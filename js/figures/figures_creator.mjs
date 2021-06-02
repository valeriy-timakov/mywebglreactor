
"use strict";
import {Vx3Utils} from '../math_utils.mjs';

export function createSphere(radius, n) {
  let halfResVertices = [],
    resPrevVerts = [],
    halfRevNorms = [],
    resPrevNorms = [],
    y = i => radius * Math.sin(2 * Math.PI * i / n),
    x = (j, ri, ni) => ri * Math.cos(2 * Math.PI * j / ni),
    z = (j, ri, ni) => ri * Math.sin(2 * Math.PI * j / ni),
    addVert = (vertBuff, normBuff, x, y, z) => {
      vertBuff.push(x, y, z);
      let len = Math.sqrt(x * x + y * y + z * z);
      normBuff.push(x / len, y / len, z / len);
    };
  for (let j = 0; j <= n; j++) {
    addVert(resPrevVerts, resPrevNorms, x(j, radius, n), 0, z(j, radius, n));
  }
  for (let i = 1; i < n / 4; i++) {
    let ri = radius * Math.cos(2 * Math.PI * i / n),
      ni = Math.floor(n * ri / radius),
      yi = y(i),
      resCurrVerts = [],
      resCurrNorms = [];
    ni = Math.max(ni, 3);
    for (let j = 0; j <= ni; j++) {
      addVert(resCurrVerts, resCurrNorms, x(j, ri, ni), yi, z(j, ri, ni));
    }
    let currPoint = 0;
    for (let k = 0; k < resPrevVerts.length / 3; k++) {
      copyPoint(resPrevVerts, halfResVertices, k);
      copyPoint(resPrevNorms, halfRevNorms, k);
      currPoint =  Math.floor(k * ni * 3 / (resPrevVerts.length - 3));
      copyPoint(resCurrVerts, halfResVertices, currPoint);
      copyPoint(resCurrNorms, halfRevNorms, currPoint);
    }
    resPrevVerts = resCurrVerts;
    resPrevNorms = resCurrNorms;
  }
  for (let k = 0; k < resPrevVerts.length / 3; k++) {
    copyPoint(resPrevVerts, halfResVertices, k);
    copyPoint(resPrevNorms, halfRevNorms, k);
  }
  return {
    vertices: addMirror(halfResVertices),
    normals: addMirror(halfRevNorms)
  };
}

function addMirror(halffRes) {
  let res = [];
  let halfCount = halffRes.length / 3;
  for (let k = 0; k <= halffRes.length / 3 - 1; k++) {
    res[(k + halfCount) * 3] = halffRes[k * 3];
    res[(k + halfCount) * 3 + 1] = halffRes[k * 3 + 1];
    res[(k + halfCount) * 3 + 2] = halffRes[k * 3 + 2];

    res[k * 3] = halffRes[(halfCount - 1 - k) * 3];
    res[k * 3 + 1] = -halffRes[(halfCount - 1 - k) * 3 + 1];
    res[k * 3 + 2] = halffRes[(halfCount - 1 - k) * 3 + 2];
  }
  return res;
}

function copyPoint(from, to, i) {
  i *= 3;
  to.push(from[i], from[i + 1], from[i + 2]);
}

function BuffersBuilder() {
  var verBuffer = [],
    normBuffer = [],
    position = 0;
  this.add = function (x, y, z) {
    verBuffer.push(x, y, z);
    let len = Math.sqrt(x * x + y * y + z * z);
    normBuffer.push(x / len, y / len, z / len);
    position++;
    return position;
  }

  this.getVertices = () => verBuffer;
  this.getNormals = () => normBuffer;

}

export function createSphereIndexed(radius, n) {
  let buffBuilder = new BuffersBuilder(),
    halfResIndexes = [],
    lastIndexes = [],
    y = i => radius * Math.sin(2 * Math.PI * i / n),
    x = (j, ri, ni) => ri * Math.cos(2 * Math.PI * j / ni),
    z = (j, ri, ni) => ri * Math.sin(2 * Math.PI * j / ni);
  for (let j = 0; j <= n; j++) {
    lastIndexes.push( buffBuilder.add( x(j, radius, n), 0, z(j, radius, n) ) );
  }
  for (let i = 1; i < n / 4; i++) {
    let ri = radius * Math.cos(2 * Math.PI * i / n),
      ni = Math.floor(n * ri / radius),
      yi = y(i),
      currIndexes = [];
    ni = Math.max(ni, 3);
    for (let j = 0; j <= ni; j++) {
      currIndexes.push( buffBuilder.add( x(j, ri, ni), yi, z(j, ri, ni) ) );
    }
    let currPoint = 0;
    for (let k = 0; k < lastIndexes.length; k++) {
      halfResIndexes.push(lastIndexes[k]);
      currPoint =  Math.floor(k * ni / (lastIndexes.length - 1));
      halfResIndexes.push(currIndexes[currPoint]);
    }
    lastIndexes = currIndexes;
  }
  for (let k = 0; k < lastIndexes.length; k++) {
    halfResIndexes.push(lastIndexes[k]);
  }
  return {
    indexes: halfResIndexes,
    vertices: buffBuilder.getVertices(),
    normals: buffBuilder.getNormals()
  };
}

