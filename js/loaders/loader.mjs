
"use strict";

import {sphere, sphereIndexed} from '../figures/sphere.mjs'
import {cube, cubeIdexed} from '../figures/cube.mjs'
import {Transform3dBuilder, Transform2DBuilder} from '../math_utils.mjs'
import {Controls} from '../controles.mjs'
import {Camera, Projection, Viewport} from '../viewport.mjs'
import {PointLight, Scene, Spotlight} from "../scene.mjs";
import {Nameable, TransformCotained} from "../utils.mjs";
import {log} from "../debug_utils.mjs";


const Loader = {
  loadGraphicOjbects: function() {
      return Promise.resolve([
        new GraphicObject1(1),
        new GraphicObject2(2),
        new GraphicObject4(4, 1.8, -2.8),
        new GraphicObject4(44, 3.8, -2.8),
        new GraphicObject3(3),
        new GraphicObject5(5)
      ]);
  },
  loadScenes: function() {
    var scene = new Scene('main');/*
     scene.addLight(new DirectLight([0, 0, -1], [0, 0, 1]));
     scene.addLight(new DirectLight([0, 1, 0], [1, 0, 0]));
     scene.addLight(new DirectLight([1, 0, 0], [0, 1, 0]));*/
    scene.addLight(new PointLight([-1, 1, -6], [0.8, 0.6, 0.0], 0.3));
    scene.addLight(new Spotlight([1, 1, -9], [0, 0, 1], 0.3, [-0.8, -0.5],

      -1, 0.86, 2));
    scene.setAmbientLight([0, 0, 0]);
    scene.setLightSensitivityCfnt([1, 1, 1])
    scene.setClearColor({r: 0.6, g: 0.6, b: 0.8, a: 0.8});
    return Promise.resolve([scene]);
  },
  loadTextures: function() {
    return new Promise((resolve, reject) => {
      var image = new Image();
      image.src = 'img/alpha_cesky_krumlov.jpg';
      image.onload = function () {
        resolve([{
          name: 'tst',
          image: image
        }]);
      };
    });
  }
};



export {Loader}




