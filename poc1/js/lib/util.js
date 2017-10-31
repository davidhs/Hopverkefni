// 'use strict';

/* global document Image :true */

// =====
// UTILS
// =====

const util = (function () {
  const util = {};

  util.extendObject = (object, extensions) => {
    for (let i = 0, keys = Object.keys(extensions); i < keys.length; i += 1) {
      object[keys[i]] = extensions[keys[i]];
    }
  };


  util.createPicker = comparator => function (...args) {
    if (args.length === 0) {
      return undefined; // undefined
    }

    let arr;

    if (args.length === 1) {
      if (Array.isArray(args[0])) {
        arr = args[0];
      } else {
        return args[0];
      }
    } else {
      arr = args;
    }

    let best = arr[0];

    for (let i = 1; i < arr.length; i += 1) {
      if (comparator(arr[i], best)) {
        best = arr[i];
      }
    }

    return best;
  };


  util.pickMin = util.createPicker((a, b) => a < b);
  util.pickMax = util.createPicker((a, b) => a > b);
  util.minIndex = (...args) => args.indexOf(util.pickMin(args));

  util.cropImage = (image, x, y, w, h) => {
    const iw = image.width;
    const ih = image.height;

    if (true) {
      // All of these should be true
      const condArr = [
        util.inBounds(x, 0, iw),
        util.inBounds(y, 0, ih),

        util.inBounds(w, 0, iw),
        util.inBounds(h, 0, ih),

        util.inBounds(x + w, 0, iw),
        util.inBounds(y + h, 0, ih),
      ];

      if (!util.booleanANDArray(condArr)) {
        console.error(image);
        console.error(iw, ih);
        console.error(x, y, w, h);
        console.error(condArr);
        throw Error();
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

    const newImage = new Image();
    newImage.src = canvas.toDataURL('image/png');

    return newImage;
  };

  util.clampRange = (value, lowBound, highBound) => {
    if (value < lowBound) {
      value = lowBound;
    } else if (value > highBound) {
      value = highBound;
    }
    return value;
  };

  util.wrapRange = (value, lowBound, highBound) => {
    // TODO: use remainder operator instead of while loop.
    while (value < lowBound) {
      value += (highBound - lowBound);
    }
    while (value > highBound) {
      value -= (highBound - lowBound);
    }
    return value;
  };

  util.isBetween = (value, lowBound, highBound) => {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
  };

  util.randRange = (min, max) => (min + Math.random() * (max - min));

  util.square = x => (x * x);

  util.cube = x => (x * x * x);

  util.distSq = (x1, y1, x2, y2) => (util.square(x2 - x1) + util.square(y2 - y1));

  util.wrappedDistSq = (x1, y1, x2, y2, xWrap, yWrap) => {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    if (dx > xWrap / 2) {
      dx = xWrap - dx;
    }

    if (dy > yWrap / 2) {
      dy = yWrap - dy;
    }
    return util.square(dx) + util.square(dy);
  };

  util.booleanANDArray = (arr) => {
    for (let i = 0; i < arr.length; i += 1) {
      if (!arr[i]) {
        return false;
      }
    }

    return true;
  };

  util.booleanORArray = (arr) => {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i]) {
        return true;
      }
    }

    return false;
  };

  util.inBounds = (value, minValue, maxValue) => (value >= minValue) && (value <= maxValue);

  util.clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  util.strokeCircle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  util.strokeRect = (ctx, x, y, w, h) => {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
  };

  util.fillCircle = (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  util.fillBox = (ctx, x, y, w, h, style) => {
    const oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
  };

  util.clamp = (value, minValue, maxValue) => {
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;
    return value;
  };

  util.rgb2str = (r, g, b) => {
    r = util.clamp(Math.floor(r), 0, 255);
    g = util.clamp(Math.floor(g), 0, 255);
    b = util.clamp(Math.floor(b), 0, 255);

    return `rgb(${r}, ${g}, ${b})`;
  };

  util.sgn = x => (x < 0 ? -1 : 1);


  // Returns a random integer between 0 and range - 1.
  util.randomInt = range => Math.floor(Math.random() * range);

  // Concatenates prefix to urls
  util.prefixStrings = (prefix, strings) => {
    const obj = {};

    for (let i = 0, keys = Object.keys(strings); i < keys.length; i += 1) {
      const key = keys[i];
      obj[key] = prefix + strings[key];
    }

    return obj;
  };

  // Scale dst according to source but not
  // exceedig max dimensions maxWidth, maxHeight,
  // yet keeping same A/R.
  util.scale = (src, dst, max_width, max_height) => {
    const w = src.width;
    const h = src.height;

    max_width = max_width || w;
    max_height = max_height || h;

    const mw = max_width;
    const mh = max_height;

    const sw = mw / w;
    const sh = mh / h;

    const s = Math.min(sw, sh);

    dst.width = w * s;
    dst.height = h * s;
  };

  util.forAllPixels = (canvas, pixelFunction) => {
    const w = canvas.width;
    const h = canvas.height;


    const rgba1 = {
      r: 0, g: 255, b: 0, a: 127,
    };
    const rgba2 = {
      r: 0, g: 0, b: 255, a: 127,
    };


    const data = canvas.getContext('2d').getImageData(0, 0, w, h).data;

    const canvas2 = document.createElement('canvas');
    canvas2.width = w;
    canvas2.height = h;
    const ctx = canvas2.getContext('2d');
    const imageData = ctx.getImageData(0, 0, w, h);
    const data2 = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      rgba1.r = data[i + 0];
      rgba1.g = data[i + 1];
      rgba1.b = data[i + 2];
      rgba1.a = data[i + 3];

      pixelFunction(rgba1, rgba2);

      data2[i + 0] = rgba2.r;
      data2[i + 1] = rgba2.g;
      data2[i + 2] = rgba2.b;
      data2[i + 3] = rgba2.a;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas2;
  };

  util.objPropsToList = (obj) => {
    const l = [];
    for (let i = 0, keys = Object.keys(obj); i < keys.length; i += 1) {
      const key = keys[i];
      l.push(obj[key]);
    }

    return l;
  };


  return util;
})();
