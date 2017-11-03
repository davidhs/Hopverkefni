'use strict';

/* global  document :true */

// ===========
// MAP HANDLER
// ===========

// This code is rushed...
const mapHandler = (function () {
  // TODO set lock


  const DEBUG = false;
  const VERBOSE = false;
  const FILENAME = 'mapHandler.js';

  let activeMap;

  let bundles = [];

  let remaining = 0;
  let completeDependencies = {};

  let assetCatalog = {};

  let phase1Done = false;
  phase1Done = true; // I KNOW

  let _callback = null;

  let oRaw = {};

  let urls = {};
  let attempsExits = 0;

  const returnAsset = {};

  const processor = {};


  function getAsset(path) {
    const trimmedPath = path.trim();

    if (trimmedPath === 'world.width') {
      return activeMap.cfg.world.width;
    } else if (trimmedPath === 'world.height') {
      return activeMap.cfg.world.height;
    }

    return assetCatalog[path];
  }


  function doExit() {
    attempsExits += 1;

    if (remaining !== 0) return;

    if (DEBUG) console.log(`${FILENAME}: Done processing, exiting map handler.`);

    // DO CLEANUP

    const retAsset = returnAsset;
    const callback = _callback;
    const map = activeMap;
    const _urls = urls;
    const raw = oRaw;


    // DO LATER
    if (true) {
      activeMap = null;
      bundles = [];
      completeDependencies = {};
      assetCatalog = {};
      phase1Done = false;
      _callback = null;
      urls = {};
      oRaw = {};
    }

    callback({
      map,
      assets: retAsset,
      urls: _urls,
      raw,
    });
  }

  function checkIfHasAllDependencies(bundle) {
    const dependencies = bundle.desc.dep;

    for (let i = 0; i < dependencies.length; i += 1) {
      const dependency = dependencies[i];
      const dependencyExists = completeDependencies[dependency];
      if (!dependencyExists) {
        return false;
      }
    }

    return true;
  }

  function processBundle(bundleIndex) {
    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Processing bundle index ${bundleIndex}`);
    const bundle = bundles[bundleIndex];
    const hasAllDependencies = checkIfHasAllDependencies(bundle);

    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Does it have all it's dependencies? ${hasAllDependencies}`);

    if (hasAllDependencies) {
      processor[bundle.type](bundleIndex);
    }
  }


  function tick() {
    for (let i = 0; i < bundles.length; i += 1) {
      processBundle(i);
    }

    if (bundles.length === 0 && phase1Done) {
      doExit();
    }
  }

  processor.textureAtlas = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const inputObject = {
      image: getAsset(dependencies[0])
    };

    util.extendObject(inputObject, cfg);

    const obj = new TextureAtlas(inputObject);


    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.texture = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE


    const imageThing = getAsset(dependencies[0]);

    let width = 0;
    let height = 0;

    if (typeof cfg.width === 'string') {
      // Path
      width = getAsset(cfg.width);
    } else {
      width = cfg.width;
    }

    if (typeof cfg.height === 'string') {
      height = getAsset(cfg.height);
    } else {
      height = cfg.height;
    }

    const scale = cfg.scale || 1;
    let image = null;

    if (typeof imageThing === 'string') {
      image = getAsset(imageThing);
    } else {
      // Assume type texture atlas :/
      const tileX = cfg.image.coordinate[0];
      const tileY = cfg.image.coordinate[1];
      image = imageThing.getTile(tileX, tileY);
    }

    const obj = new Texture({
      image,
      scale,
      width,
      height,
    });


    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.sequence = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Processing sequence.`);

    const textureAtlas = getAsset(dependencies[0]);

    const all = cfg.all || 'true';
    const primaryDirection = cfg.primaryDirection || 'right';
    const secondaryDirection = cfg.secondaryDirection || 'down';

    const obj = textureAtlas.getSequence({
      primaryDirection: 'right',
      secondaryDirection: 'down',
      nrOfTiles: textureAtlas.nrOfTiles
    });


    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.sprite = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const image = getAsset(dependencies[0]);

    const inputObject = {};
    if (cfg) util.extendObject(inputObject, cfg);
    inputObject.image = image;

    const obj = new Sprite(inputObject);

    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  // BRAND NEW TECH!
  processor.tileMap = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const inputObject = {};
    if (cfg) util.extendObject(inputObject, cfg);

    for (let i = 0; i < dependencies.length; i += 1) {
      const dependencyName = dependencies[i];
      const dependency = getAsset(dependencyName);
      for (let j = 0, keys = Object.keys(inputObject); j < keys.length; j += 1) {
        const propertyName = keys[j];
        if (inputObject[propertyName] === dependencyName) {
          inputObject[propertyName] = dependency;
        }
      }
    }

    const obj = new TileMap(inputObject);

    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.fastImage = (bundleIndex) => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const image = getAsset(dependencies[0]);

    const inputObject = {};
    if (cfg) util.extendObject(inputObject, cfg);
    inputObject.image = image;

    const obj = new FastImage(inputObject);

    // START OF EPILOGUE
    remaining -= 1;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[`${type}.${name}`] = obj;
    completeDependencies[`${type}.${name}`] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  function processAssets(response) {

    if (DEBUG) console.log(`${FILENAME}: Processing assets...`);

    const map = activeMap;

    const _url = urls;
    const _assets = {};

    // TODO not global here
    for (let i = 0, keys = Object.keys(_url); i < keys.length; i += 1) {
      const url = _url[keys[i]];
      _assets[keys[i]] = response[url];
    }

    // g_asset = _assets;

    const assets = map.assets;

    // Populate RAW dependency existences

    const raw = assets.raw;


    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Doing something...`);
    for (let i = 0, keys = Object.keys(raw); i < keys.length; i += 1) {
      const categoryType = keys[i];
      const entryList = raw[categoryType];
      for (let j = 0; j < entryList.length; j += 1) {
        const entry = entryList[j];
        const paths = entry.paths;
        for (let k = 0, keys2 = Object.keys(paths); k < keys2.length; k += 1) {
          const name = keys2[k];
          completeDependencies[`raw.${name}`] = true;
          assetCatalog[`raw.${name}`] = _assets[name];
          oRaw[name] = _assets[name];
        }
      }
    }

    const _types = [
      'texture', 'textureAtlas', 'sequence', 'sprite', 'fastImage', 'tileMap'
    ];

    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Doing something more...`);
    for (let j = 0; j < _types.length; j += 1) {
      const type = _types[j];
      const typeCatalog = assets[type];
      for (let i = 0, keys = Object.keys(typeCatalog); i < keys.length; i += 1) {
        const name = keys[i];
        remaining += 1;
        const bundle = {
          type,
          name: keys[i],
          desc: typeCatalog[name],
          ready: false,
        };
        bundles.push(bundle);
      }
    }

    if (DEBUG && VERBOSE) console.log(`${FILENAME}: About to go process bundles.`);
    tick();
  }

  function _loremIpsum(itemList) {
    const url_items = {};
    for (let i = 0; i < itemList.length; i += 1) {
      const catalog = itemList[i];
      util.extendObject(
        url_items,
        util.prefixStrings(catalog.prefix, catalog.paths),
      );
    }
    return url_items;
  }

  function processMap(map) {
    // Refer back to this map
    activeMap = map;

    // Set shadow size
    g_shadowSize = map.cfg.shadowSize;

    // Setting world
    g_world.setWidth(map.cfg.world.height, map.cfg.world.unit);
    g_world.setHeight(map.cfg.world.width, map.cfg.world.unit);
    g_world.setTileWidth(map.cfg.tile.width);
    g_world.setTileHeight(map.cfg.tile.height);

    // Set "rendering" canvas.
    g_canvas.width = map.cfg.viewport.width;
    g_canvas.height = map.cfg.viewport.height;

    // Setting viewport
    g_viewport.setIW(map.cfg.viewport.width);
    g_viewport.setIH(map.cfg.viewport.height);

    g_viewport.setOW(map.cfg.viewport.width);
    g_viewport.setOH(map.cfg.viewport.height);

    // PROCESSING RAW DATA

    const url_audio = _loremIpsum(map.assets.raw.audio);
    const url_images = _loremIpsum(map.assets.raw.image);
    const url_text = _loremIpsum(map.assets.raw.text);
    const url_json = _loremIpsum(map.assets.raw.json);
    const url_xml = _loremIpsum(map.assets.raw.xml);

    util.extendObject(urls, url_text);
    util.extendObject(urls, url_images);
    util.extendObject(urls, url_audio);
    util.extendObject(urls, url_json);
    util.extendObject(urls, url_xml);

    assetManager.load({
      text: util.objPropsToList(url_text),
      image: util.objPropsToList(url_images),
      audio: util.objPropsToList(url_audio),
      json: util.objPropsToList(url_json),
      xml: util.objPropsToList(url_xml),
    }, processAssets);
  }


  // ================
  // PUBLIC FUNCTIONS
  // ================

  function getManifest(callback) {
    if (DEBUG) console.log(`${FILENAME}: Getting manifest...`);
    assetManager.load({
      text: ['json/manifest.json'],
      image: [],
      audio: [],
    }, (response) => {
      if (DEBUG) console.log(`${FILENAME}: Done getting manifest.`);
      const key = Object.keys(response)[0];
      const manifest = JSON.parse(response[key]);
      callback(manifest);
    });
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
    if (DEBUG) console.log(`${FILENAME}: Getting map...`);
    getManifest((manifest) => {
      if (DEBUG) console.log(`${FILENAME}: Done getting map.`);
      const prefix = '' || manifest.prefix;
      const path = prefix + manifest.maps[mapName].path;

      if (!(path && prefix)) callback(null);

      assetManager.load({
        text: [path],
        image: [],
        audio: [],
      }, (response) => {
        const key = Object.keys(response)[0];
        const map = JSON.parse(response[key]);
        callback(map);
      });
    });
  }

  function openMap(mapName, callback) {
    // TODO implement callback (post-processing)
    if (DEBUG) console.log(`${FILENAME}: Opening map: ${mapName}`);
    getMap(mapName, processMap);
    _callback = callback;
  }

  // EXPOSURE

  const returnObject = {
    getManifest,
    getMap,
    openMap,
    getItem,
  };

  if (DEBUG) {
    const dbo = {};
    util.extendObject(dbo, {
      bundles,
      completeDependencies
    });
    returnObject.debug = dbo;
  }

  return returnObject;
})();
