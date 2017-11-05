'use strict';

/* global  util document :true */


// A MORE ADVANCE LOADER SPECIFIC TO THIS
const assetLoader = (function () {

  const DEBUG = false;
  const VERBOSE = false;
  const FILENAME = 'assetLoader.js';

  const processor = {};

  const _types = [];

  let groups = [];

  function generic(constructor) {

    function fg(group, bundleIndex) {
      // START OF PROLOGUE
      const bundles = group.bundles;
      const entry = bundles[bundleIndex];
      const type = entry.type;
      const name = entry.name;
      const dependencies = entry.desc.dep || [];
      const cfg = entry.desc.cfg;
      // END OF PROLOGUE

  
      const inputObject = {};
      if (cfg) util.extendObject(inputObject, cfg);
  
      for (let i = 0; i < dependencies.length; i += 1) {
        const dependencyName = dependencies[i];
        const dependency = getAsset(group, dependencyName);
        util.objectStringReplacement(inputObject, dependencyName, dependency);
      }
  
      const obj = new constructor(inputObject);
  
      // START OF EPILOGUE
      if (!group.returnAsset[type]) group.returnAsset[type] = {};
      group.returnAsset[type][name] = obj;
      group.assetCatalog[`${type}.${name}`] = obj;
      group.completeDependencies[`${type}.${name}`] = true;
      bundles.splice(bundleIndex, 1);
      // END OF EPILOGUE
    }

    return fg;
  }

  function getAsset(group, path) {
    return group.assetCatalog[path];
  }


  function doExit(group) {

    const assets = group.returnAsset;
    assets.raw = group.raw;
    const callback = group.callback;
    const urls = group.urls;

    const retObject = {
      assets, urls
    };

    // FINALIZE
    callback(retObject);
  }

  let TICK_COUNT = 0;
  const MAX_TICKS = 50;

  function tick() {

    for (let j = 0; j < groups.length; j += 1) {
      processBundles(groups[j]);
    }

    let rerun = false;
    for (let i = 0; i < groups.length; i += 1) {
      const group = groups[i];
      if (group.bundles.length > 0) {
        rerun = true;
      } else {
        groups.splice(i, 1);
        doExit(group);
      }
    }

    if (rerun && TICK_COUNT++ < MAX_TICKS) {
      tick();
    }
  }

  function processBundles(group) {
    const bundles = group.bundles;
    for (let i = 0; i < bundles.length; i += 1) {
      processBundle(group, i);
    }
  }

  function processBundle(group, bundleIndex) {

    const bundles = group.bundles;
    const completeDependencies = group.completeDependencies;

    const bundle = bundles[bundleIndex];
    const dependencies = bundle.desc.dep;
    let had = true;

    for (let k = 0; k < dependencies.length; k += 1) {
      const dependency = dependencies[k];
      const dependencyExists = completeDependencies[dependency];
      if (!dependencyExists) {
        had = false;
        k = dependencies.length; // => break
      }
    }
        
    if (!had) return;

    const result = processor[bundle.type](group, bundleIndex);
  }

  function processAssets(resp) {

    const assets = resp.assetsRequest;
    const raw = resp.response;

    const bundles = [];
    const completeDependencies = {};
    const assetCatalog = {};
    let count = 0;

    const group = {
      bundles,
      completeDependencies,
      assetCatalog,
      returnAsset: {},
      urls: resp.urls,
      raw,
      callback: resp.callback
    };

    // Categories
    for (let i = 0, keys = Object.keys(raw); i < keys.length; i += 1) {
      const cat = keys[i];
      const items = raw[cat];
      for (let j = 0, keys2 = Object.keys(items); j < keys2.length; j += 1) {
        const handle = keys2[j];
        const name = `raw.${cat}.${handle}`;
        completeDependencies[name] = true;
        assetCatalog[name] = raw[cat][handle];
      }
    }
    
    for (let j = 0; j < _types.length; j += 1) {
      const type = _types[j];
      const typeCatalog = assets[type];
      for (let i = 0, keys = Object.keys(typeCatalog); i < keys.length; i += 1) {
        const name = keys[i];
        const bundle = {
          type,
          name: keys[i],
          desc: typeCatalog[name],
          ready: false,
        };
        bundles.push(bundle);
      }
    }

    groups.push(group);
    
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

  // PUBLIC FUNCTIONS

  function load(assetsRequest, callback) {

    // PROCESSING RAW DATA
    const stuffToFetch = {};
    const urls = {};
    const raw = assetsRequest.raw;

    for (let i = 0, keys = Object.keys(raw); i < keys.length; i += 1) {
      const type = keys[i];
      stuffToFetch[type] = _loremIpsum(raw[type]);

      // Process URLs
      
      const typeList = raw[type];
      for (let j = 0; j < typeList.length; j += 1) {
        const prefix = typeList[j].prefix;
        const paths = typeList[j].paths
        for (let k = 0, keys2 = Object.keys(paths); k < keys2.length; k += 1) {
          const handle = keys2[k];
          const path = paths[handle];
          urls[prefix + path] = `raw.${type}.${handle}`;
        }
      }
    }

    loader.load(stuffToFetch, (response) => {

      processAssets({
        response,
        urls: stuffToFetch,
        assetsRequest,
        callback
      });
    });
  }

  function addProcessor(name, constructor) {
    _types.push(name);
    processor[name] = generic(constructor);
  }


  const returnObject = {};
  returnObject.load = load;
  returnObject.addProcessor = addProcessor;

  return returnObject;

})();