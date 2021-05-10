"use strict";

import { parseParams, UniformTypes, UniformAccessor, ShaderVarKind, ComplexTypes,
  ShaderBuilder, COLOR_SOURCE_MATERIAL, COLOR_SOURCE_TEXTURE, COLOR_SOURCE_VERTEX, MODE_3D_WITH_LIGHT } from '../webgl_utils.mjs'

export function getBuilder(params, scene, driver) {


  const ShaderVars = {
    u_materialDiffuseColor: {
      name: 'u_materialDiffuseColor',
      type: UniformTypes.vec4,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        var color = figure.getDiffuseColor();
        uniformAccessor.setUniform(ShaderVars.u_materialDiffuseColor, [color.r, color.g, color.b, color.a]);
      }
    },
    u_materialSpecularColor: {
      name: 'u_materialSpecularColor',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        var color = figure.getSpecularColor();
        uniformAccessor.setUniform(ShaderVars.u_materialSpecularColor, [color.r, color.g, color.b]);
      }
    },
    u_materialBrilliance: {
      name: 'u_materialBrilliance',
      type: UniformTypes.float,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        var color = figure.getBrilliance();
        uniformAccessor.setUniform(ShaderVars.u_materialBrilliance, figure.getBrilliance());
      }
    },
    u_materialRadiance: {
      name: 'u_materialRadiance',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        var color = figure.getRadiance();
        uniformAccessor.setUniform(ShaderVars.u_materialRadiance, [color.r, color.g, color.b]);
      }
    },
    u_diffuseTexture: {
      name: 'u_diffuseTexture',
      type: UniformTypes.sampler2D,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        driver.bindTexture(figure.diffuseTextureName);
      }
    },
    u_specularTexture: {
      name: 'u_specularTexture',
      type: UniformTypes.sampler2D,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        driver.bindTexture(figure.specularTextureName);
      }
    },
    u_brillianceTexture: {
      name: 'u_brillianceTexture',
      type: UniformTypes.sampler2D,
      kind: ShaderVarKind.uniform,
      set: (figure) => {
        driver.bindTexture(figure.brillianceTextureName);

      }
    },
    u_radianceTexture: {
      name: 'u_radianceTexture',
      type: UniformTypes.sampler2D,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        driver.bindTexture(figure.radianceTextureName);

      }
    },
    u_directLights: {
      name: 'u_directLights',
      type: ComplexTypes.DirectLight,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setStructsUniforms(scene.getDirectLights(), ShaderVars.u_directLights,
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_directLights.type.components.directionRev, light => light.getRevDirection(),
            ShaderVars.u_directLights.type.components.luminousIntensity, light => light.getLuminousIntensity()),
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_directLights.type.components.directionRev, light => [0, 0, 0],
            ShaderVars.u_directLights.type.components.luminousIntensity, light => [0, 0, 0])
        );
      }
    },
    u_pointLights: {
      name: 'u_pointLights',
      type: ComplexTypes.PointLight,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setStructsUniforms(scene.getPointLights(), ShaderVars.u_pointLights,
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_pointLights.type.components.position, light => light.getPosition(),
            ShaderVars.u_pointLights.type.components.luminousIntensity, light => light.getLuminousIntensity(),
            ShaderVars.u_pointLights.type.components.size, light => light.getSize()),
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_pointLights.type.components.position, light => [0, 0, 0],
            ShaderVars.u_pointLights.type.components.luminousIntensity, light => [0, 0, 0],
            ShaderVars.u_pointLights.type.components.size, light => 1)
        );
      }
    },
    u_spotLights: {
      name: 'u_spotLights',
      type: ComplexTypes.Spotlight,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setStructsUniforms(scene.getSpotLights(), ShaderVars.u_spotLights,
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_spotLights.type.components.position, light => light.getPosition(),
            ShaderVars.u_spotLights.type.components.luminousIntensity, light => light.getLuminousIntensity(),
            ShaderVars.u_spotLights.type.components.size, light => light.getSize(),
            ShaderVars.u_spotLights.type.components.directionRev, light => light.getRevDirection(),
            ShaderVars.u_spotLights.type.components.nearLimit, light => light.getNearLimit(),
            ShaderVars.u_spotLights.type.components.farLimit, light => light.getFarLimit(),
            ShaderVars.u_spotLights.type.components.smothMethod, light => light.getSmothMethod()),
          uniformAccessor.getValuesExtractor(
            ShaderVars.u_spotLights.type.components.position, light => [0, 0, 0],
            ShaderVars.u_spotLights.type.components.luminousIntensity, light => [0, 0, 0],
            ShaderVars.u_spotLights.type.components.size, light => 1,
            ShaderVars.u_spotLights.type.components.directionRev, light => [1, 0, 0],
            ShaderVars.u_spotLights.type.components.nearLimit, light => 0,
            ShaderVars.u_spotLights.type.components.farLimit, light => 0,
            ShaderVars.u_spotLights.type.components.smothMethod, light => -1)
        );
      }
    },
    u_ambientLight: {
      name: 'u_ambientLight',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setUniform(ShaderVars.u_ambientLight, scene.getAmbientLight());
      }
    },
    u_lightSensitivityCfnt: {
      name: 'u_lightSensitivityCfnt',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure) => {
        uniformAccessor.setUniform(ShaderVars.u_lightSensitivityCfnt, scene.getLightSensitivityCfnt());
      }
    },
    u_cameraPosition: {
      name: 'u_cameraPosition',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.uniform,
      set: (uniformAccessor, figure, viewport) => {
        uniformAccessor.setUniform(ShaderVars.u_cameraPosition, viewport.getCamera().getPosition());
      }
    },
    v_diffuseTexturePosition: {
      name: 'v_diffuseTexturePosition',
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
    v_specularTexturePosition: {
      name: 'v_specularTexturePosition',
        type: UniformTypes.vec2,
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
    v_normal: {
      name: 'v_normal',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    },
    v_surfacePosition: {
      name: 'v_surfacePosition',
      type: UniformTypes.vec3,
      kind: ShaderVarKind.varying
    }
  };

  const InterpolationType = {
    ermit: 0,
    linear: 1,
    power: 2
  };


  return function () {
    var config = parseParams(params || '');
    var shaderUniforms;
    var shaderUniformsArrays;
    this.getBody = function () {
      let res = new ShaderBuilder();
      res.setPrecision('mediump');

      var v = ShaderVars;

      if (config.diffuseColorSource === COLOR_SOURCE_TEXTURE) {
        res.addInstruction('gl_FragColor = texture2D(', v.u_diffuseTexture, ', ', v.v_diffuseTexturePosition, ')');
      } else if (config.diffuseColorSource === COLOR_SOURCE_MATERIAL) {
        res.addInstruction('gl_FragColor = ', v.u_materialDiffuseColor);
      } else if (config.diffuseColorSource === COLOR_SOURCE_VERTEX) {
        res.addInstruction('gl_FragColor = ', v.v_diffuseColor);
      } else {
        throw new Error('Undefined diffuse color source: ' + config.diffuseColorSource);
      }

      if (config.mode === MODE_3D_WITH_LIGHT) {

        if (config.specularColorSource === COLOR_SOURCE_TEXTURE) {
          res.addInstruction('vec3 specularColor = texture2D(', v.u_specularTexture, ', ', v.v_specularTexturePosition, ')');
        } else if (config.specularColorSource === COLOR_SOURCE_MATERIAL) {
          res.addInstruction('vec3 specularColor = ', v.u_materialSpecularColor);
        } else if (config.specularColorSource === COLOR_SOURCE_VERTEX) {
          res.addInstruction('vec3 specularColor = ', v.v_specularColor);
        } else {
          res.addInstruction('vec3 specularColor = vec3(0, 0, 0)');
        }

        if (config.brillianceSource === COLOR_SOURCE_TEXTURE) {
          res.addInstruction('float brilliance = texture2D(', v.u_brillianceTexture, ', ', v.v_brillianceTexturePosition, ')');
        } else if (config.brillianceSource === COLOR_SOURCE_MATERIAL) {
          res.addInstruction('float brilliance = ', v.u_materialBrilliance);
        } else if (config.brillianceSource === COLOR_SOURCE_VERTEX) {
          res.addInstruction('float brilliance = ', v.v_brilliance);
        } else {
          res.addInstruction('float brilliance = 1.0');
        }

        if (config.radianceSource === COLOR_SOURCE_TEXTURE) {
          res.addInstruction('vec3 radiance = texture2D(', v.u_radianceTexture, ', ', v.v_radianceTexturePosition, ')');
        } else if (config.radianceSource === COLOR_SOURCE_MATERIAL) {
          res.addInstruction('vec3 radiance = ', v.u_materialRadiance);
        } else if (config.radianceSource === COLOR_SOURCE_VERTEX) {
          res.addInstruction('vec3 radiance = ', v.v_radiance);
        } else {
          res.addInstruction('vec3 radiance = vec3(0, 0, 0)');
        }

        let directLightsCount = scene.getDirectLights().length > 0 ? scene.getDirectLights().length : 1;
        let pointLightsCount = scene.getPointLights().length > 0 ? scene.getPointLights().length : 1;
        let spotLightsCount = scene.getSpotLights().length > 0 ? scene.getSpotLights().length : 1;
        res.addDefinition('#define DIRECT_LIGHTS_COUNT ', directLightsCount);
        res.addDefinition('#define POINT_LIGHTS_COUNT ', pointLightsCount);
        res.addDefinition('#define SPOT_LIGHTS_COUNT ', spotLightsCount);
        res.addStruct(ComplexTypes.DirectLight);
        res.addStruct(ComplexTypes.PointLight);
        res.addStruct(ComplexTypes.Spotlight);

        res.addIncludeSubShaderUrl('./js/shaders/light.fs');
        res.addDeclaration(v.u_directLights, directLightsCount);
        res.addDeclaration(v.u_pointLights, pointLightsCount);
        res.addDeclaration(v.u_spotLights, spotLightsCount);
        res.addInstruction(
          'gl_FragColor.rgb = dirLight(', v.v_normal,
          ', ', v.u_directLights,
          ', ', v.u_pointLights,
          ', ', v.u_spotLights,
          ', ', v.u_ambientLight,
          ', ', v.u_lightSensitivityCfnt,
          ', ', v.v_surfacePosition,
          ', ', v.u_cameraPosition,
          ', gl_FragColor.rgb',
          ', specularColor',
          ', brilliance',
          ', radiance',
          ')');
      }
      shaderUniforms = res.getVars().filter(v => v.kind == ShaderVarKind.uniform);
      shaderUniformsArrays = res.getArrVars().filter(varData => varData[0].kind == ShaderVarKind.uniform);
      return res.build();
    };

    this.init = function (programWrapper) {
      var uniformAccessor = new UniformAccessor(driver.getGl(), programWrapper.program);
      shaderUniforms
        .forEach(u => uniformAccessor.initUniform(u));
      shaderUniformsArrays.forEach(uData => {for (let i = 0; i < uData[1]; i++) uniformAccessor.initUniform(uData[0],i)});

      programWrapper.fillFragmUniforms = function (figure, viewport) {
        shaderUniforms
          .forEach(u => u.set(uniformAccessor, figure, viewport));
        shaderUniformsArrays
          .forEach( uData =>  uData[0].set(uniformAccessor, figure, viewport));
      };

    };

  };

}

