"use strict";

import {Ajax} from './libs/ajax.mjs'

export const TYPE_DIFFUSE_COLORED = 'DIFFUSE_COLORED',
  TYPE_SPECULAR_COLORED = 'SPECULAR_COLORED',
  TYPE_DIFFUSE_MONO_COLOR = 'DIFFUSE_MONO_COLOR',
  TYPE_SPECULAR_MONO_COLOR = 'SPECULAR_MONO_COLOR',
  TYPE_TEXTURED = 'TEXTURED',
  TYPE_HAVE_NORMALS = 'HAVE_NORMALS',
  DIFFUSE_COLORE_SOURCE = 'DIFFUSE_COLORE_SOURCE',
  SPECULAR_COLORE_SOURCE = 'SPECULAR_COLORE_SOURCE',
  BRILLIANCE_SOURCE = 'BRILLIANCE_SOURCE',
  RADIANCE_SOURCE = 'RADIANCE_SOURCE',
  COLOR_SOURCE_MATERIAL = 'MATERIAL',
  COLOR_SOURCE_VERTEX = 'VERTEX',
  COLOR_SOURCE_TEXTURE = 'TEXTURE',
  MODE = 'MODE',
  MODE_2D = '2D',
  MODE_3D = '3D',
  MODE_3D_WITH_LIGHT = '3D_WITH_LIGHT'
  ;

const ParamsParser = {};
ParamsParser[TYPE_DIFFUSE_COLORED] = (config) => { config.diffuseMonoColor = false; };
ParamsParser[TYPE_DIFFUSE_MONO_COLOR] = (config) => { config.diffuseMonoColor = true; };
ParamsParser[TYPE_SPECULAR_COLORED] = (config) => { config.specularMonoColor = false; };
ParamsParser[TYPE_SPECULAR_MONO_COLOR] = (config) => { config.specularMonoColor = true; };
ParamsParser[TYPE_TEXTURED] = (config) => { config.texture = true; };
ParamsParser[TYPE_HAVE_NORMALS] = (config) => { config.normals = true; };
ParamsParser[MODE_2D] = (config) => { config.mode_2d = true; };
ParamsParser[MODE_3D] = (config) => { config.mode_2d = false; };
ParamsParser[DIFFUSE_COLORE_SOURCE] = (paramValue) => { return config => { config.diffuseColorSource = paramValue; } };
ParamsParser[SPECULAR_COLORE_SOURCE] = (paramValue) => { return config => { config.specularColorSource = paramValue; } };
ParamsParser[BRILLIANCE_SOURCE] = (paramValue) => { return config => { config.brillianceSource = paramValue; } };
ParamsParser[RADIANCE_SOURCE] = (paramValue) => { return config => { config.radianceSource = paramValue; } };
ParamsParser[MODE] = (paramValue) => { return config => { config.mode = paramValue; } };
ParamsParser.getParser = function(param) {
  if (typeof ParamsParser[param] == 'function') {
    return ParamsParser[param];
  }
  let pair = param.split('=');
  if (pair.length == 2 && typeof ParamsParser[pair[0]] == 'function') {
    return ParamsParser[pair[0]](pair[1]);
  }
};

export function parseParams (params) {
  if (params == '') {
    return {};
  }
  var config = {};
  params.split(',').forEach( param => { ParamsParser.getParser(param)(config) } );
  return config;
}

function DataTypes(gl) {
  return {
    float: {
      arrType: Float32Array,
      itemType: gl.FLOAT
    },
    u_byte: {
      arrType: Uint8Array,
      itemType: gl.UNSIGNED_BYTE
    },
    byte: {
      arrType: Int8Array,
      itemType: gl.BYTE
    },
    u_short: {
      arrType: Uint16Array,
      itemType: gl.UNSIGNED_SHORT
    },
    short: {
      arrType: Int16Array,
      itemType: gl.SHORT
    },
    u_uint: {
      arrType: Uint32Array,
      itemType: gl.UNSIGNED_INT
    },
    int: {
      arrType: Int32Array,
      itemType: gl.INT
    }
  }
}

