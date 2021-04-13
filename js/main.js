import {Scene} from './scene.js'
import {WglUtil} from './webgl_driver.js'
import {Transform3dBuilder, Transform2DBuilder} from './math_utils.js'

var driver = (function(){
  var util = new WglUtil(window.document.getElementById('c')),
    frameBufferName = 'test2';
  util.initFrameBuffer(frameBufferName, 800, 600);
  var geometries = [];
  var notFrameBuffGeoms = [];
  var scene = new Scene('main');/*
  scene.addDirectLight(new scene.DirectLight([0, 0, -1], [0, 0, 1]));
  scene.addDirectLight(new scene.DirectLight([0, 1, 0], [1, 0, 0]));
  scene.addDirectLight(new scene.DirectLight([1, 0, 0], [0, 1, 0]));*/
  scene.addPointLight(new scene.PointLight([-1, 1, -6], [1, 1, 1], 0.3));
  scene.setAmbientLight([0, 0, 0]);
  scene.setLightSensitivityCfnt([0.6, 0.4, 0.7])
  scene.setClearColor({r: 0.6, g: 0.6, b: 0.8, a: 0.8});
  util.addScene(scene);
  function render() {
    util.render(notFrameBuffGeoms, frameBufferName);
    util.render(geometries);
  }
  var geomClasses = [];
  return {
    addObject: function(geometry) {
      if (geomClasses.indexOf(geometry.__proto__) == -1) {
        util.initGeometry(geometry.__proto__);
        geomClasses.push(geometry.__proto__);
      }
      geometries.push(geometry);
      if (!geometry.framebuff) {
        notFrameBuffGeoms.push(geometry);
      } else {
        geometry.diffuseTextureName = 'test2';
      }
      //render();
    },
    addObjects: function(newGeometries) {
      for (let i in newGeometries) {
        var geometry = newGeometries[i];
        if (geomClasses.indexOf(geometry.__proto__) == -1) {
          util.initGeometry(geometry.__proto__);
          geomClasses.push(geometry.__proto__);
        }
        geometries.push(geometry);
        if (!geometry.framebuff) {
          notFrameBuffGeoms.push(geometry);
        } else {
          geometry.diffuseTextureName = 'test2';
        }
      }
      util.geometriesInited().then(() => { render() });
    },
    addTexture: function(index, image) {
      util.initTexture(index, image);
      //render();
    },
    loadImage: function(src, textureName) {
      loadImage(src, function(image){
        util.initTexture(textureName, image);
        render();
      });
    },
    change: function(state) {
      util.getScene().getPointLights()[0].getPosition()[2] = state.z / 100;
      console.log('z=' + util.getScene().getPointLights()[0].getPosition()[2])
    },
    render: render
  };

  function loadImage (src, callback) {
    var image = new Image();
    image.src = src;
    image.onload = function () {
      callback(image);
    };
  }
})();

function createGeomItem(geometry) {
  return {
    __proto__: geometry
  }
}

