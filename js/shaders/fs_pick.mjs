
export function getPickShaderSource() {
  return `precision mediump float;
      uniform vec4 u_id;
      void main() {
        gl_FragColor = u_id;
      }`;
};

export function initPickProgram(gl, programWrapper) {
  var uIdLocation = gl.getUniformLocation(programWrapper.pickProgram, 'u_id');
  programWrapper.setColorId = function (colorId) {
    gl.uniform4fv(uIdLocation, colorId);
  }
}
