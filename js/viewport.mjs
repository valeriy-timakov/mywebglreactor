
import {Transform3dBuilder, Mx4Util, Vx3Utils, Mx3Util, Transform2DBuilder} from './math_utils.mjs'
import {ChangeNotifier, Nameable} from "./utils.mjs";

import {notNull, PositionHolder, DirectionReversedHolder} from './utils.mjs'

function Camera(position, direction, up) {
  var changeDelegate = {};
  const self = this;

  Object.assign(this, new ChangeNotifier(changeDelegate));
  Object.assign(this, new PositionHolder(position, changeDelegate, self));
  Object.assign(this, new DirectionReversedHolder(direction, changeDelegate, self));

  if (up == null) up = [0, 1, 0];
  setUp(up);

  function setUp(value) {
    up = Vx3Utils.normalize(value);
    changeDelegate.change(self, 'up', up);
  }

  this.getUp = () => up;
  this.setUp = value => {
    notNull(value, 'camera up');
    setUp(value);
  };
}

function Projection(near, far, fieldOfViewVerticalRadians) {

  var changeDelegate = {};
  const self = this;

  Object.assign(this, new ChangeNotifier(changeDelegate));

  if (near == null) near = 0.5;
  if (far == null) far = 200;
  if (fieldOfViewVerticalRadians == null) fieldOfViewVerticalRadians = 1.1;

  this.getNear = () => near;
  this.setNear = (value) => {
    notNull(value, 'projection near');
    near = value;
    changeDelegate.change(self, 'near', near);
  };

  this.getFar = () => far;
  this.setFar = (value) => {
    notNull(value, 'projection far');
    far = value;
    changeDelegate.change(self, 'far', far);
  };

  this.getFieldOfViewVerticalRadians = () => fieldOfViewVerticalRadians;
  this.setFieldOfViewVerticalRadians = (value) => {
    notNull(value, 'projection fieldOfViewVerticalRadians');
    fieldOfViewVerticalRadians = value;
    changeDelegate.change(self, 'fieldOfViewVerticalRadians', fieldOfViewVerticalRadians);
  };

}

function Viewport(name, camera, projection, rightHandledWorld, canvas) {

  var version = 0;

  Object.assign(this, new Nameable(name));

  if (camera == null) camera = new Camera();
  if (projection == null) projection = new Projection();
  if (rightHandledWorld == null) rightHandledWorld = true;

  camera.addChangeListener(() => { version++; });
  projection.addChangeListener(() => { version++; });



  this.getVPBuilder = function(is2d, pickPoint) {

    if (is2d === true) {
      return new Transform2DBuilder();
    }

    let result = new Transform3dBuilder();
    result.lookTo(camera.getPosition(), camera.getRevDirection(), camera.getUp());
    if (rightHandledWorld) {
      result.multiply(Mx4Util.IDENT_INVERSE_Z);
    }

    let aspect;
    if (canvas != null) {
      aspect = canvas.width / canvas.height;
    } else if (frameBuffer != null) {
      aspect = frameBuffer.width / frameBuffer.height;
    } else {
      throw new Error("Viewport render context not set!");
    }

    if (pickPoint != null) {
      const top = Math.tan(projection.getFieldOfViewVerticalRadians() * 0.5) * projection.getNear();
      const bottom = -top;
      const left = aspect * bottom;
      const right = aspect * top;
      const width = Math.abs(right - left);
      const height = Math.abs(top - bottom);
      const pixelY = canvas.height - pickPoint.y;
      const subLeft = left + pickPoint.x * width / canvas.width;
      const subBottom = bottom + pixelY * height / canvas.height;
      const subWidth = 1 / canvas.width;
      const subHeight = 1 / canvas.height;

      let persp = Mx4Util.perspective(projection.getFieldOfViewVerticalRadians(), aspect, projection.getNear(),
        projection.getFar()),
        frust = Mx4Util.frustum(left, right, bottom, top,
          projection.getNear(),
          projection.getFar()),
      frus1 = Mx4Util.frustum(
        subLeft,
        subLeft + subWidth,
        subBottom,
        subBottom + subHeight,
        projection.getNear(),
        projection.getFar());

      return  result.projectFrustum(
        subLeft,
        subLeft + subWidth,
        subBottom,
        subBottom + subHeight,
        //left, right, bottom, top,
        projection.getNear(),
        projection.getFar());
    }

    return result.projectPersp(projection.getFieldOfViewVerticalRadians(), aspect, projection.getNear(),
      projection.getFar());

  };

   this.getVersion = () => version;

  this.getCamera = () => camera;

  this.getProjection = () => projection;

  this.setRightHandledWorld = function(value) {
    rightHandledWorld = value;
    version++;
  };

  var frameBuffer, pickBuffer;

  this.setFrameBuffer = _frameBuffer => { frameBuffer = _frameBuffer;  };
  this.setPickFrameBuffer = _pickBuffer => { pickBuffer = _pickBuffer;  };

  this.refresh = (gl, pick) => {
    if (canvas != null) {
      if (pick === true) {
        if (pickBuffer == null) throw new Error("Pick buffer is not set!");
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickBuffer);
        gl.viewport(0, 0, pickBuffer.width, pickBuffer.height);
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        resize();
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    } else if (frameBuffer != null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
      gl.viewport(0, 0, frameBuffer.width, frameBuffer.height);
    } else {
      throw new Error("Viewport render context not set!");
    }
  };

  this.getPickBufferColor = (gl) => {
    const data = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    return data;
  };

  this.getGlContext = () => {
    var gl = canvas.getContext("webgl");
    if (!gl) {
      throw new Error("WebGL is not supported!");
    }
    return gl;
  };

  this.getCanvas = () => canvas;

  function resize() {
    var height = canvas.clientHeight * window.devicePixelRatio,
      width = canvas.clientWidth * window.devicePixelRatio;
    if (canvas.width  != width || canvas.height != height) {
      canvas.width  = width;
      canvas.height = height;
    }
  }

}

export { Camera, Projection, Viewport }
