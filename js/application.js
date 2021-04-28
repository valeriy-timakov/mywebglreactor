"use strict";

import {WebglDriver} from './webgl_driver.js';
import {Controles} from "./controles.js";
import {Loader} from "./loaders/loader.js";


var driver,
  graphicObjects,
  ready = false,
  currentSceneName,
  currentViewportName;


function run() {
  driver = new WebglDriver(window.document.getElementById('c'));

  var initedFigurePrototypes = [],
    wait = [];

  Loader.loadTextures().then(textures => {
    textures.forEach(texture => { driver.initTexture(texture.name, texture.image) } );
    render();
  });

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
          initFigure(figure);
        });
    } )
  );

  wait.push(
    Loader.loadViewports().then( viewports => {
      viewports.forEach(vp => {
        driver.addViewport(vp);
        currentViewportName = vp.getName();
      } );
    } )
  );

  wait.push(
    Loader.loadGraphicOjbects().then( loadedGraphicObjects=> {

      graphicObjects = loadedGraphicObjects;

      graphicObjects
        .map(go => go.getFigures())
        .flat()
        .forEach(figure => {
          initFigure(figure);
        });

      graphicObjects
        .filter(graphicObject => graphicObject.frameBufferData != null)
        .forEach(graphicObject => {
          let fbData = graphicObject.frameBufferData;
          driver.initFrameBuffer(fbData.name, fbData.textureWidth, fbData.textureHeight);
        });

      return driver.geometriesInited().then(() => {
        graphicObjects.forEach(go => { go.initFigures() });
      });

    } )
  );

  Promise.all(wait).then(() => {
    ready = true;
    render();
  });


  function initFigure(figure) {
    if (initedFigurePrototypes.indexOf(figure.__figure_prototype) == -1) {
      driver.initFigure(figure.__figure_prototype);
      initedFigurePrototypes.push(figure.__figure_prototype);
    }
  }

  Controles.setUpdateFinishedListener(() => { render(); });

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
            .flat(),
          fbData.name);
      });
    driver.setCurrentScene(currentSceneName);
    driver.setCurrentViewport(currentViewportName);
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

