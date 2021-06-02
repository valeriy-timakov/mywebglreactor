import {Transform2DBuilder, Transform3dBuilder, Vx3Utils} from './math_utils.mjs'

export function notNull(value, name) {
  if (value == null) {
    throw Error('Cannot set ' + name + ' to null!');
  }
}

export function Nameable(name) {
  this.getName = () => name;
  Object.defineProperty(this, 'name', {
    value: name,
    writable: false
  });
}

export function Identifiable(id) {
  this.getId = () => id;
}

export function DirectionReversedHolder(direction, changeDelegate, self) {
  var reversedDirection;
  if (direction == null) direction = [0, 0, -1];
  setRevDirection(direction);

  function setRevDirection(value) {
    notNull(value, 'reversedDirection');
    reversedDirection = Vx3Utils.normalize(Vx3Utils.multiply(-1, value));
    if (changeDelegate != null) {
      changeDelegate.change(self, 'reversedDirection', reversedDirection);
    }
  }

  this.setDirection = setRevDirection;
  this.getRevDirection = () => reversedDirection;
}

export function SizeHolder(size, changeDelegate, self) {
  if (size == null) size = 1;
  setSize(size);

  function setSize(value) {
    notNull(value, 'size');
    if (value <= 0) {
      throw Error('Cannot set size to not positive value!');
    }
    size = value;
    if (changeDelegate != null) {
      changeDelegate.change(self, 'size', size);
    }
  }

  this.setSize = setSize;
  this.getSize = () => size;

}

export function Size2DHolder(width, height, changeDelegate, self) {
  if (width == null) width = 1;
  if (height == null) height = 1;
  setWidth(width);
  setHeigth(height);

  function setWidth(value) {
    validate(value, 'width');
    width = value;
    notify(value, 'width');
  }

  function setHeigth(value) {
    validate(value, 'height');
    height = value;
    notify(value, 'height');
  }

  function validate(value, name) {
    notNull(value, name);
    if (value <= 0) {
      throw Error('Cannot set ' + name + ' to not positive value!');
    }
  }

  function notify(value, name) {
    if (changeDelegate != null) {
      changeDelegate.change(self, 'size', size);
    }
  }

  this.setWidth = setWidth;
  this.getWidth = () => width;

  this.setHeight = setHeigth;
  this.getHeight = () => height;

}

export function PositionHolder(position, changeDelegate, self) {

  if (position == null) position = [0, 0, 0];

  this.setPosition = (value) => {
    notNull(value, 'position');
    position = value;
    if (changeDelegate != null) {
      changeDelegate.change(self, 'position', position);
    }
  };
  this.getPosition = () => position;

}

export function Position2D(x, y) {

  if (x == null) x = 0;
  if (y == null) y = 0;

  this.setX = (value) => { x = value };
  this.getX = () => x;

  this.setY = (value) => { y = value };
  this.getY = () => y;

}

export function Position(x, y, z) {

  Object.assign(this, new Position2D(x, y));

  if (z == null) z = 0;

  this.setZ = (value) => { z = value };
  this.getZ = () => z;

}

const TRANSFORM_MODE_2D = {
    builder: Transform2DBuilder,
    is2d: true
  },
  TRANSFORM_MODE_3D = {
    builder: Transform3dBuilder,
    is2d: false
  };


export const TransformCotained2D = createTransformCotained(TRANSFORM_MODE_2D);
export const TransformCotained3D = createTransformCotained(TRANSFORM_MODE_3D, function (self, transformationWrapper, state) {

  var worldTransformInvTransp = null;

  self.getWorldTransformInvTransp = function () {
    if (worldTransformInvTransp == null ||state.getLastWorldTransformVersion() !== transformationWrapper.getVersion()) {
      worldTransformInvTransp = new TRANSFORM_MODE_3D.builder(self.getWorldTransform()).inverse().transponse().build();
    }
    return worldTransformInvTransp;
  };
});


function createTransformCotained(mode, extender) {
  const _mode = mode,
    _extender = extender;
  return function (transformationWrapper) {

    var worldTransform = null,
      lastWorldTransformVersion = null,
      fullProjectionDataMap = {};

    const self = this;

    this.getWorldTransform = function () {
      if (worldTransform == null || lastWorldTransformVersion !== transformationWrapper.getVersion()) {
        worldTransform = transformationWrapper.getWorldTransform();
        lastWorldTransformVersion = transformationWrapper.getVersion();
        if (typeof worldTransform.build == 'function') {
          worldTransform = worldTransform.build();
        }
      }
      return worldTransform;
    };

    this.getFullProjectTransform = function (viewport, pickPoint) {
      let fullProjectionData = fullProjectionDataMap[viewport.getName()];
      if (fullProjectionData == null) {
        fullProjectionData = {};
        fullProjectionDataMap[viewport.getName()] = fullProjectionData;
      }
      if (pickPoint != null) {
        return new _mode.builder(self.getWorldTransform())
          .multiply(viewport.getVPBuilder(_mode.is2d, pickPoint).build()).build();
      }
      if (
        fullProjectionData.transform == null ||
        fullProjectionData.transformVersion !== transformationWrapper.getVersion() ||
        fullProjectionData.viewportVersion !== viewport.getVersion()
      ) {
        fullProjectionData.transform = new _mode.builder(self.getWorldTransform())
          .multiply(viewport.getVPBuilder(_mode.is2d).build()).build();
        fullProjectionData.viewportVersion = viewport.getVersion();
        fullProjectionData.transformVersion = transformationWrapper.getVersion();
      }
      return fullProjectionData.transform;
    };

    if (typeof _extender == 'function') {
      _extender(this, transformationWrapper, {
        getLastWorldTransformVersion: () =>lastWorldTransformVersion
      });
    }
  }
}

export function ChangeNotifier(delegate, silentListenerChash) {

  var changeListeners = new Set();

  this.addChangeListener = (listener) => {
    changeListeners.add(listener);
  };

  this.removeChangeListener = (listener) => {
    changeListeners.delete(listener);
  };

  delegate.change = () => {
    if (silentListenerChash === true) {
      changeListeners.forEach(listener => {
        try {
          listener(arguments);
        } catch (e) {
          console.error("Change listener chash! " + e);
        };
      });
    } else {
      changeListeners.forEach(listener => {
        listener(arguments);
      });
    }
  };
}

//https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
export function arraysEqual(a1, a2) {
  if (a1 === a2) return true;
  if (a1 == null || a2 == null) return false;
  if (a1.length !== a2.length) return false;
  for (var i = 0; i < a1.length; ++i) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function stringHashCode (s) {
  let hb = new HashBuilder();
  var hash = 0, i, chr;
  if (s == null || s.length === 0) return hash;
  for (let i = 0; i < s.length; i++) {
    hb.add(s.charCodeAt(i));
  }
  return hb.get();
}

export function numberArrayHashCode (arr) {
  let hb = new HashBuilder();
  if (arr == null || arr.length === 0) return 0;
  for (let i = 0; i < arr.length; i++) {
    hb.add(arr[i]);
  }
  return hb.get();
}

export function HashBuilder () {
  var hash = 0;
  this.add = hashCode => {
    hash  = ((hash << 5) - hash) + hashCode;
    hash |= 0;
  };
  this.get = () => hash;
}

//https://javascript.plainenglish.io/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
export function deepCopy(inObject) {
  let outObject, value, key;

  if (typeof inObject !== "object" || inObject === null) {
    return inObject;
  }

  outObject = Array.isArray(inObject) ? [] : {};
  for (key in inObject) {
    outObject[key] = deepCopy(inObject[key]);
  }

  return outObject
}
