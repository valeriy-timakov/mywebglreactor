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
      kind: ShaderVarKind.attribute
    },
    a_vertexPosition2: {
      name: 'a_vertexPosition2',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute
    },
    a_vertexNormal: {
      name: 'a_vertexNormal',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute
    },
    a_vertexDiffuseColor: {
      name: 'a_vertexDiffuseColor',
      type: UniformTypes.vec4,
      kind: ShaderVarKind.attribute
    },
    a_vertexSpecularColor: {
      name: 'a_vertexSpecularColor',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute
    },
    a_vertexBrilliance: {
      name: 'a_vertexBrilliance',
      type: UniformTypes.float,
      kind: ShaderVarKind.attribute
    },
    a_vertexRadiance: {
      name: 'a_vertexRadiance',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.attribute
    },
    a_diffuseTexturePosition: {
      name: 'a_diffuseTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute
    },
    a_specularTexturePosition: {
      name: 'a_diffuseTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute
    },
    a_brillianceTexturePosition: {
      name: 'a_brillianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute
    },
    a_radianceTexturePosition: {
      name: 'a_radianceTexturePosition',
      type: UniformTypes.vec2,
      kind: ShaderVarKind.attribute
    },
    u_worldViewProjectionMatrix3: {
      name: 'u_worldViewProjectionMatrix3',
      type: UniformTypes.mat3,
      kind: ShaderVarKind.uniform
    },
    u_worldViewProjectionMatrix4: {
      name: 'u_worldViewProjectionMatrix4',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform
    },
    u_worldMatrixInvTransp: {
      name: 'u_worldMatrixInvTransp',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform
    },
    u_worldMatrix: {
      name: 'u_worldMatrix',
      type: UniformTypes.mat4,
      kind: ShaderVarKind.uniform
    },
    u_cameraPosition: {
      name: 'u_cameraPosition',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform
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
    },
    v_cameraPosition: {
      name: 'v_cameraPosition',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    }
  };

  return function () {
    var config = parseParams(params || '');
    params = params.split(',');
    var mode = params[0];

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
          res.addInstruction(v.v_cameraPosition, ' = ', v.u_cameraPosition);
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

      return res.build();
    };

    this.init = function (programWrapper) {

      const bufferUtils = new BufferUtils(driver.getGl(), programWrapper.program),
        uniformAccessor = new UniformAccessor(driver.getGl(), programWrapper.program);

      if (config.mode === MODE_2D) {
        bufferUtils.initAttribute(ShaderVars.a_vertexPosition2);
        uniformAccessor.initUniform(ShaderVars.u_worldViewProjectionMatrix3);
      } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
        bufferUtils.initAttribute(ShaderVars.a_vertexPosition4);
        uniformAccessor.initUniform(ShaderVars.u_worldViewProjectionMatrix4);
        if (config.mode === MODE_3D_WITH_LIGHT) {
          bufferUtils.initAttribute(ShaderVars.a_vertexNormal);
          uniformAccessor.initUniform(ShaderVars.u_worldMatrix);
          uniformAccessor.initUniform(ShaderVars.u_worldMatrixInvTransp);
          uniformAccessor.initUniform(ShaderVars.u_cameraPosition);
        }
      }

      if (config.diffuseColorSource === COLOR_SOURCE_VERTEX) {
        bufferUtils.initAttribute(ShaderVars.a_vertexDiffuseColor)
      } else if (config.diffuseColorSource === COLOR_SOURCE_TEXTURE) {
        bufferUtils.initAttribute(ShaderVars.a_diffuseTexturePosition)
      }

      if (config.specularColorSource === COLOR_SOURCE_VERTEX) {
        bufferUtils.initAttribute(ShaderVars.a_vertexSpecularColor)
      } else if (config.specularColorSource === COLOR_SOURCE_TEXTURE) {
        bufferUtils.initAttribute(ShaderVars.a_specularTexturePosition)
      }

      programWrapper.initBuffers = function (buffersData) {
        if (buffersData.combinedBuffer) {

        } else {
          bufferUtils.createBufferWrapper(buffersData.positions, buffersData.useType);
          if (config.diffuseColorSource === COLOR_SOURCE_VERTEX) {
            bufferUtils.createBufferWrapper(buffersData.diffuseColors, buffersData.useType);
          } else if (config.diffuseColorSource === COLOR_SOURCE_TEXTURE) {
            bufferUtils.createBufferWrapper(buffersData.diffuseTexturePositions, buffersData.useType);
          }
          if (config.specularColorSource === COLOR_SOURCE_VERTEX) {
            bufferUtils.createBufferWrapper(buffersData.specularColors, buffersData.useType);
          } else if (config.specularColorSource === COLOR_SOURCE_TEXTURE) {
            bufferUtils.createBufferWrapper(buffersData.specularTexturePositions, buffersData.useType);
          }
          if (config.mode === MODE_3D_WITH_LIGHT) {
            bufferUtils.createBufferWrapper(buffersData.normals, buffersData.useType)
          }
        }
        if (buffersData.indexes != null) {
          bufferUtils.createIndexBufferWrapper(buffersData.indexes, buffersData.useType);
        }
      };

      programWrapper.setBuffers = function (buffersData) {
        if (buffersData.combinedBuffer) {

        } else {
          if (config.mode === MODE_2D) {
            bufferUtils.setBuffer(ShaderVars.a_vertexPosition2, buffersData.positions);
          } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
            bufferUtils.setBuffer(ShaderVars.a_vertexPosition4, buffersData.positions);
            if (config.mode === MODE_3D_WITH_LIGHT) {
              bufferUtils.setBuffer(ShaderVars.a_vertexNormal, buffersData.normals);
            }
          }

          if (config.diffuseColorSource === COLOR_SOURCE_VERTEX) {
            bufferUtils.setBuffer(ShaderVars.a_vertexDiffuseColor, buffersData.diffuseColors);
          } else if (config.diffuseColorSource === COLOR_SOURCE_TEXTURE) {
            bufferUtils.setBuffer(ShaderVars.a_diffuseTexturePosition, buffersData.diffuseTexturePositions);
          }

          if (config.specularColorSource === COLOR_SOURCE_VERTEX) {
            bufferUtils.setBuffer(ShaderVars.a_vertexSpecularColor, buffersData.specularColors);
          } else if (config.specularColorSource === COLOR_SOURCE_TEXTURE) {
            bufferUtils.setBuffer(ShaderVars.a_specularTexturePosition, buffersData.specularTexturePositions);
          }
        }
        if (buffersData.indexes != null) {
          bufferUtils.setIndexBuffer(buffersData.indexes);
          return buffersData.indexes.bufferWrapper.type;
        }
        return null;
      };

      programWrapper.fillVertUniforms = function (figure, viewport) {
        var worldMatrix = figure.getWorldTransform();
        if (worldMatrix == null) {
          if (config.mode === MODE_2D) {
            worldMatrix = Mx3Util.IDENT;
          } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
            worldMatrix = Mx4Util.IDENT;
          }
        }
        if (config.mode === MODE_2D) {
          uniformAccessor.setUniform(ShaderVars.u_worldViewProjectionMatrix3, worldMatrix);
        } else if (config.mode === MODE_3D || config.mode === MODE_3D_WITH_LIGHT) {
          if (config.mode === MODE_3D_WITH_LIGHT) {
            uniformAccessor.setUniform(ShaderVars.u_worldMatrix, new Transform3dBuilder(worldMatrix).build());
            uniformAccessor.setUniform(ShaderVars.u_worldMatrixInvTransp,
              new Transform3dBuilder(worldMatrix).inverse().transponse().build());
            uniformAccessor.setUniform(ShaderVars.u_cameraPosition, viewport.getCamera().getPosition());
          }
          uniformAccessor.setUniform(ShaderVars.u_worldViewProjectionMatrix4,
            new Transform3dBuilder(worldMatrix).multiply(viewport.getVPBuilder().build()).build());
        }
      };

    };
  }

};
