
"use strict";

import {log} from './debug_utils.mjs';
import {FiguresPrototypesRegistry} from "./core/figure_prtotypes_regitry.mjs";
import {getPickShaderSource, initPickProgram} from "./shaders/fs_pick.mjs";

export function WebglDriver(mainViewport){

  var scenes = {},
    currentSceneName,
    viewports = {},
    currentViewportName = null,
    textures = {},
    initingGeometries = [],
    self = this,
    programs = {},
    figurePrototypesRegistry = new FiguresPrototypesRegistry(),
    figuresInited = 0,
    prototypeReusageCount = 0;


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
  };

  this.setCurrentViewport = (name) => {
    currentViewportName = name;
    if (currentViewportName == mainViewport.getName()) {
      currentViewportName = null;
    }
  };

  this.setMainViewport = () => { currentViewportName = null; };

  this.getViewport = () => currentViewportName != null ? viewports[currentViewportName] : mainViewport;

  const gl = mainViewport.getGlContext();

  this.getGl = () => gl;


  this.bindTexture = function(textureName) {
    gl.bindTexture(gl.TEXTURE_2D, textures[textureName]);
  };

  this.geometriesInited = function() {
    return Promise.all(initingGeometries);
  };

  const DEFAULT_TEXTURE_INIT_MAP = {
      TEXTURE_WRAP_S: 'CLAMP_TO_EDGE',
      TEXTURE_WRAP_T: 'CLAMP_TO_EDGE',
      TEXTURE_MIN_FILTER: 'NEAREST',
      TEXTURE_MAG_FILTER: 'NEAREST'
    },
    PICK_BUFF_TEXTURE_INIT_MAP = {
      TEXTURE_WRAP_S: 'CLAMP_TO_EDGE',
      TEXTURE_WRAP_T: 'CLAMP_TO_EDGE',
      TEXTURE_MIN_FILTER: 'LINEAR'
    };

  createPickFrameBuffer();

  this.initTexture = function (name, image) {
    var texture = createTexture(DEFAULT_TEXTURE_INIT_MAP);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    textures[name] = texture;
  };

  this.addFrameBufferViewport = function(viewport, width, height) {
    self.addViewport(viewport);
    const texture = createTexture(PICK_BUFF_TEXTURE_INIT_MAP),
      frameBuffer = gl.createFramebuffer();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    textures[viewport.getName()] = texture;
    frameBuffer.width = width;
    frameBuffer.height = height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    viewport.setFrameBuffer(frameBuffer);
  };

  function createPickFrameBuffer() {
    const width = 800,
      height = 600,
      level = 0,
      targetTexture  = createTexture(DEFAULT_TEXTURE_INIT_MAP),
      depthBuffer = gl.createRenderbuffer(),
      frameBuffer = gl.createFramebuffer();


    textures['pick'] = targetTexture


    gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    frameBuffer.width = width;
    frameBuffer.height = height;
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

    mainViewport.setPickFrameBuffer(frameBuffer);
  }

  function createTexture(initMap) {
    var texture = gl.createTexture();
    //gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (let i in initMap) {
      gl.texParameteri(gl.TEXTURE_2D, gl[i], gl[initMap[i]]);
    }
    return texture;
  }

  this.initFigure = function(figure) {
    initFigure(figure, true);
  };

  function initFigure(figure, firstAttempt) {
    let {
      prototype: prototype,
      found: found
    } = figurePrototypesRegistry.findOrAdd(figure);
    if (found) {
      if (prototype._programWrapper == null) {
        if (firstAttempt === true) {
          Promise.all(initingGeometries).then(() => {
            initFigure(figure, false);
          });
          return;
        }
      } else {
        figure._programWrapper = prototype._programWrapper;
        figure.buffersData = prototype.buffersData;
        prototypeReusageCount++;
        figuresInited++;
        log('v_reus', prototypeReusageCount / figuresInited);
        return;
      }
    }
    initProtorype(prototype, (rPprototype) => {
      figure._programWrapper = rPprototype._programWrapper;
      figure.buffersData = rPprototype.buffersData;
      figuresInited++;
      log('v_reus', prototypeReusageCount / figuresInited);
    });
  }

  this.initFigures = function(figures) {
    var prototypes = new Map();
    figures.forEach(figure => {
      let {
        prototype: prototype,
        found: found
      } = figurePrototypesRegistry.findOrAdd(figure);
      let figures;
      if (found) {
        figures = prototypes.get(prototype);
      } else {
        figures = [];
        prototypes.set(prototype, figures);
        figures.push(figure);
      }
    });
    prototypes.forEach((figures, proto) => {
      initProtorype(proto, rProto => {
        figures.forEach(figure => {
          figure._programWrapper = rProto._programWrapper;
          figure.buffersData = rProto.buffersData;
        });
      });
    });
    log('v_reus', prototypes.size / figures.length);
  }

  function initProtorype(prototype, callback) {
    var pickFragmentShader = createShader(gl.FRAGMENT_SHADER, getPickShaderSource());
    for (let i in scenes) {
      initingGeometries.push(createProgram(prototype.vertexShaderName, prototype.fragmentShaderName,
        prototype.shadersParams, i, pickFragmentShader)
        .then(programWrapper => {
          if (prototype._programWrapper == null) {
            prototype._programWrapper = {};
          }
          prototype._programWrapper[i] = programWrapper;
          programWrapper.initBuffers(prototype.buffersData);
          callback(prototype);
        }));
    }

  }

  const DEFAULT_SHADER_NAME = 'UNIVERSAL',
    VERTEX_SHADER_NAME_PREFIX = 'VS_',
    FRAGMENT_SHADER_NAME_PREFIX = 'FS_';

  function createProgram(vertexShaderName, fragmentShaderName, shadersParams, sceneName, pickFragmentShader)
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
        var newProgramWrapper = {
          program: createGLProgram(vertexShaderData.shader, fragmentShaderData.shader),
          pickProgram: createGLProgram(vertexShaderData.pickShader, pickFragmentShader)
        };
        if (typeof vertexShaderData.init == 'function') {
          vertexShaderData.init(newProgramWrapper);
        }
        if (typeof fragmentShaderData.init == 'function') {
          fragmentShaderData.init(newProgramWrapper);
        }
        initPickProgram(gl, newProgramWrapper);
        return newProgramWrapper;
      });
      programs[programName] = newPromise;
    }
    return programs[programName];
  }

  function createShaderPromise(type, shaderName, shadersParams, scene) {

    var shaderData;

    return import('./shaders/' + shaderName + '.mjs')
      .then((module) =>  module.getBuilder(shadersParams, scene, self))
      .then(shaderBuilder => {
        shaderData = new shaderBuilder();
        return shaderData.getBody();
      }).then((shaderSource) => {
        shaderData.shader = createShader(type, shaderSource);
        if (typeof shaderData.getPickBody == 'function') {
          shaderData.pickShader = createShader(type, shaderData.getPickBody());
        }
        return shaderData;
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
  }

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
  }

  this.render = createRender(false);
  this.pick = createRender(true);

  const pickNothingColog = {r: 0, g: 0, b: 0, a: 1};

  function createRender(_pick) {
    const pick = _pick;
    return function (geometries, pickPoint) {
      let viewport = pick === true ? mainViewport : self.getViewport();
      viewport.refresh(gl, pick);
      let clearColor = pick === true ? pickNothingColog : self.getScene().getClearColor();
      gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      let start = window.performance.now();
      for (var i in geometries) {
        var figure = geometries[i];
        let vertCount = typeof figure.getVertCount == "function" ? figure.getVertCount() : null;
        if (vertCount === 0 || pick === true && figure.id == null) {
          continue;
        }
        if (figure.cullFace === 'CCW') {
          gl.enable(gl.CULL_FACE);
          gl.cullFace(gl.BACK);
        } else if (figure.cullFace === 'CW') {
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
        let indexType;
        if (pick === true) {
          gl.useProgram(programWrapper.pickProgram);
          indexType = programWrapper.setPickBuffers(figure.buffersData);
          programWrapper.setColorId(encodeIdToColor(figure.id));
          programWrapper.fillPickVertUniforms(figure, viewport, pickPoint);
        } else {
          gl.useProgram(programWrapper.program);
          indexType = programWrapper.setBuffers(figure.buffersData);
          if (typeof programWrapper.setTextures == 'function') {
            programWrapper.setTextures(figure);
          }
          programWrapper.fillFragmUniforms(figure, viewport);
          programWrapper.fillVertUniforms(figure, viewport);
        }
        let offset = typeof figure.getOffset == "function" ? figure.getOffset() : 0;
        if (indexType != null) {
          vertCount = vertCount != null ? vertCount : figure.indexes.data.length;
          gl.drawElements(gl[figure.primitiveType], vertCount, indexType, offset);
        } else {
          vertCount = vertCount != null ? vertCount : Math.floor(figure.buffersData.positions.data.length / 3);
          gl.drawArrays(gl[figure.primitiveType], offset, vertCount);
        }
      }

      if (pick === true) {
        log('v_dTp', window.performance.now() - start);
        return decodeIdFromColor(viewport.getPickBufferColor(gl));
      } else {
        log('v_dT', window.performance.now() - start);

      }
    };
  }

  function encodeIdToColor(id) {
    return [1, 1, 1, 1
    /*  ((id >>  0) & 0xFF) / 0xFF,
      ((id >>  8) & 0xFF) / 0xFF,
      ((id >> 16) & 0xFF) / 0xFF,
      ((id >> 24) & 0xFF) / 0xFF*/
    ];
  }

  function decodeIdFromColor(color) {
    return color[0] + (color[1] << 8) + (color[2] << 16) + (color[3] << 24);
  }




};
