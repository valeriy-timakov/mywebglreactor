
"use strict";

import {Vx3Utils} from './math_utils.js';
import {log} from './debug_utils.js';

const KeyData = {
  "Backspace": ["Backspace", 8],
  "Tab": ["Tab", 9],
  "Enter": ["Enter", 13],
  "NumpadEnter": ["Enter", 13],
  "ShiftLeft": ["Shift", 16],
  "ShiftRight": ["Shift", 16],
  "ControlRight": ["Control", 17],
  "ControlLeft": ["Control", 17],
  "AltRight": ["Alt", 18],
  "AltLeft": ["Alt", 18],
  "CapsLock": ["CapsLock", 20],
  "Escape": ["Escape", 27],
  "Space": [" ", 32],
  "PageUp": ["PageUp", 33],
  "PageDown": ["PageDown", 34],
  "End": ["End", 35],
  "Home": ["Home", 36],
  "ArrowLeft": ["ArrowLeft", 37],
  "ArrowUp": ["ArrowUp", 38],
  "ArrowRight": ["ArrowRight", 39],
  "ArrowDown": ["ArrowDown", 40],
  "Insert": ["Insert", 45],
  "Delete": ["Delete", 46],
  "Digit0": ["0", 48],
  "Digit1": ["1", 49],
  "Digit2": ["2", 50],
  "Digit3": ["3", 51],
  "Digit4": ["4", 52],
  "Digit5": ["5", 53],
  "Digit6": ["6", 54],
  "Digit7": ["7", 55],
  "Digit8": ["8", 56],
  "Digit9": ["9", 57],
  "KeyA": ["a", 65],
  "KeyB": ["b", 66],
  "KeyC": ["c", 67],
  "KeyD": ["d", 68],
  "KeyE": ["e", 69],
  "KeyF": ["f", 70],
  "KeyG": ["g", 71],
  "KeyH": ["h", 72],
  "KeyI": ["i", 73],
  "KeyJ": ["j", 74],
  "KeyK": ["k", 75],
  "KeyL": ["l", 76],
  "KeyM": ["m", 77],
  "KeyN": ["n", 78],
  "KeyO": ["o", 79],
  "KeyP": ["p", 80],
  "KeyQ": ["q", 81],
  "KeyR": ["r", 82],
  "KeyS": ["s", 83],
  "KeyT": ["t", 84],
  "KeyU": ["u", 85],
  "KeyV": ["v", 86],
  "KeyW": ["w", 87],
  "KeyX": ["x", 88],
  "KeyY": ["y", 89],
  "KeyZ": ["z", 90],
  "MetaLeft": ["Meta", 91],
  "ContextMenu": ["ContextMenu", 93],
  "Numpad0": ["0", 96],
  "Numpad1": ["1", 97],
  "Numpad2": ["2", 98],
  "Numpad3": ["3", 99],
  "Numpad4": ["4", 100],
  "Numpad5": ["5", 101],
  "Numpad6": ["6", 102],
  "Numpad7": ["7", 103],
  "Numpad8": ["8", 104],
  "Numpad9": ["9", 105],
  "NumpadMultiply": ["*", 106],
  "NumpadAdd": ["+", 107],
  "NumpadSubtract": ["-", 109],
  "NumpadDecimal": [".", 110],
  "NumpadDivide": ["/", 111],
  "F1": ["F1", 112],
  "F2": ["F2", 113],
  "F3": ["F3", 114],
  "F4": ["F4", 115],
  "F5": ["F5", 116],
  "F6": ["F6", 117],
  "F7": ["F7", 118],
  "F8": ["F8", 119],
  "F9": ["F9", 120],
  "F10": ["F10", 121],
  "F11": ["F11", 122],
  "F12": ["F12", 123],
  "NumLock": ["NumLock", 144],
  "Semicolon": [";", 186],
  "Equal": ["=", 187],
  "Comma": [",", 188],
  "Minus": ["-", 189],
  "Period": [".", 190],
  "Slash": ["/", 191],
  "Backquote": ["`", 192],
  "BracketLeft": ["[", 219],
  "Backslash": ["\\", 220],
  "BracketRight": ["]", 221],
  "Quote": ["'", 222],
  "IntlBackslash": ["\\", 226]
};

const keyCodesData = {
  175: ["AudioVolumeUp", ""]
};

var
  state = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
    v: 0
  },
  listeners = [],
  updateFinishedListener,
  down = false,
  incrementKeys = {},
  decrementKeys = {},
  resetKeys = {},
  incrementers = {},
  keysDown = new Set(),
  pressIncrementKeys = {},
  pressIncrementValues = {};

function change() {
  for (let i in listeners) {
    let listener = listeners[i];
    if (typeof listener == 'function') {
      listener(getState());
    }
  }
  for (let name in kineticUnits) {
    kineticUnits[name].change();
  }
  if (typeof updateFinishedListener == 'function') {
    updateFinishedListener(getState());
  }
}

