'use strict'

var WrappedGL = (function () {

    var CONSTANT_NAMES = [
        'ACTIVE_ATTRIBUTES',
        'ACTIVE_ATTRIBUTE_MAX_LENGTH',
        'ACTIVE_TEXTURE',
        'ACTIVE_UNIFORMS',
        'ACTIVE_UNIFORM_MAX_LENGTH',
        'ALIASED_LINE_WIDTH_RANGE',
        'ALIASED_POINT_SIZE_RANGE',
        'ALPHA',
        'ALPHA_BITS',
        'ALWAYS',
        'ARRAY_BUFFER',
        'ARRAY_BUFFER_BINDING',
        'ATTACHED_SHADERS',
        'BACK',
        'BLEND',
        'BLEND_COLOR',
        'BLEND_DST_ALPHA',
        'BLEND_DST_RGB',
        'BLEND_EQUATION',
        'BLEND_EQUATION_ALPHA',
        'BLEND_EQUATION_RGB',
        'BLEND_SRC_ALPHA',
        'BLEND_SRC_RGB',
        'BLUE_BITS',
        'BOOL',
        'BOOL_VEC2',
        'BOOL_VEC3',
        'BOOL_VEC4',
        'BROWSER_DEFAULT_WEBGL',
        'BUFFER_SIZE',
        'BUFFER_USAGE',
        'BYTE',
        'CCW',
        'CLAMP_TO_EDGE',
        'COLOR_ATTACHMENT0',
        'COLOR_BUFFER_BIT',
        'COLOR_CLEAR_VALUE',
        'COLOR_WRITEMASK',
        'COMPILE_STATUS',
        'COMPRESSED_TEXTURE_FORMATS',
        'CONSTANT_ALPHA',
        'CONSTANT_COLOR',
        'CONTEXT_LOST_WEBGL',
        'CULL_FACE',
        'CULL_FACE_MODE',
        'CURRENT_PROGRAM',
        'CURRENT_VERTEX_ATTRIB',
        'CW',
        'DECR',
        'DECR_WRAP',
        'DELETE_STATUS',
        'DEPTH_ATTACHMENT',
        'DEPTH_BITS',
        'DEPTH_BUFFER_BIT',
        'DEPTH_CLEAR_VALUE',
        'DEPTH_COMPONENT',
        'DEPTH_COMPONENT16',
        'DEPTH_FUNC',
        'DEPTH_RANGE',
        'DEPTH_STENCIL',
        'DEPTH_STENCIL_ATTACHMENT',
        'DEPTH_TEST',
        'DEPTH_WRITEMASK',
        'DITHER',
        'DONT_CARE',
        'DST_ALPHA',
        'DST_COLOR',
        'DYNAMIC_DRAW',
        'ELEMENT_ARRAY_BUFFER',
        'ELEMENT_ARRAY_BUFFER_BINDING',
        'EQUAL',
        'FASTEST',
        'FLOAT',
        'FLOAT_MAT2',
        'FLOAT_MAT3',
        'FLOAT_MAT4',
        'FLOAT_VEC2',
        'FLOAT_VEC3',
        'FLOAT_VEC4',
        'FRAGMENT_SHADER',
        'FRAMEBUFFER',
        'FRAMEBUFFER_ATTACHMENT_OBJECT_NAME',
        'FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE',
        'FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE',
        'FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL',
        'FRAMEBUFFER_BINDING',
        'FRAMEBUFFER_COMPLETE',
        'FRAMEBUFFER_INCOMPLETE_ATTACHMENT',
        'FRAMEBUFFER_INCOMPLETE_DIMENSIONS',
        'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT',
        'FRAMEBUFFER_UNSUPPORTED',
        'FRONT',
        'FRONT_AND_BACK',
        'FRONT_FACE',
        'FUNC_ADD',
        'FUNC_REVERSE_SUBTRACT',
        'FUNC_SUBTRACT',
        'GENERATE_MIPMAP_HINT',
        'GEQUAL',
        'GREATER',
        'GREEN_BITS',
        'HIGH_FLOAT',
        'HIGH_INT',
        'INCR',
        'INCR_WRAP',
        'INFO_LOG_LENGTH',
        'INT',
        'INT_VEC2',
        'INT_VEC3',
        'INT_VEC4',
        'INVALID_ENUM',
        'INVALID_FRAMEBUFFER_OPERATION',
        'INVALID_OPERATION',
        'INVALID_VALUE',
        'INVERT',
        'KEEP',
        'LEQUAL',
        'LESS',
        'LINEAR',
        'LINEAR_MIPMAP_LINEAR',
        'LINEAR_MIPMAP_NEAREST',
        'LINES',
        'LINE_LOOP',
        'LINE_STRIP',
        'LINE_WIDTH',
        'LINK_STATUS',
        'LOW_FLOAT',
        'LOW_INT',
        'LUMINANCE',
        'LUMINANCE_ALPHA',
        'MAX_COMBINED_TEXTURE_IMAGE_UNITS',
        'MAX_CUBE_MAP_TEXTURE_SIZE',
        'MAX_FRAGMENT_UNIFORM_VECTORS',
        'MAX_RENDERBUFFER_SIZE',
        'MAX_TEXTURE_IMAGE_UNITS',
        'MAX_TEXTURE_SIZE',
        'MAX_VARYING_VECTORS',
        'MAX_VERTEX_ATTRIBS',
        'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
        'MAX_VERTEX_UNIFORM_VECTORS',
        'MAX_VIEWPORT_DIMS',
        'MEDIUM_FLOAT',
        'MEDIUM_INT',
        'MIRRORED_REPEAT',
        'NEAREST',
        'NEAREST_MIPMAP_LINEAR',
        'NEAREST_MIPMAP_NEAREST',
        'NEVER',
        'NICEST',
        'NONE',
        'NOTEQUAL',
        'NO_ERROR',
        'NUM_COMPRESSED_TEXTURE_FORMATS',
        'ONE',
        'ONE_MINUS_CONSTANT_ALPHA',
        'ONE_MINUS_CONSTANT_COLOR',
        'ONE_MINUS_DST_ALPHA',
        'ONE_MINUS_DST_COLOR',
        'ONE_MINUS_SRC_ALPHA',
        'ONE_MINUS_SRC_COLOR',
        'OUT_OF_MEMORY',
        'PACK_ALIGNMENT',
        'POINTS',
        'POLYGON_OFFSET_FACTOR',
        'POLYGON_OFFSET_FILL',
        'POLYGON_OFFSET_UNITS',
        'RED_BITS',
        'RENDERBUFFER',
        'RENDERBUFFER_ALPHA_SIZE',
        'RENDERBUFFER_BINDING',
        'RENDERBUFFER_BLUE_SIZE',
        'RENDERBUFFER_DEPTH_SIZE',
        'RENDERBUFFER_GREEN_SIZE',
        'RENDERBUFFER_HEIGHT',
        'RENDERBUFFER_INTERNAL_FORMAT',
        'RENDERBUFFER_RED_SIZE',
        'RENDERBUFFER_STENCIL_SIZE',
        'RENDERBUFFER_WIDTH',
        'RENDERER',
        'REPEAT',
        'REPLACE',
        'RGB',
        'RGB5_A1',
        'RGB565',
        'RGBA',
        'RGBA4',
        'SAMPLER_2D',
        'SAMPLER_CUBE',
        'SAMPLES',
        'SAMPLE_ALPHA_TO_COVERAGE',
        'SAMPLE_BUFFERS',
        'SAMPLE_COVERAGE',
        'SAMPLE_COVERAGE_INVERT',
        'SAMPLE_COVERAGE_VALUE',
        'SCISSOR_BOX',
        'SCISSOR_TEST',
        'SHADER_COMPILER',
        'SHADER_SOURCE_LENGTH',
        'SHADER_TYPE',
        'SHADING_LANGUAGE_VERSION',
        'SHORT',
        'SRC_ALPHA',
        'SRC_ALPHA_SATURATE',
        'SRC_COLOR',
        'STATIC_DRAW',
        'STENCIL_ATTACHMENT',
        'STENCIL_BACK_FAIL',
        'STENCIL_BACK_FUNC',
        'STENCIL_BACK_PASS_DEPTH_FAIL',
        'STENCIL_BACK_PASS_DEPTH_PASS',
        'STENCIL_BACK_REF',
        'STENCIL_BACK_VALUE_MASK',
        'STENCIL_BACK_WRITEMASK',
        'STENCIL_BITS',
        'STENCIL_BUFFER_BIT',
        'STENCIL_CLEAR_VALUE',
        'STENCIL_FAIL',
        'STENCIL_FUNC',
        'STENCIL_INDEX',
        'STENCIL_INDEX8',
        'STENCIL_PASS_DEPTH_FAIL',
        'STENCIL_PASS_DEPTH_PASS',
        'STENCIL_REF',
        'STENCIL_TEST',
        'STENCIL_VALUE_MASK',
        'STENCIL_WRITEMASK',
        'STREAM_DRAW',
        'SUBPIXEL_BITS',
        'TEXTURE',
        'TEXTURE0',
        'TEXTURE1',
        'TEXTURE2',
        'TEXTURE3',
        'TEXTURE4',
        'TEXTURE5',
        'TEXTURE6',
        'TEXTURE7',
        'TEXTURE8',
        'TEXTURE9',
        'TEXTURE10',
        'TEXTURE11',
        'TEXTURE12',
        'TEXTURE13',
        'TEXTURE14',
        'TEXTURE15',
        'TEXTURE16',
        'TEXTURE17',
        'TEXTURE18',
        'TEXTURE19',
        'TEXTURE20',
        'TEXTURE21',
        'TEXTURE22',
        'TEXTURE23',
        'TEXTURE24',
        'TEXTURE25',
        'TEXTURE26',
        'TEXTURE27',
        'TEXTURE28',
        'TEXTURE29',
        'TEXTURE30',
        'TEXTURE31',
        'TEXTURE_2D',
        'TEXTURE_BINDING_2D',
        'TEXTURE_BINDING_CUBE_MAP',
        'TEXTURE_CUBE_MAP',
        'TEXTURE_CUBE_MAP_NEGATIVE_X',
        'TEXTURE_CUBE_MAP_NEGATIVE_Y',
        'TEXTURE_CUBE_MAP_NEGATIVE_Z',
        'TEXTURE_CUBE_MAP_POSITIVE_X',
        'TEXTURE_CUBE_MAP_POSITIVE_Y',
        'TEXTURE_CUBE_MAP_POSITIVE_Z',
        'TEXTURE_MAG_FILTER',
        'TEXTURE_MIN_FILTER',
        'TEXTURE_WRAP_S',
        'TEXTURE_WRAP_T',
        'TRIANGLES',
        'TRIANGLE_FAN',
        'TRIANGLE_STRIP',
        'UNPACK_ALIGNMENT',
        'UNPACK_COLORSPACE_CONVERSION_WEBGL',
        'UNPACK_FLIP_Y_WEBGL',
        'UNPACK_PREMULTIPLY_ALPHA_WEBGL',
        'UNSIGNED_BYTE',
        'UNSIGNED_INT',
        'UNSIGNED_SHORT',
        'UNSIGNED_SHORT_4_4_4_4',
        'UNSIGNED_SHORT_5_5_5_1',
        'UNSIGNED_SHORT_5_6_5',
        'VALIDATE_STATUS',
        'VENDOR',
        'VERSION',
        'VERTEX_ATTRIB_ARRAY_BUFFER_BINDING',
        'VERTEX_ATTRIB_ARRAY_ENABLED',
        'VERTEX_ATTRIB_ARRAY_NORMALIZED',
        'VERTEX_ATTRIB_ARRAY_POINTER',
        'VERTEX_ATTRIB_ARRAY_SIZE',
        'VERTEX_ATTRIB_ARRAY_STRIDE',
        'VERTEX_ATTRIB_ARRAY_TYPE',
        'VERTEX_SHADER',
        'VIEWPORT',
        'ZERO'
    ];

    WrappedGL.create = function (canvas, options) {
        var gl = null;
        try {
            gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
        } catch (e) { //no webgl support
            return null;
        }
        if (gl === null) { //no webgl support
            return null;
        }

        return new WrappedGL(gl);
    }


    function WrappedGL (gl) {
        this.gl = gl;


        for (var i = 0; i < CONSTANT_NAMES.length; i += 1) {
            this[CONSTANT_NAMES[i]] = gl[CONSTANT_NAMES[i]];
        };

        this.changedParameters = {}; //parameters that aren't default

        //each parameter is an object like
        /*
        {
            defaults: [values],
            setter: function (called with this set to gl)

            //undefined flag means not used
            usedInDraw: whether this state matters for drawing
            usedInClear: whether this state matters for clearing
            usedInRead: wheter this state matters for reading
        }

        //the number of parameters in each defaults array corresponds to the arity of the corresponding setter
        */

        this.parameters = {
            'framebuffer': {
                defaults: [null],
                setter: function (framebuffer) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                },
                usedInDraw: true,
                usedInClear: true,
                usedInRead: true
            },
            'program': {
                defaults: [ {program: null} ],
                setter: function (wrappedProgram) {
                    gl.useProgram(wrappedProgram.program);
                },
                usedInDraw: true
            },
            'viewport': {
                defaults: [0, 0, 0, 0],
                setter: gl.viewport,
                usedInDraw: true,
                usedInClear: true
            },
            'indexBuffer': {
                defaults: [null],
                setter: function (buffer) {
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
                },
                usedInDraw: true
            },
            'depthTest': {
                defaults: [false],
                setter: function (enabled) {
                    if (enabled) {
                        gl.enable(gl.DEPTH_TEST);
                    } else {
                        gl.disable(gl.DEPTH_TEST);
                    }
                },
                usedInDraw: true
            },
            'depthFunc': {
                defaults: [gl.LESS],
                setter: gl.depthFunc,
                usedInDraw: true
            },
            'cullFace': {
                defaults: [false],
                setter: function (enabled) {
                    if (enabled) {
                        gl.enable(gl.CULL_FACE);
                    } else {
                        gl.disable(gl.CULL_FACE);
                    }
                },
                usedInDraw: true
            },
            'frontFace': {
                defaults: [gl.CCW],
                setter: gl.frontFace
            },
            'blend': {
                defaults: [false],
                setter: function (enabled) {
                    if (enabled) {
                        gl.enable(gl.BLEND);
                    } else {
                        gl.disable(gl.BLEND);
                    }
                },
                usedInDraw: true
            },
            'blendEquation': {
                defaults: [gl.FUNC_ADD, gl.FUNC_ADD],
                setter: gl.blendEquationSeparate,
                usedInDraw: true
            },
            'blendFunc': {
                defaults: [gl.ONE, gl.ZERO, gl.ONE, gl.ZERO],
                setter: gl.blendFuncSeparate,
                usedInDraw: true
            },
            'polygonOffsetFill': {
                defaults: [false],
                setter: function (enabled) {
                    if (enabled) {
                        gl.enable(gl.POLYGON_OFFSET_FILL);
                    } else {
                        gl.disable(gl.POLYGON_OFFSET_FILL);
                    }
                },
                usedInDraw: true
            },
            'polygonOffset': {
                defaults: [0, 0],
                setter: gl.polygonOffset,
                usedInDraw: true
            },
            'scissorTest': {
                defaults: [false],
                setter: function (enabled) {
                    if (enabled) {
                        gl.enable(gl.SCISSOR_TEST);
                    } else {
                        gl.disable(gl.SCISSOR_TEST);
                    }
                },
                usedInDraw: true,
                usedInClear: true
            },
            'scissor': {
                defaults: [0, 0, 0, 0],
                setter: gl.scissor,
                usedInDraw: true,
                usedInClear: true
            },
            'colorMask': {
                defaults: [true, true, true, true],
                setter: gl.colorMask,
                usedInDraw: true,
                usedInClear: true
            },
            'depthMask': {
                defaults: [true],
                setter: gl.depthMask,
                usedInDraw: true,
                usedInClear: true
            },
            'clearColor': {
                defaults: [0, 0, 0, 0],
                setter: gl.clearColor,
                usedInClear: true
            },
            'clearDepth': {
                defaults: [1],
                setter: gl.clearDepth,
                usedInClear: true
            }
        };


        var maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
        for (var i = 0; i < maxVertexAttributes; ++i) {
            //we need to capture the index in a closure
            this.parameters['attributeArray' + i.toString()] = {
                defaults: [null, 0, null, false, 0, 0],
                setter: (function () {
                    var index = i;

                    return function (buffer, size, type, normalized, stride, offset) {
                        if (buffer !== null) {
                            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                            gl.vertexAttribPointer(index, size, type, normalized, stride, offset);

                            gl.enableVertexAttribArray(index); //TODO: cache this
                        }
                    }
                }()),
                usedInDraw: true
            };
        }

        var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        for (var i = 0; i < maxTextures; ++i) {
            this.parameters['texture' + i.toString()] = {
                defaults: [gl.TEXTURE_2D, null],
                setter: (function () {
                    //we need to capture the unit in a closure
                    var unit = i;

                    return function (target, texture) {
                        gl.activeTexture(gl.TEXTURE0 + unit);
                        gl.bindTexture(target, texture);
                    }
                }()),
                usedInDraw: true
            };
        }


        this.uniformSetters = {
            '1i': gl.uniform1i,
            '2i': gl.uniform2i,
            '3i': gl.uniform3i,
            '4i': gl.uniform4i,
            '1f': gl.uniform1f,
            '2f': gl.uniform2f,
            '3f': gl.uniform3f,
            '4f': gl.uniform4f,
            '1fv': gl.uniform1fv,
            '2fv': gl.uniform2fv,
            '3fv': gl.uniform3fv,
            '4fv': gl.uniform4fv,
            'matrix2fv': gl.uniformMatrix2fv,
            'matrix3fv': gl.uniformMatrix3fv,
            'matrix4fv': gl.uniformMatrix4fv
        };


        this.defaultTextureUnit = 0; //the texure unit we use for modifying textures

    }

    WrappedGL.checkWebGLSupport = function (successCallback, failureCallback) {
        WrappedGL.checkWebGLSupportWithExtensions([], successCallback, function (hasWebGL, unsupportedExtensions) {
            failureCallback();
        });
    }

    WrappedGL.checkWebGLSupportWithExtensions = function (extensions, successCallback, failureCallback) { //successCallback(), failureCallback(hasWebGL, unsupportedExtensions)
        var canvas = document.createElement('canvas');
        var gl = null;
        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {
            failureCallback(false, []); //no webgl support
            return;
        }
        if (gl === null) {
            failureCallback(false, []); //no webgl support
            return;
        }

        var unsupportedExtensions = [];
        for (var i = 0; i < extensions.length; ++i) {
            if (gl.getExtension(extensions[i]) === null) {
                unsupportedExtensions.push(extensions[i]);
            }
        }
        if (unsupportedExtensions.length > 0) {
            failureCallback(true, unsupportedExtensions); //webgl support but no extensions
            return;
        }

        //webgl support and all required extensions
        successCallback();
    };

    WrappedGL.prototype.getSupportedExtensions = function () {
        return this.gl.getSupportedExtensions();
    };

    //returns null if the extension is not supported, otherwise the extension object
    WrappedGL.prototype.getExtension = function (name) {
        var gl = this.gl;

        //for certain extensions, we need to expose additional, wrapped rendering compatible, methods directly on WrappedGL and DrawState
        if (name === 'ANGLE_instanced_arrays') {
            var instancedExt = gl.getExtension('ANGLE_instanced_arrays');

            if (instancedExt !== null) {
                this.instancedExt = instancedExt;

                var maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

                for (var i = 0; i < maxVertexAttributes; ++i) {
                    this.parameters['attributeDivisor' + i.toString()] = {
                        defaults: [0],
                        setter: (function () {
                            var index = i;

                            return function (divisor) {
                                instancedExt.vertexAttribDivisorANGLE(index, divisor); 
                            }
                        }()),
                        usedInDraw: true
                    };
                }

                //override vertexAttribPointer
                DrawState.prototype.vertexAttribPointer = function (buffer, index, size, type, normalized, stride, offset) {
                    this.setParameter('attributeArray' + index.toString(), [buffer, size, type, normalized, stride, offset]);

                    if (this.changedParameters.hasOwnProperty('attributeDivisor' + index.toString())) {
                        //we need to have divisor information for any attribute location that has a bound buffer
                        this.setParameter('attributeDivisor' + index.toString(), [0]);
                    }

                    return this;
                };

                DrawState.prototype.vertexAttribDivisorANGLE = function (index, divisor) {
                    this.setParameter('attributeDivisor' + index.toString(), [divisor]);
                    return this;
                };

                this.drawArraysInstancedANGLE = function (drawState, mode, first, count, primcount) {
                    this.resolveDrawState(drawState);

                    this.instancedExt.drawArraysInstancedANGLE(mode, first, count, primcount);
                };

                this.drawElementsInstancedANGLE = function (drawState, mode, count, type, indices, primcount) {
                    this.resolveDrawState(drawState);

                    this.instancedExt.drawElementsInstancedANGLE(mode, count, type, indices, primcount);
                };

                return {};
            } else {
                return null;
            }

        } else { //all others, we can just return as is (we can treat them as simple enums)
            return gl.getExtension(name);
        }
    };

    WrappedGL.prototype.getParameter = function (parameter) {
        return this.gl.getParameter(parameter);
    };

    WrappedGL.prototype.canRenderToTexture = function (type) {
        var gl = this.gl;

        var framebuffer = this.createFramebuffer(); 
        var texture = this.buildTexture(gl.RGBA, type, 1, 1, null, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);
        this.framebufferTexture2D(framebuffer, gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        var result = this.checkFramebufferStatus(framebuffer) === gl.FRAMEBUFFER_COMPLETE;

        this.deleteFramebuffer(framebuffer);
        this.deleteTexture(texture);

        return result;
    };

    WrappedGL.prototype.checkFramebufferStatus = function (framebuffer) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.changedParameters['framebuffer'] = framebuffer;

        return this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    };

    WrappedGL.prototype.getShaderPrecisionFormat = function (shaderType, precisionType) {
        return this.gl.getShaderPrecisionFormat(shaderType, precisionType);
    };


    WrappedGL.prototype.hasHalfFloatTextureSupport = function () {
        var ext = this.getExtension('OES_texture_half_float');
        if (ext === null) return false;
        if (this.getExtension('OES_texture_half_float_linear') === null) return false;
        if (!this.canRenderToTexture(ext.HALF_FLOAT_OES)) return false;

        return true;
    };

    WrappedGL.prototype.hasFloatTextureSupport = function () {
        if (this.getExtension('OES_texture_float') === null || this.getExtension('OES_texture_float_linear') === null) return false;
        if (!this.canRenderToTexture(this.FLOAT)) return false;

        return true;
    };


    //flag is one of usedInDraw, usedInClear, usedInRead
    WrappedGL.prototype.resolveState = function (state, flag) {
        var gl = this.gl;
        

        //first let's revert all states to default that were set but now aren't set
        for (var parameterName in this.changedParameters) {
            if (this.changedParameters.hasOwnProperty(parameterName)) {
                if (!state.changedParameters.hasOwnProperty(parameterName)) { //if this is not set in the incoming draw state then we need to go back to default
                    if (this.parameters[parameterName][flag]) {
                        this.parameters[parameterName].setter.apply(this.gl, this.parameters[parameterName].defaults);

                        delete this.changedParameters[parameterName];
                    }
                }
            }
        }


        //now we set all of the new incoming states

        for (var parameterName in state.changedParameters) {
            if (state.changedParameters.hasOwnProperty(parameterName)) {

                if (!this.changedParameters.hasOwnProperty(parameterName) || //if this state is not currently set
                    !arraysEqual(this.changedParameters[parameterName], state.changedParameters[parameterName]) //or if it's changed
                    ) {

                    this.changedParameters[parameterName] = state.changedParameters[parameterName];

                    this.parameters[parameterName].setter.apply(this.gl, this.changedParameters[parameterName]);
                }
            }
        }
    }

    WrappedGL.prototype.resolveDrawState = function (drawState) {
        var gl = this.gl;

        this.resolveState(drawState, 'usedInDraw');

        //resolve uniform values
        //we don't diff uniform values, it's just not worth it
        var program = drawState.changedParameters.program[0]; //we assume a draw state has a program

        for (var uniformName in drawState.uniforms) {
            if (drawState.uniforms.hasOwnProperty(uniformName)) {
                //this array creation is annoying....
                var args = [program.uniformLocations[uniformName]].concat(drawState.uniforms[uniformName].value);

                this.uniformSetters[drawState.uniforms[uniformName].type].apply(gl, args);
            }
        }

    };

    WrappedGL.prototype.drawArrays = function (drawState, mode, first, count) {
        this.resolveDrawState(drawState);

        this.gl.drawArrays(mode, first, count);
    };

    WrappedGL.prototype.drawElements = function (drawState, mode, count, type, offset) {
        this.resolveDrawState(drawState);

        this.gl.drawElements(mode, count, type, offset);
    };

    WrappedGL.prototype.resolveClearState = function (clearState) {
        this.resolveState(clearState, 'usedInClear');
    };

    WrappedGL.prototype.clear = function (clearState, bit) {
        this.resolveClearState(clearState);

        this.gl.clear(bit);
    };

    WrappedGL.prototype.resolveReadState = function (readState) {
        this.resolveState(readState, 'usedInRead');
    };

    WrappedGL.prototype.readPixels = function (readState, x, y, width, height, format, type, pixels) {
        this.resolveReadState(readState);

        this.gl.readPixels(x, y, width, height, format, type, pixels);
    };

    WrappedGL.prototype.finish = function () {
        this.gl.finish();
        return this;
    };

    WrappedGL.prototype.flush = function () {
        this.gl.flush();
        return this;
    };

    WrappedGL.prototype.getError = function () {
        return this.gl.getError();
    };

    WrappedGL.prototype.createFramebuffer = function () {
        return this.gl.createFramebuffer();
    };

    WrappedGL.prototype.framebufferTexture2D = function (framebuffer, target, attachment, textarget, texture, level) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.changedParameters['framebuffer'] = framebuffer;

        this.gl.framebufferTexture2D(target, attachment, textarget, texture, level);

        return this;
    };

    WrappedGL.prototype.framebufferRenderbuffer = function (framebuffer, target, attachment, renderbuffertarget, renderbuffer) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.changedParameters['framebuffer'] = framebuffer;

        this.gl.framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer);
    };

    WrappedGL.prototype.drawBuffers = function (framebuffer, buffers) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.changedParameters['framebuffer'] = framebuffer;

        this.drawExt.drawBuffersWEBGL(buffers);
    };

    WrappedGL.prototype.createTexture = function () {
        return this.gl.createTexture();
    };

    WrappedGL.prototype.bindTextureForEditing = function (target, texture) {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.defaultTextureUnit);
        this.gl.bindTexture(target, texture);

        this.changedParameters['texture' + this.defaultTextureUnit.toString()] = [target, texture];
    };

    //this function is overloaded, it can be either
    //(target, texture, level, internalformat, width, height, border, format, type, pixels)
    //(target, texture, level, internalformat, format, type, object)
    WrappedGL.prototype.texImage2D = function (target, texture) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(target); //add target to for texImage2D arguments list

        this.bindTextureForEditing(target, texture);
        this.gl.texImage2D.apply(this.gl, args);

        return this;
    };

    //this function is overloaded, it can be either
    //(target, texture, level, xoffset, yoffset, width, height, format, type, pixels)
    //(target, texture, level, xoffset, yoffset, format, type, object)
    WrappedGL.prototype.texSubImage2D = function (target, texture) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(target); //add target to for texImage2D arguments list

        this.bindTextureForEditing(target, texture);
        this.gl.texSubImage2D.apply(this.gl, args);

        return this;
    }

    WrappedGL.prototype.texParameteri = function(target, texture, pname, param) {
        this.bindTextureForEditing(target, texture);
        this.gl.texParameteri(target, pname, param);

        return this;
    };

    WrappedGL.prototype.texParameterf = function(target, texture, pname, param) {
        this.bindTextureForEditing(target, texture);
        this.gl.texParameterf(target, pname, param);

        return this;
    };

    WrappedGL.prototype.pixelStorei = function(target, texture, pname, param) {
        this.bindTextureForEditing(target, texture);
        this.gl.pixelStorei(pname, param);

        return this;
    };

    WrappedGL.prototype.setTextureFiltering = function (target, texture, wrapS, wrapT, minFilter, magFilter) {
        var gl = this.gl;

        this.bindTextureForEditing(target, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

        return this;
    };

    WrappedGL.prototype.generateMipmap = function (target, texture) {
        this.bindTextureForEditing(target, texture);
        this.gl.generateMipmap(target);

        return this;
    };

    WrappedGL.prototype.buildTexture = function (format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
        var texture = this.createTexture();
        this.rebuildTexture(texture, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter);

        return texture;
    };

    WrappedGL.prototype.rebuildTexture = function (texture, format, type, width, height, data, wrapS, wrapT, minFilter, magFilter) {
        this.texImage2D(this.TEXTURE_2D, texture, 0, format, width, height, 0, format, type, data)
            .setTextureFiltering(this.TEXTURE_2D, texture, wrapS, wrapT, minFilter, magFilter);

        return this;
    };

    WrappedGL.prototype.createRenderbuffer = function () {
        return this.gl.createRenderbuffer();
    };

    WrappedGL.prototype.renderbufferStorage = function (renderbuffer, target, internalformat, width, height) {
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
        this.gl.renderbufferStorage(target, internalformat, width, height);

        return this;
    };

    WrappedGL.prototype.createBuffer = function () {
        return this.gl.createBuffer();
    };

    WrappedGL.prototype.bufferData = function (buffer, target, data, usage) {
        var gl = this.gl;

        if (target === gl.ARRAY_BUFFER) {
            //we don't really care about the vertex buffer binding state...
        } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
            this.changedParameters.indexBuffer = [buffer];
        }

        gl.bindBuffer(target, buffer);
        gl.bufferData(target, data, usage);
    };

    WrappedGL.prototype.buildBuffer = function (target, data, usage) {
        var buffer = this.createBuffer();
        this.bufferData(buffer, target, data, usage);
        return buffer;
    };

    WrappedGL.prototype.bufferSubData = function (buffer, target, offset, data) {
        var gl = this.gl;

        if (target === gl.ARRAY_BUFFER) {
            //we don't really care about the vertex buffer binding state...
        } else if (target === gl.ELEMENT_ARRAY_BUFFER) {
            this.changedParameters.indexBuffer = [buffer];
        }

        gl.bindBuffer(target, buffer);
        gl.bufferSubData(target, offset, data);
    };

    WrappedGL.prototype.createProgram = function (vertexShaderSource, fragmentShaderSource, attributeLocations) {
        return new WrappedProgram(this, vertexShaderSource, fragmentShaderSource, attributeLocations); 
    };


    //loads text files and calls callback with an object like this:
    // { filename: 'content', otherFilename, 'morecontent' }
    //TODO: error conditions...
    WrappedGL.loadTextFiles = function (filenames, onLoaded) {
        var loadedSoFar = 0;
        var results = {};
        for (var i = 0; i < filenames.length; ++i) {
            var filename = filenames[i];
            (function () {
                var name = filename;

                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (request.readyState === 4) { //if this reqest is done
                        //add this file to the results object
                        var text = request.responseText;
                        results[name] = text;

                        loadedSoFar += 1;
                        if (loadedSoFar === filenames.length) { //if we've loaded all of the files
                            onLoaded(results);    
                        }
                    }
                }
                request.open('GET', name, true);
                request.send();

            }());
        }
    };

    //asynchronous
    //successCallback is called with (program)
    //vertex shader, fragment shader can either be strings or arrays of strings
    //in the array case, the file contents will be concatenated
    WrappedGL.prototype.createProgramFromFiles = function (vertexShaderPath, fragmentShaderPath, attributeLocations, successCallback, failureCallback) {
        var that = this;

        var filesToLoad = [];
        if (Array.isArray(vertexShaderPath)) {
            filesToLoad = filesToLoad.concat(vertexShaderPath);
        } else {
            filesToLoad.push(vertexShaderPath);
        }

        if (Array.isArray(fragmentShaderPath)) {
            filesToLoad = filesToLoad.concat(fragmentShaderPath);
        } else {
            filesToLoad.push(fragmentShaderPath);
        }

        WrappedGL.loadTextFiles(filesToLoad, function (files) {
            var vertexShaderSources = [];
            if (Array.isArray(vertexShaderPath)) {
                for (var i = 0; i < vertexShaderPath.length; ++i) {
                    vertexShaderSources.push(files[vertexShaderPath[i]]);
                }
            } else {
                vertexShaderSources.push(files[vertexShaderPath]);
            }


            var fragmentShaderSources = [];
            if (Array.isArray(fragmentShaderPath)) {
                for (var i = 0; i < fragmentShaderPath.length; ++i) {
                    fragmentShaderSources.push(files[fragmentShaderPath[i]]);
                }
            } else {
                fragmentShaderSources.push(files[fragmentShaderPath]);
            }

            var program =  that.createProgram(vertexShaderSources.join('\n'), fragmentShaderSources.join('\n'), attributeLocations);
            successCallback(program);
        });
    };

    /*
    input:
    {
        firstProgram: {
            vertexShader: 'first.vert',
            fragmentShader: 'first.frag',
            attributeLocations: {
                0: 'a_attribute'
            }
        },

        secondProgram: {
            vertexShader: 'second.vert',
            fragmentShader: 'second.frag',
            attributeLocations: {
                0: 'a_attribute'
            }
        }
    }

    output:
    {
        firstProgram: firstProgramObject,
        secondProgram: secondProgramObject
    */

    function keysInObject (object) {
        var count = 0;
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                count += 1;
            }
        }
        return count;
    }

    //asynchronous
    WrappedGL.prototype.createProgramsFromFiles = function (programParameters, successCallback, failureCallback) {
        var programCount = keysInObject(programParameters);

        var loadedSoFar = 0;
        var programs = {};
        for (var programName in programParameters) {
            if (programParameters.hasOwnProperty(programName)) {
                var parameters = programParameters[programName];
                
                var that = this;
                (function () {
                    var name = programName;

                    that.createProgramFromFiles(parameters.vertexShader, parameters.fragmentShader, parameters.attributeLocations, function (program) {
                        programs[name] = program;

                        loadedSoFar++;
                        if (loadedSoFar === programCount) { //if we've loaded all the programs
                            successCallback(programs);
                        }
                    
                    });
                }());
            }
        }
    };

    WrappedGL.prototype.createDrawState = function () {
        return new DrawState(this);
    };

    WrappedGL.prototype.createClearState = function () {
        return new ClearState(this);
    };

    WrappedGL.prototype.createReadState = function () {
        return new ReadState(this);
    };

    WrappedGL.prototype.deleteBuffer = function (buffer) {
        this.gl.deleteBuffer(buffer);
    };

    WrappedGL.prototype.deleteFramebuffer = function (buffer) {
        this.gl.deleteFramebuffer(buffer);
    };

    WrappedGL.prototype.deleteTexture = function (texture) {
        this.gl.deleteTexture(texture);
    };

    function buildShader (gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        //log any errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
        }
        return shader;
    };

    //we don't have to specify any or all attribute location bindings
    //any unspecified bindings will be assigned automatically and can be queried with program.getAttribLocation(attributeName)
    function WrappedProgram (wgl, vertexShaderSource, fragmentShaderSource, requestedAttributeLocations) {
        this.uniformLocations = {};
        this.uniforms = {}; //TODO: if we want to cache uniform values in the future

        var gl = wgl.gl;

        //build shaders from source
        var vertexShader = buildShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        var fragmentShader = buildShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        //create program and attach shaders
        var program = this.program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        
        //bind the attribute locations that have been specified in attributeLocations
        if (requestedAttributeLocations !== undefined) {
            for (var attributeName in requestedAttributeLocations) {
                gl.bindAttribLocation(program, requestedAttributeLocations[attributeName], attributeName);
            }
        }
        gl.linkProgram(program);


        //construct this.attributeLocations (maps attribute names to locations)
        this.attributeLocations = {};
        var numberOfAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numberOfAttributes; ++i) {
            var activeAttrib = gl.getActiveAttrib(program, i);
            var attributeName = activeAttrib.name;
            this.attributeLocations[attributeName] = gl.getAttribLocation(program, attributeName);
        }

        //cache uniform locations
        var uniformLocations = this.uniformLocations = {};
        var numberOfUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < numberOfUniforms; i += 1) {
            var activeUniform = gl.getActiveUniform(program, i),
                uniformLocation = gl.getUniformLocation(program, activeUniform.name);
            uniformLocations[activeUniform.name] = uniformLocation;
        }
    };

    //TODO: maybe this should be on WrappedGL?
    WrappedProgram.prototype.getAttribLocation = function (name) {
        return this.attributeLocations[name];
    };

    function State (wgl) {
        this.wgl = wgl;

        //all states that have been changed from defaults
        this.changedParameters = {};
        //map of state string to array of values
        //eg
        /*
            'framebuffer: [framebuffer],
            'viewport': [x, y, width, height],
            'blendMode': [rgb, alpha]
        */
    };

    //assumes a and b are equal length
    function arraysEqual (a, b) {
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };


    State.prototype.setParameter = function (parameterName, values) {
        if (!arraysEqual(values, this.wgl.parameters[parameterName].defaults)) { //if the state hasn't been set to the defaults
            this.changedParameters[parameterName] = values;
        } else { //if we're going back to defaults
            if (this.changedParameters.hasOwnProperty(parameterName)) {
                delete this.changedParameters[parameterName];
            }
        }
    };

    State.prototype.clone = function () {
        var newState = new (this.constructor)(this.wgl);

        for (var parameterName in this.changedParameters) {
            if (this.changedParameters.hasOwnProperty(parameterName)) {
                var parameterValues = this.changedParameters[parameterName];
                var clonedValues = [];
                for (var i = 0; i < parameterValues.length; ++i) {
                    clonedValues.push(parameterValues[i]);
                }
                newState.changedParameters[parameterName] = clonedValues;
            }
        }

        return newState;
    }


    //inherits from State
    function DrawState (wgl) {
        State.call(this, wgl);

        //we always set uniforms
        this.uniforms = {}; //eg: {type: '3f', value: [x, y, z]}
    }

    DrawState.prototype = Object.create(State.prototype);
    DrawState.prototype.constructor = State;


    DrawState.prototype.bindFramebuffer = function (framebuffer) {
        this.setParameter('framebuffer', [framebuffer]);
        return this;
    };

    DrawState.prototype.viewport = function (x, y, width, height) {
        this.setParameter('viewport', [x, y, width, height]);
        return this;
    };

    DrawState.prototype.enable = function (cap) {
        if (cap === this.wgl.DEPTH_TEST) {
            this.setParameter('depthTest', [true]);
        } else if (cap === this.wgl.BLEND) {
            this.setParameter('blend', [true]);
        } else if (cap === this.wgl.CULL_FACE) {
            this.setParameter('cullFace', [true]);
        } else if (cap === this.wgl.POLYGON_OFFSET_FILL) {
            this.setParameter('polygonOffsetFill', [true]);   
        } else if (cap === this.wgl.SCISSOR_TEST) {
            this.setParameter('scissorTest', [true]);
        }

        return this;
    };

    DrawState.prototype.disable = function (cap) {
        if (cap === this.wgl.DEPTH_TEST) {
            this.setParameter('depthTest', [false]);
        } else if (cap === this.wgl.BLEND) {
            this.setParameter('blend', [false]);
        } else if (cap === this.wgl.CULL_FACE) {
            this.setParameter('cullFace', [false]);
        } else if (cap === this.wgl.POLYGON_OFFSET_FILL) {
            this.setParameter('polygonOffsetFill', [false]);   
        } else if (cap === this.wgl.SCISSOR_TEST) {
            this.setParameter('scissorTest', [false]);
        }

        return this;
    };

    DrawState.prototype.vertexAttribPointer = function (buffer, index, size, type, normalized, stride, offset) {
        this.setParameter('attributeArray' + index.toString(), [buffer, size, type, normalized, stride, offset]);

        if (this.instancedExt && this.changedParameters.hasOwnProperty('attributeDivisor' + index.toString())) {
            //we need to have divisor information for any attribute location that has a bound buffer
            this.setParameter('attributeDivisor' + index.toString(), [0]);
        }

        return this;
    };

    DrawState.prototype.bindIndexBuffer = function (buffer) {
        this.setParameter('indexBuffer', [buffer]);
        return this;
    };

    DrawState.prototype.depthFunc = function (func) {
        this.setParameter('depthFunc', [func]);
        return this;
    };

    DrawState.prototype.frontFace = function (mode) {
        this.setParameter('frontFace', [mode]);
        return this;
    };

    DrawState.prototype.blendEquation = function (mode) {
        this.blendEquationSeparate(mode, mode);
        return this;
    };

    DrawState.prototype.blendEquationSeparate = function (modeRGB, modeAlpha) {
        this.setParameter('blendEquation', [modeRGB, modeAlpha]);

        return this;
    };

    DrawState.prototype.blendFunc = function (sFactor, dFactor) {
        this.blendFuncSeparate(sFactor, dFactor, sFactor, dFactor);
        return this;
    };

    DrawState.prototype.blendFuncSeparate = function (srcRGB, dstRGB, srcAlpha, dstAlpha) {
        this.setParameter('blendFunc', [srcRGB, dstRGB, srcAlpha, dstAlpha]);
        return this;
    };

    DrawState.prototype.scissor = function (x, y, width, height) {
        this.setParameter('scissor', [x, y, width, height]);
        return this;
    };

    DrawState.prototype.useProgram = function (program) {
        this.setParameter('program', [program]);
        return this;
    };

    DrawState.prototype.bindTexture = function (unit, target, texture) {
        this.setParameter('texture' + unit.toString(), [target, texture]);
        return this;
    };

    DrawState.prototype.colorMask = function (r, g, b, a) {
        this.setParameter('colorMask', [r, g, b, a]);
        return this;
    };

    DrawState.prototype.depthMask = function (enabled) {
        this.setParameter('depthMask', [enabled]);
        return this;
    };

    DrawState.prototype.polygonOffset = function (factor, units) {
        this.setParameter('polygonOffset', [factor, units]);
        return this;
    };

    DrawState.prototype.uniformTexture = function (uniformName, unit, target, texture) {
        this.uniform1i(uniformName, unit);
        this.bindTexture(unit, target, texture);

        return this;
    };

    DrawState.prototype.uniform1i = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '1i', value: [value]};
        return this;
    };

    DrawState.prototype.uniform2i = function (uniformName, x, y) {
        this.uniforms[uniformName] = {type: '2i', value: [x, y]};
        return this;
    };

    DrawState.prototype.uniform3i = function (uniformName, x, y, z) {
        this.uniforms[uniformName] = {type: '3i', value: [x, y, z]};
        return this;
    };

    DrawState.prototype.uniform4i = function (uniformName, x, y, z ,w) {
        this.uniforms[uniformName] = {type: '4i', value: [x, y, z, w]};
        return this;
    };

    DrawState.prototype.uniform1f = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '1f', value: value};
        return this;
    };

    DrawState.prototype.uniform2f = function (uniformName, x, y) {
        this.uniforms[uniformName] = {type: '2f', value: [x, y]};
        return this;
    };

    DrawState.prototype.uniform3f = function (uniformName, x, y, z) {
        this.uniforms[uniformName] = {type: '3f', value: [x, y, z]};
        return this;
    };

    DrawState.prototype.uniform4f = function (uniformName, x, y, z ,w) {
        this.uniforms[uniformName] = {type: '4f', value: [x, y, z, w]};
        return this;
    };

    DrawState.prototype.uniform1fv = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '1fv', value: [value]};
        return this;
    };

    DrawState.prototype.uniform2fv = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '2fv', value: [value]};
        return this;
    };

    DrawState.prototype.uniform3fv = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '3fv', value: [value]};
        return this;
    };

    DrawState.prototype.uniform4fv = function (uniformName, value) {
        this.uniforms[uniformName] = {type: '4fv', value: [value]};
        return this;
    };

    DrawState.prototype.uniformMatrix2fv = function (uniformName, transpose, matrix) {
        this.uniforms[uniformName] = {type: 'matrix2fv', value: [transpose, matrix]};
        return this;
    };

    DrawState.prototype.uniformMatrix3fv = function (uniformName, transpose, matrix) {
        this.uniforms[uniformName] = {type: 'matrix3fv', value: [transpose, matrix]};
        return this;
    };

    DrawState.prototype.uniformMatrix4fv = function (uniformName, transpose, matrix) {
        this.uniforms[uniformName] = {type: 'matrix4fv', value: [transpose, matrix]};
        return this;
    };


    function ClearState (wgl) {
        State.call(this, wgl);
    };

    ClearState.prototype = Object.create(State.prototype);
    ClearState.prototype.constructor = ClearState;

    ClearState.prototype.bindFramebuffer = function (framebuffer) {
        this.setParameter('framebuffer', [framebuffer]);
        return this;
    };

    ClearState.prototype.clearColor = function (r, g, b, a) {
        this.setParameter('clearColor', [r, g, b, a]);        
        return this;
    };

    ClearState.prototype.clearDepth = function (depth) {
        this.setParameter('clearDepth', [depth]);
        return this;
    }

    ClearState.prototype.colorMask = function (r, g, b, a) {
        this.setParameter('colorMask', [r, g, b, a]);
        return this;
    };

    ClearState.prototype.depthMask = function (enabled) {
        this.setParameter('depthMask', [enabled]);
        return this;
    };

    ClearState.prototype.enable = function (cap) {
        if (cap === this.wgl.SCISSOR_TEST) {
            this.setParameter('scissorTest', [true]);
        }

        return this;
    };

    ClearState.prototype.disable = function (cap) {
        if (cap === this.wgl.SCISSOR_TEST) {
            this.setParameter('scissorTest', [false]);
        }

        return this;
    };

    ClearState.prototype.scissor = function (x, y, width, height) {
        this.setParameter('scissor', [x, y, width, height]);
        return this;
    };



    function ReadState (wgl) {
        State.call(this, wgl);
    }

    ReadState.prototype = Object.create(State.prototype);
    ReadState.prototype.constructor = ReadState;

    ReadState.prototype.bindFramebuffer = function (framebuffer) {
        this.setParameter('framebuffer', [framebuffer]);
        return this;
    };



    return WrappedGL;

}());
