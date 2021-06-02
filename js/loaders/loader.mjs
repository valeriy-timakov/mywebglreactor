
"use strict";

import {sphere, sphereIndexed} from '../figures/sphere.mjs'
import {cube} from '../figures/cube.mjs'
import {Transform2DBuilder, Transform3dBuilder} from '../math_utils.mjs'
import {Controls} from '../controles.mjs'
import {PointLight, Scene, Spotlight} from "../scene.mjs";
import {Identifiable, Nameable, TransformCotained2D, TransformCotained3D} from "../utils.mjs";
import {log} from "../debug_utils.mjs";
import {Axis} from "../figures/axis.mjs";
import {createCone} from "../figures/figures_creator.mjs";


const Loader = {
  loadGraphicOjbects: function() {
      return Promise.resolve([
        new GraphicObject1(1, 215),
        new GraphicObject2(2, 198),
        new GraphicObject4(4, 1.8, -2.8, 699),
        new GraphicObject4(44, 3.8, -2.8, 120),
        new GraphicObject3(3),
        new GraphicObject5(5, 90, 249),
        new Axis(12341, 'axis1', [0, 0, -6], [0, 1, 0], {})
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




function GraphicObject2(name, id) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  var g5 = Object.assign({}, cube),
    originalColor =  { r: 0, g: 0, b: 1, a: 1 } , _color = originalColor;
  g5.getDiffuseColor = () => _color;
  this.setColor = color => { _color = color; };
  this.resetColor = () => { _color = originalColor; };
  transformGeom2(g5, Controls.getState(), 0, 0, -8);
  Controls.addListener(function(state) {
    transformGeom2(g5, state, 0, 0, -8);
  });
  Object.assign(g5, new TransformCotained3D({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g5.name = name + '_cube';
  g5.id = id;

  function transformGeom2(geom, state, x, y, z) {
    transform = new Transform3dBuilder();
    transform.rotateX(state.getY() * 2 * Math.PI / 300);
    transform.rotateY(state.getX() * 2 * Math.PI / 300);
    transform.move(x, y, z);
    version++;
  }
  this.getFigures = () => [g5];
}
function GraphicObject4(name, x, y, id) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  let cyl = createCone( 0.7, 1, 20 )


  let ttt = {
    primitiveType: 'TRIANGLES',
    vertexShaderName: 'UNIVERSAL',
    shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=MATERIAL,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
    fragmentShaderName: 'UNIVERSAL',
    buffersData: {
      useType: 'STATIC_DRAW',
      indexes: {
        data: cyl.indexes,//cubeIdexed.buffersData.indexes.data,//
        type: 'u_byte'
      },
      positions: {
        data: cyl.vertices,//cubeIdexed.buffersData.positions.data,//
        type: 'float'
      },
      normals: {
        data:  cyl.normals,//cubeIdexed.buffersData.normals.data,//
        type: 'float'
      }
    },
    cullFace: 'CCW',
    depthTestEnabled: true,
    getSpecularColor: () => { return {r: 1, g: 1, b: 0} },
    getDiffuseColor: () => {  return { r: 0, g: 0, b: 1, a: 1 } },
    getRadiance: () =>  { return {r: 0, g: 0, b: 0} },
    getBrilliance: () => 3
  };


  var g5 = Object.assign({}, ttt),
    originalColor =  { r: 0, g: 0, b: 1, a: 1 } , _color = originalColor;
  g5.getDiffuseColor = () => _color;
  this.setColor = color => { _color = color; };
  this.resetColor = () => { _color = originalColor; };
  transformGeom2(g5, Controls.getState(), x, y, -9);
  Controls.addListener(function(state) {
    transformGeom2(g5, state, x, y, -7);
  });
  Object.assign(g5, new TransformCotained3D({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g5.name = name + '_cube';
  g5.id = id;

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
  var g7 = Object.assign({}, sphere);
  transformGeom3(g7, Controls.getState(), -1.7, -1.5, -5);
  Controls.addListener(function(state) {
    transformGeom3(g7, state, -1.7, -1.5);
  });
  Object.assign(g7, new TransformCotained3D({
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
function GraphicObject5(name, id) {

  var transform, version = 0;

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  var g7 = Object.assign({}, sphereIndexed),
    originalColor = { r: 1, g: 1, b: 1, a: 1 }, _color = originalColor;
  g7.getDiffuseColor = () => _color;
  this.setColor = color => { _color = color; };
  this.resetColor = () => { _color = originalColor; };;
  transformGeom3(g7, Controls.getState(), -1.7, 1.7, -5);
  Controls.addListener(function(state) {
    transformGeom3(g7, state, -1.7, 1.7);
  });
  Object.assign(g7, new TransformCotained3D({
    getWorldTransform: () => transform,
    getVersion: () => version
  }));
  g7.name = name + '_sphere';
  g7.id = id;

  function transformGeom3(geom, state, x, y) {
    transform = new Transform3dBuilder();
    transform.move(x, y, state.getZ()/100);
    version++;
    log('v_z', state.getZ()/100);
  }

  this.getFigures = () => [g7];
}



function GraphicObject1(name, id) {

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  var g3 = pm(figure3, -1, -1, 0/180*3.1416);
  this.frameBufferData = {
    textureWidth: 800,
    textureHeight: 600,
    viewportName: 'back'
  };
  g3.diffuseTextureName = 'back';
  g3.id = id;

  var g4 = pm(figure3, 0, -0.9),
    g5 = pm(figure2, -300, -300, null, null, null, true),
    g6 = pm(figure2, -300, -200, null, null, null, true),
    originalColor = {
      r: 1,
      g: 0.6,
      b: 0.9,
      a: 1
    }, _color = originalColor;
  g4.diffuseTextureName = 'tst';
  g4.id = id;
  g5.getDiffuseColor = () => _color;
  g5.id = id;
  g6.getDiffuseColor = () => _color;
  g6.id = id;
  this.setColor = color => { _color = color; };
  this.resetColor = () => { _color = originalColor; };

  let g1 = pm(figure1);
  g1.id = id;

  var figures = [
    g1,
    g5,
    g6,
    g4,
    g3
  ];
  this.getFigures = () => figures;


  function pm(geom, dx, dy, angle, sx, sy, project) {
    var item = Object.assign({}, geom);
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
      t.project(0, 0, 600, 600);
    }
    Object.assign(item, new TransformCotained2D({
      getWorldTransform: () => t,
      getVersion: () => 0
    }));
    return item;
  }
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





