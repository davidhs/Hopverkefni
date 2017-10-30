//'use strict';

// =====
// UTILS
// =====



var util = {
  extendObject: (object, extensions) => {
    for (const property in extensions) {
      if (extensions.hasOwnProperty(property)) {
        object[property] = extensions[property];
      }
    }
  },
};

util.extendObject(util, {
  createPicker: comparator => function (/* arguments */) {
    if (arguments.length === 0) {
      return; // undefined
    }

    let arr;

    if (arguments.length === 1) {
      if (Array.isArray(arguments[0])) {
        arr = arguments[0];
      } else {
        return arguments[0];
      }
    } else {
      arr = arguments;
    }

    let best = arr[0];

    for (let i = 1; i < arr.length; i++) {
      if (comparator(arr[i], best)) {
        best = arr[i];
      }
    }

    return best;
  },
});

util.extendObject(util, {
  pickMin: util.createPicker((a, b) => a < b),
  pickMax: util.createPicker((a, b) => a > b),
  minIndex: (/* arguments */) => arguments.indexOf(util.pickMin(arguments)),
  cropImage: (image, x, y, w, h) => {
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
  },
  clampRange: (value, lowBound, highBound) => {
    if (value < lowBound) {
      value = lowBound;
    } else if (value > highBound) {
      value = highBound;
    }
    return value;
  },
  wrapRange: (value, lowBound, highBound) => {
    // TODO: use remainder operator instead of while loop.
    while (value < lowBound) {
      value += (highBound - lowBound);
    }
    while (value > highBound) {
      value -= (highBound - lowBound);
    }
    return value;
  },
  isBetween: (value, lowBound, highBound) => {
    if (value < lowBound) { return false; }
    if (value > highBound) { return false; }
    return true;
  },
  randRange: (min, max) => (min + Math.random() * (max - min)),
  square: x => (x * x),
  cube: x => (x * x * x),
  distSq: (x1, y1, x2, y2) => (util.square(x2 - x1) + util.square(y2 - y1)),
  wrappedDistSq: (x1, y1, x2, y2, xWrap, yWrap) => {
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);

    if (dx > xWrap / 2) {
      dx = xWrap - dx;
    }

    if (dy > yWrap / 2) {
      dy = yWrap - dy;
    }
    return util.square(dx) + util.square(dy);
  },
  booleanANDArray: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (!arr[i]) {
        return false;
      }
    }

    return true;
  },
  booleanORArray: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        return true;
      }
    }

    return false;
  },
  inBounds: (value, minValue, maxValue) => (value >= minValue) && (value <= maxValue),
  clearCanvas: (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  },
  strokeCircle: (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  },
  fillCircle: (ctx, x, y, r) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  },
  fillBox: (ctx, x, y, w, h, style) => {
    const oldStyle = ctx.fillStyle;
    ctx.fillStyle = style;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = oldStyle;
  },
  clamp: (value, minValue, maxValue) => (value < minValue ? minValue : value > maxValue ? maxValue : value),
  rgb2str: (r, g, b) => {
    r = util.clamp(~~r, 0, 255);
    g = util.clamp(~~g, 0, 255);
    b = util.clamp(~~b, 0, 255);

    return `rgb(${r}, ${g}, ${b})`;
  },
  sgn: x => (x < 0 ? -1 : 1),
});

util.extendObject(util, {
  // Returns a random integer between 0 and range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  },

  // Extends object `object' with properties from
  // object `extensions'.
  extendObject(object, extensions) {
    for (const property in extensions) {
      if (!extensions.hasOwnProperty(property)) continue;
      object[property] = extensions[property];
    }
  },

  // Concatenates prefix to urls
  prefixStrings(prefix, strings) {
    const obj = {};

    for (const key in strings) {
      if (!strings.hasOwnProperty(key)) continue;
      obj[key] = prefix + strings[key];
    }

    return obj;
  },
  // Scale dst according to source but not
  // exceedig max dimensions maxWidth, maxHeight,
  // yet keeping same A/R.
  scale(src, dst, max_width, max_height) {
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
  },

  forAllPixels(canvas, pixelFunction) {
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
  },

  objPropsToList(obj) {
    const l = [];
    for (const prop in obj) {
      if (!obj.hasOwnProperty(prop)) continue;
      l.push(obj[prop]);
    }
    return l;
  },


});
