

export function Transform3dBuilder(initialTransform) {

  var result;

  if (initialTransform != null) {
    if (initialTransform instanceof Transform3dBuilder) {
      result = initialTransform.build();
    } else if (initialTransform instanceof Array && initialTransform.length == 16) {
      result = initialTransform;
    } else {
      throw new Error('Wrong type for 3D transform matrix! ' + initialTransform);
    }
  } else {
    result = Mx4Util.IDENT;
  }

  this.build = function() {
    return result;
  };

  var self = this;

  this.move = function(dx, dy, dz) {
    if (dx instanceof Array && dy == null && dz == null) {
      dx = dx[0];
      dy = dx[1];
      dz = dx[2];
    }
    result = Mx4Util.multiply(result, Mx4Util.translation(dx, dy, dz));
    return self;
  };

  this.scale = function(sx, sy, sz) {
    result = Mx4Util.multiply(result, Mx4Util.scaling(sx, sy, sz));
    return self;
  };

  this.multiply= function(m) {
    result = Mx4Util.multiply(result, m);
    return self;
  };

  this.rotateX = function(angleInRadians) {
    result = Mx4Util.multiply(result, Mx4Util.xRotation(angleInRadians));
    return self;
  };

  this.rotateY = function(angleInRadians) {
    result = Mx4Util.multiply(result, Mx4Util.yRotation(angleInRadians));
    return self;
  };

  this.rotateZ = function(angleInRadians) {
    result = Mx4Util.multiply(result, Mx4Util.zRotation(angleInRadians));
    return self;
  };

  this.projectOrtho = function(left, right, bottom, top, near, far) {
    result = Mx4Util.multiply(result, Mx4Util.orthographic(left, right, bottom, top, near, far));
    return self;
  };

  this.projectPersp = function(fieldOfViewInRadians, aspect, near, far) {
    result = Mx4Util.multiply(result, Mx4Util.perspective(fieldOfViewInRadians, aspect, near, far));
    return self;
  };

  this.projectFrustum = function (left, right, bottom, top, near, far) {
    result = Mx4Util.multiply(result, Mx4Util.frustum(left, right, bottom, top, near, far));
    return self;
  };

  this.lookTo = function(location, direction, up) {
    result = Mx4Util.multiply(result, Mx4Util.inverse( Mx4Util.lookTo(location, direction, up) ));
    return self;
  };

  this.inverse = function() {
    result = Mx4Util.inverse(result);
    return self;
  };

  this.transponse = function() {
    result = Mx4Util.transponse(result);
    return self;
  };

  this.orientByDirection = function (direction) {
    result = Mx4Util.multiply(result, Mx4Util.orientByDirection( direction ));
    return self;
  }

}

export function Transform2DBuilder() {

  var result = Mx3Util.IDENT;

  this.build = function() {
    return result;
  };

  var self = this;

  this.move = function(dx, dy) {
    result = Mx3Util.multiply(result, Mx3Util.translation(dx, dy));
    return self;
  };

  this.rotate = function(angleInRadians) {
    result = Mx3Util.multiply(result, Mx3Util.rotation(angleInRadians));
    return self;
  };

  this.scale = function(sx, sy) {
    result = Mx3Util.multiply(result, Mx3Util.scaling(sx, sy));
    return self;
  };

  this.multiply= function(m) {
    result = Mx3Util.multiply(result, m);
    return self;
  };

  this.project = function(x0, y0, sizeX, sizeY) {
    result = Mx3Util.multiply(result, Mx3Util.projection(x0, y0, sizeX, sizeY));
    return self;
  };
}