export function BufferUtils (gl, program) {

  const dataTypes = new DataTypes(gl),
    attributeLocations = {};

  return {
    createBufferWrapper: function(bufferData, bufferUseType) {
      var dataType = dataTypes[bufferData.type];
      bufferData.bufferWrapper = {
        buffer: createBuffer(bufferData.data, dataType.arrType, bufferUseType, gl.ARRAY_BUFFER),
        type: dataType.itemType
      };
    },

    createIndexBufferWrapper: function(bufferData, bufferUseType) {
      var dataType = dataTypes[bufferData.type];
      bufferData.bufferWrapper = {
        buffer: createBuffer(bufferData.data, dataType.arrType, bufferUseType, gl.ELEMENT_ARRAY_BUFFER),
        type: dataType.itemType
      };
    },

    setBuffer: function(attributeShaderVar, bufferData) {
      let attribureLocation = attributeLocations[attributeShaderVar.name],
        componentsCount = attributeShaderVar.componentsCount != null ?
          attributeShaderVar.componentsCount : attributeShaderVar.type.componentsCount;
      gl.enableVertexAttribArray(attribureLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferData.bufferWrapper.buffer);
      gl.vertexAttribPointer(attribureLocation, componentsCount, bufferData.bufferWrapper.type,
        bufferData.normalized != null ? bufferData.normalized : false,
        0, bufferData.offset != null ? bufferData.offset : 0);
    },

    setIndexBuffer: function(bufferData) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferData.bufferWrapper.buffer);
    },

    initAttribute: function(attributeShaderVar) {
      attributeLocations[attributeShaderVar.name] = gl.getAttribLocation(program, attributeShaderVar.name);
    }
  }

  function createBuffer(bufferData, arrayType, bufferUseType, bufferKind) {
    var result = gl.createBuffer();
    gl.bindBuffer(bufferKind, result);
    gl.bufferData(bufferKind, new arrayType(bufferData), gl[bufferUseType]);
    return result;
  }

}

export function UniformAccessor(gl, program) {

  var uniformLocations = {};

  function getFullName(shaderVar, arrayPosition) {
    if (arrayPosition == null) {
      return shaderVar.name;
    } else {
      return shaderVar.name + '[' + arrayPosition + ']';
    }
  }

  function setFullQualifiedVar(varFullName, type, value) {
    var vector = value instanceof Array;
    if (vector) {
      for (let i in value) {
        if (isNaN(value[i])) throw new Error("Uniform value is NaN! " + varFullName  + '=' + value)
      }
    } else {
      if (isNaN(value)) throw new Error("Uniform value is NaN! " + varFullName  + '=' + value)
    }
    if (type.matrix) {
      gl['uniformMatrix' + type.fnSuffix + 'v'](uniformLocations[varFullName], false, value);
    } else {
      gl['uniform' + type.fnSuffix + (vector ? 'v' : '')](uniformLocations[varFullName], value);
    }
  }


  function initUniform(shaderVar, arrayPosition) {
    let fullName = getFullName(shaderVar, arrayPosition);
    let components = shaderVar.type.components;
    if (components == null) {
      uniformLocations[fullName] = gl.getUniformLocation(program, fullName);
    } else {
      for (let i in components) {
        let componentName = fullName + '.' + components[i].name;
        uniformLocations[componentName] = gl.getUniformLocation(program, componentName);
      }
    }
  }

  return {
    initUniform: initUniform,
    /*initUniforms: function (uniforms) {

    }*/
    setUniform: function(shaderVar, value, arrayPosition) {
      let fullName = getFullName(shaderVar, arrayPosition);
      let components = shaderVar.type.components;
      if (components == null) {
        setFullQualifiedVar(fullName, shaderVar.type, value);
      } else {
        for (let i in components) {
          let
            component = components[i],
            componentName = fullName + '.' + component.name,
            componentType = component.type,
            componentValue = value.get(component);
          setFullQualifiedVar(componentName, componentType, componentValue);
        }
      }
    },
    setStructsUniforms: function(structs, shaderVar, valuesExtractor, nullValuesExtractor) {
      if (structs.length > 0) {
        for (let i = 0; i < structs.length; i++) {
          let valuesMap = valuesExtractor(structs[i]);
          this.setUniform(shaderVar, valuesMap, i);
        }
      } else {
        let valuesMap = nullValuesExtractor(null);
        this.setUniform(shaderVar, valuesMap, 0);
      }
    },
    getValuesExtractor: function () {
      let args = arguments;
      return function (struct) {
        let values = new Map();
        for (let i = 1; i < args.length; i += 2) {
          values.set(args[i - 1], args[i](struct));
        }
        return values;
      }
    }
  };

}

export const ShaderVarKind = {
  uniform: 'uniform',
  attribute: 'attribute',
  varying: 'varying'
};

export const UniformTypes = {
  float: {
    name: 'float',
    fnSuffix: '1f',
    componentsCount: 1
  },
  vec2: {
    name: 'vec2',
    fnSuffix: '2f',
    componentsCount: 2
  },
  vec3: {
    name: 'vec3',
    fnSuffix: '3f',
    componentsCount: 3
  },
  vec4: {
    name: 'vec4',
    fnSuffix: '4f',
    componentsCount: 4
  },
  int: {
    name: 'int',
    fnSuffix: '1i',
    componentsCount: 1
  },
  ivec2: {
    name: 'ivec2',
    fnSuffix: '2i',
    componentsCount: 2
  },
  ivec3: {
    name: 'ivec3',
    fnSuffix: '3i',
    componentsCount: 3
  },
  ivec4: {
    name: 'ivec4',
    fnSuffix: '4i',
    componentsCount: 4
  },
  sampler2D: {
    name: 'sampler2D',
    fnSuffix: '1i'
  },
  samplerCube : {
    name: 'samplerCube ',
    fnSuffix: '1i'
  },
  mat3: {
    name: 'mat3',
    fnSuffix: '3f',
    matrix: true
  },
  mat4: {
    name: 'mat4',
    fnSuffix: '4f',
    matrix: true
  },
};