export const CON_SURFACE_MODE_FAN = 'fan';


export function createConeSurfaceFan(radius, height, n) {
  let vertices = [];
  vertices.push([0, 0, height]);
  for (let i = 0; i < n; i++) {
    let angle = i * 2 * Math.PI / n;
    vertices.push([radius * Math.cos(angle), radius * Math.sin(angle), 0]);
  }
  vertices.push([radius, 0, 0]);
  return vertices;
}
/*
export function createCircle(radius, n, clockwise) {
  let vertices = [];
  vertices.push([0, 0, 0]);
  for (let i = 0; i < n; i++) {
    let angle = i * 2 * Math.PI / n;
    vertices.push([radius * Math.cos(angle), radius * Math.sin(angle), 0]);
  }
  vertices.push([radius, 0, 0]);
  return vertices;
}
*/

export function createCone(radius, height, n) {
  let vertices = [],
    normals = [],
    indexes = [];
  const top = [0, 0, height],
    bottom = [0, 0, 0],
    bottomNormal = [0, 0, -1];
  vertices = vertices.concat(bottom);
  normals = normals.concat(bottomNormal);
  let prevNormal = null,
    firstNormal;
  for (let i = 0; i < n; i++) {
    let angle = i * 2 * Math.PI / n,
      sin = Math.cos(angle),
      cos = Math.sin(angle),
      sideLen = Math.sqrt(radius * radius + height * height),
      point = [radius * sin, radius * cos, 0],
      normal = Vx3Utils.normalize( [ height * sin / sideLen, height  * cos / sideLen, radius / sideLen ] );
    if (prevNormal != null) {
      normals = normals.concat(Vx3Utils.normalize( Vx3Utils.add(prevNormal, normal) ));
    }

    //circle
    vertices = vertices.concat(point);
    normals = normals.concat(bottomNormal);
    let lineNum = i != n - 1 ? i : -1;
    indexes.push(1 + 3 * i);//0
    indexes.push(0);
    indexes.push(4 + 3 * lineNum);//0+3=3
    //cone side
    vertices = vertices.concat(point);
    normals = normals.concat(normal);
    vertices = vertices.concat(top);
    indexes.push(2 + 3 * i);//1
    indexes.push(5 + 3 * lineNum);//1+3=4
    indexes.push(3 + 3 * i);//2

    prevNormal = normal;
    if (i == 0) {
      firstNormal = normal;
    }
  }
  normals = normals.concat(Vx3Utils.normalize( Vx3Utils.add(prevNormal, firstNormal) ));
  return {
    indexes: indexes,
    vertices:vertices,
    normals: normals
  };
}

export function createCylinder(radius, height, n) {
  const top = [0, 0, height],
    topNormal = [0, 0, 1],
    bottom = [0, 0, 0],
    bottomNormal = [0, 0, -1];
    let vertices = [],
     normals = [],
     indexes = [],
     firstNormal = [1, 0, 0],
     prevNormal = firstNormal;
  vertices = vertices.concat(top);
  normals = normals.concat(topNormal);
  vertices = vertices.concat(bottom);
  normals = normals.concat(bottomNormal);
  for (let i = 0; i < n; i++) {
    let angle = i * 2 * Math.PI / n,
      cos = Math.cos(angle),
      sin = Math.sin(angle),
      x = radius * cos,
      y = radius * sin,
      normal = [cos, sin, 0],
      currentVertTop = [x, y, height],
      currentVertBottom = [x, y, 0];

    let lineNum = i != n - 1 ? i : -1;
    //top circle
    vertices = vertices.concat(currentVertTop);
    normals = normals.concat(topNormal);
    indexes.push(0);
    indexes.push(2 + i * 4);//0
    indexes.push(6 + lineNum * 4);//0+4=4
    //side surface
    vertices = vertices.concat(currentVertTop);
    normals = normals.concat(normal);
    vertices = vertices.concat(currentVertBottom);
    normals = normals.concat(normal);
    indexes.push(3 + i * 4);//1
    indexes.push(4 + i * 4);//2
    indexes.push(7 + lineNum * 4);//1+4=5
    indexes.push(7 + lineNum * 4);//1+4=5
    indexes.push(4 + i * 4);//2
    indexes.push(8 + lineNum * 4);//2+4=6
    //bottom circle
    vertices = vertices.concat(currentVertBottom);
    normals = normals.concat(bottomNormal);
    indexes.push(1);
    indexes.push(9 + lineNum * 4);//3+4=7
    indexes.push(5 + i * 4);//3
  }
  return {
    indexes: indexes,
    vertices:vertices,
    normals: normals
  };
}