export const MxDefUtils = {

  multiply: function(m1, m2) {
    var size = this.getSize(m1);
    var size2 = this.getSize(m2);
    if (size != size2) {
      throw new Error('Matrix sizes are not equals! ' + size + '!=' + size2);
    }
    function get(m, i, j) {
      return m[i * size + j];
    }
    function part(i, j) {
      var sum = 0;
      for (var k = 0; k < size; k++) {
        sum += get(m1, i, k) * get(m2, k, j);
      }
      return sum;
    }
    var result = [];
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        result[i * size + j] = part(i, j);
      }
    }
    return result;
  },

  det: function(m) {
    var size = this.getSize(m);
    if (size == 1) {
      return m[0];
    }
    var sum = 0;
    for (var j = 0; j < size; j++) {
      sum += this.sgn(j) * m[j] * this.det(this.subMatrix(m, 0, j));
    }
    return sum;
  },

  sgn :function (i) {
    return i % 2 == 0 ? 1 : -1;
  },

  subMatrix: function(m, i, j) {
    var result = [];
    var size = Math.sqrt(m.length);
    if (Math.trunc(size) != size) {
      throw new Error('Wrong matrix array size: ' + m.length);
    }
    for (var ii = 0; ii < size; ii++) {
      for (var jj = 0; jj < size; jj++) {
        if (ii != i && jj != j) {
          result.push( m[ii * size + jj] );
        }
      }
    }
    return result;
  },

  minor: function(m) {
    var size = this.getSize(m);
    var result = [];
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        result.push(this.det(this.subMatrix(m, i, j)));
      }
    }
    return result;
  },

  getSize: function(m) {
    var size = Math.sqrt(m.length);
    if (Math.trunc(size) != size) {
      throw new Error('Wrong matrix array size: ' + m.length);
    }
    return size;
  },

  algebrComplement: function(m) {
    var res = [...m];
    this.algebrComplementMutable(res);
    return res;
  },

  transponse: function(m) {
    var res = [...m];
    this.transponseMutable(res);
    return res;
  },

  multScal: function(m, s) {
    var res = [...m];
    this.multScalMutable(res);
    return res;
  },

  algebrComplementMutable: function(m) {
    var size = this.getSize(m);
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        var pos = i * size + j;
        m[pos] = this.sgn(i + j) * m[pos];
      }
    }
  },

  transponseMutable: function(m) {
    var size = this.getSize(m);
    var swp;
    for (var i = 0; i < size; i++) {
      for (var j = i + 1; j < size; j++) {
        swp = m[i * size + j];
        m[i * size + j] = m[j * size + i];
        m[j * size + i] = swp;
      }
    }
  },

  multScalMutable: function(m, s) {
    for (var i in m) {
      m[i] = s * m[i];
    }
  },

  inverse: function(m) {
    var det = this.det(m);
    var res = this.minor(m);
    this.algebrComplementMutable(res);
    this.transponseMutable(res);
    this.multScalMutable(res, 1/det);
    return res;
  },

};

export const Mx2Util = {

  IDENT: [
    1, 0,
    0, 1
  ],

  multiply: function(m1, m2) {
    /*
     m1[0, 0] * m2[0, 0] + m1[0, 1] * m2[1, 0]  m1[0, 0] * m2[0, 1] + m1[0, 1] * m2[1, 1]
     m1[1, 0] * m2[0, 0] + m1[1, 1] * m2[1, 0]  m1[1, 0] * m2[0, 1] + m1[1, 1] * m2[1, 1]
     */
    return [
      m1[0] * m2[0] + m1[1] * m2[2], m1[0] * m2[1] + m1[1] * m2[3],
      m1[2] * m2[0] + m1[3] * m2[2], m1[2] * m2[1] + m1[3] * m2[3]
    ]
  },

  det: function(m) {
    //(m[0,0] * m[1,1] - m[0,1] * m[1,0])
    return m[0] * m[3] - m[1] * m[2];
  },

  minor: function(m) {
    return [
      m[3], m[2],
      m[1], m[0]
    ];
  },

  act: function(m) {
    return [
      m[0], -m[2],
      -m[1], m[3]
    ];
  },

  transponse: function(m) {
    return [
      m[0], m[2],
      m[1], m[3]
    ];
  },

  inverse: function(m) {
    var det = this.det(m);
    return [
      m[3] / det, -m[1] / det,
      -m[2] / det, m[0] / det
    ];
  }

};