export const ComplexTypes = {
  DirectLight: {
    name: 'DirectLight',
    components: {
      directionRev : {
        name: 'directionRev',
        type: UniformTypes.vec3
      },
      luminousIntensity : {
        name: 'luminousIntensity',
        type: UniformTypes.vec3
      }
    }
  },
  PointLight: {
    name: 'PointLight',
    components: {
      position : {
        name: 'position',
        type: UniformTypes.vec3
      },
      luminousIntensity : {
        name: 'luminousIntensity',
        type: UniformTypes.vec3
      },
      size : {
        name: 'size',
        type: UniformTypes.float
      }
    }
  },
  Spotlight: {
    name: 'Spotlight',
    components: {
      position : {
        name: 'position',
        type: UniformTypes.vec3
      },
      luminousIntensity : {
        name: 'luminousIntensity',
        type: UniformTypes.vec3
      },
      size : {
        name: 'size',
        type: UniformTypes.float
      },
      directionRev : {
        name: 'directionRev',
        type: UniformTypes.vec3
      },
      nearLimit : {
        name: 'nearLimit',
        type: UniformTypes.float
      },
      farLimit : {
        name: 'farLimit',
        type: UniformTypes.float
      },
      smothMethod : {
        name: 'smothMethod',
        type: UniformTypes.float
      }
    }
  }
};

export function ShaderBuilder() {
  var
    structs = [],
    declaredVars = new Set(),
    arrayDeclaresVars = new Map(),
    instructions = '',
    precisionDeclaration = '',
    definitions = '',
    includeSubShadersUrls = [];

  this.getVars = () => Array.from(declaredVars);
  this.getArrVars = () => Array.from(arrayDeclaresVars.entries());

  this.build = function() {
    var structsDeclarations = structs.map(struct => 'struct ' + struct.name + ' {\n' +
    Object.values(struct.components).map(comp => '\t' + comp.type.name + ' ' + comp.name + ';\n').join('') + '};\n')
      .join('');
    var declarations = Array.from(declaredVars)
      .map(varDef => varDef.kind + ' ' + varDef.type.name + ' ' + varDef.name + ';\n')
      .join('');
    var arrayDeclarations = Array.from(arrayDeclaresVars.entries())
      .map(([shaderVar, arraySize])=>shaderVar.kind + ' ' + shaderVar.type.name + ' ' + shaderVar.name +
      '[' + arraySize + '];\n')
      .join('');
    if (includeSubShadersUrls.length == 0) {
      return precisionDeclaration + '\n' +
        definitions + '\n' +
        structsDeclarations + '\n' +
        arrayDeclarations + '\n' +
        declarations + '\n\nvoid main() {\n' +
        instructions + '\n}';
    } else {
      return Promise.all(includeSubShadersUrls.map(url => Ajax.get(url))).then(sources =>
        precisionDeclaration + '\n' +
        definitions + '\n' +
        structsDeclarations + '\n' +
        arrayDeclarations + '\n' +
        declarations + '\n\n' +
        sources.map(xhr => xhr.responseText).join('/n')  + '\n\nvoid main() {\n' +
        instructions + '\n}' );
    }
  };

  this.addDeclaration = function(shaderVar, arraySize) {
    if (arraySize == null) {
      declaredVars.add(shaderVar);
    } else {
      arrayDeclaresVars.set(shaderVar, arraySize);
    }
  };

  this.addStruct = (struct) => { structs.push(struct) };

  this.addDefinition = function() {
    let line = '';
    for (let i in arguments) {
      let a = arguments[i];
      if (line.length > 0) {
        line += ' ';
      }
      line += a;
    }
    line += '\n';
    definitions += line;
  };

  this.addIncludeSubShaderUrl = function(url) {
    includeSubShadersUrls.push(url);
  };

  this.setPrecision = function(precision) {
    precisionDeclaration = 'precision ' + precision + ' float;'
  };

  function stringify(value) {
    if (value.name != null) {
      if (arrayDeclaresVars.get(value) == null) {
        declaredVars.add(value);
      }
      return value.name;
    } else {
      return value;
    }
  }

  function createInstruction(args) {
    let line = '\t';
    for (let i in args) {
      let a = args[i];
      if (line.length > 1) {
        line += ' ';
      }
      line += stringify(a);
    }
    return line;
  }

  this.createInstructionBuilder = function() {
    var line = createInstruction(arguments),
      result = {};
    result.add = function() {
      line += createInstruction(arguments);
      return result;
    };
    result.addIf = function(condition) {
      if (condition) {
        line += createInstruction(arguments);
      }
      return result;
    };
    result.build = function() {
      instructions += line + ';\n';
    };
    return result;
  };

  this.addInstruction = function() {
    instructions += createInstruction(arguments) + ';\n';
  };
}
