import {Vx3Utils, Mx4Util, Transform3dBuilder} from './math_utils.js'
import {MODE_2D, MODE_3D, TYPE_DIFFUSE_COLORED, TYPE_HAVE_NORMALS, TYPE_TEXTURED} from './webgl_utils.js'

export function WglUtil(canvasEl){

  var scenes = {},
    currentSceneName;

  var textures = {};
  var framebuffers = [];
  var initingGeometries = [];
  var self = this;
  var programs = {};
  var shadersDataMap = {};

  this.addScene = (scene) => {
    scenes[scene.getName()] = scene;
    if (currentSceneName == null) {
      currentSceneName = scene.getName();
    }
  };

  this.setCurrentScene = (name) => {
    currentSceneName = name;
  };

  this.getScene = function() {
    return scenes[currentSceneName];
  };


  var gl = canvasEl.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL is not supported!");
  }

  this.getGl = function() {
    return gl;
  };


  this.bindTexture = function(textureName) {
    gl.bindTexture(gl.TEXTURE_2D, textures[textureName]);
  };

  this.geometriesInited = function() {
    return Promise.all(initingGeometries);
  };

  this.initGeometry = function(geometry) {
    for (let i in scenes) {
      initingGeometries.push(createProgram(geometry.vertexShaderName, geometry.fragmentShaderName,
          geometry.shadersParams, i)
        .then(programWrapper => {
          if (geometry.program == null) {
            geometry.program = {};
          }
          geometry.program[i] = programWrapper;
          if (typeof programWrapper.initBuffers == 'function') {
            programWrapper.initBuffers(geometry);
          }
        }));
    }
  };

  const DEFAULT_SHADER_NAME = 'UNIVERSAL',
    VERTEX_SHADER_NAME_PREFIX = 'VS_',
    FRAGMENT_SHADER_NAME_PREFIX = 'FS_';

  function createProgram(vertexShaderName, fragmentShaderName, shadersParams, sceneName)
  {
    if (!vertexShaderName) {
      vertexShaderName = DEFAULT_SHADER_NAME;
    }
    if (!fragmentShaderName) {
      fragmentShaderName = DEFAULT_SHADER_NAME;
    }
    vertexShaderName = VERTEX_SHADER_NAME_PREFIX + vertexShaderName;
    fragmentShaderName = FRAGMENT_SHADER_NAME_PREFIX + fragmentShaderName;
    var programName = vertexShaderName + '__' + shadersParams + '.' +
      fragmentShaderName + '__' + shadersParams + '#' + sceneName;
    if (programs[programName] == null) {
      var newPromise = Promise.all( [
        createShaderPromise(gl.VERTEX_SHADER, vertexShaderName, shadersParams, scenes[sceneName]),
        createShaderPromise(gl.FRAGMENT_SHADER, fragmentShaderName, shadersParams, scenes[sceneName])
      ]).then(([vertexShaderData, fragmentShaderData]) => {
        var newProgram = {
          program: createGLProgram(vertexShaderData.shader, fragmentShaderData.shader)
        };
        if (typeof vertexShaderData.init == 'function') {
          vertexShaderData.init(newProgram);
        }
        if (typeof fragmentShaderData.init == 'function') {
          fragmentShaderData.init(newProgram);
        }
        return newProgram;
      });
      programs[programName] = newPromise;
    }
    return programs[programName];
  }

  function createShaderPromise(type, shaderName, shadersParams, scene) {
    var vertexShaderData;

    return import('./shaders/' + shaderName + '.js')
      .then((module) =>  module.getBuilder(shadersParams, scene, self))
      .then(shaderBuilder => {
        vertexShaderData = new shaderBuilder();
        return vertexShaderData.getBody();
      }).then((shaderSource) => {
        vertexShaderData.shader = createShader(type, shaderSource);
        return vertexShaderData;
      });
  }

  function getShaderBuilder(name) {
      return ;
  }

  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    var compilationLog = gl.getShaderInfoLog(shader);
    console.error('Shader compiler log: ' + compilationLog);
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
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Error creating program!")
  };

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


  this.render = function(geometries, frameBurrerName) {
    var currentSize = {};
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
    let clearColor = self.getScene().getClearColor();
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
      let programWrapper = geometry.program[self.getScene().getName()];
      gl.useProgram(programWrapper.program);
      programWrapper.setBuffers(geometry);
      if (typeof programWrapper.setTextures == 'function') {
        programWrapper.setTextures(geometry);
      }
      if (typeof programWrapper.fillFragmUniforms == 'function') {
        programWrapper.fillFragmUniforms(geometry);
      }
      if (typeof programWrapper.fillVertUniforms == 'function') {
        programWrapper.fillVertUniforms(geometry);
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






};