export const Mx3Util =  {

  IDENT: [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ],

  translation: function(dx, dy) {
    return [
      1, 0, 0,
      0, 1, 0,
      dx, dy, 1,
    ];
  },

  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },

  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1
    ];
  },

  projection: function(x0, y0, sizeX, sizeY) {
    return [
      2 / sizeX, 0, 0,
      0, 2 / sizeY, 0,
      -x0, -y0, 1
    ];
  },

  multiply: function(m1, m2) {
    /*
     m1[0, 0] * m2[0, 0] + m1[0, 1] * m2[1, 0] + m1[0, 2] * m2[2, 0], m1[0, 0] * m2[0, 1] + m1[0, 1] * m2[1, 1] + m1[0, 2] * m2[2, 1], m1[0, 0] * m2[0, 2] + m1[0, 1] * m2[1, 2] + m1[0, 2] * m2[2, 2],
     m1[1, 0] * m2[0, 0] + m1[1, 1] * m2[1, 0] + m1[1, 2] * m2[2, 0], m1[1, 0] * m2[0, 1] + m1[1, 1] * m2[1, 1] + m1[1, 2] * m2[2, 1], m1[1, 0] * m2[0, 2] + m1[1, 1] * m2[1, 2] + m1[1, 2] * m2[2, 2],
     m1[2, 0] * m2[0, 0] + m1[2, 1] * m2[1, 0] + m1[2, 2] * m2[2, 0], m1[2, 0] * m2[0, 1] + m1[2, 1] * m2[1, 1] + m1[2, 2] * m2[2, 1], m1[2, 0] * m2[0, 2] + m1[2, 1] * m2[1, 2] + m1[2, 2] * m2[2, 2],
     */
    return [
      m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6], m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],   m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
      m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6], m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],   m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
      m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6], m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],   m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8]
    ];
  },

  det: function(m) {
    //(m[0,0] * (m[1,1] * m[2,2] - m[1,2] * m[2,1]) - m[0,1] * (m[1,0] * m[2,2] - m[1,2] * m[2,0]) + m[0,2] * (m[1,0] * m[2,1] - m[1,1] * m[2,0]))
    return (m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]));
  },

  minor: function(m) {
    return [
      Mx2Util.det([m[4], m[5], m[7], m[8]]), Mx2Util.det([m[3], m[5], m[6], m[8]]), Mx2Util.det([m[3], m[4], m[6], m[7]]),
      Mx2Util.det([m[1], m[2], m[7], m[8]]), Mx2Util.det([m[0], m[2], m[6], m[8]]), Mx2Util.det([m[0], m[1], m[6], m[7]]),
      Mx2Util.det([m[1], m[2], m[4], m[5]]), Mx2Util.det([m[0], m[2], m[3], m[5]]), Mx2Util.det([m[0], m[1], m[3], m[4]])
    ];
  },

  act: function(m) {
    return [
      m[0], -m[3], m[6],
      -m[1], m[4], -m[7],
      m[2], -m[5], m[8]
    ];
  },

  transponse: function(m) {
    return [
      m[0], m[3], m[6],
      m[1], m[4], m[7],
      m[2], m[5], m[8]
    ];
  },

  inverse: function(m) {
    var det = this.det(m);
    return [
      Mx2Util.det([m[4], m[5], m[7], m[8]]) / det, -Mx2Util.det([m[1], m[2], m[7], m[8]]) / det, Mx2Util.det([m[1], m[2], m[4], m[5]]) / det,
      -Mx2Util.det([m[3], m[5], m[6], m[8]]) / det, Mx2Util.det([m[0], m[2], m[6], m[8]]) / det, -Mx2Util.det([m[0], m[2], m[3], m[5]]) / det,
      Mx2Util.det([m[3], m[4], m[6], m[7]]) / det, -Mx2Util.det([m[0], m[1], m[6], m[7]]) / det, Mx2Util.det([m[0], m[1], m[3], m[4]]) / det
    ];
  }

};

