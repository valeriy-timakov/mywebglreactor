
import {Vx3Utils, Mx4Util, Transform3dBuilder} from './math_utils.js'

export function Scene(name){

  function notNull(value, name) {
    if (value == null) {
      throw Error('Cannot set ' + name + ' to null!');
    }
  }

  function Camera(position, direction, up) {
    if (position == null) position = [0, 0, 0];
    if (up == null) up = [0, 1, 0];
    if (direction == null) direction = [0, 0, -1];
    setDirection(direction);

    function setDirection(newDirection) {
      direction = Vx3Utils.multiply(-1, newDirection);
    }

    this.getPosition = () => position;
    this.setPosition = newPosition => {
      notNull(newPosition, 'camera position');
      position = newPosition;
    };

    this.getUp = () => up;
    this.setUp = newUp => {
      notNull(newUp, 'camera up');
      up = newUp;
    };

    this.getDirection = () => direction;
    this.setDirection = newDirection => {
      notNull(newDirection, 'camera direction');
      setDirection(newDirection);
    };
  }

  function Projection(near, far, fieldOfViewVerticalRadians, aspect) {
    if (near == null) near = 0.5;
    if (far == null) far = 200;
    if (fieldOfViewVerticalRadians == null) fieldOfViewVerticalRadians = 1.1;
    if (aspect == null) aspect = 1024 / 768;

    Object.defineProperty(this, 'near', {
      get: function() {
        return near;
      },
      set: function(newNear) {
        notNull(newNear, 'projection near');
        near = newNear;
      }
    });
    Object.defineProperty(this, 'far', {
      get: function() {
        return far;
      },
      set: function(newFar) {
        notNull(newFar, 'projection far');
        far = newFar;
      }
    });
    Object.defineProperty(this, 'fieldOfViewVerticalRadians', {
      get: function() {
        return fieldOfViewVerticalRadians;
      },
      set: function(newFieldOfViewVerticalRadians) {
        notNull(newFieldOfViewVerticalRadians, 'projection fieldOfViewVerticalRadians');
        fieldOfViewVerticalRadians = newFieldOfViewVerticalRadians;
      }
    });
    Object.defineProperty(this, 'aspect', {
      get: function() {
        return aspect;
      },
      set: function(newAspect) {
        notNull(newAspect, 'projection aspect');
        aspect = newAspect;
      }
    });
  }

  this.DirectLight = function(direction, luminousIntensity) {
    var reversedDirection;
    if (direction == null) direction = [0, 0, -1];
    if (luminousIntensity == null) luminousIntensity = [1, 1, 1];
    setRevDirection(direction);

    function setRevDirection(value) {
      reversedDirection = Vx3Utils.normalize(Vx3Utils.multiply(-1, value));
    }

    this.setDirection = (value) => {
      notNull(value, 'direct light reversedDirection');
      setRevDirection(value);
    };
    this.getRevDirection = () => reversedDirection;

    this.setLuminousIntensity = (value) => {
      notNull(value, 'direct light luminousIntensity');
      luminousIntensity = value;
    };
    this.getLuminousIntensity = () => luminousIntensity;

  };

  this.PointLight = function(position, luminousIntensity, size) {
    if (position == null) position = [0, 0, 0];
    if (luminousIntensity == null) luminousIntensity = [1, 1, 1];
    if (size == null) size = 1;
    setSize(size);

    function setSize(value) {
      notNull(value, 'point light size');
      if (value <= 0) {
        throw Error('Cannot set ' + name + ' to not positive value!');
      }
      size = value;
    }

    this.setPosition = (value) => {
      notNull(value, 'point light position');
      position = value;
    };
    this.getPosition = () => position;

    this.setLuminousIntensity = (value) => {
      notNull(value, 'point light luminousIntensity');
      luminousIntensity = value;
    };
    this.getLuminousIntensity = () => luminousIntensity;

    this.setSize = (value) => {
      setSize(value)
    };
    this.getSize = () => size;

  };

  var directLights = [],
    pointLights = [],
    camera = new Camera(),
    projection = new Projection(),
    rightHandledWorld = true,
    clearColor = [1, 1, 1, 1],
    ambientLight = [0, 0, 0],
    lightSensitivityCfnt = [1, 1, 1];

  this.getName = () => name;

  this.getVPBuilder = function() {
    var result = new Transform3dBuilder();
    result.lookTo(camera.getPosition(), camera.getDirection(), camera.getUp());
    if (rightHandledWorld) {
      result.multiply(Mx4Util.IDENT_INVERSE_Z);
    }
    result.projectPersp(projection.fieldOfViewVerticalRadians, projection.aspect, projection.near, projection.far);
    return result;
  };

  this.getCamera = () => camera;

  this.setCamera = function(position, direction, up) {
    camera.setPosition(position);
    camera.setDirection(direction);
    camera.setUp(up);
  };

  this.updateCameraPosition = function(newValue) {
    camera.setPosition(newValue);
  };

  this.updateCameraDirection = function(newValue) {
    camera.setDirection(newValue);
  };

  this.updateCameraUp = function(newValue) {
    camera.setUp(newValue);
  };

  this.setProjection = function(fieldOfViewVerticalRadians, aspect, near, far) {
    projection.aspect = aspect;
    projection.fieldOfViewVerticalRadians = fieldOfViewVerticalRadians;
    projection.near = near;
    projection.far = far;
  };

  this.setRightHandledWorld = function(value) {
    rightHandledWorld = value;
  };

  this.getClearColor = () => clearColor;
  this.setClearColor = (value) => {clearColor = value};
  this.getDirectLights = () => directLights;
  this.addDirectLight = (newDirectLight) => { directLights.push(newDirectLight) };
  this.getPointLights = () => pointLights;
  this.addPointLight = (pointLight) => { pointLights.push(pointLight) };
  this.getAmbientLight = () => ambientLight;
  this.setAmbientLight = (value) => {ambientLight = value};
  this.getLightSensitivityCfnt = () => lightSensitivityCfnt;
  this.setLightSensitivityCfnt = (value) => {lightSensitivityCfnt = value};
}
