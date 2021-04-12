

vec3 dirLight(
  vec3 normal, DirectLight[DIRECT_LIGHTS_COUNT] dirLights, PointLight[POINT_LIGHTS_COUNT] pointLights,
  vec3 ambientLight, vec3 lightSensitivityCfnt, vec3 surfacePosition, vec3 cameraPosition, vec3 diffuseColor,
  vec3 specularColor, float brilliance, vec3 radiance
) {
  normal = normalize(normal);
  vec3 luminousIntensityTotal = vec3(0, 0, 0);
  for (int i = 0; i < DIRECT_LIGHTS_COUNT; i++) {
    float light = dot(normal, dirLights[i].directionRev);
    luminousIntensityTotal += dirLights[i].luminousIntensity * light;
  }
  vec3 specularIntensityTotal = vec3(0, 0, 0);
  vec3 toCamera = cameraPosition - surfacePosition;
  float toCameraLength = length(toCamera);
  for (int i = 0; i < POINT_LIGHTS_COUNT; i++) {
    vec3 toLight = pointLights[i].position - surfacePosition;
    float toLightLengthRel = length(toLight) / pointLights[i].size;
    float attentuation = 1.0 + 0.02 * toLightLengthRel  + 0.003 * toLightLengthRel * toLightLengthRel;
    float diffuseLight = dot(normal, normalize(toLight)) / attentuation;
    luminousIntensityTotal += pointLights[i].luminousIntensity * diffuseLight;
    float specularLight = dot(normalize(toLight + toCamera), normal) / attentuation;
    specularLight = pow(specularLight, brilliance);
    specularIntensityTotal += pointLights[i].luminousIntensity * specularLight;
  }
  luminousIntensityTotal += ambientLight;
  luminousIntensityTotal *= lightSensitivityCfnt * diffuseColor;
  specularIntensityTotal *= lightSensitivityCfnt * specularColor;
  return  luminousIntensityTotal + specularIntensityTotal + radiance;
}