export const Mx4Util = {

  IDENT: [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ],

  IDENT_INVERSE_X: [
    -1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ],

  IDENT_INVERSE_Y: [
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ],

  IDENT_INVERSE_Z: [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1
  ],

  multiply: function(m1, m2) {
    /*
     m1[0, 0] * m2[0, 0] + m1[0, 1] * m2[1, 0] + m1[0, 2] * m2[2, 0] + m1[0, 3] * m2[3, 0], m1[0, 0] * m2[0, 1] + m1[0, 1] * m2[1, 1] + m1[0, 2] * m2[2, 1] + m1[0, 3] * m2[3, 1], m1[0, 0] * m2[0, 2] + m1[0, 1] * m2[1, 2] + m1[0, 2] * m2[2, 2] + m1[0, 3] * m2[3, 2], m1[0, 0] * m2[0, 3] + m1[0, 1] * m2[1, 3] + m1[0, 2] * m2[2, 3] + m1[0, 3] * m2[3, 3],
     m1[1, 0] * m2[0, 0] + m1[1, 1] * m2[1, 0] + m1[1, 2] * m2[2, 0] + m1[1, 3] * m2[3, 0], m1[1, 0] * m2[0, 1] + m1[1, 1] * m2[1, 1] + m1[1, 2] * m2[2, 1] + m1[1, 3] * m2[3, 1], m1[1, 0] * m2[0, 2] + m1[1, 1] * m2[1, 2] + m1[1, 2] * m2[2, 2] + m1[1, 3] * m2[3, 2], m1[1, 0] * m2[0, 3] + m1[1, 1] * m2[1, 3] + m1[1, 2] * m2[2, 3] + m1[1, 3] * m2[3, 3],
     m1[2, 0] * m2[0, 0] + m1[2, 1] * m2[1, 0] + m1[2, 2] * m2[2, 0] + m1[2, 3] * m2[3, 0], m1[2, 0] * m2[0, 1] + m1[2, 1] * m2[1, 1] + m1[2, 2] * m2[2, 1] + m1[2, 3] * m2[3, 1], m1[2, 0] * m2[0, 2] + m1[2, 1] * m2[1, 2] + m1[2, 2] * m2[2, 2] + m1[2, 3] * m2[3, 2], m1[2, 0] * m2[0, 3] + m1[2, 1] * m2[1, 3] + m1[2, 2] * m2[2, 3] + m1[2, 3] * m2[3, 3],
     m1[3, 0] * m2[0, 0] + m1[3, 1] * m2[1, 0] + m1[3, 2] * m2[2, 0] + m1[3, 3] * m2[3, 0], m1[3, 0] * m2[0, 1] + m1[3, 1] * m2[1, 1] + m1[3, 2] * m2[2, 1] + m1[3, 3] * m2[3, 1], m1[3, 0] * m2[0, 2] + m1[3, 1] * m2[1, 2] + m1[3, 2] * m2[2, 2] + m1[3, 3] * m2[3, 2], m1[3, 0] * m2[0, 3] + m1[3, 1] * m2[1, 3] + m1[3, 2] * m2[2, 3] + m1[3, 3] * m2[3, 3],
     "
     */
    return [
      m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12], m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13], m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14], m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15],
      m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12], m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13], m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14], m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15],
      m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12], m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13], m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14], m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15],
      m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12], m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13], m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14], m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15]
    ];
  },

  det: function(m) {
    //m[0,0] * (m[1,1] * (m[2,2] * m[3,3] - m[2,3] * m[3,2]) - m[1,2] * (m[2,1] * m[3,3] - m[2,3] * m[3,1]) + m[1,3] * (m[2,1] * m[3,2] - m[2,2] * m[3,1])) -
    //m[0,1] * (m[1,0] * (m[2,2] * m[3,3] - m[2,3] * m[3,2]) - m[1,2] * (m[2,0] * m[3,3] - m[2,3] * m[3,0]) + m[1,3] * (m[2,0] * m[3,2] - m[2,2] * m[3,0])) +
    //m[0,2] * (m[1,0] * (m[2,1] * m[3,3] - m[2,3] * m[3,1]) - m[1,1] * (m[2,0] * m[3,3] - m[2,3] * m[3,0]) + m[1,3] * (m[2,0] * m[3,1] - m[2,1] * m[3,0])) -
    //m[0,3] * (m[1,0] * (m[2,1] * m[3,2] - m[2,2] * m[3,1]) - m[1,1] * (m[2,0] * m[3,2] - m[2,2] * m[3,0]) + m[1,2] * (m[2,0] * m[3,1] - m[2,1] * m[3,0]))
    return m[0] * (m[5] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[9] * m[15] - m[11] * m[13]) + m[7] * (m[9] * m[14] - m[10] * m[13])) -
      m[1] * (m[4] * (m[10] * m[15] - m[11] * m[14]) - m[6] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[14] - m[10] * m[12])) +
      m[2] * (m[4] * (m[9] * m[15] - m[11] * m[13]) - m[5] * (m[8] * m[15] - m[11] * m[12]) + m[7] * (m[8] * m[13] - m[9] * m[12])) -
      m[3] * (m[4] * (m[9] * m[14] - m[10] * m[13]) - m[5] * (m[8] * m[14] - m[10] * m[12]) + m[6] * (m[8] * m[13] - m[9] * m[12]));
  },

  minor: function(m) {
    return [
      Mx3Util.det([ m[5], m[6], m[7], m[9], m[10], m[11], m[13], m[14], m[15] ]),
      Mx3Util.det([ m[4], m[6], m[7], m[8], m[10], m[11], m[12], m[14], m[15] ]),
      Mx3Util.det([ m[4], m[5], m[7], m[8], m[9], m[11], m[12], m[13], m[15] ]),
      Mx3Util.det([ m[4], m[5], m[6], m[8], m[9], m[10], m[12], m[13], m[14] ]),

      Mx3Util.det([ m[1], m[2], m[3], m[9], m[10], m[11], m[13], m[14], m[15] ]),
      Mx3Util.det([ m[0], m[2], m[3], m[8], m[10], m[11], m[12], m[14], m[15] ]),
      Mx3Util.det([ m[0], m[1], m[3], m[8], m[9], m[11], m[12], m[13], m[15] ]),
      Mx3Util.det([ m[0], m[1], m[2], m[8], m[9], m[10], m[12], m[13], m[14] ]),

      Mx3Util.det([ m[1], m[2], m[3], m[5], m[6], m[7], m[13], m[14], m[15] ]),
      Mx3Util.det([ m[0], m[2], m[3], m[4], m[6], m[7], m[12], m[14], m[15] ]),
      Mx3Util.det([ m[0], m[1], m[3], m[4], m[5], m[7], m[12], m[13], m[15] ]),
      Mx3Util.det([ m[0], m[1], m[2], m[4], m[5], m[6], m[12], m[13], m[14] ]),

      Mx3Util.det([ m[1], m[2], m[3], m[5], m[6], m[7], m[9], m[10], m[11] ]),
      Mx3Util.det([ m[0], m[2], m[3], m[4], m[6], m[7], m[8], m[10], m[11] ]),
      Mx3Util.det([ m[0], m[1], m[3], m[4], m[5], m[7], m[8], m[9], m[11] ]),
      Mx3Util.det([ m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10] ])
    ];
  },

  act: function(m) {
    return [
      m[0], -m[4], m[8], -m[12],
      -m[1], m[5], -m[9], m[13],
      m[2], -m[6], m[10], -m[14],
      -m[3], m[7], -m[11], m[15]
    ];
  },

  transponse: function(m) {
    return [
      m[0], m[4], m[8], m[12],
      m[1], m[5], m[9], m[13],
      m[2], m[6], m[10], m[14],
      m[3], m[7], m[11], m[15]
    ];
  },

  inverse: function(m) {
    var det = this.det(m);
    return [
      Mx3Util.det([ m[5], m[6], m[7], m[9], m[10], m[11], m[13], m[14], m[15] ]) / det,
      -Mx3Util.det([ m[1], m[2], m[3], m[9], m[10], m[11], m[13], m[14], m[15] ]) / det,
      Mx3Util.det([ m[1], m[2], m[3], m[5], m[6], m[7], m[13], m[14], m[15] ]) / det,
      -Mx3Util.det([ m[1], m[2], m[3], m[5], m[6], m[7], m[9], m[10], m[11] ]) / det,

      -Mx3Util.det([ m[4], m[6], m[7], m[8], m[10], m[11], m[12], m[14], m[15] ]) / det,
      Mx3Util.det([ m[0], m[2], m[3], m[8], m[10], m[11], m[12], m[14], m[15] ]) / det,
      -Mx3Util.det([ m[0], m[2], m[3], m[4], m[6], m[7], m[12], m[14], m[15] ]) / det,
      Mx3Util.det([ m[0], m[2], m[3], m[4], m[6], m[7], m[8], m[10], m[11] ]) / det,

      Mx3Util.det([ m[4], m[5], m[7], m[8], m[9], m[11], m[12], m[13], m[15] ]) / det,
      -Mx3Util.det([ m[0], m[1], m[3], m[8], m[9], m[11], m[12], m[13], m[15] ]) / det,
      Mx3Util.det([ m[0], m[1], m[3], m[4], m[5], m[7], m[12], m[13], m[15] ]) / det,
      -Mx3Util.det([ m[0], m[1], m[3], m[4], m[5], m[7], m[8], m[9], m[11] ]) / det,

      -Mx3Util.det([ m[4], m[5], m[6], m[8], m[9], m[10], m[12], m[13], m[14] ]) / det,
      Mx3Util.det([ m[0], m[1], m[2], m[8], m[9], m[10], m[12], m[13], m[14] ]) / det,
      -Mx3Util.det([ m[0], m[1], m[2], m[4], m[5], m[6], m[12], m[13], m[14] ]) / det,
      Mx3Util.det([ m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10] ]) / det
    ];
  },

  translation: function(tx, ty, tz) {
    return [
      1,  0,  0,  0,
      0,  1,  0,  0,
      0,  0,  1,  0,
      tx, ty, tz, 1
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  },

  axisRotation: function (axisDirection, angle) {
    let x = axisDirection[0],
      y = axisDirection[1],
      z = axisDirection[2],
      c = Math.cos(angle),
      mc = 1 - c,
      s = Math.sin(angle),
      a21 = mc * x * y ,
      a31 = mc * x * z,
      a32 = mc * y * z,
      sx = s * x,
      sy = s * y,
      sz = s * z;
    return [
      c + mc * x * x, a21 - sz,       a31 + sy,       0,
      a21 + sz,       c + mc * y * y, a32  + sx,      0,
      a31 + sy,       a32 + sx,       c + mc * z * z, 0,
      0,              0,              0,              1
    ];
  },

  scaling: function(sx, sy, sz) {
    return [
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1
    ];
  },

  orientByDirection: function(direction) {
    let sb = direction[1],
      cb = Math.sqrt(1 + sb * sb),
      sa = direction[2] / cb,
      ca = direction[0] / cb;
    return this.inverse([
      cb,       0,  sb,
      sa * sb,  ca, -sa * cb,
      -ca * sb, sa, ca * cb
    ]);
  },

  orthographic: function(left, right, bottom, top, near, far) {
    return [
      2 / (right - left),               0,                              0,                            0,
      0,                                2 / (top - bottom),             0,                            0,
      0,                                0,                              2 / (near - far),             0,
      (left + right) / (left - right), (bottom + top) / (bottom - top), (near + far) / (near - far),  1
    ];
  },


  perspective: function(fieldOfViewInRadians, aspect, near, far) {
    var f = Math.tan( (Math.PI - fieldOfViewInRadians) / 2 );
    var rangeInv = 1.0 / (far - near);

    return [
      f / aspect, 0, 0,                           0,
      0,          f, 0,                           0,
      0,          0, (near + far) * rangeInv,     1,
      0,          0, -2 * near * far * rangeInv,  0
    ];
  },

  frustum: function (left, right, bottom, top, near, far) {

    let dx = right - left,
      dy = top - bottom,
      dz = far - near;

    return [
      2 * near / dx,        0,                  0,                    0,
      0,                    2 * near / dy,      0,                    0,
      (left + right) / dx, (top + bottom) / dy, (far + near) / dz,    1,
      0,                    0,                  -2 * near * far / dz, 0
    ];
  },

  lookTo: function(location, direction, up) {
    var vz = Vx3Utils.normalize(direction),
      vx = Vx3Utils.normalize(Vx3Utils.crossProduct(up, vz)),
      vy = Vx3Utils.normalize(Vx3Utils.crossProduct(vz, vx));

    return [
      vx[0], vx[1], vx[2], 0,
      vy[0], vy[1], vy[2], 0,
      vz[0], vz[1], vz[2], 0,
      location[0], location[1], location[2], 1
    ];
  }
};

