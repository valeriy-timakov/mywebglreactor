
"use strict";

import { createCone, createCylinder } from './figures_creator.mjs'
import {Transform3dBuilder, Mx4Util} from '../math_utils.mjs'
import {Nameable, Identifiable} from "../utils.mjs";

const DefaultLineWidth = 0.02,
  DefaultLineLength = 2,
  DefaultArrowRadius = 0.1,
  DefaultArrowLength = 0.4,
  DefaultAccuracy = 20,
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

function copyVerts(figure, vertData) {
  figure.buffersData.indexes.data = vertData.indexes;
  figure.buffersData.positions.data = vertData.vertices;
  figure.buffersData.normals.data = vertData.normals;
}

function FiguresGettersProvider(data) {
  this.getWorldTransform = () => data.transformations;
  this.getSpecularColor = () => data.specularColor;
  this.getDiffuseColor = () => data.diffuseColor;
  this.getRadiance = () =>  data.radiance;
  this.getBrilliance = () => data.brilliance;
}

export function Axis(id, name, position, direction, settings) {

  if (position == null) position = DefaultPosition;
  if (direction == null) direction = DefaultDirection;

  Object.assign(this, new Nameable(name));
  Object.assign(this, new Identifiable(id));

  settings.lineWidth = settings.lineWidth != null ?settings.lineWidth : DefaultLineWidth;
  settings.lineLength = settings.lineLength != null ?settings.lineLength : DefaultLineLength;
  settings.lineAccuracy = settings.lineAccuracy != null ?settings.lineAccuracy : DefaultAccuracy;
  settings.arrowRadius = settings.arrowRadius != null ?settings.arrowRadius : DefaultArrowRadius;
  settings.arrowLength = settings.arrowLength != null ?settings.arrowLength : DefaultArrowLength;
  settings.arrowAccuracy = settings.arrowAccuracy != null ?settings.arrowAccuracy : DefaultAccuracy;

  var lineData = createCylinder( settings.lineWidth, settings.lineLength, settings.lineAccuracy ),
    arrowData = createCone( settings.arrowRadius, settings.arrowLength, settings.arrowAccuracy ),
    axisTransform, lineTransrorm, arrowTransform,
    lineFigure = Object.assign({}, FiguresCommonProperties, FiguresGettersProvider(lineData)),
    arrowFigure = Object.assign({}, FiguresCommonProperties, FiguresGettersProvider(arrowData)),
    figures = [lineFigure, arrowFigure];
  copyVerts(lineFigure, lineData);
  copyVerts(arrowFigure, arrowData);

  update(position, direction);

  function update (position, direction) {
    axisTransform = new Transform3dBuilder()
      .orientByDirection(direction)
      .move(position);
    lineTransrorm = new Transform3dBuilder(axisTransform);
    arrowTransform = new Transform3dBuilder().move(0, 0,settings.lineLength )
      .multiply(axisTransform);
  }

  this.update = update;

  this.getFigures = () => figures;

}

