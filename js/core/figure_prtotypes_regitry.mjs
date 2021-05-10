import {arraysEqual, HashBuilder, numberArrayHashCode, stringHashCode} from "../utils.mjs";


export function FiguresPrototypesRegistry() {
  const prototypes = new Map();

  this.findOrAdd = function (figure) {
    let arr = getPrototyesArr(figure),
      prototype = find(arr, figure),
      found = true;
    if (prototype == null) {
      prototype = createPrototype(figure);
      arr.push(prototype);
      found = false;
    }
    return {
      prototype: prototype,
      found: found
    };

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
    for (let name in f. buffersData) {
      if (f.buffersData[name].data instanceof Array) {
        addBufferToHashCode(f.buffersData[name], hashCodeBuilder);
      }
    }
    return hashCodeBuilder.get();
  }

  function addBufferToHashCode(buffer, hashCodeBuilder) {
    if (buffer == null) return;
    hashCodeBuilder.add(stringHashCode(buffer.type));
    hashCodeBuilder.add(numberArrayHashCode(buffer.data));
  }

  function protorypesEqual(f1, f2) {
    let result = f1.vertexShaderName === f2.vertexShaderName
        && f1.fragmentShaderName === f2.fragmentShaderName
        && f1.shadersParams === f2.shadersParams
        && f1.buffersData.useType === f2.buffersData.useType;
    if (!result) {
      return false;
    }
    let names = new Set();
    addNames(names, f1.buffersData);
    addNames(names, f2.buffersData);
    names = Array.from(names);
    for (let i in names) {
      result &&= buffersEqual(f1, f2, names[i]);
      if (!result) {
        return false;
      }
    }
    return result;
  }

  function buffersEqual(f1, f2, bufferName) {
    let b1 = f1.buffersData[bufferName],
      b2 = f2.buffersData[bufferName];
    if (b1 === b2) return true;
    if (b1 == null || b2 == null) return false;
    return b1.type === b2.type && arraysEqual(b1.data, b2.data);
  }

  function addNames(names, buffersData) {
    for (let name in buffersData) {
      if (buffersData[name].data instanceof Array) {
        names.add(name);
      }
    }
  }
}
