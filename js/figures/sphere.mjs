
import {createSphere, createSphereIndexed} from './figures_creator.mjs'

let d = createSphere(1.7, 500);
export const sphere = {
  primitiveType: 'TRIANGLE_STRIP',
  vertexShaderName: 'UNIVERSAL',
  shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=MATERIAL,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
  fragmentShaderName: 'UNIVERSAL',
  buffersData: {
    useType: 'STATIC_DRAW',
    positions: {
      data: d.vertices,
      type: 'float'
    },
    normals: {
      data: d.normals,
      type: 'float'
    }
  },
  depthTestEnabled: true,
  cullFace: null,
  getSpecularColor: () => { return {r: 1, g: 1, b: 1} },
  getDiffuseColor: () => {  return { r: 1, g: 0, b: 1, a: 1 } },
  getRadiance: () =>  { return {r: 0.1, g: 0, b: 0} },
  getBrilliance: () => 16
};

let di = createSphereIndexed(1.7, 500);
export const sphereIndexed = {
  primitiveType: 'TRIANGLE_STRIP',
  getVertCount:  () => di.indexes.length,
  getOffset: () => 0,
  vertexShaderName: 'UNIVERSAL',
  shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=MATERIAL,SPECULAR_COLORE_SOURCE=MATERIAL,BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
  fragmentShaderName: 'UNIVERSAL',
  buffersData: {
    useType: 'STATIC_DRAW',
    indexes: {
      data: di.indexes,
      type: 'u_short'
    },
    positions: {
      data: di.vertices,
      type: 'float'
    },
    normals: {
      data: di.normals,
      type: 'float'
    }
  },
  depthTestEnabled: true,
  cullFace: null,
  getSpecularColor: () => { return {r: 1, g: 1, b: 1} },
  getRadiance: () =>  { return {r: 0, g: 0.2, b: 0} },
  getBrilliance: () => 7
};
