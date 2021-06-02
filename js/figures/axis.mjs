
"use strict";

import {createCone, createCylinder} from './figures_creator.mjs'
import {Transform3dBuilder} from '../math_utils.mjs'
import {deepCopy, Identifiable, Nameable, TransformCotained3D} from "../utils.mjs";

const CommonDefaults = {
    specularColor: [0.8, 0.8, 0.8],
    diffuseColor: [0.6, 0.6, 0.6, 1],
    radiance: [0.2, 0.2, 0.2],
    brilliance: 9
  },
  LineDefaults = {
    width: 0.1,
    length: 1,
    accuracy: 40
  },
  ArrowDefaults = {
    width: 0.2,
    length: 0.3,
    accuracy: 40
  },
  DefaultPosition = [0, 0, 0],
  DefaultDirection = [1, 0, 0],
  FiguresCommonProperties = {
    primitiveType: 'TRIANGLE_STRIP',
    vertexShaderName: 'UNIVERSAL',
    shadersParams: 'MODE=3D_WITH_LIGHT,DIFFUSE_COLORE_SOURCE=MATERIAL,SPECULAR_COLORE_SOURCE=MATERIAL,' +
      'BRILLIANCE_SOURCE=MATERIAL,RADIANCE_SOURCE=MATERIAL',
    fragmentShaderName: 'UNIVERSAL',
    buffersData: {
      useType: 'STATIC_DRAW',
      indexes: {
        type: 'u_short'
      },
      positions: {
        type: 'float'
      },
      normals: {
        type: 'float'
      }
    },
    depthTestEnabled: true,
    cullFace: null
  };

var version = 0,
  transforms = {},
  creators = {
    line: createCylinder,
    arrow: createCone
  };

export function Axis(id, name, position, direction, settings) {

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  if (position == null) position = DefaultPosition;
  if (direction == null) direction = DefaultDirection;

  settings.line = Object.assign({}, CommonDefaults, LineDefaults, settings.line);
  settings.arrow = Object.assign({}, CommonDefaults, ArrowDefaults, settings.arrow);

  var lineFigure = createFigure(settings, 'line'),
    arrowFigure = createFigure(settings, 'arrow');

  update(position, direction);

  var p = position;

  function update (position, direction) {
    let axisTransform = new Transform3dBuilder()
      .orientByDirectionFromZ(direction)
      .move(position);
    transforms.line = new Transform3dBuilder(axisTransform);
    transforms.arrow = new Transform3dBuilder().move(0, 0, settings.line.length )
      .multiply(axisTransform);
    version++;
  }

  this.update = update;

  this.getFigures = () => [lineFigure, arrowFigure];

}

function createFigure(settings, name) {
  let vertices = creators[name]( settings[name].width, settings[name].length, settings[name].accuracy ),
    figure = Object.assign({}, deepCopy(FiguresCommonProperties), new FiguresGettersProvider(settings[name]));
  copyVerts(figure, vertices);
  Object.assign(figure, new TransformCotained3D({
    getWorldTransform: () => transforms[name],
    getVersion: () => version
  }));
  return figure;
}

function copyVerts(figure, vertData) {
  figure.buffersData.indexes.data = vertData.indexes;
  figure.buffersData.positions.data = vertData.vertices;
  figure.buffersData.normals.data = vertData.normals;
}

function FiguresGettersProvider(data) {
  this.getSpecularColor = () => data.specularColor;
  this.getDiffuseColor = () => data.diffuseColor;
  this.getRadiance = () =>  data.radiance;
  this.getBrilliance = () => data.brilliance;

}
