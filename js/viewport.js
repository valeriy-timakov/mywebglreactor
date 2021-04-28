
import {Transform3dBuilder, Mx4Util, Vx3Utils} from './math_utils.js'
import {Nameable} from "./utils.js";

import {notNull, PositionHolder, DirectionReversedHolder} from './utils.js'

function Camera(position, direction, up) {

  Object.assign(this, new PositionHolder(position));
  Object.assign(this, new DirectionReversedHolder(direction));

  if (up == null) up = [0, 1, 0];
  setUp(up);

  function setUp(value) {
    up = Vx3Utils.normalize(value);
  }

  this.getUp = () => up;
  this.setUp = value => {
    notNull(value, 'camera up');
    setUp(value);
  };
}

function Projection(near, far, fieldOfViewVerticalRadians, aspect) {
  if (near == null) near = 0.5;
  if (far == null) far = 200;
  if (fieldOfViewVerticalRadians == null) fieldOfViewVerticalRadians = 1.1;
  if (aspect == null) aspect = 1024 / 768;

  this.getNear = () => near;
  this.setNear = (value) => {
    notNull(value, 'projection near');
    near = value;
  };

  this.getFar = () => far;
  this.setFar = (value) => {
    notNull(value, 'projection far');
    far = value;
  };

  this.getFieldOfViewVerticalRadians = () => fieldOfViewVerticalRadians;
  this.setFieldOfViewVerticalRadians = (value) => {
    notNull(value, 'projection fieldOfViewVerticalRadians');
    fieldOfViewVerticalRadians = value;
  };

  this.getAspect = () => aspect;
  this.setAspect = (value) => {
    notNull(value, 'projection aspect');
    aspect = value;
  };

}

function Viewport(name, camera, projection, rightHandledWorld) {

  Object.assign(this, new Nameable(name));

  if (camera == null) camera = new Camera();
  if (projection == null) projection = new Projection();
  if (rightHandledWorld == null) rightHandledWorld = true;

   this.getVPBuilder = function() {
    var result = new Transform3dBuilder();
    result.lookTo(camera.getPosition(), camera.getRevDirection(), camera.getUp());
    if (rightHandledWorld) {
      result.multiply(Mx4Util.IDENT_INVERSE_Z);
    }
    result.projectPersp(projection.getFieldOfViewVerticalRadians(), projection.getAspect(), projection.getNear(),
      projection.getFar());
    return result;
  };

  this.getCamera = () => camera;

  this.getProjection = () => projection;

  this.setRightHandledWorld = function(value) {
    rightHandledWorld = value;
  };
}

export { Camera, Projection, Viewport }
