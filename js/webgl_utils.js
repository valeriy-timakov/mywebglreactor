import {Scene} from './scene.js'
import {Vx3Utils, Mx4Util, Transform3dBuilder} from './math_utils.js'

export function WglUtil(canvasEl){

  var scene = new Scene();

  this.getScene = function() {
    return scene;
  };


  var gl = canvasEl.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL is not supported!");
  }

  var programs = {};
  var textures = {};
  var framebuffers = [];

  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    gl.deleteShader(shader);
    throw new Error("Shader compilation error!");
  };

  function createGLProgram(vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
    gl.deleteProgram(program);
    throw new Error("Error creating program!")
  };

  function createProgram(geometry) {
    var vertexShaderName = geometry.vertexShaderName,
      fragmentShaderName = geometry.fragmentShaderName,
      vertexShaderParams = geometry.vertexShaderParams,
      fragmentShaderParams = geometry.fragmentShaderParams;
    var programName = vertexShaderName + '__' + vertexShaderParams + '.' + fragmentShaderName + '__' + fragmentShaderParams;
    if (programs[programName] == null) {
      var vertexShaderData = new shadersDataMap[vertexShaderName](vertexShaderParams),
        fragmentShaderData = new shadersDataMap[fragmentShaderName](fragmentShaderParams),
        vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderData.getBody()),
        fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderData.getBody()),
        newProgram = {
          program: createGLProgram(vertexShader, fragmentShader)
        };
      if (typeof vertexShaderData.init == 'function') {
        vertexShaderData.init(newProgram, geometry);
      }
      if (typeof fragmentShaderData.init == 'function') {
        fragmentShaderData.init(newProgram, geometry);
      }
      if (typeof vertexShaderData.bindMethods == 'function') {
        vertexShaderData.bindMethods(newProgram);
      }
      if (typeof fragmentShaderData.bindMethods == 'function') {
        fragmentShaderData.bindMethods(newProgram);
      }
      programs[programName] = newProgram;
    }
    if (typeof programs[programName].initBuffers == 'function') {
      programs[programName].initBuffers(geometry);
    }
    return programs[programName];
  }

  function createTexture() {
    var texture = gl.createTexture();
    //gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
  }

  this.initTexture = function (name, image) {
    var texture = createTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    textures[name] = texture;
  };

  this.initGeometry = function(geometry) {
    geometry.program = createProgram(geometry);
  };

  this.initFrameBuffer = function(name, width, height) {
    var texture = createTexture();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    textures[name] = texture;
    var frameBuffer = gl.createFramebuffer();
    framebuffers[name] = frameBuffer;
    frameBuffer.width = width;
    frameBuffer.height = height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  };

  var currentSize = {};

  this.render = function(clearColor, geometries, frameBurrerName) {
    if (frameBurrerName == null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      resize(gl.canvas);
      currentSize.width = gl.canvas.width;
      currentSize.height = gl.canvas.height;
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffers[frameBurrerName]);
      currentSize.width = framebuffers[frameBurrerName].width;
      currentSize.height = framebuffers[frameBurrerName].height;
    }
    gl.viewport(0, 0, currentSize.width, currentSize.height);
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (var i in geometries) {
      var geometry = geometries[i];
      if (geometry.cullFace == 'CCW') {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
      } else if (geometry.cullFace == 'CW') {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
      } else {
        gl.disable(gl.CULL_FACE);
      }
      if (geometry.depthTestEnabled) {
        gl.enable(gl.DEPTH_TEST);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }
      gl.useProgram(geometry.program.program);
      geometry.program.setBuffers(geometry);
      if (typeof geometry.program.setTextures == 'function') {
        geometry.program.setTextures(geometry);
      }
      if (typeof geometry.program.fillFragmUniforms == 'function') {
        geometry.program.fillFragmUniforms(geometry);
      }
      if (typeof geometry.program.fillVertUniforms == 'function') {
        geometry.program.fillVertUniforms(geometry);
      }
      gl.drawArrays(gl[geometry.primitiveType], geometry.offset, geometry.vertCount);
    }
  };

  function resize(canvas) {
    var height = canvas.clientHeight * window.devicePixelRatio,
      width = canvas.clientWidth * window.devicePixelRatio;
    if (canvas.width  != width || canvas.height != height) {
      canvas.width  = width;
      canvas.height = height;
    }
  }


  var dataTypes = {
    float: {
      arrType: Float32Array,
      itemType: gl.FLOAT
    },
    u_byte: {
      arrType: Uint8Array,
      itemType: gl.UNSIGNED_BYTE
    },
    byte: {
      arrType: Int8Array,
      itemType: gl.BYTE
    },
    u_short: {
      arrType: Uint16Array,
      itemType: gl.UNSIGNED_SHORT
    },
    short: {
      arrType: Int16Array,
      itemType: gl.SHORT
    },
    u_uint: {
      arrType: Uint32Array,
      itemType: gl.UNSIGNED_INT
    },
    int: {
      arrType: Int32Array,
      itemType: gl.INT
    }
  };

  var shadersDataMap = {};

  shadersDataMap.FS_MONO_COLOR = function()  {
    this.getBody = function() {
      return `
        precision mediump float;
        uniform vec4 u_color;
        void main() {
          gl_FragColor = u_color;
        }`;
    };

    var colorUniformLocation;

    this.init = function(programWrapper, geometry) {
      colorUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_color');
    };

    this.bindMethods = function(programWrapper) {
      programWrapper.fillFragmUniforms = function(geometry) {
        var color = geometry.getColor();
        gl.uniform4f(colorUniformLocation, color.r, color.g,  color.b, color.a);
      };
    };
  };

  shadersDataMap.FS_TEXTURED = function()  {
    this.getBody = function() {
      return `
        precision mediump float;
        uniform sampler2D u_texture;
        varying vec2 v_texture_position;
        void main() {
          gl_FragColor = texture2D(u_texture, v_texture_position);
        }`;
    };

    var textureUniformLocation;

    this.init = function(programWrapper, geometry) {
      textureUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_texture');
    };

    this.bindMethods = function(programWrapper) {
      programWrapper.fillFragmUniforms = function(geometry) {
        gl.bindTexture(gl.TEXTURE_2D, textures[geometry.textureName]);
      };
    };
  };

  shadersDataMap.FS_VERTEX_COLOR = function(params)  {
    params = params != null ? params.split(',') : null;
    var normalsMode = params != null ? params[0] : null;
    this.getBody = function() {
      var result = `
        precision mediump float;
        varying vec4 v_color;`;
      if (normalsMode == TYPE_HAVE_NORMALS) {
        result += `
        varying vec3 v_normal;
        uniform vec3 u_reverseLightDirection;`;
      }
      result += `
        void main() {
          gl_FragColor = v_color;`;
      if (normalsMode == TYPE_HAVE_NORMALS) {
        result += `
          vec3 normal = normalize(v_normal);
          float light = dot(normal, u_reverseLightDirection);
          gl_FragColor.rgb *= light;`;
      }
      result += `
        }`;
      return result;
    };

    var reverseLightDirectionUniformLocation;

    this.init = function(programWrapper, geometry) {
      if (normalsMode == TYPE_HAVE_NORMALS) {
        reverseLightDirectionUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_reverseLightDirection');
      }
    };

    this.bindMethods = function(programWrapper) {
      programWrapper.fillFragmUniforms = function(geometry) {
        if (normalsMode == TYPE_HAVE_NORMALS) {
          gl.uniform3fv(reverseLightDirectionUniformLocation, scene.getReversedLightDirection());
        }
      };
    };
  };

  const TYPE_COLORED = 'COLORED',
    TYPE_TEXTURED = 'TEXTURED',
    TYPE_HAVE_NORMALS = 'HAVE_NORMALS',
    TYPE_TEXTURED_FLAT = 'TYPE_TEXTURED_FLAT',
    MODE_2D = '2D',
    MODE_3D = '3D';

  shadersDataMap.VS_TRANSFORM = function(params) {
    params = params.split(',');
    var mode = params[0],
      type = params[1],
      normalsMode = params[2];

    this.getBody = function() {
      var result;
      if (mode == MODE_2D) {
        result =  `
        attribute vec2 a_position;
        uniform mat3 u_wvp_matrix;`;
      } else {
        result =  `
        attribute vec4 a_position;
        uniform mat4 u_wvp_matrix;`;
        if (normalsMode == TYPE_HAVE_NORMALS) {
          result += `
        attribute vec3 a_normal;
        varying vec3 v_normal;
        uniform mat4 u_world_matrix;`;
        }
      }
      if (type == TYPE_COLORED) {
        result += `
        attribute vec4 a_color;
        varying vec4 v_color;`;
      } else if (type == TYPE_TEXTURED) {
        result += `
        attribute vec2 a_texture_position;
        varying vec2 v_texture_position;`;
      } else if (type == TYPE_TEXTURED_FLAT) {
        result += `
        varying vec2 v_texture_position;
        uniform vec2 u_texture_scale;`;
      }
      result += `
        void main() {`;
      if (mode == MODE_2D) {
        result += `
            gl_Position = vec4((u_wvp_matrix * vec3(a_position, 1)).xy, 0, 1);`
      } else {
        result += `
            gl_Position = u_wvp_matrix * a_position;`
        if (normalsMode == TYPE_HAVE_NORMALS) {
          result += `
        v_normal = a_normal;
        v_normal = mat3(u_world_matrix) * a_normal;`;
        }
      }
      if (type == TYPE_COLORED) {
        result += `
            v_color = a_color;`;
      } else if (type == TYPE_TEXTURED) {
        result += `
            v_texture_position = a_texture_position;`;
      } else if (type == TYPE_TEXTURED_FLAT) {
        result += `
            v_texture_position = a_position * u_texture_scale;`;
      }
      result += `
        }`;
      return result;
    };

    var positionAttributeLocation;
    var colorAttributeLocation;
    var texturePositionsAttributeLocation;
    var normalsAttributeLocation;
    var textureScaleUniformLocation;
    var wvpTransformUniformLocation;
    var worldTransformUniformLocation;

    this.init = function(programWrapper, geometry) {
      positionAttributeLocation = gl.getAttribLocation(programWrapper.program, 'a_position');
      wvpTransformUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_wvp_matrix');
      if (type == TYPE_COLORED) {
        colorAttributeLocation = gl.getAttribLocation(programWrapper.program, 'a_color');
      } else if (type == TYPE_TEXTURED) {
        texturePositionsAttributeLocation = gl.getAttribLocation(programWrapper.program, 'a_texture_position');
      } else if (type == TYPE_TEXTURED_FLAT) {
        textureScaleUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_texture_scale');
      }
      if (mode == MODE_3D && normalsMode == TYPE_HAVE_NORMALS) {
        normalsAttributeLocation = gl.getAttribLocation(programWrapper.program, 'a_normal');
        worldTransformUniformLocation = gl.getUniformLocation(programWrapper.program, 'u_world_matrix');
      }
    };

    this.bindMethods = function(programWrapper) {
      programWrapper.initBuffers = function(geometry) {
        if (geometry.combinedBuffer) {

        } else {
          geometry.positionsBuffer = createBufferWrapper(geometry.positions);
          if (type == TYPE_COLORED) {
            geometry.colorsBuffer = createBufferWrapper(geometry.colors);
          } else if (type == TYPE_TEXTURED) {
            geometry.texturePositionsBuffer = createBufferWrapper(geometry.texturePositions);
          }
          if (mode == MODE_3D && normalsMode == TYPE_HAVE_NORMALS) {
            geometry.normalsBuffer = createBufferWrapper(geometry.normals)
          }
        }
      };

      function createBufferWrapper(bufferData) {
        var dataType = dataTypes[bufferData.type];
        return {
          buffer: createBuffer(bufferData.data, dataType.arrType, bufferData.bufferUseType),
          type: dataType.itemType
        };
      }

      function createBuffer(bufferData, arrayType, bufferUseType) {
        var result = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, result);
        gl.bufferData(gl.ARRAY_BUFFER, new arrayType(bufferData), gl[bufferUseType]);
        return result;
      };


      programWrapper.setBuffers = function(geometry) {
        if (geometry.combinedBuffer) {

        } else {
          setBuffer(positionAttributeLocation, geometry.positionsBuffer, geometry.positions, mode == MODE_2D ? 2 : 3);
          if (type == TYPE_COLORED) {
            setBuffer(colorAttributeLocation, geometry.colorsBuffer, geometry.colors, 4);
          } else if (type == TYPE_TEXTURED) {
            setBuffer(texturePositionsAttributeLocation, geometry.texturePositionsBuffer, geometry.texturePositions, 2);
          }
          if (mode == MODE_3D && normalsMode == TYPE_HAVE_NORMALS) {
            setBuffer(normalsAttributeLocation, geometry.normalsBuffer, geometry.normals, 3);
          }
        }
      };

      function setBuffer(attribureLocation, bufferWrapper, bufferData, componentsCount) {
        gl.enableVertexAttribArray(attribureLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferWrapper.buffer);
        gl.vertexAttribPointer(attribureLocation, componentsCount, bufferWrapper.type, bufferData.normalized, 0, 0);
      }

      programWrapper.fillVertUniforms = function(geometry) {
        var worldMatrix = geometry.getWorldTransform();
        if (worldMatrix == null) {
          if (mode == MODE_2D) {
            worldMatrix = Mx3Util.IDENT;
          } else {
            worldMatrix = Mx4Util.IDENT;
          }
        }
        if (mode == MODE_2D) {
          gl.uniformMatrix3fv(wvpTransformUniformLocation, false, worldMatrix);
        } else {
          worldMatrix = new Transform3dBuilder(worldMatrix);
          if (normalsMode == TYPE_HAVE_NORMALS) {
            gl.uniformMatrix4fv(worldTransformUniformLocation, false, worldMatrix.build());
          }
          gl.uniformMatrix4fv(wvpTransformUniformLocation, false,
            worldMatrix.multiply(scene.getVPBuilder().build()).build()
          );

        }
        if (type == TYPE_TEXTURED_FLAT) {
          gl.uniform2fv(wvpTransformUniformLocation, geometry.textureScaleVec);
        }
      };

    };
  };


};
