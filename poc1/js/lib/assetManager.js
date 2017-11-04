'use strict';

/* global Image Audio XMLHttpRequest  :true */

/* jslint browser: true, devel: true, white: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =============
// Asset manager
// ============

// The asset manager lets you load multiple assets of different types,
// here image and text are useful types.  Once all assets have been loaded
// the supplied callback is called.

// The name is probably a misnomer, since it just fetches
// stuff for you and does some rudamentary processing.
// It doesn't manage assets.
const assetManager = (function () {
  // Types of assets this manager supports.
  // const _catname = ['image', 'audio', 'text'];

  const DEBUG = false;
  const VERBOSE = false;
  const FILENAME = 'assetManager.js';

  const _catname = ['image', 'audio', 'text', 'json', 'xml'];

  // Each load invocation creates a bundle.  A bundle
  // keeps track of the callback function, which URLs
  // to process, and how many assets have been received.
  // This enables the user to have multiple load
  // invocations at the same time.
  const bundles = [];

  // Processes given asset type.
  const processor = {};

  // Process image
  processor.image = function (url, callback) {
    const img = new Image();

    if (DEBUG) console.log(`${FILENAME}: Processing image: ${url}`);

    img.onload = function (evt) {
      if (DEBUG) console.log(`${FILENAME}: Done processing image: ${url}`);
      callback(img, url);
    };

    img.onerror = function (evt) {
      if (DEBUG) console.log(`${FILENAME}: Done processing image (error): ${url}`);
      callback(null, url);
    };

    img.src = url;
  };

  // Process audio, most likely not needed.
  processor.audio = function (url, callback) {
    if (DEBUG) console.log(`${FILENAME}: Processing audio: ${url}`);
    const audio = new Audio(url);
    if (DEBUG) console.log(`${FILENAME}: Done processing audio: ${url}`);
    callback(audio, url);
  };

  // Processes text
  processor.text = function (url, callback) {
    if (DEBUG) console.log(`${FILENAME}: Processing text: ${url}`);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.onload = function () {
      if (xhr.status === 200) {
        if (DEBUG) console.log(`${FILENAME}: Done processing text: ${url}`);
        callback(xhr.responseText, url);
      } else {
        if (DEBUG) console.log(`${FILENAME}: Done processing text (error): ${url}`);
        callback(null, url);
      }
    };
    xhr.send();
  };

  processor.xml = function (url, callback) {
    if (DEBUG) console.log(`${FILENAME}: Processing XML: ${url}`);
    processor.text(url, (response, url) => {
      if (DEBUG) console.log(`${FILENAME}: Done processing XML: ${url}`);
      if (response === null) callback(null, url);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response, 'text/xml');
      callback(xmlDoc, url);
    });
  };

  processor.json = function (url, callback) {
    if (DEBUG) console.log(`${FILENAME}: Processing JSON: ${url}`);
    processor.text(url, (response, url) => {
      if (DEBUG) console.log(`${FILENAME}: Done processing JSON: ${url}`);
      if (response === null) callback(null, url);
      const json = JSON.parse(response);
      callback(json, url);
    });
  };

  // Each time an asset has been loaded this function
  // is called.
  function assetTick(asset, url) {
    if (DEBUG) console.log(`${FILENAME}: Remaining bundles before: ${bundles.length}`);
    for (let i = 0; i < bundles.length; i += 1) {
      const bundle = bundles[i];
      const bundleLut = bundle.lut;
      const lut = bundleLut;

      // Check if this bundle has been waiting
      // for this URL
      if (lut[url]) {
        lut[url] = false;
        bundle.count += 1;
        bundle.asset[url] = asset;
      }

      // If all assets are loaded in the
      // bundle, call callback with
      // assets.
      if (bundle.count === bundle.size) {
        delete bundles[i];

        if (DEBUG) console.log(`${FILENAME}: Bundle at index ${i} complete.`);

        bundles.splice(i, 1);
        i -= 1;
        bundle.callback(bundle.asset);
      }
    }
    if (DEBUG) console.log(`${FILENAME}: Remaining bundles after: ${bundles.length}`);
  }

  /**
     * Assets are of form
     *
     * { images: [urls...], audio: [urls...]
     */
  function load(categories, callback) {
    if (DEBUG) console.log(`${FILENAME}: Loading stuff...`);
    if (DEBUG && VERBOSE) console.log(`${FILENAME}: Loading:`, JSON.stringify(categories));

    // TODO: probably doesn't work
    if (!categories) {
      if (callback) {
        callback(null);
      }
      return;
    }

    // Create a bundle
    const bundle = {
      category: {},
      size: 0,
      count: 0,
      callback,
      asset: {},
      lut: {},
    };

    // Load into bundle
    for (let i = 0; i < _catname.length; i += 1) {
      const catname = _catname[i];
      const urls = categories[catname];

      if (!urls) continue;

      // if (!categories.hasOwnProperty(catname)) continue;

      for (let j = 0; j < urls.length; j += 1) {
        bundle.lut[urls[j]] = true;
      }

      bundle.size += urls.length;
      bundle.category[catname] = urls;
    }

    // Check if bundle is empty
    if (bundle.size === 0) {
      if (DEBUG) console.log(`${FILENAME}: Bundle is empty.`);
      if (callback) callback(null);
      return;
    }

    if (DEBUG) console.log(`${FILENAME}: Adding bundle with ${bundle.size} elements.`);

    // Push to bundles.
    bundles.push(bundle);

    const categoryNames = Object.keys(bundle.category);
    if (DEBUG) console.log(`${FILENAME}: Category names requested:`, categoryNames);

    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      const urls = bundle.category[categoryName];
      for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i];
        if (!processor[categoryName]) throw Error('CATEGORY NOT SUPPORTED: ', categoryName);
        processor[categoryName](url, assetTick);
      }
    }
  }

  const returnObject = {};

  returnObject.load = load;

  if (DEBUG) returnObject.debug = {
    bundles,
  };

  return returnObject;
}());
