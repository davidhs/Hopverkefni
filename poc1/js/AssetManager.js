"use strict";

var assetManager = (function () {

    let CATEGORY_IMAGE = "image";
    let CATEGORY_AUDIO = "audio";

    let bundles = [];

    var processor = {};
    processor[CATEGORY_IMAGE] = getImage;
    processor[CATEGORY_AUDIO] = getAudio;


    // Boolean String Memebership Look-Up Table
    function createBSMLUT(categories) {
      
        let lut = {};
        
        for (let categoryName in categories) {
            if (!categories.hasOwnProperty(categoryName)) continue;

            let category = categories[categoryName];

            for (let itemName in category) {
                if (!category.hasOwnProperty(itemName)) continue;

                let item = category[itemName];
                let url = item.url;

                if (!lut[url]) {
                    lut[url] = {
                        asset: null
                    };
                }
            }
        }
        
        return lut;
    }


    function getImage(url, callback) {
    
        var img = new Image();
    
        img.onload = function (evt) { 
            callback(CATEGORY_IMAGE, img, url);
        };
    
        img.onerror = function (evt) {
            callback(CATEGORY_IMAGE, null, url);
        };
        
        img.src = url;
    }


    function getAudio(url, callback) {
        var audio = new Audio(url);
        callback(CATEGORY_AUDIO, audio, url);
    }


    function assetTick(category, asset, url) {

        // Iterate through bundles
        for (let i = 0; i < bundles.length; i++) {
            let bundle = bundles[i];

            let lut = bundle.bsmlut;
            

            if (lut[url]) {
                lut[url].asset = asset;
                bundle.count++;
            }

            if (bundle.count === bundle.size) {
                bundles.splice(i, 1);
                i--;

                let categories = bundle.categories;
                let callback = bundle.callback;

                for (let categoryName in categories) {
                    if (!categories.hasOwnProperty(categoryName)) continue;

                    let category = categories[categoryName];
                    
                    for (let itemName in category) {
                        if (!category.hasOwnProperty(itemName)) continue;

                        let item = category[itemName];

                        item.asset = lut[item.url].asset;
                    }
                }

                callback();
            }
        }
    }

    /**
     * Assets are of form
     *
     * { images: [urls...], audio: [urls...]
     */
    function load(categories, callback) {

        if (!categories) {
            if (callback) {
                callback();
            }
            return;
        }

        var size = 0;

        for (let categoryName in categories) {
            if (!categories.hasOwnProperty(categoryName)) continue;
            let category = categories[categoryName];
                
            for (let itemName in category) {
                if (!category.hasOwnProperty(itemName)) continue;

                let item = category[itemName];
                size++;
            }
        }

        if (size === 0) {
            if (callback) callback();
            return;
        }

        bundles.push({
            categories: categories,
            bsmlut: createBSMLUT(categories),
            size: size,
            count: 0,
            callback: callback
        });

        for (let categoryName in categories) {
            if (!categories.hasOwnProperty(categoryName)) continue;

            let category = categories[categoryName];

            for (let itemName in category) {
                if (!category.hasOwnProperty(itemName)) continue;

                let item = category[itemName];
                processor[categoryName](item.url, assetTick);
            }
        }
    }

    return {
        load: load
    };
})();