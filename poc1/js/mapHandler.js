'use strict';

/* global  document :true */

// ===========
// MAP HANDLER
// ===========

const mapHandler = (function () {

  // TODO set lock

  let activeMap;

  let bundles = [];

  let remaining = 0;
  let completeDependencies = {};

  let assetCatalog = {};

  let phase1Done = false;
  phase1Done = true;  // I KNOW

  let _callback = null;

  let oRaw = {};

  let urls = {};
  
  function getManifest(callback) {
    assetManager.load({
      text: ["json/manifest.json"],
      image: [],
      audio: []
    }, response => {
      const key = Object.keys(response)[0];
      const manifest = JSON.parse(response[key]);
      callback(manifest);
    });
  }
  
  function getMap(mapName, callback) {
    getManifest(manifest => {
      const prefix = "" || manifest.prefix;
      const path = prefix + manifest.maps[mapName].path;
  
      if (!(path && prefix)) callback(null);
  
      assetManager.load({
        text: [path],
        image: [],
        audio: []
        }, response => {
          const key = Object.keys(response)[0];
          const map = JSON.parse(response[key]);
          callback(map);
        }
      );
    });
  }
  
  function openMap(mapName, callback) {
    // TODO implement callback (post-processing)
    getMap(mapName, processMap);
    _callback = callback;
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
  
    const url_audio = {};
    const audioList = map.assets.raw.audio;
    for (let i = 0; i < audioList.length; i += 1) {
      const catalog = audioList[i];
      util.extendObject(
        url_audio,
        util.prefixStrings(catalog.prefix, catalog.paths),
      );
    }
  
    const url_images = {};
    const imageList = map.assets.raw.image;
    for (let i = 0; i < imageList.length; i += 1) {
      const catalog = imageList[i];
      util.extendObject(
        url_images,
        util.prefixStrings(catalog.prefix, catalog.paths),
      ); 
    }
  
    const url_text = {};
    const textList = map.assets.raw.text;
    for (let i = 0; i < textList.length; i += 1) {
      const catalog = textList[i];
      util.extendObject(
        url_text,
        util.prefixStrings(catalog.prefix, catalog.paths),
      );
    }
  
    util.extendObject(urls, url_text);
    util.extendObject(urls, url_images);
    util.extendObject(urls, url_audio);
  
    assetManager.load({
      text: util.objPropsToList(url_text),
      image: util.objPropsToList(url_images),
      audio: util.objPropsToList(url_audio),
    }, processAssets2);
  }



  function getAsset(path) {

    const trimmedPath = path.trim();

    if (trimmedPath === "world.width") {
      return activeMap.cfg.world.width;
    } else if (trimmedPath === "world.height") {
      return activeMap.cfg.world.height;
    }

    return assetCatalog[path];
  }

  let attempsExits = 0;

  function doExit() {
    attempsExits++;

    if (remaining !== 0) return;

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
      map: map,
      assets: retAsset,
      urls: _urls,
      raw: raw
    });
  }

  function checkIfHasAllDependencies(bundle) {

    let dependencies = bundle.desc.dep;

    for (let i = 0; i < dependencies.length; i += 1) {
      const dependency = dependencies[i];
      const dependencyExists = completeDependencies[dependency];
      if (!dependencyExists) {
        return false;
      }
    }

    return true;
  }

  function tick() {
    for (let i = 0; i < bundles.length; i += 1) {
      processBundle(i);
    }

    if (bundles.length === 0 && phase1Done) {
      doExit();
    }
  }

  function processBundle(bundleIndex) {

    const bundle = bundles[bundleIndex];
    let hasAllDependencies = checkIfHasAllDependencies(bundle);

    if (hasAllDependencies) {
      processor[bundle.type](bundleIndex);
    }

  }

  function processBundles() {
    const newestEntryIndex = bundles.length - 1;

    processBundle(newestEntryIndex);
  }

  let returnAsset = {};

  let processor = {};

  processor.textureAtlas = bundleIndex => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    let image = getAsset(dependencies[0]);
    let tileWidth = cfg.tileWidth || 0;
    let tileHeight = cfg.tileHeight || 0;
    let nrOfTiles = cfg.nrOfTiles || 0;
    let primaryDirection = cfg.primaryDirection || "right";
    let secondaryDirection = cfg.secondaryDirection || "down";

    const obj = new TextureAtlas(image, tileWidth, tileHeight, nrOfTiles);


    // START OF EPILOGUE
    remaining--;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[type + "." + name] = obj;
    completeDependencies[type + "." + name] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.texture = bundleIndex => {
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

    if (typeof cfg.width === "string") {
      // Path
      width = getAsset(cfg.width);
    } else {
      width = cfg.width;
    }

    if (typeof cfg.height === "string") {
      height = getAsset(cfg.height);
    } else {
      height = cfg.height;
    }

    let scale = cfg.scale || 1;
    let image = null;

    if (typeof imageThing === "string") {
      image = getAsset(imageThing);
    } else {
      // Assume type texture atlas :/
      const tileX = cfg.image.coordinate[0];
      const tileY = cfg.image.coordinate[1];
      image = imageThing.getSubimage(tileX, tileY);
    }

    const obj = new Texture({
      image: image,
      scale: scale,
      width: width, 
      height: height
    });


    // START OF EPILOGUE
    remaining--;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[type + "." + name] = obj;
    completeDependencies[type + "." + name] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.sequence = bundleIndex => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const textureAtlas = getAsset(dependencies[0]);

    const all = cfg.all || "true";
    const primaryDirection = cfg.primaryDirection || "right";
    const secondaryDirection = cfg.secondaryDirection || "down";

    const obj = textureAtlas.getSequence({
      // TODO FIX LATER
      rowFirst: true,
      LR: true,
      TB: true,
      qty: textureAtlas.nrOfSubimages
    });


    // START OF EPILOGUE
    remaining--;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[type + "." + name] = obj;
    completeDependencies[type + "." + name] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.sprite = bundleIndex => {
    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const image = getAsset(dependencies[0]);
    let scale = 1.0;

    if (cfg && cfg.scale) scale = cfg.scale;

    const obj = new Sprite({
      image, scale
    });

    // START OF EPILOGUE
    remaining--;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[type + "." + name] = obj;
    completeDependencies[type + "." + name] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };

  processor.fastImage = bundleIndex => {

    // START OF PROLOGUE
    const entry = bundles[bundleIndex];
    const type = entry.type;
    const name = entry.name;
    const dependencies = entry.desc.dep;
    const cfg = entry.desc.cfg;
    // END OF PROLOGUE

    const image = getAsset(dependencies[0]);

    const obj = new FastImage(image);

    // START OF EPILOGUE
    remaining--;
    if (!returnAsset[type]) returnAsset[type] = {};
    returnAsset[type][name] = obj;
    assetCatalog[type + "." + name] = obj;
    completeDependencies[type + "." + name] = true;
    entry.ready = true;
    bundles.splice(bundleIndex, 1);
    tick();
    // END OF EPILOGUE
  };


  
  function processAssets2(response) {
  

    const map = activeMap;

    const _url = urls;
    const _assets = {};
  
    // TODO not global here
    for (let i = 0, keys = Object.keys(_url); i < keys.length; i += 1) {
      const url = _url[keys[i]];
      _assets[keys[i]] = response[url];
    }

    //g_asset = _assets;

    const assets = map.assets;

    // Populate RAW dependency existences

    const raw = assets.raw;

    

    for (let i = 0, keys = Object.keys(raw); i < keys.length; i += 1) {
      const categoryType = keys[i];
      const entryList = raw[categoryType];
      for (let j = 0; j < entryList.length; j += 1) {
        const entry = entryList[j];
        const paths = entry.paths;
        for (let k = 0, keys2 = Object.keys(paths); k < keys2.length; k += 1) {
          const name = keys2[k];
          completeDependencies["raw." + name] = true;
          assetCatalog["raw." + name] = _assets[name];
          oRaw[name] = _assets[name];
        }
      }
    }

    const _types = [
      "texture", "textureAtlas", "sequence", "sprite", "fastImage"
    ];

    for (let j = 0; j < _types.length; j += 1) {
      const type = _types[j];
      const typeCatalog = assets[type];
      for (let i = 0, keys = Object.keys(typeCatalog); i < keys.length; i += 1) {
        const name = keys[i];
        remaining += 1;
        const bundle = {
          type: type,
          name: keys[i],
          desc: typeCatalog[name],
          ready: false
        };
        bundles.push(bundle);
      }
    }


    processBundles();
  }

  function getItem(master, path) {
    let obj = master;
    const chain = path.split('.');
    for (let i = 0; i < chain.length; i += 1) {
      obj = obj[chain[i]];
    }

    return obj;
  }


  return {
    getManifest: getManifest,
    getMap: getMap,
    openMap: openMap,
    getItem: getItem
  };
})();