export const Vx3Utils = {
  normalize: function(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length > 0.00001) {
      return [v[0] / length, v[1] / length, v[2] / length];
    } else {
      return [0, 0, 0];
    }
  },

  crossProduct: function(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0] ];
  },

  scalarProduct: function(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  },

  add: function(a, b) {
    return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ];
  } ,

  diff: function(a, b) {
    return [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
  } ,

  multiply: function(k, v) {
    return [ k * v[0], k * v[1], k * v[2] ];
  },

  mxProduct: function(v, mx) {
    return [
      v[0] * mx[0] + v[1] * mx[3] + v[2] * mx[6],
      v[0] * mx[1] + v[1] * mx[4] + v[2] * mx[7],
      v[0] * mx[2] + v[1] * mx[5] + v[2] * mx[8]
    ];
  },

  xRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0,
      0, c, s,
      0, -s, c
    ];
  },

  yRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s,
      0, 1, 0,
      s, 0, c
    ];
  },

  zRotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0,
      -s, c, 0,
      0, 0, 1,
    ];
  },

  axisRotation: function (axisDirection, angle) {
    let x = axisDirection[0],
      y = axisDirection[1],
      z = axisDirection[2],
      c = Math.cos(angle),
      mc = 1 - c,
      s = Math.sin(angle),
      a21 = mc * x * y ,
      a31 = mc * x * z,
      a32 = mc * y * z,
      sx = s * x,
      sy = s * y,
      sz = s * z;
    return [
      c + mc * x * x, a21 - sz,       a31 + sy,
      a21 + sz,       c + mc * y * y, a32  + sx,
      a31 + sy,       a32 + sx,       c + mc * z * z
    ];
  },
};



