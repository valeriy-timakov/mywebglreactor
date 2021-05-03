

export const cube = {
  primitiveType: 'TRIANGLES',
  getVertCount: () => 50,
  vertexShaderName: 'UNIVERSAL',
  shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=MATERIAL,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
  fragmentShaderName: 'UNIVERSAL',
  buffersData: {
    useType: 'STATIC_DRAW',
    positions: {
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
      type: 'float'
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
      type: 'float'
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
      type: 'u_byte'
    }
  },
  depthTestEnabled: true,
  cullFace: 'none',
  transform: {},
  getWorldTransform: function() {
    return this.transform;
  },
  getSpecularColor: () => { return {r: 1, g: 1, b: 0} },
  getDiffuseColor: () => {  return { r: 0, g: 0, b: 1, a: 1 } },
  getRadiance: () =>  { return {r: 0, g: 0, b: 0} },
  getBrilliance: () => 3,
};


var colors = [
  [1.0,  1.0,  1.0,  1.0],    // Front face: white
  [1.0,  0.0,  0.0,  1.0],    // Back face: red
  [0.0,  1.0,  0.0,  1.0],    // Top face: green
  [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
  [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
  [1.0,  0.0,  1.0,  1.0]     // Left face: purple
];

var generatedColors = [];

for (let j=0; j<6; j++) {
  var c = colors[j];

  for (var i=0; i<4; i++) {
    generatedColors = generatedColors.concat(c);
  }
}

var normals = [
  [0.0,  0.0,  1.0],    // Front face
  [0.0,  0.0,  -1.0],    // Back face
  [0.0,  1.0,  0.0],    // Top face
  [0.0,  -1.0,  0.0],    // Bottom face
  [1.0,  0.0,  0.0],    // Right face
  [-1.0,  0.0,  0.0]     // Left face
];

var generatedNormals = [];

for (let j=0; j<6; j++) {
  var c = normals[j];

  for (var i=0; i<4; i++) {
    generatedNormals = generatedNormals.concat(c);
  }
}

var indexes = [
  0,  1,  2,      0,  2,  3,    // front
  4,  5,  6,      4,  6,  7,    // back
  8,  9,  10,     8,  10, 11,   // top
  12, 13, 14,     12, 14, 15,   // bottom
  16, 17, 18,     16, 18, 19,   // right
  20, 21, 22,     20, 22, 23    // left
];

export const cubeIdexed = {
  primitiveType: 'TRIANGLES',
  getVertCount: () => indexes.length,
  vertexShaderName: 'UNIVERSAL',
  shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=VERTEX,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
  fragmentShaderName: 'UNIVERSAL',
  buffersData: {
    useType: 'STATIC_DRAW',
    indexes: {
      data: indexes,
      type: 'u_byte'
    },
    positions: {
      data: [

        // Передняя грань
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Задняя грань
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Верхняя грань
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Нижняя грань
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Правая грань
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Левая грань
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
      ],
      type: 'float'
    },
    normals: {
      data: generatedNormals,
      type: 'float'
    },
    diffuseColors: {
      data: generatedColors,
      type: 'float'
    }
  },
  cullFace: 'CCW',
  depthTestEnabled: true,
  transform: {},
  getWorldTransform: function() {
    return this.transform;
  },
  getSpecularColor: () => { return {r: 1, g: 1, b: 0} },
  getDiffuseColor: () => {  return { r: 0, g: 0, b: 1, a: 1 } },
  getRadiance: () =>  { return {r: 0, g: 0, b: 0} },
  getBrilliance: () => 3,
};
