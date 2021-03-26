
import {Vx3Utils, Mx4Util, Transform3dBuilder} from './math_utils.js'

export function Scene(){

  function notNull(value, name) {
    if (value == null) {
      throw Error('Cannot set ' + name + ' to null!');
    }
  }

  function Camera(location, direction, up) {
    if (location == null) location = [0, 0, 0];
    if (up == null) up = [0, 1, 0];
    if (direction == null) direction = [0, 0, -1];
    setDirection(direction);

    function setDirection(newDirection) {
      direction = Vx3Utils.multiply(-1, newDirection);
    }

    Object.defineProperty(this, 'location', {
      get: function() {
        return location;
      },
      set: function(newLocation) {
        notNull(newLocation, 'camera location');
        location = newLocation;
      }
    });
    Object.defineProperty(this, 'up', {
      get: function() {
        return up;
      },
      set: function(newUp) {
        notNull(newUp, 'camera up');
        up = newUp;
      }
    });
    Object.defineProperty(this, 'direction', {
      get: function() {
        return direction;
      },
      set: function(newDirection) {
        notNull(newDirection, 'camera direction');
        setDirection(newDirection);
      }
    });
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
  var reversedLightDirection = [0, 0, 1];
  var camera = new Camera();
  var projection = new Projection();
  var rightHandledWorld = true;

  this.getVPBuilder = function() {
    var result = new Transform3dBuilder();
    result.lookTo(camera.location, camera.direction, camera.up);
    if (rightHandledWorld) {
      result.multiply(Mx4Util.IDENT_INVERSE_Z);
    }
    result.projectPersp(projection.fieldOfViewVerticalRadians, projection.aspect, projection.near, projection.far);
    return result;
  };

  this.setCamera = function(location, direction, up) {
    camera.location = location;
    camera.direction = direction;
    camera.up = up;
  };

  this.updateCameraLocation = function(newValue) {
    camera.location = newValue;
  };

  this.updateCameraDirection = function(newValue) {
    camera.direction = newValue;
  };

  this.updateCameraUp = function(newValue) {
    camera.up = newValue;
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

  this.setDirectLight = function(lightDirection) {
    notNull(lightDirection, 'lightDirection');
    reversedLightDirection = Vx3Utils.normalize(Vx3Utils.multiply(-1, lightDirection));
  };

  this.getReversedLightDirection = function() {
    return reversedLightDirection;
  };


}