document.body.onmousedown = function () {
  down = true;
};

document.body.onmouseup = function () {
  down = false;
};

document.body.onmousemove = function(e)  {
  let changed = false;
  if (down) {
    state.x += e.movementX;
    state.y += e.movementY;
    changed = true;
  }
  for (let name in kineticUnits) {
    kineticUnits[name].mouseMove(e.movementX, -e.movementY);
    changed = true;
  }
  if (changed) {
    change();
  }
};

window.setInterval(function (){

  var changed = false;
  Array.from(keysDown)
    .map(key => [key, pressIncrementKeys[key]])
    .forEach(([key, names])=> {
      if (names != null) {
        names.forEach(name => {
          let incrementer = pressIncrementValues[name];
          incrementer.value += incrementer.steps[key];
          changed = true;
        });
      }
    });
  for (let name in kineticUnits) {
    if (kineticUnits[name].idle()) {
      changed = true;
    }
  }
  if (changed) {
    change();
  }
}, 10);

document.body.onwheel = function(e) {
  state.w += e.deltaX;
  state.v += e.deltaZ;
  state.z += e.deltaY;
  change();
};

document.body.onkeydown = function (e) {
  keysDown.add(e.code);
  for (let name in kineticUnits) {
    kineticUnits[name].keyDown(e.code);
  }
  change();
};

document.body.onkeyup = function (e) {
  let inrementedNames = incrementKeys[e.code]
  if (inrementedNames != null) {
    inrementedNames.forEach(name => {
      incrementers[name]++;
    })
  }
  let decrementedNames = decrementKeys[e.code]
  if (decrementedNames != null) {
    decrementedNames.forEach(name => {
      incrementers[name]--;
    })
  }
  let resetNames = resetKeys[e.code]
  if (resetNames != null) {
    resetNames.forEach(name => {
      incrementers[name] = 0;
    })
  }
  keysDown.delete(e.code);
  for (let name in kineticUnits) {
    kineticUnits[name].keyUp(e.code);
  }
  change();
};

function addListener(listener) {
  listeners.push(listener);
}

function setUpdateFinishedListener(listener) {
  updateFinishedListener = listener;
}

function getState() {
  return {
    getX: () => state.x,
    getY: () => state.y,
    getZ: () => state.z,
    getV: () => state.v,
    getW: () => state.w,
    getIncrementerValue: (name) => incrementers[name],
    getKeysDown: () => Array.from(keysDown),
    isKeyDown: (key) => keysDown.has(key),
    getPressIncrementerValue: (name) => pressIncrementValues[name].value,
    getKineticUnitState: (name) => kineticUnits[name] != null ? kineticUnits[name].getState() : null
  };
}


function addKeyIncrementer(name, incKey, decKey, resetKey) {
  addToKey(key, incKey, incrementKeys);
  addToKey(key, decKey, decrementKeys);
  addToKey(key, resetKey, resetKeys);
  if (incrementers[name] == null) {
    incrementers[name] = 0;
  }
}

function addToKey(key, name, arr) {
  if (arr[key] == null) {
    arr[key] = [];
  }
  arr[key].push(name);
}

function addKeyPressIncrementer(key, name, step, createStepUpdater) {
  if (pressIncrementKeys[key] == null) {
    pressIncrementKeys[key] = [];
  }
  pressIncrementKeys[key].push(name);
  if (pressIncrementValues[name] == null) {
    pressIncrementValues[name] = {
      value: 0,
      steps: {}
    };
  }
  pressIncrementValues[name].step[key] = step;
  if (createStepUpdater) {
    return (newStepValue) => {

    };
  }
}

function resetKeyPressIncrementer(name) {
  pressIncrementValues[name] = 0;
}

var kineticUnits = {};

