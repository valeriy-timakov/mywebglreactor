
import {notNull, DirectionReversedHolder, SizeHolder, PositionHolder, Nameable} from './utils.js'



function Light(luminousIntensity) {

  if (luminousIntensity == null) luminousIntensity = [1, 1, 1];
  var switchedOn = true;
  const BLACK_COLOR = [0, 0, 0];

  this.setLuminousIntensity = (value) => {
    notNull(value, 'direct light luminousIntensity');
    luminousIntensity = value;
  };

  this.getLuminousIntensity = () => switchedOn ? luminousIntensity : BLACK_COLOR;

  this.switchOn = () => {switchedOn = true;};

  this.switchOff = () => {switchedOn = false;};

}

function GraphicRepresentationHolder (graphicRepresentation, lightItem) {

  setGraphicRepresentationValue(graphicRepresentation);

  function setGraphicRepresentationValue(value) {
    graphicRepresentation = value;
    if (graphicRepresentation != null) {
      graphicRepresentation.lightItem = lightItem;
    }
  }

  this.getGraphicRepresentation = () => graphicRepresentation;

  this.setGraphicRepresentation = (value) => {
    graphicRepresentation = value;
  };
}


function DirectLight(direction, luminousIntensity) {
  Object.assign(this, new DirectionReversedHolder(direction));
  Object.assign(this, new Light(luminousIntensity));
}

function PointLight(position, luminousIntensity, size, graphicRepresentation) {
  var self = this;
  Object.assign(this, new Light(luminousIntensity));
  Object.assign(this, new SizeHolder(size));
  Object.assign(this, new PositionHolder(position));
  Object.assign(this, new GraphicRepresentationHolder(graphicRepresentation, self));

}

function Spotlight(position, luminousIntensity, size, direction, nearLimit, farLimit, smothMethod, graphicRepresentation) {
  var self = this;
  Object.assign(this, new PointLight(position, luminousIntensity, size));
  Object.assign(this, new DirectionReversedHolder(direction));
  Object.assign(this, new GraphicRepresentationHolder(graphicRepresentation, self));

  this.getNearLimit = () => nearLimit;
  this.setNearLimit = (value) => {
    notNull(value, 'spot light nearLimit');
    nearLimit = value;
  };

  this.getFarLimit = () => farLimit;
  this.setFarLimit = (value) => {
    notNull(value, 'spot light farLimit');
    farLimit = value;
  };

  this.getSmothMethod = () => smothMethod;
  this.setSmothMethod = (value) => {
    notNull(value, 'spot light smothMethod');
    smothMethod = value;
  };

}

function Scene(name){

  Object.assign(this, new Nameable(name));

  var directLights = [],
    pointLights = [],
    spotLights = [],
    clearColor = [1, 1, 1, 1],
    ambientLight = [0, 0, 0],
    lightSensitivityCfnt = [1, 1, 1],
    permanentGraphicalObjects = [];

  this.getClearColor = () => clearColor;
  this.setClearColor = (value) => {clearColor = value};
  this.getDirectLights = () => directLights;
  this.getPointLights = () => pointLights;
  this.addLight = (light) => {
    if (light instanceof DirectLight) {
      directLights.push(light);
    } else if (light instanceof PointLight) {
      pointLights.push(light);
    } else if (light instanceof Spotlight) {
      spotLights.push(light);
    } else {
      throw new Error('Unknown ligth type! ' + light);
    }

  };
  this.getSpotLights = () => spotLights;
  this.getAmbientLight = () => ambientLight;
  this.setAmbientLight = (value) => {ambientLight = value};
  this.getLightSensitivityCfnt = () => lightSensitivityCfnt;
  this.setLightSensitivityCfnt = (value) => { lightSensitivityCfnt = value };
  this.addPermanentGraphicObject = (value) => { permanentGraphicalObjects.push(value) };
  this.removePermanentGraphicObject = (value) => {
    let pos = permanentGraphicalObjects.indexOf(value);
    if (pos != -1) {
      permanentGraphicalObjects.splice(pos, 1);
    }
  };
  this.getPermanentGraphicsObjects = () => [...permanentGraphicalObjects];
}



export {
  DirectLight, PointLight, Spotlight, Scene
};
