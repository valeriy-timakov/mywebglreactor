
import {Vx3Utils} from './math_utils.js'

export function notNull(value, name) {
  if (value == null) {
    throw Error('Cannot set ' + name + ' to null!');
  }
}

export function Nameable(name) {
  this.getName = () => name;
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
