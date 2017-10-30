// Asset manager

'use strict';

/* jslint browser: true, devel: true, white: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// The asset manager lets you load multiple assets of different types,
// here image and text are useful types.  Once all assets have been loaded
// the supplied callback is called.
const assetManager = (function () {
  // Types of assets this manager supports.
  const _catname = ['image', 'audio', 'text'];

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

    img.onload = function (evt) {
      callback(img, url);
    };

    img.onerror = function (evt) {
      callback(null, url);
    };

    img.src = url;
  };

  // Process audio, most likely not needed.
  processor.audio = function (url, callback) {
    const audio = new Audio(url);
    callback(audio, url);
  };

  // Processes text
  processor.text = function (url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.responseText, url);
      } else {
        callback(null, url);
      }
    };
    xhr.send();
  };

  // Each time an asset has been loaded this function
  // is called.
  function assetTick(asset, url) {
    for (let i = 0; i < bundles.length; i++) {
      const bundle = bundles[i];
      const lut = bundle.lut;

      // Check if this bundle has been waiting
      // for this URL
      if (lut[url]) {
        lut[url] = false;
        bundle.count++;
        bundle.asset[url] = asset;
      }

      // If all assets are loaded in the
      // bundle, call callback with
      // assets.
      if (bundle.count === bundle.size) {
        delete bundles[i];

        bundles.splice(i, 1);
        i--;

        bundle.callback(bundle.asset);
      }
    }
  }

  /**
     * Assets are of form
     *
     * { images: [urls...], audio: [urls...]
     */
  function load(categories, callback) {
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
    for (let i = 0; i < _catname.length; i++) {
      const catname = _catname[i];

      if (!categories.hasOwnProperty(catname)) continue;

      const urls = categories[catname];
      for (let j = 0; j < urls.length; j++) {
        bundle.lut[urls[j]] = true;
      }

      bundle.size += urls.length;
      bundle.category[catname] = urls;
    }

    // Check if bundle is empty
    if (bundle.size === 0) {
      if (callback) callback(null);
      return;
    }

    // Push to bundles.
    bundles.push(bundle);

    // Process bundle
    for (const categoryName in bundle.category) {
      if (!bundle.category.hasOwnProperty(categoryName)) continue;

      const urls = bundle.category[categoryName];
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        processor[categoryName](url, assetTick);
      }
    }
  }

  return {
    load,
  };
}());
