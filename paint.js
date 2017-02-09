var Paint = (function () {
    'use strict';

    var InteractionMode = {
        NONE: 0,
        PAINTING: 1,
        RESIZING: 2,
        PANNING: 3
    };

    var ResizingSide = {
        NONE: 0,
        LEFT: 1,
        RIGHT: 2,
        BOTTOM: 3,
        TOP: 4,
        TOP_LEFT: 5,
        TOP_RIGHT: 6,
        BOTTOM_LEFT: 7,
        BOTTOM_RIGHT: 8
    };


    var QUALITIES = [
        {
            name: 'Low',
            resolutionScale: 1.0
        },
        {
            name: 'Medium',
            resolutionScale: 1.5
        },
        {
            name: 'High',
            resolutionScale: 2.0
        }
    ];

    var INITIAL_QUALITY = 1;


    var INITIAL_PADDING = 100;
    var MIN_PAINTING_WIDTH = 300;
    var MAX_PAINTING_WIDTH = 4096; //this is further constrained by the maximum texture size

    //brush parameters
    var MAX_BRISTLE_COUNT = 100;
    var MIN_BRISTLE_COUNT = 10;
    var MIN_BRUSH_SCALE = 10;
    var MAX_BRUSH_SCALE = 75;
    var BRUSH_HEIGHT = 2.0; //how high the brush is over the canvas - this is scaled with the brushScale
    var Z_THRESHOLD = 0.13333; //this is scaled with the brushScale


    //splatting parameters
    var SPLAT_VELOCITY_SCALE = 0.14;
    var SPLAT_RADIUS = 0.05;

    //for thin brush (fewest bristles)
    var THIN_MIN_ALPHA = 0.002;
    var THIN_MAX_ALPHA = 0.08;

    //for thick brush (most bristles)
    var THICK_MIN_ALPHA = 0.002;
    var THICK_MAX_ALPHA = 0.025;


    //panel is aligned with the top left
    var PANEL_WIDTH = 300;
    var PANEL_HEIGHT = 475;
    var PANEL_BLUR_SAMPLES = 13;
    var PANEL_BLUR_STRIDE = 8;

    var COLOR_PICKER_LEFT = 20;
    var COLOR_PICKER_TOP = 467;

    var RESIZING_RADIUS = 20;
    var RESIZING_FEATHER_SIZE = 8; //in pixels

    //box shadow parameters
    var BOX_SHADOW_SIGMA = 5.0;
    var BOX_SHADOW_WIDTH = 10.0;
    var PAINTING_SHADOW_ALPHA = 0.5;
    var PANEL_SHADOW_ALPHA = 1.0;

    //rendering parameters
    var BACKGROUND_GRAY = 0.7;
    var NORMAL_SCALE = 7.0;
    var ROUGHNESS = 0.075;
    var F0 = 0.05;
    var SPECULAR_SCALE = 0.5;
    var DIFFUSE_SCALE = 0.15;
    var LIGHT_DIRECTION = [0, 1, 1];

    //canvas resizing
    var CANVAS_RESIZE = false;


    function pascalRow (n) {
        var line = [1];
        for (var k = 0; k < n; ++k) {
            line.push(line[k] * (n - k) / (k + 1));
        }
        return line;
    }

    //width should be an odd number
    function makeBlurShader (width) {
        var coefficients = pascalRow(width - 1 + 2);

        //take the 1s off the ends
        coefficients.shift();
        coefficients.pop();

        var normalizationFactor = 0;
        for (var i = 0; i < coefficients.length; ++i) {
            normalizationFactor += coefficients[i];
        }

        var shader = [
            'precision highp float;',

            'uniform sampler2D u_input;',

            'uniform vec2 u_step;',
            'uniform vec2 u_resolution;',

            'void main () {',
                'vec4 total = vec4(0.0);',

                'vec2 coordinates = gl_FragCoord.xy / u_resolution;',
                'vec2 delta = u_step / u_resolution;',
        ].join('\n');

        shader += '\n';

        for (var i = 0; i < width; ++i) {
            var offset = i - (width - 1) / 2;

            shader += 'total += texture2D(u_input, coordinates + delta * ' + offset.toFixed(1) + ') * ' + coefficients[i].toFixed(1) + '; \n';
        }

        shader += 'gl_FragColor = total / ' + normalizationFactor.toFixed(1) + ';\n }';

        return shader;
    }


    function hsvToRyb (h, s, v) {
        h = h % 1;

        var c = v * s,
            hDash = h * 6;

        var x = c * (1 - Math.abs(hDash % 2 - 1));

        var mod = Math.floor(hDash);

        var r = [c, x, 0, 0, x, c][mod],
            g = [x, c, c, x, 0, 0][mod],
            b = [0, 0, x, c, c, x][mod];

        var m = v - c;

        r += m;
        g += m;
        b += m;

        return [r, g, b];
    }

    function makeOrthographicMatrix (matrix, left, right, bottom, top, near, far) {
        matrix[0] = 2 / (right - left);
        matrix[1] = 0;
        matrix[2] = 0;
        matrix[3] = 0;
        matrix[4] = 0;
        matrix[5] = 2 / (top - bottom);
        matrix[6] = 0;
        matrix[7] = 0;
        matrix[8] = 0;
        matrix[9] = 0;
        matrix[10] = -2 / (far - near);
        matrix[11] = 0;
        matrix[12] = -(right + left) / (right - left);
        matrix[13] = -(top + bottom) / (top - bottom);
        matrix[14] = -(far + near) / (far - near);
        matrix[15] = 1;

        return matrix;
    }

    function mix (a, b, t) {
        return (1.0 - t) * a + t * b;
    }


    function Paint (canvas, wgl) {
        this.canvas = canvas;
        this.wgl = wgl;

        WrappedGL.loadTextFiles([
            'shaders/splat.vert', 'shaders/splat.frag',
            'shaders/fullscreen.vert',
            'shaders/advect.frag',
            'shaders/divergence.frag',
            'shaders/jacobi.frag',
            'shaders/subtract.frag',
            'shaders/resize.frag',

            'shaders/project.frag',
            'shaders/distanceconstraint.frag',
            'shaders/planeconstraint.frag',
            'shaders/bendingconstraint.frag',
            'shaders/setbristles.frag',
            'shaders/updatevelocity.frag',

            'shaders/brush.vert', 'shaders/brush.frag',
            'shaders/painting.vert', 'shaders/painting.frag',
            'shaders/picker.vert', 'shaders/picker.frag',
            'shaders/panel.frag',
            'shaders/output.frag',
            'shaders/shadow.frag',
        ], start.bind(this));

        function start(shaderSources) {

            var maxTextureSize = wgl.getParameter(wgl.MAX_TEXTURE_SIZE);
            this.maxPaintingWidth = Math.min(MAX_PAINTING_WIDTH, maxTextureSize / QUALITIES[QUALITIES.length - 1].resolutionScale);


            this.framebuffer = wgl.createFramebuffer();


            this.paintingProgram = wgl.createProgram(
                shaderSources['shaders/painting.vert'], shaderSources['shaders/painting.frag']);

            this.resizingPaintingProgram = wgl.createProgram(
                shaderSources['shaders/painting.vert'], '#define RESIZING \n ' + shaderSources['shaders/painting.frag']);

            this.savePaintingProgram = wgl.createProgram(
                shaderSources['shaders/painting.vert'], '#define SAVE \n ' + shaderSources['shaders/painting.frag']);

            this.brushProgram = wgl.createProgram(
                shaderSources['shaders/brush.vert'], shaderSources['shaders/brush.frag'], { 'a_position': 0 });

            this.panelProgram = wgl.createProgram(
                shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/panel.frag'], { 'a_position': 0 });


            this.blurProgram = wgl.createProgram(
                shaderSources['shaders/fullscreen.vert'], makeBlurShader(PANEL_BLUR_SAMPLES), { 'a_position': 0 });

            this.outputProgram = wgl.createProgram(
                shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/output.frag'], { 'a_position': 0 });

            this.shadowProgram = wgl.createProgram(
                shaderSources['shaders/fullscreen.vert'], shaderSources['shaders/shadow.frag'], { 'a_position': 0 });


            this.quadVertexBuffer = wgl.createBuffer();
            wgl.bufferData(this.quadVertexBuffer, wgl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), wgl.STATIC_DRAW);


            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;



            //position of painting on screen, and its dimensions
            //units are pixels
            this.paintingRectangle = new Rectangle(
                INITIAL_PADDING, INITIAL_PADDING,
                Utilities.clamp(canvas.width - INITIAL_PADDING * 2, MIN_PAINTING_WIDTH, this.maxPaintingWidth),
                Utilities.clamp(canvas.height - INITIAL_PADDING * 2, MIN_PAINTING_WIDTH, this.maxPaintingWidth));

            //simulation resolution = painting resolution * resolution scale
            this.resolutionScale = QUALITIES[INITIAL_QUALITY].resolutionScale;


            this.simulator = new Simulator(wgl, shaderSources, this.getPaintingResolutionWidth(), this.getPaintingResolutionHeight());


            this.brushInitialized = false; //whether the user has moved their mouse at least once and we thus have a valid brush position

            this.brushX = 0;
            this.brushY = 0;

            this.brushScale = 50;

            this.brushColorHSVA = [Math.random(), 1, 1, 0.8];


            this.brush = new Brush(wgl, shaderSources, MAX_BRISTLE_COUNT);



            this.fluiditySlider = new Slider(document.getElementById('fluidity-slider'), this.simulator.fluidity, 0.6, 0.9, (function (fluidity) {
              this.simulator.fluidity = fluidity;
            }).bind(this));

            this.bristleCountSlider = new Slider(document.getElementById('bristles-slider'), 1, 0, 1, (function (t) {
                var BRISTLE_SLIDER_POWER = 2.0;
                t = Math.pow(t, BRISTLE_SLIDER_POWER);
                var bristleCount = Math.floor(MIN_BRISTLE_COUNT + t * (MAX_BRISTLE_COUNT - MIN_BRISTLE_COUNT));
                this.brush.setBristleCount(bristleCount);
            }).bind(this));

            this.brushSizeSlider = new Slider(document.getElementById('size-slider'), this.brushScale, MIN_BRUSH_SCALE, MAX_BRUSH_SCALE, (function(size) {
                this.brushScale = size;
            }).bind(this));



            this.qualityButtons = new Buttons(document.getElementById('qualities'),
                QUALITIES.map(function (q) { return q.name })
            , INITIAL_QUALITY, (function (index) {
                this.resolutionScale = QUALITIES[index].resolutionScale;
                this.simulator.changeResolution(this.getPaintingResolutionWidth(), this.getPaintingResolutionHeight());
            }).bind(this));


            this.colorPicker = new ColorPicker(this, 'brushColorHSVA', wgl, canvas, shaderSources, COLOR_PICKER_LEFT, 0);

            //this.brushViewer = new BrushViewer(wgl, this.brushProgram, 0, 800, 200, 300);


            this.saveButton = document.getElementById('save-button');
            this.saveButton.addEventListener('click', this.save.bind(this));


            this.clearButton = document.getElementById('clear-button');
            this.clearButton.addEventListener('click', (function () {
                this.simulator.clear();
            }).bind(this));



            this.mainProjectionMatrix = makeOrthographicMatrix(new Float32Array(16), 0.0, this.canvas.width, 0, this.canvas.height, -5000.0, 5000.0);


            this.onResize = function () {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;

                this.paintingRectangle.left = Utilities.clamp(this.paintingRectangle.left, -this.paintingRectangle.width, this.canvas.width);
                this.paintingRectangle.bottom = Utilities.clamp(this.paintingRectangle.bottom, -this.paintingRectangle.height, this.canvas.height);


                this.colorPicker.bottom = this.canvas.height - COLOR_PICKER_TOP;


                //this.brushViewer.bottom = this.canvas.height - 800;


                this.mainProjectionMatrix = makeOrthographicMatrix(new Float32Array(16), 0.0, this.canvas.width, 0, this.canvas.height, -5000.0, 5000.0);

                this.canvasTexture = wgl.buildTexture(wgl.RGBA, wgl.UNSIGNED_BYTE, this.canvas.width, this.canvas.height, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
                this.tempCanvasTexture = wgl.buildTexture(wgl.RGBA, wgl.UNSIGNED_BYTE, this.canvas.width, this.canvas.height, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
                this.blurredCanvasTexture = wgl.buildTexture(wgl.RGBA, wgl.UNSIGNED_BYTE, this.canvas.width, this.canvas.height, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.LINEAR, wgl.LINEAR);
            };
            this.onResize();

            window.addEventListener('resize', this.onResize.bind(this));


            this.mouseX = 0;
            this.mouseY = 0;

            this.spaceDown = false;


            canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
            canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
            document.addEventListener('mouseup', this.onMouseUp.bind(this));
            canvas.addEventListener('mouseover', this.onMouseOver.bind(this));

            document.addEventListener('wheel', this.onWheel.bind(this));


            document.addEventListener('keydown', (function (event) {
                if (event.keyCode === 32) { //space
                    this.spaceDown = true;
                }
            }).bind(this));

            document.addEventListener('keyup', (function (event) {
                if (event.keyCode === 32) {
                    this.spaceDown = false;
                }
            }).bind(this));




            //these are used while we're resizing
            this.resizingSide = ResizingSide.NONE; //which side we're currently resizing

            //this is updated during resizing according to the new mouse position
            //when we finish resizing, we then resize the simulator to match
            this.newPaintingRectangle = null;


            this.interactionState = InteractionMode.NONE;


            var update = (function () {
                this.update();
                requestAnimationFrame(update);
            }).bind(this);
            update();
        }
    }

    Paint.prototype.getPaintingResolutionWidth = function () {
        return Math.ceil(this.paintingRectangle.width * this.resolutionScale);
    };


    Paint.prototype.getPaintingResolutionHeight = function () {
        return Math.ceil(this.paintingRectangle.height * this.resolutionScale);
    };

    Paint.prototype.drawShadow = function (alpha, rectangle) {
        var wgl = this.wgl;

        var shadowDrawState = wgl.createDrawState()
          .uniform2f('u_bottomLeft', rectangle.left, rectangle.bottom)
          .uniform2f('u_topRight', rectangle.getRight(), rectangle.getTop())
          .uniform1f('u_sigma', BOX_SHADOW_SIGMA)
          .uniform1f('u_alpha', alpha)
          .enable(wgl.BLEND)
          .blendFunc(wgl.ONE, wgl.ONE_MINUS_SRC_ALPHA)
          .useProgram(this.shadowProgram)
          .vertexAttribPointer(this.quadVertexBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0);

        var rectangles = [
            new Rectangle(rectangle.left - BOX_SHADOW_WIDTH, rectangle.bottom - BOX_SHADOW_WIDTH, rectangle.width + 2 * BOX_SHADOW_WIDTH, BOX_SHADOW_WIDTH), //bottom
            new Rectangle(rectangle.left - BOX_SHADOW_WIDTH, rectangle.getTop(), rectangle.width + 2 * BOX_SHADOW_WIDTH, BOX_SHADOW_WIDTH), //top
            new Rectangle(rectangle.left - BOX_SHADOW_WIDTH, rectangle.bottom, BOX_SHADOW_WIDTH, rectangle.height), //left
            new Rectangle(rectangle.getRight(), rectangle.bottom, BOX_SHADOW_WIDTH, rectangle.height) // right
        ];

        var screenRectangle = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
        for (var i = 0; i < rectangles.length; ++i) {
            var rect = rectangles[i];
            rect.intersectRectangle(screenRectangle);

            if (rect.getArea() > 0) {
                shadowDrawState.viewport(rect.left, rect.bottom, rect.width, rect.height);
                wgl.drawArrays(shadowDrawState, wgl.TRIANGLE_STRIP, 0, 4);
            }
        }

    };

    function cursorForResizingSide (side) {
        if (side === ResizingSide.LEFT || side === ResizingSide.RIGHT) {
            return 'ew-resize';
        } else if (side === ResizingSide.BOTTOM || side === ResizingSide.TOP) {
            return 'ns-resize';
        } else if (side === ResizingSide.TOP_LEFT) {
            return 'nw-resize';
        } else if (side === ResizingSide.TOP_RIGHT) {
            return 'ne-resize';
        } else if (side === ResizingSide.BOTTOM_LEFT) {
            return 'sw-resize';
        } else if (side === ResizingSide.BOTTOM_RIGHT) {
            return 'se-resize';
        }
    }


    Paint.prototype.update = function () {
        var wgl = this.wgl;
        var canvas = this.canvas;
        var simulationFramebuffer = this.simulationFramebuffer;


        //update brush

        if (this.brushInitialized) {
            this.brush.update(this.brushX, this.brushY, BRUSH_HEIGHT * this.brushScale, this.brushScale);
        }



        //splat into paint and velocity textures

        if (this.interactionState === InteractionMode.PAINTING) {
            var splatRadius = SPLAT_RADIUS * this.brushScale;

            var splatColor = hsvToRyb(this.brushColorHSVA[0], this.brushColorHSVA[1], this.brushColorHSVA[2]);

            var alphaT = this.brushColorHSVA[3];

            //we scale alpha based on the number of bristles
            var bristleT = (this.brush.bristleCount - MIN_BRISTLE_COUNT) / (MAX_BRISTLE_COUNT - MIN_BRISTLE_COUNT);

            var minAlpha = mix(THIN_MIN_ALPHA, THICK_MIN_ALPHA, bristleT);
            var maxAlpha = mix(THIN_MAX_ALPHA, THICK_MAX_ALPHA, bristleT);

            var alpha = mix(minAlpha, maxAlpha, alphaT);

            splatColor[3] = alpha;

            var splatVelocityScale = SPLAT_VELOCITY_SCALE * splatColor[3] * this.resolutionScale;

            //splat paint
            this.simulator.splat(this.brush, Z_THRESHOLD * this.brushScale, this.paintingRectangle, splatColor, splatRadius, splatVelocityScale);

        }

        this.simulator.simulate();


        //draw painting into texture


        wgl.framebufferTexture2D(this.framebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.canvasTexture, 0);
        var clearState = wgl.createClearState()
            .bindFramebuffer(this.framebuffer)
            .clearColor(BACKGROUND_GRAY, BACKGROUND_GRAY, BACKGROUND_GRAY, 1.0);

        wgl.clear(clearState, wgl.COLOR_BUFFER_BIT | wgl.DEPTH_BUFFER_BIT);


        var paintingProgram = this.interactionState === InteractionMode.RESIZING ? this.resizingPaintingProgram : this.paintingProgram;

        var paintingDrawState = wgl.createDrawState()
            .bindFramebuffer(this.framebuffer)
            .vertexAttribPointer(this.quadVertexBuffer, paintingProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0)
            .useProgram(paintingProgram)
            .uniform1f('u_featherSize', RESIZING_FEATHER_SIZE)

            .uniform1f('u_normalScale', NORMAL_SCALE / this.resolutionScale)
            .uniform1f('u_roughness', ROUGHNESS)
            .uniform1f('u_diffuseScale', DIFFUSE_SCALE)
            .uniform1f('u_specularScale', SPECULAR_SCALE)
            .uniform1f('u_F0', F0)
            .uniform3f('u_lightDirection', LIGHT_DIRECTION[0], LIGHT_DIRECTION[1], LIGHT_DIRECTION[2])

            .uniform2f('u_paintingPosition', this.paintingRectangle.left, this.paintingRectangle.bottom)
            .uniform2f('u_paintingResolution', this.simulator.resolutionWidth, this.simulator.resolutionHeight)
            .uniform2f('u_paintingSize', this.paintingRectangle.width, this.paintingRectangle.height)
            .uniform2f('u_screenResolution', this.canvas.width, this.canvas.height)
            .uniformTexture('u_paintTexture', 0, wgl.TEXTURE_2D, this.simulator.paintTexture);


        //the rectangle we end up drawing the painting into
        var clippedPaintingRectangle = (this.interactionState === InteractionMode.RESIZING ? this.newPaintingRectangle : this.paintingRectangle).clone()
                                       .intersectRectangle(new Rectangle(0, 0, this.canvas.width, this.canvas.height));


        paintingDrawState.viewport(clippedPaintingRectangle.left, clippedPaintingRectangle.bottom, clippedPaintingRectangle.width, clippedPaintingRectangle.height);

        wgl.drawArrays(paintingDrawState, wgl.TRIANGLE_STRIP, 0, 4);


        //output painting to screen
        var outputDrawState = wgl.createDrawState()
          .viewport(0, 0, this.canvas.width, this.canvas.height)
          .useProgram(this.outputProgram)
          .uniformTexture('u_input', 0, wgl.TEXTURE_2D, this.canvasTexture)
          .vertexAttribPointer(this.quadVertexBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0);

        wgl.drawArrays(outputDrawState, wgl.TRIANGLE_STRIP, 0, 4);



        this.drawShadow(PAINTING_SHADOW_ALPHA, clippedPaintingRectangle);



        //draw brush to screen
        if (this.interactionState === InteractionMode.PAINTING || !this.colorPicker.isInUse() && this.interactionState === InteractionMode.NONE && this.desiredInteractionMode(this.mouseX, this.mouseY) === InteractionMode.PAINTING) { //we draw the brush if we're painting or you would start painting on click
            var brushDrawState = wgl.createDrawState()
                .bindFramebuffer(null)
                .viewport(0, 0, this.canvas.width, this.canvas.height)
                .vertexAttribPointer(this.brush.brushTextureCoordinatesBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0)

                .useProgram(this.brushProgram)
                .bindIndexBuffer(this.brush.brushIndexBuffer)

                .uniform4f('u_color', 0.6, 0.6, 0.6, 1.0)
                .uniformMatrix4fv('u_projectionViewMatrix', false, this.mainProjectionMatrix)
                .enable(wgl.DEPTH_TEST)

                .enable(wgl.BLEND)
                .blendFunc(wgl.DST_COLOR, wgl.ZERO)

                .uniformTexture('u_positionsTexture', 0, wgl.TEXTURE_2D, this.brush.positionsTexture);

            wgl.drawElements(brushDrawState, wgl.LINES, this.brush.indexCount * this.brush.bristleCount / this.brush.maxBristleCount, wgl.UNSIGNED_SHORT, 0);
        }


        //work out what cursor we want
        var desiredCursor = '';

        if (this.colorPicker.isInUse()) {
            desiredCursor = 'pointer';
        } else if (this.colorPicker.overControl(this.mouseX, this.mouseY)) {
            desiredCursor = 'pointer';
        } else if (this.interactionState === InteractionMode.NONE) { //if there is no current interaction, we display a cursor based on what interaction would occur on click
            var desiredMode = this.desiredInteractionMode(this.mouseX, this.mouseY);

            if (desiredMode === InteractionMode.PAINTING) {
                desiredCursor = 'none';
            } else if (desiredMode === InteractionMode.RESIZING) {
                desiredCursor = cursorForResizingSide(this.getResizingSide(this.mouseX, this.mouseY));
            } else if (desiredMode === InteractionMode.PANNING) {
                desiredCursor = 'pointer';
            } else {
                desiredCursor = 'default';
            }
        } else { //if there is an interaction going on, display appropriate cursor
            if (this.interactionState === InteractionMode.PAINTING) {
                desiredCursor = 'none';
            } else if (this.interactionState === InteractionMode.RESIZING) {
                desiredCursor = cursorForResizingSide(this.resizingSide);
            } else if (this.interactionState === InteractionMode.PANNING) {
                desiredCursor = 'pointer';
            }
        }

        if (this.canvas.style.cursor !== desiredCursor) { //don't thrash the style
            this.canvas.style.cursor = desiredCursor;
        }



        //blur painting in texture for panel and draw panel to screen

        var panelBottom = this.canvas.height - PANEL_HEIGHT;

        //blur the canvas for the panel

        var BLUR_FEATHER = ((PANEL_BLUR_SAMPLES - 1) / 2) * PANEL_BLUR_STRIDE;

        var blurDrawState = wgl.createDrawState()
            .useProgram(this.blurProgram)
            .viewport(
                0,
                Utilities.clamp(panelBottom - BLUR_FEATHER, 0, this.canvas.height),
                PANEL_WIDTH + BLUR_FEATHER,
                PANEL_HEIGHT + BLUR_FEATHER)
            .bindFramebuffer(this.framebuffer)
            .uniform2f('u_resolution', this.canvas.width, this.canvas.height)
            .vertexAttribPointer(this.quadVertexBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0);



        wgl.framebufferTexture2D(this.framebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.tempCanvasTexture, 0);
        blurDrawState.uniformTexture('u_input', 0, wgl.TEXTURE_2D, this.canvasTexture)
            .uniform2f('u_step', PANEL_BLUR_STRIDE, 0);

        wgl.drawArrays(blurDrawState, wgl.TRIANGLE_STRIP, 0, 4);


        wgl.framebufferTexture2D(this.framebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, this.blurredCanvasTexture, 0);
        blurDrawState.uniformTexture('u_input', 0, wgl.TEXTURE_2D, this.tempCanvasTexture)
            .uniform2f('u_step', 0, PANEL_BLUR_STRIDE);

        wgl.drawArrays(blurDrawState, wgl.TRIANGLE_STRIP, 0, 4);


        var panelDrawState = wgl.createDrawState()
            .viewport(0, panelBottom, PANEL_WIDTH, PANEL_HEIGHT)
            .uniformTexture('u_canvasTexture', 0, wgl.TEXTURE_2D, this.blurredCanvasTexture)
            .uniform2f('u_canvasResolution', this.canvas.width, this.canvas.height)
            .uniform2f('u_panelResolution', PANEL_WIDTH, PANEL_HEIGHT)
            .useProgram(this.panelProgram)
            .vertexAttribPointer(this.quadVertexBuffer, 0, 2, wgl.FLOAT, wgl.FALSE, 0, 0);

        wgl.drawArrays(panelDrawState, wgl.TRIANGLE_STRIP, 0, 4);




        //shadow for panel
        this.drawShadow(PANEL_SHADOW_ALPHA, new Rectangle(0, panelBottom, PANEL_WIDTH, PANEL_HEIGHT));


        this.colorPicker.draw();


        //this.brushViewer.draw(this.brushX, this.brushY, this.brush);
    };

    Paint.prototype.save = function () {
        //we first render the painting to a WebGL texture

        var wgl = this.wgl;

        var saveWidth = this.paintingRectangle.width;
        var saveHeight = this.paintingRectangle.height;

        var saveTexture = wgl.buildTexture(wgl.RGBA, wgl.UNSIGNED_BYTE, saveWidth, saveHeight, null, wgl.CLAMP_TO_EDGE, wgl.CLAMP_TO_EDGE, wgl.NEAREST, wgl.NEAREST);

        var saveFramebuffer = wgl.createFramebuffer();
        wgl.framebufferTexture2D(saveFramebuffer, wgl.FRAMEBUFFER, wgl.COLOR_ATTACHMENT0, wgl.TEXTURE_2D, saveTexture, 0);

        var saveDrawState = wgl.createDrawState()
            .bindFramebuffer(saveFramebuffer)
            .viewport(0, 0, saveWidth, saveHeight)
            .vertexAttribPointer(this.quadVertexBuffer, this.paintingProgram.getAttribLocation('a_position'), 2, wgl.FLOAT, false, 0, 0)
            .useProgram(this.savePaintingProgram)
            .uniform2f('u_paintingSize', this.paintingRectangle.width, this.paintingRectangle.height)
            .uniform2f('u_paintingResolution', this.simulator.resolutionWidth, this.simulator.resolutionHeight)
            .uniform2f('u_screenResolution', this.paintingRectangle.width, this.paintingRectangle.height)
            .uniform2f('u_paintingPosition', 0, 0)
            .uniformTexture('u_paintTexture', 0, wgl.TEXTURE_2D, this.simulator.paintTexture)

            .uniform1f('u_normalScale', NORMAL_SCALE / this.resolutionScale)
            .uniform1f('u_roughness', ROUGHNESS)
            .uniform1f('u_diffuseScale', DIFFUSE_SCALE)
            .uniform1f('u_specularScale', SPECULAR_SCALE)
            .uniform1f('u_F0', F0)
            .uniform3f('u_lightDirection', LIGHT_DIRECTION[0], LIGHT_DIRECTION[1], LIGHT_DIRECTION[2]);


        wgl.drawArrays(saveDrawState, wgl.TRIANGLE_STRIP, 0, 4);

        //then we read back this texture

        var savePixels = new Uint8Array(saveWidth * saveHeight * 4);
        wgl.readPixels(wgl.createReadState().bindFramebuffer(saveFramebuffer),
                        0, 0, saveWidth, saveHeight, wgl.RGBA, wgl.UNSIGNED_BYTE, savePixels);


        wgl.deleteTexture(saveTexture);
        wgl.deleteFramebuffer(saveFramebuffer);


        //then we draw the pixels to a 2D canvas and then save from the canvas
        //is there a better way?

        var saveCanvas = document.createElement('canvas');
        saveCanvas.width = saveWidth;
        saveCanvas.height = saveHeight;
        var saveContext = saveCanvas.getContext('2d');

        var imageData = saveContext.createImageData(saveWidth, saveHeight);
        imageData.data.set(savePixels);
        saveContext.putImageData(imageData, 0, 0);

        window.open(saveCanvas.toDataURL());
    };

    Paint.prototype.onMouseMove = function (event) {
        event.preventDefault();

        var position = Utilities.getMousePosition(event, this.canvas);

        var mouseX = position.x;
        var mouseY = this.canvas.height - position.y;

        this.brushX = mouseX;
        this.brushY = mouseY;


        if (!this.brushInitialized) {
            this.brush.initialize(this.brushX, this.brushY, BRUSH_HEIGHT * this.brushScale, this.brushScale);

            this.brushInitialized = true;
        }

        if (this.interactionState === InteractionMode.PANNING) {
            var deltaX = mouseX - this.mouseX;
            var deltaY = mouseY - this.mouseY;

            this.paintingRectangle.left += deltaX;
            this.paintingRectangle.bottom += deltaY;

            this.paintingRectangle.left = Utilities.clamp(this.paintingRectangle.left, -this.paintingRectangle.width, this.canvas.width);
            this.paintingRectangle.bottom = Utilities.clamp(this.paintingRectangle.bottom, -this.paintingRectangle.height, this.canvas.height);
        } else if (this.interactionState === InteractionMode.RESIZING) {
            if (this.resizingSide === ResizingSide.LEFT || this.resizingSide === ResizingSide.TOP_LEFT || this.resizingSide === ResizingSide.BOTTOM_LEFT) {
                this.newPaintingRectangle.left = Utilities.clamp(mouseX,
                    this.paintingRectangle.getRight() - this.maxPaintingWidth,
                    this.paintingRectangle.getRight() - MIN_PAINTING_WIDTH);
                this.newPaintingRectangle.width = this.paintingRectangle.left + this.paintingRectangle.width - this.newPaintingRectangle.left;
            }

            if (this.resizingSide === ResizingSide.RIGHT || this.resizingSide === ResizingSide.TOP_RIGHT || this.resizingSide === ResizingSide.BOTTOM_RIGHT) {
                this.newPaintingRectangle.width = Utilities.clamp(mouseX - this.paintingRectangle.left, MIN_PAINTING_WIDTH, this.maxPaintingWidth);
            }

            if (this.resizingSide === ResizingSide.BOTTOM || this.resizingSide === ResizingSide.BOTTOM_LEFT || this.resizingSide === ResizingSide.BOTTOM_RIGHT) {
                this.newPaintingRectangle.bottom = Utilities.clamp(mouseY,
                    this.paintingRectangle.getTop() - this.maxPaintingWidth,
                    this.paintingRectangle.getTop() - MIN_PAINTING_WIDTH);

                this.newPaintingRectangle.height = this.paintingRectangle.bottom + this.paintingRectangle.height - this.newPaintingRectangle.bottom;
            }

            if (this.resizingSide === ResizingSide.TOP || this.resizingSide === ResizingSide.TOP_LEFT || this.resizingSide === ResizingSide.TOP_RIGHT) {
                this.newPaintingRectangle.height = Utilities.clamp(mouseY - this.paintingRectangle.bottom, MIN_PAINTING_WIDTH, this.maxPaintingWidth);
            }
        }

        this.colorPicker.onMouseMove(position.x, this.canvas.height - position.y);


        this.mouseX = mouseX;
        this.mouseY = mouseY;
    };

    Paint.prototype.topggleCanvasResizeLock = function(){
      // toggle drag to unlock canvas
      CANVAS_RESIZE=!CANVAS_RESIZE;
      var img = CANVAS_RESIZE ? 'lock' : 'unlock';
      document.getElementById('canvasLockImage').src='images/'+img+'.png';
    }

    Paint.prototype.allowCanvasResize = function(i){
      return !CANVAS_RESIZE ? i: '';
    }

    Paint.prototype.getResizingSide = function (mouseX, mouseY) { //the side we'd be resizing with the current mouse position
        //we can resize if our perpendicular distance to an edge is less than RESIZING_RADIUS

        if (Math.abs(mouseX - this.paintingRectangle.left) <= RESIZING_RADIUS && Math.abs(mouseY - this.paintingRectangle.getTop()) <= RESIZING_RADIUS) { //top left
            return this.allowCanvasResize(ResizingSide.TOP_LEFT);
        }

        if (Math.abs(mouseX - this.paintingRectangle.getRight()) <= RESIZING_RADIUS && Math.abs(mouseY - this.paintingRectangle.getTop()) <= RESIZING_RADIUS) { //top right
            return this.allowCanvasResize(ResizingSide.TOP_RIGHT);
        }

        if (Math.abs(mouseX - this.paintingRectangle.left) <= RESIZING_RADIUS && Math.abs(mouseY - this.paintingRectangle.bottom) <= RESIZING_RADIUS) { //bottom left
            return this.allowCanvasResize(ResizingSide.BOTTOM_LEFT);
        }

        if (Math.abs(mouseX - this.paintingRectangle.getRight()) <= RESIZING_RADIUS && Math.abs(mouseY - this.paintingRectangle.bottom) <= RESIZING_RADIUS) { //bottom right
            return this.allowCanvasResize(ResizingSide.BOTTOM_RIGHT);
        }


        if (mouseY > this.paintingRectangle.bottom && mouseY <= this.paintingRectangle.getTop()) { //left or right
            if (Math.abs(mouseX - this.paintingRectangle.left) <= RESIZING_RADIUS) { //left
                return this.allowCanvasResize(ResizingSide.LEFT);
            } else if (Math.abs(mouseX - this.paintingRectangle.getRight()) <= RESIZING_RADIUS) { //right
                return this.allowCanvasResize(ResizingSide.RIGHT);
            }
        }

        if (mouseX > this.paintingRectangle.left && mouseX <= this.paintingRectangle.getRight()) { //bottom or top
            if (Math.abs(mouseY - this.paintingRectangle.bottom) <= RESIZING_RADIUS) { //bottom
                return this.allowCanvasResize(ResizingSide.BOTTOM);
            } else if (Math.abs(mouseY - this.paintingRectangle.getTop()) <= RESIZING_RADIUS) { //top
                return this.allowCanvasResize(ResizingSide.TOP);
            }
        }

        return ResizingSide.NONE;
    };

    //what interaction mode would be triggered if we clicked with given mouse position
    Paint.prototype.desiredInteractionMode = function (mouseX, mouseY) {
        var mouseOverPanel = mouseX < PANEL_WIDTH && mouseY > this.canvas.height - PANEL_HEIGHT;

        if (mouseOverPanel) {
            return InteractionMode.NONE;
        } else if (this.spaceDown || this.mouseX < this.paintingRectangle.left - RESIZING_RADIUS || this.mouseX > this.paintingRectangle.left + this.paintingRectangle.width + RESIZING_RADIUS || this.mouseY < this.paintingRectangle.bottom - RESIZING_RADIUS || this.mouseY > this.paintingRectangle.bottom + this.paintingRectangle.height + RESIZING_RADIUS) {
            return InteractionMode.PANNING;
        } else if (this.getResizingSide(mouseX, mouseY) !== ResizingSide.NONE) {
            return InteractionMode.RESIZING;
        } else {
            return InteractionMode.PAINTING;
        }
    };

    Paint.prototype.onMouseDown = function (event) {
        event.preventDefault();

        var position = Utilities.getMousePosition(event, this.canvas);

        var mouseX = position.x;
        var mouseY = this.canvas.height - position.y;

        this.mouseX = mouseX;
        this.mouseY = mouseY;

        this.colorPicker.onMouseDown(mouseX, mouseY);

        if (!this.colorPicker.isInUse()) {

            var mode = this.desiredInteractionMode(mouseX, mouseY);

            if (mode === InteractionMode.PANNING) {
                this.interactionState = InteractionMode.PANNING;
            } else if (mode === InteractionMode.RESIZING) {
                this.interactionState = InteractionMode.RESIZING;

                this.resizingSide = this.getResizingSide(mouseX, mouseY);

                this.newPaintingRectangle = this.paintingRectangle.clone();

            } else if (mode === InteractionMode.PAINTING) {
                this.interactionState = InteractionMode.PAINTING;
            }
        }
    };

    Paint.prototype.onMouseUp = function (event) {
        event.preventDefault();

        var position = Utilities.getMousePosition(event, this.canvas);

        this.colorPicker.onMouseUp(position.x, this.canvas.height - position.y);

        if (this.interactionState === InteractionMode.RESIZING) { //if we're stopping the resize
            //resize simulator

            var offsetX = 0, offsetY = 0;

            if (this.resizingSide === ResizingSide.LEFT || this.resizingSide === ResizingSide.TOP_LEFT || this.resizingSide === ResizingSide.BOTTOM_LEFT) {
                offsetX = (this.paintingRectangle.left - this.newPaintingRectangle.left) * this.resolutionScale;
            }

            if (this.resizingSide === ResizingSide.BOTTOM || this.resizingSide === ResizingSide.BOTTOM_LEFT || this.resizingSide === ResizingSide.BOTTOM_RIGHT) {
                offsetY = (this.paintingRectangle.bottom - this.newPaintingRectangle.bottom) * this.resolutionScale;
            }

            this.paintingRectangle = this.newPaintingRectangle;

            this.simulator.resize(this.getPaintingResolutionWidth(), this.getPaintingResolutionHeight(), offsetX, offsetY, RESIZING_FEATHER_SIZE);
        }

        this.interactionState = InteractionMode.NONE;
    };

    Paint.prototype.onMouseOver = function (event) {
        event.preventDefault();

        var position = Utilities.getMousePosition(event, this.canvas);

        var mouseX = position.x;
        var mouseY = this.canvas.height - position.y;

        this.brushX = mouseX;
        this.brushY = mouseY;


        this.brush.initialize(this.brushX, this.brushY, BRUSH_HEIGHT * this.brushScale, this.brushScale);
        this.brushInitialized = true;
    };

    Paint.prototype.onWheel = function (event) {
        event.preventDefault();

        var scrollDelta = event.deltaY < 0.0 ? -1.0 : 1.0;

        this.brushScale = Utilities.clamp(this.brushScale + scrollDelta * -5.0, MIN_BRUSH_SCALE, MAX_BRUSH_SCALE);

        this.brushSizeSlider.setValue(this.brushScale);
    };

    return Paint;
}());
