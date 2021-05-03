import {arraysEqual, HashBuilder, numberArrayHashCode, stringHashCode} from "../utils.mjs";


export function FiguresPrototypesRegistry() {
  const prototypes = new Map();

  this.findOrAdd = function (figure) {
    let arr = getPrototyesArr(figure),
      prototype = find(arr, figure);
    if (prototype == null) {
      prototype = createPrototype(figure);
      arr.push(prototype);
    }
    return prototype;

  }

  function find(prototypes, figure) {
    for (let i in prototypes) {
      let tmpPrototype = prototypes[i];
      if (protorypesEqual(tmpPrototype, figure)) {
        return tmpPrototype;
      }
    }
    return  null;
  }

  function createPrototype(figure) {
    return  {
      vertexShaderName: figure.vertexShaderName,
      fragmentShaderName: figure.fragmentShaderName,
      shadersParams: figure.shadersParams,
      buffersData: figure.buffersData
    };
  }

  function getPrototyesArr(figure) {
    let code = protorypeHashCode(figure),
      arr = prototypes.get(code);
    if (arr == null) {
      arr = [];
      prototypes.set(code, arr);
    }
    return arr;
  }

  function protorypeHashCode(f) {
    let hashCodeBuilder = new HashBuilder();
    hashCodeBuilder.add(stringHashCode(f.vertexShaderName));
    hashCodeBuilder.add(stringHashCode(f.fragmentShaderName));
    hashCodeBuilder.add(stringHashCode(f.shadersParams));
    hashCodeBuilder.add(stringHashCode(f.buffersData.useType));
    addBufferToHashCode(f.buffersData.indexes, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.positions, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.normals, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.diffuseColors, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.diffuseTexturePositions, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.specularColors, hashCodeBuilder);
    addBufferToHashCode(f.buffersData.specularTexturePositions, hashCodeBuilder);
    return hashCodeBuilder.get();
  }

  function addBufferToHashCode(buffer, hashCodeBuilder) {
    if (buffer == null) return;
    hashCodeBuilder.add(stringHashCode(buffer.type));
    hashCodeBuilder.add(numberArrayHashCode(buffer.data));
  }

  function protorypesEqual(f1, f2) {
    return f1.vertexShaderName === f2.vertexShaderName
      && f1.fragmentShaderName === f2.fragmentShaderName
      && f1.shadersParams === f2.shadersParams
      && f1.buffersData.useType === f2.buffersData.useType
      && buffersEqual(f1, f2, 'indexes')
      && buffersEqual(f1, f2, 'positions')
      && buffersEqual(f1, f2, 'normals')
      && buffersEqual(f1, f2, 'diffuseColors')
      && buffersEqual(f1, f2, 'diffuseTexturePositions')
      && buffersEqual(f1, f2, 'specularColors')
      && buffersEqual(f1, f2, 'specularTexturePositions');
  }

  function buffersEqual(f1, f2, bufferName) {
    let b1 = f1.buffersData[bufferName],
      b2 = f2.buffersData[bufferName];
    if (b1 === b2) return true;
    if (b1 == null || b2 == null) return false;
    return b1.type === b2.type && arraysEqual(b1.data, b2.data);
  }
}
