'use strict';

/* global  document :true */

// ===========
// MAP HANDLER
// ===========

// This code is rushed...
const mapHandler = (function () {
  // ================
  // PUBLIC FUNCTIONS
  // ================


  const DEBUG = true;
  const FILENAME = 'assetLoader.js';

  function getManifest(callback) {
    loader.load(
      { json: { manifest: 'json/manifest.json' } },
      (response) => {
        callback(response.json.manifest);
      },
    );
  }

  function getItem(master, path) {
    let obj = master;
    const chain = path.split('.');
    for (let i = 0; i < chain.length; i += 1) {
      obj = obj[chain[i]];
    }

    return obj;
  }

  function getMap(mapName, callback) {
    getManifest((manifest) => {
      const prefix = '' || manifest.prefix;
      const path = prefix + manifest.maps[mapName].path;

      if (!(path && prefix)) callback(null);

      loader.load({ json: { map: path } }, (response) => {
        callback(response.json.map);
      });
    });
  }


  function _loadAssets(assets, callback) {
    if (assets) {
      if (DEBUG) console.log(`${util.timestamp()}: Assets are in map?.json.`);
      assetLoader.load(assets, callback);
    } else {
      if (DEBUG) console.log(`${util.timestamp()}: Assets are in assets.json.`);
      loader.load({
        json: {
          assets: 'json/assets.json'
        }
      }, (response) => {
        const assets = response.json.assets;
        assetLoader.load(assets, callback);
      });
    }
  }

  function openMap(mapName, callback) {
    if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: Opening map [${mapName}].`);
    getMap(mapName, (map) => {
      if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: loading assets...`);
      _loadAssets(map.assets, (response) => {
        if (DEBUG) console.log(`${util.timestamp()}: ${FILENAME}: sending response back.`);
        callback({
          map,
          assets: response.assets,
          urls: response.urls,
        });
      });
    });
  }

  // EXPOSURE

  const returnObject = {
    getManifest,
    getMap,
    openMap,
    getItem,
  };

  return returnObject;
})();