function addKineticUnit(name, settings, listener) {

  function KineticUnit() {
    var position = settings.initialPosition,
      direction = Vx3Utils.normalize(settings.initialDirection),
      up = Vx3Utils.normalize(settings.initialUp),
      right = null,
      speed = settings.initialSpeed,
      changed = false,
      operationsEnabled = {
        zIncrement: false,
        zDecrement: false,
        yIncrement: false,
        yDecrement: false,
        xIncrement: false,
        xDecrement: false,
        speedIncrement: false,
        speedDecrement: false,
        directionXIncrement: false,
        directionXDecrement: false,
        directionYIncrement: false,
        directionYDecrement: false,
        upRightIncrement: false,
        upRightDecrement: false
      },
      keyOperationsMap = {};
    ;

    this.getState = () => { return {
      position: position,
      direction: direction,
      up: up,
      speed : speed
    } };

    var self = this;
    this.change = () => {
      if (changed && typeof listener == 'function') {
        log('v_right', right);
        listener(self.getState());
      }
    };

    keyOperationsMap[settings.forwardKey] = 'zIncrement';
    keyOperationsMap[settings.backwardKey] = 'zDecrement';
    keyOperationsMap[settings.upKey] = 'yIncrement';
    keyOperationsMap[settings.downKey] = 'yDecrement';
    keyOperationsMap[settings.rightKey] = 'xIncrement';
    keyOperationsMap[settings.leftKey] = 'xDecrement';
    keyOperationsMap[settings.fasterKey] = 'speedIncrement';
    keyOperationsMap[settings.slowerKey] = 'speedDecrement';
    keyOperationsMap[settings.directionRightKey] = 'directionXIncrement';
    keyOperationsMap[settings.directionLeftKey] = 'directionXDecrement';
    keyOperationsMap[settings.directionUpKey] = 'directionYIncrement';
    keyOperationsMap[settings.directionDownKey] = 'directionYDecrement';
    keyOperationsMap[settings.rightInclineKey] = 'upRightIncrement';
    keyOperationsMap[settings.leftInclineKey] = 'upRightDecrement';

    this.mouseMove = function(dx, dy) {
      if (dx != 0) {
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(up, dx * settings.changeDirectionByMouseSpeed)) );
        right = null;
        changed = true;
      }
      if (dy != 0) {
        checkRight();
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(right, dy * settings.changeDirectionByMouseSpeed)));
        up = Vx3Utils.normalize( Vx3Utils.crossProduct(direction, right) );
        changed = true;
      }
    };
    this.keyDown = operationSwitchByKey(true);
    this.keyUp = operationSwitchByKey(false);
    this.idle = () => {
      let changed = false;
      if (operationsEnabled.zIncrement) {
        position = Vx3Utils.add(position, Vx3Utils.multiply(speed, direction));
        changed = true;
      }
      if (operationsEnabled.zDecrement) {
        position = Vx3Utils.add(position, Vx3Utils.multiply(-speed, direction));
        changed = true;
      }
      if (operationsEnabled.yIncrement) {
        position = Vx3Utils.add(position, Vx3Utils.multiply(speed, up));
        changed = true;
      }
      if (operationsEnabled.yDecrement) {
        position = Vx3Utils.add(position, Vx3Utils.multiply(-speed, up));
        changed = true;
      }
      if (operationsEnabled.xIncrement) {
        checkRight();
        position = Vx3Utils.add(position, Vx3Utils.multiply(speed, right));
        changed = true;
      }
      if (operationsEnabled.xDecrement) {
        checkRight();
        position = Vx3Utils.add(position, Vx3Utils.multiply(-speed, right));
        changed = true;
      }
      if (operationsEnabled.speedIncrement) {
        speed += settings.acceleration;
      }
      if (operationsEnabled.speedDecrement) {
        speed -= settings.acceleration;
        if (speed < 0) {
          speed == 0;
        }
        changed = true;
      }
      if (operationsEnabled.directionXIncrement) {
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(up, settings.changeDirectionSpeed)) );
        right = null;
        changed = true;
      }
      if (operationsEnabled.directionXDecrement) {
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(up, -settings.changeDirectionSpeed)) );
        right = null;
        changed = true;
      }
      if (operationsEnabled.directionYIncrement) {
        checkRight();
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(right, settings.changeDirectionSpeed)) );
        up = Vx3Utils.normalize( Vx3Utils.crossProduct(direction, right) );
        changed = true;
      }
      if (operationsEnabled.directionYDecrement) {
        checkRight();
        direction = Vx3Utils.normalize( Vx3Utils.mxProduct(direction, Vx3Utils.axisRotation(right, -settings.changeDirectionSpeed)) );
        up = Vx3Utils.normalize( Vx3Utils.crossProduct(direction, right) );
        changed = true;
      }
      if (operationsEnabled.upRightIncrement) {
        up = Vx3Utils.normalize( Vx3Utils.mxProduct(up, Vx3Utils.axisRotation(direction, settings.changeInclineSpeed)) );
        right = null;
        changed = true;
      }
      if (operationsEnabled.upRightDecrement) {
        up = Vx3Utils.normalize( Vx3Utils.mxProduct(up, Vx3Utils.axisRotation(direction, -settings.changeInclineSpeed)) );
        right = null;
        changed = true;
      }
      return changed;
    };

    function checkRight() {
      if (right == null) {
        right = Vx3Utils.normalize( Vx3Utils.crossProduct(up, direction) );
      }
    }

    function operationSwitchByKey(switchOn) {
      return key => {
        let operationName = keyOperationsMap[key]
        if (operationName != null) {
          operationsEnabled[operationName] = switchOn;
        }
      }
    }

  }

  kineticUnits[name] = new KineticUnit();


}

const Controles = {
  addListener: addListener,
  setUpdateFinishedListener: setUpdateFinishedListener,
  getState: getState,
  addKeyIncrementer: addKeyIncrementer,
  addKeyPressIncrementer: addKeyPressIncrementer,
  resetKeyPressIncrementer: resetKeyPressIncrementer,
  addKineticUnit: addKineticUnit
};

export {Controles}