function GraphicObject1(name) {

  Object.assign(this, new Nameable(name));

  let fbName = 'tst2';
  var g3 = pm(figure3, -1, -1, 0/180*3.1416);
  this.frameBufferData = {
    name: fbName,
    textureWidth: 800,
    textureHeight: 600,
    viewportName: 'back'
  };
  g3.diffuseTextureName = 'pick';

  var g4 = pm(figure3, 0, -0.9);
  g4.diffuseTextureName = 'tst';

  var figures = [
    pm(figure1),
    pm(figure2, 0, 0, null, null, null, true),
    pm(figure2, 0, 100, null, null, null, true),
    g4,
    g3
  ];
  this.getFigures = () => figures;
}
function GraphicObject2(name) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));

  var g5 = createGeomItem(cube);
  transformGeom2(g5, Controls.getState(), 0, 0, -8);
  Controls.addListener(function(state) {
    transformGeom2(g5, state, 0, 0, -8);
  });
  Object.assign(g5, new TransformCotained({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g5.name = name + '_cube';

  function transformGeom2(geom, state, x, y, z) {
    transform = new Transform3dBuilder();
    transform.rotateX(state.getY() * 2 * Math.PI / 300);
    transform.rotateY(state.getX() * 2 * Math.PI / 300);
    transform.move(x, y, z);
    version++;
  }
  this.getFigures = () => [g5];
}
function GraphicObject4(name, x, y) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));

  var g5 = createGeomItem(cubeIdexed);
  transformGeom2(g5, Controls.getState(), x, y, -7);
  Controls.addListener(function(state) {
    transformGeom2(g5, state, x, y, -7);
  });
  Object.assign(g5, new TransformCotained({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g5.name = name + '_cube';

  function transformGeom2(geom, state, x, y, z) {
    transform = new Transform3dBuilder();
    transform.rotateX(state.getY() * 2 * Math.PI / 300);
    transform.rotateY(state.getX() * 2 * Math.PI / 300);
    transform.move(x, y, z);
    version++;
  }
  this.getFigures = () => [g5];
}
function GraphicObject3(name) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));
  var g7 = createGeomItem(sphere);
  transformGeom3(g7, Controls.getState(), -1.7, -1.5, -5);
  Controls.addListener(function(state) {
    transformGeom3(g7, state, -1.7, -1.5);
  });
  Object.assign(g7, new TransformCotained({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));

  g7.name = name + '_sphere';

  function transformGeom3(geom, state, x, y) {
    transform = new Transform3dBuilder();
    transform.move(x, y, state.getZ()/100);
    version++;
    log('v_z', state.getZ()/100);
  }

  this.getFigures = () => [g7];
}
function GraphicObject5(name) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));

  var g7 = createGeomItem(sphereIndexed);
  transformGeom3(g7, Controls.getState(), -1.7, 1.7, -5);
  Controls.addListener(function(state) {
    transformGeom3(g7, state, -1.7, 1.7);
  });
  Object.assign(g7, new TransformCotained({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g7.name = name + '_sphere';
  g7.id = 12364;

  function transformGeom3(geom, state, x, y) {
    transform = new Transform3dBuilder();
    transform.move(x, y, state.getZ()/100);
    version++;
    log('v_z', state.getZ()/100);
  }

  this.getFigures = () => [g7];
}


var figure1 = {
    primitiveType: 'TRIANGLE_STRIP',
    getVertCount: () => 4,
    shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=VERTEX',
    combinedBuffer: false,
    buffersData: {
      useType: 'STATIC_DRAW',
      positions: {
        data: [
          0, 0,
          0, 0.5,
          0.7, 0,
          0.7, 0.5
        ],
        type: 'float'
      },
      diffuseColors: {
        data: [
          255, 179, 230, 255,
          255, 0, 0, 255,
          0, 255, 0, 206,
          0, 0, 255, 255,
          255, 255, 0, 255,
          255, 255, 255, 255
        ],
        normalized: true,
        type: 'u_byte'
      }
    }
  },
  figure2 = {
    primitiveType: 'TRIANGLES',
    getVertCount: () => 3,
    shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=MATERIAL',
    buffersData: {
      useType: 'STATIC_DRAW',
      positions: {
        data: [
          0, 0,
          0, 200,
          300, 0
        ],
        type: 'float'
      }
    },
    getDiffuseColor: function () {
      return {
        r: 1,
        g: 0.6,
        b: 0.9,
        a: 1
      }
    }
  },
  figure3 = {
    primitiveType: 'TRIANGLE_STRIP',
    getVertCount: () => 4,
    shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=TEXTURE',
    buffersData: {
      useType: 'STATIC_DRAW',
      positions: {
        data: [
          0, 0,
          0, 0.5,
          0.7, 0,
          0.7, 0.5
        ],
        type: 'float'
      },
      diffuseTexturePositions: {
        data: [
          0, 0,
          0, 1,
          1, 0,
          1, 1
        ],
        type: 'float'

      }
    }
  };


function pm(geom, dx, dy, angle, sx, sy, project) {
  var item = createGeomItem(geom);
  var t = new Transform2DBuilder();
  if (angle != null) {
    t.rotate(angle);
  }
  if (dx != null || dy != null) {
    if (dx == null) dx = 0;
    if (dy == null) dy = 0;
    t.move(dx, dy);
  }
  if (sx != null || sy != null) {
    if (sx == null) sx = 0;
    if (sy == null) sy = 0;
    t.scale(sx, sy);
  }
  if (project) {
    t.project(1, 1, 600, 600);
  }
  item.getFullProjectTransform = () => t.build();
  return item;
}


function createGeomItem(figure) {
  return Object.assign({}, figure);
}

