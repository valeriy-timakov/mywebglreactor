"use strict";

import {WebglDriver} from './webgl_driver.mjs';
import {Controls} from "./controles.mjs";
import {Loader} from "./loaders/loader.mjs";
import {Camera, Projection, Viewport} from "./viewport.mjs";


var driver,
  graphicObjects,
  ready = false,
  currentSceneName,
  currentViewportName;


function run() {
  let canvas = window.document.getElementById('c'),
    mainCamera = new Camera([0, 0, 0], [0, 0, -1], [0, 1, 0]),
    canvasViewport = new Viewport('main', mainCamera,
      new Projection(0.5, 200, 1.1), true, canvas);
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
            fbViewport = new Viewport(fbData.name, new Camera([0, 0, -20], [0, 0, 1], [1, 1, 0]),
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
        mouseX = e.clientX - rect.left,
        mouseY = e.clientY - rect.top,
        pickPoint = {
          x: mouseX * canvas.width / canvas.clientWidth,
          y: mouseY * canvas.height / canvas.clientHeight
        };
      let selId = driver.pick(
        graphicObjects
          .map(graphicObject => graphicObject.getFigures())
          .flat(), pickPoint);
      console.log(selId)
    });
  });

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
          driver.setCurrentViewport(fbData.name);
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

