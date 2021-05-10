/**
 * Created by valti on 26.03.2021.
 */

import { BufferUtils, UniformTypes, ShaderVarKind, UniformAccessor, ShaderBuilder, COLOR_SOURCE_VERTEX,
  COLOR_SOURCE_TEXTURE, MODE_2D, MODE_3D, MODE_3D_WITH_LIGHT, parseParams } from '../webgl_utils.mjs'
import {Vx3Utils, Mx4Util, Transform3dBuilder} from '../math_utils.mjs'

export function getBuilder(params, scene, driver) {

  const ShaderVars = {
    a_vertexPosition4: {
      name: 'a_vertexPosition4',
      type: UniformTypes.vec4,
      componentsCount: 3,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'positions'
    },
    a_vertexPosition2: {
      name: 'a_vertexPosition2',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'positions'
    },
    a_vertexNormal: {
      name: 'a_vertexNormal',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'normals'
    },
    a_vertexDiffuseColor: {
      name: 'a_vertexDiffuseColor',
      type: UniformTypes.vec4,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'diffuseColors'
    },
    a_vertexSpecularColor: {
      name: 'a_vertexSpecularColor',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'specularColors'
    },
    a_vertexBrilliance: {
      name: 'a_vertexBrilliance',
      type: UniformTypes.float,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'brilliances'
    },
    a_vertexRadiance: {
      name: 'a_vertexRadiance',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'radianceColors'
    },
    a_diffuseTexturePosition: {
      name: 'a_diffuseTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'diffuseTexturePositions'
    },
    a_specularTexturePosition: {
      name: 'a_specularTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'specularTexturePositions'
    },
    a_brillianceTexturePosition: {
      name: 'a_brillianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'brillianceTexturePositions'
    },
    a_radianceTexturePosition: {
      name: 'a_radianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute,
      bufferWrapperName: 'radianceTexturePositions'
    },
    u_worldViewProjectionMatrix3: {
      name: 'u_worldViewProjectionMatrix3',
      type: UniformTypes.mat3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure, viewport, pickPoint) => {
        uniformAccessor.setUniform(ShaderVars.u_worldViewProjectionMatrix3, figure.getFullProjectTransform(viewport, pickPoint));
      }
    },
    u_worldViewProjectionMatrix4: {
      name: 'u_worldViewProjectionMatrix4',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure, viewport, pickPoint) => {
        uniformAccessor.setUniform(ShaderVars.u_worldViewProjectionMatrix4, figure.getFullProjectTransform(viewport, pickPoint));
      }
    },
    u_worldMatrixInvTransp: {
      name: 'u_worldMatrixInvTransp',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        let worldMatrix = figure.getWorldTransform();
        uniformAccessor.setUniform(ShaderVars.u_worldMatrixInvTransp, figure.getWorldTransformInvTransp());
      }
    },
    u_worldMatrix: {
      name: 'u_worldMatrix',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setUniform(ShaderVars.u_worldMatrix, figure.getWorldTransform());
      }
    },
    v_normal: {
      name: 'v_normal',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    },
    v_diffuseTexturePosition: {
      name: 'v_diffuseTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.varying
    },
    v_specularTexturePosition: {
      name: 'v_specularTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.varying
    },
    v_brillianceTexturePosition: {
      name: 'v_brillianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.varying
    },
    v_radianceTexturePosition: {
      name: 'v_radianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.varying
    },
    v_diffuseColor: {
      name: 'v_diffuseColor',
      type: UniformTypes.vec4,
      kind: ShaderVarKind.varying
    },
    v_specularColor: {
      name: 'v_specularColor',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    },
    v_brilliance: {
      name: 'v_brilliance',
      type: UniformTypes.float,
      kind: ShaderVarKind.varying
    },
    v_radiance: {
      name: 'v_radiance',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    },
    v_surfacePosition: {
      name: 'v_surfacePosition',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    }
  };

  return function () {
    var config = parseParams(params || ''),
      standartShaderScope, pickShaderScope,
      shaderUniforms, shaderUniformsArrays, shaderAttributes, pickUniforms, pickUniformArrays, pickAattributes;

    this.getBody = function () {
      let res = new ShaderBuilder();
      var v = ShaderVars;
      if (config.mode === MODE_2D) {
        res.addInstruction('gl_Position =',
          'vec4( ( ', v.u_worldViewProjectionMatrix3, ' * vec3(', v.a_vertexPosition2, ', 1) ).xy, 0, 1 )');

      } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
        res.addInstruction('gl_Position =', v.u_worldViewProjectionMatrix4, ' * ', v.a_vertexPosition4);
        if (config.mode === MODE_3D_WITH_LIGHT) {
          res.addInstruction(v.v_surfacePosition, ' = (', v.u_worldMatrix, ' * ', v.a_vertexPosition4, ').xyz');
          res.addInstruction(v.v_normal, ' = mat3( ', v.u_worldMatrixInvTransp , ' ) * ', v.a_vertexNormal);
        }
      }
      if (config.diffuseColorSource === COLOR_SOURCE_VERTEX) {
        res.addInstruction(v.v_diffuseColor, '=', v.a_vertexDiffuseColor);
      } else if (config.diffuseColorSource === COLOR_SOURCE_TEXTURE) {
        res.addInstruction(v.v_diffuseTexturePosition, '=', v.a_diffuseTexturePosition);
      }
      if (config.specularColorSource === COLOR_SOURCE_VERTEX) {
        res.addInstruction(v.v_specularColor, '=', v.a_vertexSpecularColor);
      } else if (config.specularColorSource === COLOR_SOURCE_TEXTURE) {
        res.addInstruction(v.v_specularTexturePosition, '=', v.a_specularTexturePosition);
      }
      if (config.brillianceSource === COLOR_SOURCE_VERTEX) {
        res.addInstruction(v.v_brilliance, '=', v.a_vertexBrilliance);
      } else if (config.brillianceSource === COLOR_SOURCE_TEXTURE) {
        res.addInstruction(v.v_brillianceTexturePosition, '=', v.a_brillianceTexturePosition);
      }
      if (config.radianceSource === COLOR_SOURCE_VERTEX) {
        res.addInstruction(v.v_radiance, '=', v.a_vertexRadiance);
      } else if (config.radianceSource === COLOR_SOURCE_TEXTURE) {
        res.addInstruction(v.v_radianceTexturePosition, '=', v.a_radianceTexturePosition);
      }

      standartShaderScope = createShaderScope(res);

      return res.build();
    };


    this.getPickBody = function () {
      let res = new ShaderBuilder(),
        v = ShaderVars;
      if (config.mode === MODE_2D) {
        res.addInstruction('gl_Position =',
          'vec4( ( ', v.u_worldViewProjectionMatrix3, ' * vec3(', v.a_vertexPosition2, ', 1) ).xy, 0, 1 )');

      } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
        res.addInstruction('gl_Position =', v.u_worldViewProjectionMatrix4, ' * ', v.a_vertexPosition4);
      }

      pickShaderScope = createShaderScope(res, true);

      return res.build();
    };

    this.init = function (programWrapper) {

      initShaderScope(standartShaderScope, programWrapper.program);
      initShaderScope(pickShaderScope, programWrapper.pickProgram);

      programWrapper.initBuffers = createInitBuffers(standartShaderScope);
      programWrapper.setBuffers = createSetBuffers(standartShaderScope);
      programWrapper.setPickBuffers = createSetBuffers(pickShaderScope);
      programWrapper.fillVertUniforms = createFillVertUniforms(standartShaderScope);
      programWrapper.fillPickVertUniforms = createFillVertUniforms(pickShaderScope);

    };

    function createShaderScope(shaderBuilder, pick) {
      return {
        uniforms: shaderBuilder.getVars().filter(v => v.kind === ShaderVarKind.uniform),
        attributes: shaderBuilder.getVars().filter(v => v.kind === ShaderVarKind.attribute),
        uniformsArrays: shaderBuilder.getArrVars().filter(varData => varData[0].kind === ShaderVarKind.uniform),
        pick: pick
      };
    }

    function initShaderScope(scope, shaderProgramm) {
      scope.bufferUtils = new BufferUtils(driver.getGl(), shaderProgramm);
      scope.uniformAccessor = new UniformAccessor(driver.getGl(), shaderProgramm);

      scope.uniforms.forEach(u => scope.uniformAccessor.initUniform(u));
      scope.attributes.forEach(a => scope.bufferUtils.initAttribute(a));
      scope.uniformsArrays.forEach(uData => {for (let i = 0; i < uData[1]; i++) scope.uniformAccessor.initUniform(uData[0],i)});
    }

    function createInitBuffers(scope) {
      return function (buffersData) {
        if (buffersData.combinedBuffer) {

        } else {
          scope.attributes.forEach(a => {
            scope.bufferUtils.createBufferWrapper(buffersData[a.bufferWrapperName], buffersData.useType);
          });
        }
        if (buffersData.indexes != null) {
          scope.bufferUtils.createIndexBufferWrapper(buffersData.indexes, buffersData.useType);
        }
      };
    }

    function createSetBuffers(scope) {
      return function (buffersData) {
        if (buffersData.combinedBuffer) {

        } else {
          scope.attributes.forEach(a => {
            scope.bufferUtils.setBuffer(a, buffersData[a.bufferWrapperName]);
          });
        }
        if (buffersData.indexes != null) {
          scope.bufferUtils.setIndexBuffer(buffersData.indexes);
          return buffersData.indexes.bufferWrapper.type;
        }
        return null;
      };
    }

    function createFillVertUniforms(scope) {
      return function (figure, viewport, pickPoint) {
        scope.uniforms
          .forEach(u => u.set(scope.uniformAccessor, figure, viewport, scope.pick === true ? pickPoint : null));
        scope.uniformsArrays
          .forEach( uData =>  uData[0].set(scope.uniformAccessor, figure, viewport, scope.pick === true ? pickPoint : null));
      };
    }
  }

};
