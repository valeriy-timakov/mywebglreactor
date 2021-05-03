
import {Vx3Utils} from './math_utils.mjs'

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

export function DirectionReversedHolder(direction) {
  var reversedDirection;
  if (direction == null) direction = [0, 0, -1];
  setRevDirection(direction);

  function setRevDirection(value) {
    reversedDirection = Vx3Utils.normalize(Vx3Utils.multiply(-1, value));
  }

  this.setDirection = (value) => {
    notNull(value, 'reversedDirection');
    setRevDirection(value);
  };
  this.getRevDirection = () => reversedDirection;
}

export function SizeHolder(size) {
  if (size == null) size = 1;
  setSize(size);

  function setSize(value) {
    notNull(value, 'size');
    if (value <= 0) {
      throw Error('Cannot set size to not positive value!');
    }
    size = value;
  }

  this.setSize = (value) => {
    setSize(value)
  };
  this.getSize = () => size;
}

export function PositionHolder(position) {

  if (position == null) position = [0, 0, 0];

  this.setPosition = (value) => {
    notNull(value, 'position');
    position = value;
  };
  this.getPosition = () => position;

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