//-------------------------------------------------CODE GENERATION----------------------------------------------------

/*
function detGen(size) {
  function dets(m) {
    var size = Math.sqrt(m.length);
    if (Math.trunc(size) != size) {
      throw new Error('Wrong matrix array size: ' + m.length);
    }
    if (size == 1) {
      return m[0];
    }
    var sum = '';
    for (var j = 0; j < size; j++) {
      var sgn = MxDefUtils.sgn(j).toString().substr(0, 1);
      sgn = sgn == '-' ? sgn : '';
      sum += sgn + m[j] + ' * ' + dets(MxDefUtils.subMatrix(m, 0, j));
      if (j != size -1) {
        sum += ' + ';
      }
    }
    return '(' + sum + ')';
  }
  var m = [];
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      m.push('' + i + j);
    }
  }
  var res = dets(m);
  return [
    res.replaceAll(/\d\d/ig, function(f) {
      var i = parseInt(f.substr(0,1 ));
      var j = parseInt(f.substr(1,1 ));
      return 'm[' + (i*size + j) + ']'
    }),
    res.replaceAll(/\d\d/ig, function(f) {
      var i = f.substr(0,1 );
      var j = f.substr(1,1 );
      return 'm[' + i + ',' + j + ']'
    })
  ];
}


function multGet(s) {
  var r = '';
  for (var i = 0; i < s; i++) {
    for (var j = 0; j< s;j++) {
      for (var k = 0; k < s; k++) {
        r += 'm1[' + (i  * s  + k) + '] * m2[' + (k * s + j) + ']'
        if (k < s-1) r += ' + ';
      }
      r += ', '
    }
    r += '\n'
  }
  return r;
}

function minorGen(n) {
  var r = '';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      var s = '';
      for (var ii = 0; ii < n; ii++) {
        if (i != ii) {
          for (var jj = 0; jj < n; jj++) {
            if (j != jj)
              s += 'm[' + (ii * n + jj) + '], ';
          }
        }
      }
      r += 'Mx' + (n-1) + 'Util.det([ ' + s.substr(0, s.length - 2) + ' ]), \n';
    }
    r += '\n';
  }
  return '[ ' + r.substr(0, r.length - 2) + ' ]';
}

function inverseGen(n) {
  var r = [];
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      var s = '';
      for (var ii = 0; ii < n; ii++) {
        if (i != ii) {
          for (var jj = 0; jj < n; jj++) {
            if (j != jj)
              s += 'm[' + (ii * n + jj) + '], ';
          }
        }
      }
      var sgn = MxDefUtils.sgn(i+j).toString().substr(0, 1);
      sgn = sgn == '-' ? sgn : '';
      r.push( sgn + 'Mx' + (n-1) + 'Util.det([ ' + s.substr(0, s.length - 2) + ' ]) / det, ' );
    };
  }

  r = MxDefUtils.transponse(r);
  var res = '';
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      res += r[i * n + j]  + '\n';
    }
    res += '\n';
  }
  return res;
}
*/
