
"use strict";

import {log} from './debug_utils.mjs';
import {FiguresPrototypesRegistry} from "./core/figure_prtotypes_regitry.mjs";

export function WebglDriver(canvasEl){

  var scenes = {},
    currentSceneName,
    viewports = {},
    currentViewportName,
    textures = {},
    framebuffers = [],
    initingGeometries = [],
    self = this,
    programs = {},
    figurePrototypesRegistry = new FiguresPrototypesRegistry();

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

  this.addViewport = (viewport) => {
    viewports[viewport.getName()] = viewport;
    if (currentViewportName == null) {
      currentViewportName = viewport.getName();
    }
  };

  this.setCurrentViewport = (name) => {
    currentViewportName = name;
  };



  this.getViewport = function() {
    return viewports[currentViewportName];
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

  this.initFigure = function(figure) {
    let prototype = figurePrototypesRegistry.findOrAdd(figure);
    if (prototype._programWrapper == null) {
      for (let i in scenes) {
        initingGeometries.push(createProgram(prototype.vertexShaderName, prototype.fragmentShaderName,
          prototype.shadersParams, i)
          .then(programWrapper => {
            if (prototype._programWrapper == null) {
              prototype._programWrapper = {};
            }
            prototype._programWrapper[i] = programWrapper;
            programWrapper.initBuffers(prototype.buffersData);
            figure._programWrapper = prototype._programWrapper;
            figure.buffersData = prototype.buffersData;
          }));
      }
    } else {
      figure._programWrapper = prototype._programWrapper;
      figure.buffersData = prototype.buffersData;
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

    return import('./shaders/' + shaderName + '.mjs')
      .then((module) =>  module.getBuilder(shadersParams, scene, self))
      .then(shaderBuilder => {
        vertexShaderData = new shaderBuilder();
        return vertexShaderData.getBody();
      }).then((shaderSource) => {
        vertexShaderData.shader = createShader(type, shaderSource);
        return vertexShaderData;
      });
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

    let start = window.performance.now();
    for (var i in geometries) {
      var figure = geometries[i];
      let vertCount = typeof figure.getVertCount == "function" ? figure.getVertCount() : null;
      if (vertCount === 0) {
        continue;
      }
      if (figure.cullFace == 'CCW') {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
      } else if (figure.cullFace == 'CW') {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
      } else {
        gl.disable(gl.CULL_FACE);
      }
      if (figure.depthTestEnabled) {
        gl.enable(gl.DEPTH_TEST);
      } else {
        gl.disable(gl.DEPTH_TEST);
      }
      let programWrapper = figure._programWrapper[self.getScene().getName()];
      gl.useProgram(programWrapper.program);
      let indexType = programWrapper.setBuffers(figure.buffersData);
      if (typeof programWrapper.setTextures == 'function') {
        programWrapper.setTextures(figure);
      }
      if (typeof programWrapper.fillFragmUniforms == 'function') {
        programWrapper.fillFragmUniforms(figure);
      }
      if (typeof programWrapper.fillVertUniforms == 'function') {
        programWrapper.fillVertUniforms(figure, self.getViewport());
      }
      let offset = typeof figure.getOffset == "function" ? figure.getOffset() : 0;
      if (indexType != null) {
        vertCount = vertCount != null ? vertCount : figure.indexes.data.length;
        gl.drawElements(gl[figure.primitiveType], vertCount, indexType, figure.offset);
      } else {
        vertCount = vertCount != null ? vertCount : Math.floor(figure.buffersData.positions.data.length / 3);
        gl.drawArrays(gl[figure.primitiveType], figure.offset, vertCount);
      }
    }
    log('v_dT', window.performance.now() - start);
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
