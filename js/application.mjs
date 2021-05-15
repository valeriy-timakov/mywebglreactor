"use strict";

import {WebglDriver} from './webgl_driver.mjs';
import {Controls} from "./controles.mjs";
import {Loader} from "./loaders/loader.mjs";
import {Camera, Clipper2D, Projection, Viewport} from "./viewport.mjs";


var driver,
  graphicObjects,
  ready = false,
  currentSceneName,
  currentViewportName,
  objectsMap = new Map();


function run() {
  let canvas = window.document.getElementById('c'),
    mainCamera = new Camera([0, 0, 0], [0, 0, -1], [0, 1, 0]),
    main2DCliper = new Clipper2D(0, 0, 2, 2),
    canvasViewport = new Viewport('main', mainCamera,
      new Projection(0.5, 200, 1.1), true, main2DCliper, canvas);
  driver = new WebglDriver(canvasViewport);
  currentViewportName = canvasViewport.getName();

  var wait = [];



  Loader.loadTextures().then(textures => {
    textures.forEach(texture => { driver.initTexture(texture.name, texture.image) } );
    render();
  });


  /* Controls.addKineticUnit('camera', {
     initialPosition: mainCamera.getPosition(),
     initialDirection: mainCamera.getRevDirection(),
     initialUp: mainCamera.getUp(),
     initialSpeed: 0.1,
     acceleration: 0.01,
     changeDirectionByKeySpeed: 0.1,
     changeInclineSpeed: 0.1,
     changeDirectionByMouseSpeed: 0.1,
     forwardKey: 'KeyW',
     backwardKey: 'KeyS',
     rightKey: 'KeyD',
     leftKey: 'KeyA',
     upKey: 'KeyE',
     downKey: 'KeyC',
     fasterKey: 'KeyQ',
     slowerKey: 'KeyZ',
     directionRightKey: 'ArrowRight',
     directionLeftKey: 'ArrowLeft',
     directionUpKey: 'ArrowUp',
     directionDownKey: 'ArrowDown',
     rightInclineKey: 'PageDown',
     leftInclineKey: 'Delete'
   }, (state, position, direction, up) => {
     mainCamera.setPosition(position);
     mainCamera.setDirection(direction);
     mainCamera.setUp(up);
   });*/

  wait.push(
    Loader.loadScenes().then(scenes => {
      scenes
        .map(scene => {
          driver.addScene(scene);
          currentSceneName = scene.getName();
          return []
            .concat( scene.getPointLights().map(pl => pl.getGraphicRepresentation()).filter(plgr => plgr != null) )
            .concat( scene.getSpotLights().map(pl => pl.getGraphicRepresentation()).filter(plgr => plgr != null) );
        })
        .flat()
        .map(graphicObject => graphicObject.getFigures())
        .flat()
        .forEach(figure => {
          driver.initFigure(figure);
        });
    } )
  );

  wait.push(
    Loader.loadGraphicOjbects().then( loadedGraphicObjects=> {

      graphicObjects = loadedGraphicObjects;

      graphicObjects.forEach(graphicObject => {
        if (typeof graphicObject.getId == 'function' && graphicObject.getId() != null) {
          objectsMap.set(graphicObject.getId(), graphicObject);
        }
      });

      graphicObjects
        .map(go => go.getFigures())
        .flat()
        .forEach(figure => {
          driver.initFigure(figure);
        });

      graphicObjects
        .filter(graphicObject => graphicObject.frameBufferData != null)
        .forEach(graphicObject => {
          let fbData = graphicObject.frameBufferData,
            fbViewport = new Viewport(fbData.viewportName, new Camera([0, 0, -20], [0, 0, 1], [1, 1, 0]),
            new Projection(0.4, 1000, 2.1));
          driver.addFrameBufferViewport(fbViewport, fbData.textureWidth, fbData.textureHeight);
        });

      return driver.geometriesInited();

    } )
  );

  Promise.all(wait).then(() => {
    ready = true;
    render();
    document.body.addEventListener('mousemove', function(e)  {
      let canvas = canvasViewport.getCanvas(),
        rect = canvas.getBoundingClientRect(),
        mouseX = (e.clientX - rect.left) / canvas.clientWidth,
        mouseY = (e.clientY - rect.top) / canvas.clientHeight;
      if (mouseY < 0 || mouseY > 1 || mouseX < 0 || mouseX > 1) {
        return;
      }
      let pickPoint = {
          x: mouseX * canvas.width,
          y: mouseY * canvas.height
        };
      let selId = driver.pick(
        graphicObjects
          .map(graphicObject => graphicObject.getFigures())
          .flat(), pickPoint),
        selGraphicObject = objectsMap.get(selId);
      if (selGraphicObject != null) {
        selGraphicObject.setColor(selColor);
        if (lastObject != null && lastObject != selGraphicObject) {
          lastObject.resetColor();
        }
        lastObject = selGraphicObject;
      } else if (lastObject != null) {
        lastObject.resetColor();
        lastObject = null;
      }
      render();
    });
  });

  var lastObject = null;
  const selColor = {r: 1, g: 0, b: 0, a: 1};

  Controls.setUpdateFinishedListener(() => { render(); });

};

function render() {
  if (ready) {
    graphicObjects
      .filter(graphicObject => graphicObject.frameBufferData != null)
      .forEach(graphicObject => {
        let fbData = graphicObject.frameBufferData;
        if (fbData.sceneName != null) {
          driver.setCurrentScene(fbData.sceneName);
        }
        if (fbData.viewportName != null) {
          driver.setCurrentViewport(fbData.viewportName);
        }
        driver.render(
          graphicObjects
            .filter(tmpGraphicObject => tmpGraphicObject != graphicObject)
            .map(tmpGraphicObject => tmpGraphicObject.getFigures())
            .flat());
      });
    driver.setCurrentScene(currentSceneName);
    driver.setMainViewport();
    driver.render(
      graphicObjects
        .map(graphicObject => graphicObject.getFigures())
        .flat()
    );
  }
}

const Application = {
  run: run
};

export {Application}

