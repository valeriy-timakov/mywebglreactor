
import {WglUtil} from './webgl_utils.js'
import {Transform3dBuilder} from './math_utils.js'

var driver = (function(){
  var util = new WglUtil(window.document.getElementById('c')),
    frameBufferName = 'test2';
  util.initFrameBuffer(frameBufferName, 800, 600);
  var geometries = [];
  var notFrameBuffGeoms = [];
  util.getScene().setDirectLight([0, 1, -1]);
  function render() {
    util.render({r: 0.6, g: 0.6, b: 0.8, a: 0.8}, notFrameBuffGeoms, frameBufferName);
    util.render({r: 0.2, g: 0.4, b: 0.8, a: 0.8}, geometries);
  }
  var geomClasses = [];
  return {
    addObject: function(geometry, framebuff) {
      if (geomClasses.indexOf(geometry.__proto__) == -1) {
        util.initGeometry(geometry.__proto__);
        geomClasses.push(geometry.__proto__);
      }
      geometries.push(geometry);
      if (!framebuff) {
        notFrameBuffGeoms.push(geometry);
      }
      render();
    },
    addTexture: function(index, image) {
      util.initTexture(index, image);
      render();
    },
    render: render
  };
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
  vertexShaderName: 'VS_TRANSFORM',
  fragmentShaderName: 'FS_VERTEX_COLOR',
  vertexShaderParams: '2D,COLORED',
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
  colors: {
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
    vertexShaderName: 'VS_TRANSFORM',
    fragmentShaderName: 'FS_MONO_COLOR',
    vertexShaderParams: '2D,',
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
    getColor: function() {
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
    vertexShaderName: 'VS_TRANSFORM',
    fragmentShaderName: 'FS_TEXTURED',
    vertexShaderParams: '2D,TEXTURED',
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
    texturePositions: {
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
    textureName: 'tst',
    transform: {},
    getWorldTransform: function() {
      return this.transform;
    }
  },
  geometry4 = {
    primitiveType: 'TRIANGLES',
    offset: 0,
    vertCount: 50,
    vertexShaderName: 'VS_TRANSFORM',
    vertexShaderParams: '3D,COLORED,HAVE_NORMALS',
    fragmentShaderName: 'FS_VERTEX_COLOR',
    fragmentShaderParams: 'HAVE_NORMALS',
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
    colors: {
      data: [
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,
        255, 0, 0, 255,

        0, 255, 0, 255,
        0, 255, 0, 255,
        0, 255, 0, 255,
        0, 255, 0, 255,
        0, 255, 0, 255,
        0, 255, 0, 255,

        0, 0, 255, 255,
        0, 0, 255, 255,
        0, 0, 255, 255,
        0, 0, 255, 255,
        0, 0, 255, 255,
        0, 0, 255, 255,

        255, 0, 255, 255,
        255, 0, 255, 255,
        255, 0, 255, 255,
        255, 0, 255, 255,
        255, 0, 255, 255,
        255, 0, 255, 255,

        0, 255, 255, 255,
        0, 255, 255, 255,
        0, 255, 255, 255,
        0, 255, 255, 255,
        0, 255, 255, 255,
        0, 255, 255, 255,

        255, 255, 0, 255,
        255, 255, 0, 255,
        255, 255, 0, 255,
        255, 255, 0, 255,
        255, 255, 0, 255,
        255, 255, 0, 255

      ],
      normalized: true,
      bufferUseType: 'STATIC_DRAW',
      type: 'u_byte'
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
    textureName: 'tst',
    depthTestEnabled: true,
    cullFace: 'CCW',
    transform: {},
    getWorldTransform: function() {
      return this.transform;
    }
  };

function loadImage (src, callback) {
  var image = new Image();
  image.src = src;
  image.onload = function () {
    callback(image);
  };
}

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
  loadImage('img/alpha_cesky_krumlov.jpg', function(img){
    driver.addTexture('tst', img);
  });/*
  driver.addObject(pm(geometry1));
  driver.addObject(pm(geometry2, 0, 0, null, null, null, true));
  driver.addObject(pm(geometry2, 0, 100, null, null, null, true));
  driver.addObject(pm(geometry3, 0, -0.9));
  var g3 = pm(geometry3, -1, -1, 0/180*3.1416);
  g3.textureName = 'test2';
  g3.texturePositions.data = [
    0, 0,
    0, 1,
    1, 0
  ];
  driver.addObject(g3, true);
*/
  var g5 = createGeomItem(geometry4);
  transformGeom2(g5, CONTROLES.getState());
  driver.addObject(g5);

  CONTROLES.addListener(function(state) {
    transformGeom2(g5, state);
    driver.render();
  });
}


function transformGeom2(geom, state) {
  var bt3 = new Transform3dBuilder();
  bt3.rotateX(state.y * 2 * Math.PI / 300);
  bt3.rotateY(state.x * 2 * Math.PI / 300);
  bt3.rotateZ(state.z * 2 * Math.PI / 90);
  bt3.move(0, 0, -8);
  geom.transform = bt3;
}


main();