var geometry1 = {
  primitiveType: 'TRIANGLE_STRIP',
  offset: 0,
  vertCount: 4,
  shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=VERTEX',
  combinedBuffer: false,
  positions:  {
    data: [
      0, 0,
      0, 0.5,
      0.7, 0,
      0.7, 0.5
    ],
    normalized: false,
    bufferUseType: 'STATIC_DRAW',
    type: 'float',
    stride: 0,
    offset: 0
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
    bufferUseType: 'STATIC_DRAW',
    type: 'u_byte'
  },
  transform: {},
  getWorldTransform: function() {
    return this.transform;
  }

},
  geometry2 = {
    primitiveType: 'TRIANGLES',
    offset: 0,
    vertCount: 3,
    shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=MATERIAL',
    positions:  {
      data: [
        0, 0,
        0, 200,
        300, 0
      ],
      normalized: false,
      bufferUseType: 'STATIC_DRAW',
      type: 'float',
      stride: 0,
      offset: 0
    },
    getDiffuseColor: function() {
      return {
        r: 1,
        g: 0.6,
        b: 0.9,
        a: 1
      }
    },
    transform: {},
    getWorldTransform: function() {
      return this.transform;
    }
  },
  geometry3 = {
    primitiveType: 'TRIANGLE_STRIP',
    offset: 0,
    vertCount: 4,
    shadersParams: 'MODE=2D,DIFFUSE_COLORE_SOURCE=TEXTURE',
    positions:  {
      data: [
        0, 0,
        0, 0.5,
        0.7, 0,
        0.7, 0.5
      ],
      normalized: false,
      bufferUseType: 'STATIC_DRAW',
      type: 'float',
      stride: 0,
      offset: 0
    },
    diffuseTexturePositions: {
      data: [
        0, 0,
        0, 1,
        1, 0,
        1, 1
      ],
      normalized: false,
      bufferUseType: 'STATIC_DRAW',
      type: 'float',
      stride: 0,
      offset: 0

    },
    diffuseTextureName: 'tst',
    transform: {},
    getWorldTransform: function() {
      return this.transform;
    }
  },
  geometry4 = {
    primitiveType: 'TRIANGLES',
    offset: 0,
    vertCount: 50,
    vertexShaderName: 'UNIVERSAL',
    shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=VERTEX,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
    fragmentShaderName: 'UNIVERSAL',
    positions:  {
      data: [
        1, 0, 0,
        1, 1, 0,
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
        1, 1, 0,

        0, 0, 0,
        0, 1, 0,
        0, 0, -1,
        0, 1, -1,
        0, 0, -1,
        0, 1, 0,

        1, 0, -1,
        1, 1, -1,
        1, 0, 0,
        1, 1, 0,
        1, 0, 0,
        1, 1, -1,

        0, 0, -1,
        0, 1, -1,
        1, 0, -1,
        1, 1, -1,
        1, 0, -1,
        0, 1, -1,

        1, 1, 0,
        1, 1, -1,
        0, 1, 0,
        0, 1, -1,
        0, 1, 0,
        1, 1, -1,

        1, 0, -1,
        1, 0, 0,
        0, 0, -1,
        0, 0, 0,
        0, 0, -1,
        1, 0, 0

      ],
      normalized: false,
      bufferUseType: 'STATIC_DRAW',
      type: 'float',
      stride: 0,
      offset: 0
    },
    normals: {
      data: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,



        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0
      ],
      normalized: false,
      bufferUseType: 'STATIC_DRAW',
      type: 'float',
      stride: 0,
      offset: 0
    },
    diffuseColors: {
      data: [
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,

        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,

        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,

        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,

        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,

        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255,
        255, 255, 255, 255

      ],
      normalized: true,
      bufferUseType: 'STATIC_DRAW',
      type: 'u_byte'
    },
    depthTestEnabled: true,
    cullFace: 'CCW',
    transform: {},
    getWorldTransform: function() {
      return this.transform;
    },
    getSpecularColor: () => { return {r: 1, g: 1, b: 1} },
    getBrilliance: () => 5,
    getRadiance: () =>  { return {r: 0.1, g: 0.02, b: 0.04} },
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
  item.transform = t.build();
  return item;
}


var CONTROLES = (function () {
  var state = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    v: 0
  };

  var listeners = [];

  function change() {
    for (var i in listeners) {
      var listener = listeners[i];
      if (typeof listener == 'function') {
        listener(state);
      }
    }
  }

  var down = false;

  document.body.onmousedown = function () {
    down = true;
  };

  document.body.onmouseup = function () {
    down = false;
  };

  document.body.onmousemove = function(e)  {
    if (down) {
      state.x += e.movementX;
      state.y += e.movementY;
      change();
    }
  };

  document.body.onwheel = function(e) {
    state.w += e.deltaX;
    state.v += e.deltaZ;
    state.z += e.deltaY;
    change();
  };

  return {
    addListener: function(listener) {
      listeners.push(listener);
    },
    getState: function() {
      return state;
    }
  };
})();

function main() {
  driver.loadImage('img/alpha_cesky_krumlov.jpg', 'tst');
  var g3 = pm(geometry3, -1, -1, 0/180*3.1416);
  g3.framebuff = true;

  var g5 = createGeomItem(geometry4);
  transformGeom2(g5, CONTROLES.getState());

  var g6 = createGeomItem(geometry4);
  transformGeom3(g6, CONTROLES.getState());

  driver.addObjects([

    pm(geometry1),
    pm(geometry2, 0, 0, null, null, null, true),
    pm(geometry2, 0, 100, null, null, null, true),
    pm(geometry3, 0, -0.9),
    g3, g5, g6]);

  CONTROLES.addListener(function(state) {
    transformGeom2(g5, state);
    transformGeom3(g6, state);
   // driver.change(state);
    driver.render();
  });
}


function transformGeom2(geom, state) {
  var bt3 = new Transform3dBuilder();
  bt3.rotateX(state.y * 2 * Math.PI / 300);
  bt3.rotateY(state.x * 2 * Math.PI / 300);
  bt3.move(0, 0, -8);
  geom.transform = bt3;
}

function transformGeom3(geom, state) {
  var bt3 = new Transform3dBuilder();
  bt3.move(-1, 0, state.z/100);
  console.log(state.z/100);
  geom.transform = bt3;
}


main();
