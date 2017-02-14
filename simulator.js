var Simulator = (function () {
    'use strict';

    var PRESSURE_JACOBI_ITERATIONS = 2;

    var FRAMES_TO_SIMULATE = 60; //how many frames to simulate the area induced by each splat for

    var SPLAT_PADDING = 4.5; //approximately sqrt(BRISTLE_LENGTH * BRISTLE_LENGTH - BRUSH_HEIGHT * BRUSH_HEIGHT)
    var SPEED_PADDING = 1.1;


    function SplatArea (rectangle, frameNumber) {
        this.rectangle = rectangle;
        this.frameNumber = frameNumber;
    }

    function Simulator (wgl, shaderSources, resolutionWidth, resolutionHeight) {
        this.wgl = wgl;

        wgl.getExtension('OES_texture_float');
        wgl.getExtension('OES_texture_float_linear');



        var halfFloatExt = wgl.getExtension('OES_texture_half_float');
        var halfFloatLinearExt = wgl.getExtension('OES_texture_half_float_linear');


        this.simulationTextureType = wgl.hasHalfFloatTextureSupport() ? halfFloatExt.HALF_FLOAT_OES : wgl.FLOAT; //use float if half float not available


        this.resolutionWidth = resolutionWidth;
        this.resolutionHeight = resolutionHeight;

        this.fluidity = 0.8;

        this.frameNumber = 0;

       

        this.splatAreas = []; //the splat areas that we're currently still simulating
        //more recent are at the front of the array



        //////////////////////////////////////////////////
        // create shader programs

        this.splatProgram = wgl.createProgram(
            shaderSources['shaders/splat.vert'], shaderSources['shaders/splat.frag']);

        this.velocitySplatProgram = wgl.createProgram(
            '#define VELOCITY \n' + shaderSources['shaders/splat.vert'], '#define VELOCITY \n' + shaderSources['shaders/splat.frag']);

        this.advectProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/advect.frag']);

        this.divergenceProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/divergence.frag']);

        this.jacobiProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/jacobi.frag']);

        this.subtractProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/subtract.frag']);

        this.copyProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/output.frag']);

        this.resizeProgram = wgl.createProgram(
            shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/resize.frag']);

        
        ///////////////////////////////////////////////
        // create buffers

        this.quadVertexBuffer = wgl.createBuffer();
        wgl.bufferData(this.quadVertexBuffer, wgl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), wgl.STATIC_DRAW);

        this.splatPositionsBuffer = wgl.createBuffer();
        this.splatVelocitiesBuffer = wgl.createBuffer();



        this.simulationFramebuffer = wgl.createFramebuffer();


        //create textures

        this.paintTexture = wgl.buildTexture(wgl.RGBA, wgl.FLOAT, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        this.paintTextureTemp = wgl.buildTexture(wgl.RGBA, wgl.FLOAT, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);

        this.velocityTexture = wgl.buildTexture(wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        this.velocityTextureTemp = wgl.buildTexture(wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);

        this.divergenceTexture = wgl.buildTexture(wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);
        this.pressureTexture = wgl.buildTexture(wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);

        
        this.pressureTextureTemp = wgl.buildTexture(wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);

        this.clearTextures([this.paintTexture, this.paintTextureTemp, this.velocityTexture, this.velocityTextureTemp, this.divergenceTexture, this.pressureTexture, this.pressureTextureTemp]);
    }

    Simulator.prototype.clearTextures = function (textures) {
        var wgl = this.wgl;

        for (var i = 0; i < textures.length; ++i) {
            wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, textures[i], 0);

            wgl.clear(
                wgl.createClearState().bindFramebuffer(this.simulationFramebuffer),
                wgl.COLOR_BUFFER_BIT);
        }
    };

    Simulator.prototype.clear = function () {
        this.clearTextures([this.paintTexture, this.paintTextureTemp]);
    };

    Simulator.prototype.copyTexture = function (destinationWidth, destinationHeight, sourceTexture, destinationTexture) {
        var copyDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(0, 0, destinationWidth, destinationHeight)
            .useProgram(this.copyProgram)

            .uniformTexture('u_input', 0, wgl.TEXTURE_2D, sourceTexture)

            .vertexAttribPointer(this.quadVertexBuffer, this.copyProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);

        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, destinationTexture, 0);
        wgl.drawArrays(copyDrawState, wgl.TRIANGLE_STRIP, 0, 4);
    };

    //resizes the canvas with direct texel correspondence, offsetting the previous painting
    Simulator.prototype.resize = function (newWidth, newHeight, offsetX, offsetY, featherSize) {
        var wgl = this.wgl;


        var resizeDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(0, 0, newWidth, newHeight)
            .useProgram(this.resizeProgram)

            .uniformTexture('u_paintTexture', 0, wgl.TEXTURE_2D, this.paintTexture)
            .uniform2f('u_oldResolution', this.resolutionWidth, this.resolutionHeight)
            .uniform2f('u_offset', offsetX, offsetY)
            .uniform1f('u_featherSize', featherSize)

            .vertexAttribPointer(this.quadVertexBuffer, this.resizeProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);


        wgl.rebuildTexture(this.paintTextureTemp, wgl.RGBA, wgl.FLOAT, newWidth, newHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);

        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.paintTextureTemp, 0);
        wgl.drawArrays(resizeDrawState, wgl.TRIANGLE_STRIP, 0, 4);

        Utilities.swap(this, 'paintTexture', 'paintTextureTemp');




        this.resolutionWidth = newWidth;
        this.resolutionHeight = newHeight;


        wgl.rebuildTexture(this.paintTextureTemp, wgl.RGBA, wgl.FLOAT, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        this.copyTexture(newWidth, newHeight, this.paintTexture, this.paintTextureTemp);


        wgl.rebuildTexture(this.velocityTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        wgl.rebuildTexture(this.velocityTextureTemp, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);

        wgl.rebuildTexture(this.divergenceTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);

        wgl.rebuildTexture(this.pressureTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);
        wgl.rebuildTexture(this.pressureTextureTemp, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);
        
        
        this.clearTextures([this.velocityTexture, this.velocityTextureTemp, this.divergenceTexture, this.pressureTexture, this.pressureTextureTemp]);
    };

    //resamples the whole painting
    Simulator.prototype.changeResolution = function (newWidth, newHeight) {
        var wgl = this.wgl;


        wgl.rebuildTexture(this.paintTextureTemp, wgl.RGBA, wgl.FLOAT, newWidth, newHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        this.copyTexture(newWidth, newHeight, this.paintTexture, this.paintTextureTemp);
        Utilities.swap(this, 'paintTexture', 'paintTextureTemp');

        this.resolutionWidth = newWidth;
        this.resolutionHeight = newHeight;


        wgl.rebuildTexture(this.paintTextureTemp, wgl.RGBA, wgl.FLOAT, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        this.copyTexture(newWidth, newHeight, this.paintTexture, this.paintTextureTemp);


        wgl.rebuildTexture(this.velocityTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
        wgl.rebuildTexture(this.velocityTextureTemp, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);

        wgl.rebuildTexture(this.divergenceTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);

        wgl.rebuildTexture(this.pressureTexture, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);
        wgl.rebuildTexture(this.pressureTextureTemp, wgl.RGBA, this.simulationTextureType, this.resolutionWidth, this.resolutionHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);


        this.clearTextures([this.velocityTexture, this.velocityTextureTemp, this.divergenceTexture, this.pressureTexture, this.pressureTextureTemp]);
    };


    //assumes destination texture has dimensions resolutionWidth x resolutionHeight
    Simulator.prototype.copyPaintTexture = function (destinationTexture) {
        this.copyTexture(this.resolutionWidth, this.resolutionHeight, this.paintTexture, destinationTexture);
    };

    Simulator.prototype.applyPaintTexture = function (texture) {
        this.copyTexture(this.resolutionWidth, this.resolutionHeight, texture, this.paintTexture);
        this.copyTexture(this.resolutionWidth, this.resolutionHeight, texture, this.paintTextureTemp);

        this.clearTextures([this.velocityTexture, this.velocityTextureTemp]);
    };

    //returns the area we're currently simulating
    Simulator.prototype.getSimulationArea = function () {
        var simulationBorder = 0;

        //now let's work out the total simulation area we need to simulate
        var simulationArea = this.splatAreas[0].rectangle.clone(); //start with the first rectangle

        for (var i = 1; i < this.splatAreas.length; ++i) { //and add the others
            var splatArea = this.splatAreas[i];
            var area = splatArea.rectangle.clone();

            simulationArea.includeRectangle(area);
        }

        simulationArea.round();
        simulationArea.intersectRectangle(new Rectangle(0, 0, this.resolutionWidth, this.resolutionHeight));

        return simulationArea;
    };

    Simulator.prototype.splat = function (brush, zThreshold, paintingRectangle, splatColor, splatRadius, velocityScale) {

        //the area we need to simulate for this set of splats
        var brushPadding = Math.ceil(brush.scale * SPLAT_PADDING);
        brushPadding += Math.ceil(brush.getFilteredSpeed() * SPEED_PADDING);

        //we start in canvas space
        var area = new Rectangle(brush.positionX - brushPadding, brush.positionY - brushPadding, brushPadding * 2, brushPadding * 2);
        
        //transform into simulation space
        area.translate(-paintingRectangle.left, -paintingRectangle.bottom);
        area.scale(this.resolutionWidth / paintingRectangle.width, this.resolutionHeight / paintingRectangle.height);
        area.round();
        area.intersectRectangle(new Rectangle(0, 0, this.resolutionWidth, this.resolutionHeight));

        this.splatAreas.splice(0, 0, new SplatArea(area, this.frameNumber));

        var simulationArea = this.getSimulationArea();


        var wgl = this.wgl;


        /*
        var clearState = wgl.createClearState()
            .bindFramebuffer(this.simulationFramebuffer)
            .clearColor(Math.sin(this.frameNumber * 0.1) * 0.5 + 0.5, 1, 1, 1)
            
            //restrict splatting to area that'll be simulated
            .enable(wgl.SCISSOR_TEST)
            .scissor(Math.floor(simulationArea.left), Math.floor(simulationArea.bottom), Math.floor(simulationArea.width), Math.floor(simulationArea.height))


        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.paintTexture, 0);
        wgl.clear(clearState, wgl.COLOR_BUFFER_BIT);
        */


        var splatPaintDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(0, 0, this.resolutionWidth, this.resolutionHeight)
            
            //restrict splatting to area that'll be simulated
            .enable(wgl.SCISSOR_TEST)
            .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .enable(wgl.BLEND)
            .blendEquation(wgl.FUNC_ADD)
            .blendFuncSeparate(wgl.SRC_ALPHA, wgl.ONE_MINUS_SRC_ALPHA, wgl.ONE, wgl.ONE)

            .vertexAttribPointer(brush.splatCoordinatesBuffer, this.splatProgram.getAttribLocation('a_splatCoordinates'), 4, wgl.FLOAT, wgl.FALSE, 0, 0)
            .bindIndexBuffer(brush.splatIndexBuffer)

            .useProgram(this.splatProgram)

            .uniform2f('u_paintingDimensions', paintingRectangle.width, paintingRectangle.height)
            .uniform2f('u_paintingPosition', paintingRectangle.left, paintingRectangle.bottom)
            .uniform1f('u_splatRadius', splatRadius)
            .uniform4f('u_splatColor', splatColor[0], splatColor[1], splatColor[2], splatColor[3])
            .uniformTexture('u_positionsTexture', 0, wgl.TEXTURE_2D, brush.positionsTexture)
            .uniformTexture('u_previousPositionsTexture', 1, wgl.TEXTURE_2D, brush.previousPositionsTexture)
            .uniform1f('u_zThreshold', zThreshold);

        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.paintTexture, 0);
        wgl.drawElements(splatPaintDrawState, wgl.TRIANGLES, brush.splatIndexCount * brush.bristleCount / brush.maxBristleCount, wgl.UNSIGNED_SHORT, 0);



        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.velocityTexture, 0);

        var splatVelocityDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(0, 0, this.resolutionWidth, this.resolutionHeight)

            //restrict splatting to area that'll be simulated
            .enable(wgl.SCISSOR_TEST)
            .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .enable(wgl.BLEND)
            .blendEquation(wgl.FUNC_ADD)
            .blendFuncSeparate(wgl.ONE, wgl.ONE, wgl.ZERO, wgl.ZERO)

            .vertexAttribPointer(brush.splatCoordinatesBuffer, this.splatProgram.getAttribLocation('a_splatCoordinates'), 4, wgl.FLOAT, wgl.FALSE, 0, 0)
            .bindIndexBuffer(brush.splatIndexBuffer)
            .useProgram(this.velocitySplatProgram)

            .uniform2f('u_paintingDimensions', paintingRectangle.width, paintingRectangle.height)
            .uniform2f('u_paintingPosition', paintingRectangle.left, paintingRectangle.bottom)
            .uniform1f('u_splatRadius', splatRadius)
            .uniformTexture('u_positionsTexture', 0, wgl.TEXTURE_2D, brush.positionsTexture)
            .uniformTexture('u_previousPositionsTexture', 1, wgl.TEXTURE_2D, brush.previousPositionsTexture)
            .uniformTexture('u_velocitiesTexture', 2, wgl.TEXTURE_2D, brush.velocitiesTexture)
            .uniformTexture('u_previousVelocitiesTexture', 3, wgl.TEXTURE_2D, brush.previousVelocitiesTexture)
            .uniform1f('u_zThreshold', zThreshold)
            .uniform1f('u_velocityScale', velocityScale);

        wgl.drawElements(splatVelocityDrawState, wgl.TRIANGLES, brush.splatIndexCount * brush.bristleCount / brush.maxBristleCount, wgl.UNSIGNED_SHORT, 0);

    };


    //returns whether any simulating actually took place
    Simulator.prototype.simulate = function () {
        var wgl = this.wgl;


        if (this.splatAreas.length === 0) return false;

        var simulationArea = this.getSimulationArea();

        var advect = (function (velocityTexture, dataTexture, targetTexture, deltaTime, dissipation) {
            var advectDrawState = wgl.createDrawState()
                .bindFramebuffer(this.simulationFramebuffer)
                .viewport(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

                .enable(wgl.SCISSOR_TEST)
                .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)
                
                .useProgram(this.advectProgram)
                .uniform1f('u_dissipation', dissipation)
                .uniform2f('u_resolution', this.resolutionWidth, this.resolutionHeight)
                .uniformTexture('u_velocityTexture', 0, wgl.TEXTURE_2D, velocityTexture)
                .uniformTexture('u_inputTexture', 1, wgl.TEXTURE_2D, dataTexture)

                .uniform2f('u_min', simulationArea.left, simulationArea.bottom)
                .uniform2f('u_max', simulationArea.getRight(), simulationArea.getTop())

                .vertexAttribPointer(this.quadVertexBuffer, this.advectProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);


            
            wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, targetTexture, 0);
            advectDrawState.uniform1f('u_deltaTime', deltaTime);

            wgl.drawArrays(advectDrawState, wgl.TRIANGLE_STRIP, 0, 4);


        }).bind(this);


        ////////////////////////////////////////
        // advect velocity and paint

        var DELTA_TIME = 1.0 / 60.0; //we use a constant timestep for simulation consistency


         //compute divergence for pressure projection

        var divergenceDrawState = wgl.createDrawState()
            
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .enable(wgl.SCISSOR_TEST)
            .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .useProgram(this.divergenceProgram)
            .uniform2f('u_resolution', this.resolutionWidth, this.resolutionHeight)
            .uniformTexture('u_velocityTexture', 0, wgl.TEXTURE_2D, this.velocityTexture)

            .vertexAttribPointer(this.quadVertexBuffer, this.divergenceProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);


        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.divergenceTexture, 0);
        
        wgl.drawArrays(divergenceDrawState, wgl.TRIANGLE_STRIP, 0, 4);
        
        
        //compute pressure via jacobi iteration

        var jacobiDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .enable(wgl.SCISSOR_TEST)
            .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .useProgram(this.jacobiProgram)
            .uniform2f('u_resolution', this.resolutionWidth, this.resolutionHeight)
            .uniformTexture('u_divergenceTexture', 1, wgl.TEXTURE_2D, this.divergenceTexture)

            .vertexAttribPointer(this.quadVertexBuffer, this.jacobiProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);


        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.pressureTexture, 0);
            wgl.clear(
                wgl.createClearState().bindFramebuffer(this.simulationFramebuffer),
                wgl.COLOR_BUFFER_BIT);
        
        for (var i = 0; i < PRESSURE_JACOBI_ITERATIONS; ++i) {
            wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.pressureTextureTemp, 0);
            jacobiDrawState.uniformTexture('u_pressureTexture', 0, wgl.TEXTURE_2D, this.pressureTexture);
            
            wgl.drawArrays(jacobiDrawState, wgl.TRIANGLE_STRIP, 0, 4);
            
            Utilities.swap(this, 'pressureTexture', 'pressureTextureTemp');
        }
        
        
        //subtract pressure gradient from velocity

        var subtractDrawState = wgl.createDrawState()
            .bindFramebuffer(this.simulationFramebuffer)
            .viewport(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .enable(wgl.SCISSOR_TEST)
            .scissor(simulationArea.left, simulationArea.bottom, simulationArea.width, simulationArea.height)

            .useProgram(this.subtractProgram)
            .uniform2f('u_resolution', this.resolutionWidth, this.resolutionHeight)
            .uniformTexture('u_pressureTexture', 0, wgl.TEXTURE_2D, this.pressureTexture)
            .uniformTexture('u_velocityTexture', 1, wgl.TEXTURE_2D, this.velocityTexture)

            .vertexAttribPointer(this.quadVertexBuffer, this.subtractProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0);

        
        wgl.framebufferTexture2D(this.simulationFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.velocityTextureTemp, 0);
        
        wgl.drawArrays(subtractDrawState, wgl.TRIANGLE_STRIP, 0, 4);
        
        Utilities.swap(this, 'velocityTexture', 'velocityTextureTemp');



        //advect paint
        advect(this.velocityTexture, this.paintTexture, this.paintTextureTemp, DELTA_TIME, 1.0);
        Utilities.swap(this, 'paintTexture', 'paintTextureTemp');

        //advect velocity
        advect(this.velocityTexture, this.velocityTexture, this.velocityTextureTemp, DELTA_TIME, this.fluidity);
        Utilities.swap(this, 'velocityTexture', 'velocityTextureTemp');



        this.frameNumber += 1;

        //remove all of the splat areas we no longer need to simulate
        var i = this.splatAreas.length;
        while (i--) {
            if (this.frameNumber - this.splatAreas[i].frameNumber > FRAMES_TO_SIMULATE) {
                this.splatAreas.splice(i, 1);
            }
        }


        if (this.splatAreas.length === 0) { //if we finished simulating on this step
            this.clearTextures(this.velocityTexture, this.velocityTextureTemp); //clear all velocity textures
        }


        return true;
    };


    return Simulator;

}());
