


float attentuation(float toLightLengthRel) {
  return 1.0 / ( 1.0 + 0.02 * toLightLengthRel  + 0.003 * toLightLengthRel * toLightLengthRel);
}

vec3 dirLight(
  vec3 normal, DirectLight[DIRECT_LIGHTS_COUNT] dirLights, PointLight[POINT_LIGHTS_COUNT] pointLights,
  Spotlight[SPOT_LIGHTS_COUNT] spotLights,vec3 ambientLight, vec3 lightSensitivityCfnt, vec3 surfacePosition,
  vec3 cameraPosition, vec3 diffuseColor, vec3 specularColor, float brilliance, vec3 radiance
) {
  normal = normalize(normal);
  vec3 luminousIntensityTotal = ambientLight;
  for (int i = 0; i < DIRECT_LIGHTS_COUNT; i++) {
    float light = dot(normal, dirLights[i].directionRev);
    luminousIntensityTotal += dirLights[i].luminousIntensity * light;
  }
  vec3 specularIntensityTotal = vec3(0, 0, 0);
  vec3 toCameraNorm = normalize(cameraPosition - surfacePosition);
  for (int i = 0; i < POINT_LIGHTS_COUNT; i++) {
    vec3 toLight = pointLights[i].position - surfacePosition;
    vec3 toLightNorm = normalize(toLight);
    float diffuseLight = dot(normal, toLightNorm);
    if (diffuseLight > 0.0) {
      float toLightLengthRel = length(toLight) / pointLights[i].size;
      float attentuation = attentuation(toLightLengthRel);
      diffuseLight = diffuseLight * attentuation;
      luminousIntensityTotal += pointLights[i].luminousIntensity * diffuseLight;

      float specularLight = dot(normalize(toLightNorm + toCameraNorm), normal);
      if (specularLight > 0.0) {
        specularLight = pow(specularLight, brilliance) * attentuation;
        specularIntensityTotal += pointLights[i].luminousIntensity * specularLight;
      }
    }
  }
  for (int i = 0; i < SPOT_LIGHTS_COUNT; i++) {
    vec3 toLight = spotLights[i].position - surfacePosition;
    vec3 toLightNorm = normalize(toLight);
    float lightToSpotDirCoincidence = dot(toLightNorm, spotLights[i].directionRev);
    float diffuseLight = 0.0;
    if (lightToSpotDirCoincidence > spotLights[i].farLimit) {
      diffuseLight = dot(normal, toLightNorm);
      if (diffuseLight > 0.0) {
        float obfuscation;
        if (spotLights[i].smothMethod == 0.0) {
          obfuscation = smoothstep(spotLights[i].farLimit, spotLights[i].nearLimit, lightToSpotDirCoincidence);
        } else {
          obfuscation = clamp((lightToSpotDirCoincidence - spotLights[i].farLimit) /
            (spotLights[i].nearLimit - spotLights[i].farLimit), 0.0, 1.0);
          obfuscation = pow(obfuscation, spotLights[i].smothMethod);
        }
        diffuseLight *= obfuscation;

        float toLightLengthRel = length(toLight) / spotLights[i].size;
        float attentuation = attentuation(toLightLengthRel);
        diffuseLight = diffuseLight * attentuation;
        luminousIntensityTotal += spotLights[i].luminousIntensity * diffuseLight;

        float specularLight = dot(normalize(toLightNorm + toCameraNorm), normal);
        if (specularLight > 0.0) {
          specularLight = pow(specularLight, brilliance) * attentuation;
          specularIntensityTotal += spotLights[i].luminousIntensity * specularLight;
        }
      }
    }
  }


  return lightSensitivityCfnt * ( luminousIntensityTotal * diffuseColor + specularIntensityTotal * specularColor + radiance);
}

