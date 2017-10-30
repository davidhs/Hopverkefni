'use strict';

// obj can be canvas or image
function FastImage(obj) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  this._ = {
    canvas,
    ctx,
  };

  this.update(obj);
}


FastImage.prototype.width = 0;
FastImage.prototype.height = 0;


FastImage.prototype.getImage = function () {
  return this._.canvas;
};

FastImage.prototype.crop = function (x, y, w, h) {
  const iw = this._.canvas.width;
  const ih = this._.canvas.height;


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
  ctx.drawImage(this._.canvas, x, y, w, h, 0, 0, w, h);

  return new FastImage(canvas);
};


FastImage.prototype.update = function (obj) {
  const canvas = this._.canvas;
  let ctx = this._.ctx;

  const width = obj.width;
  const height = obj.height;


  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    this.width = width;
    this.height = height;

    ctx = canvas.getContext('2d');
    this._.ctx = ctx;
  }


  if (obj instanceof FastImage) {
    ctx.drawImage(obj.getImage(), 0, 0, width, height);
  } else {
    ctx.drawImage(obj, 0, 0, width, height);
  }
};

FastImage.prototype.copy = function () {
  const h = this._.canvas.width;
  const ih = this._.canvas.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(this._.canvas, 0, 0, w, h);

  return new FastImage(canvas);
};

FastImage.prototype.render = function (ctx, x, y, w, h) {
  x = x || 0;
  y = y || 0;

  w = w || this._.canvas.width;
  h = h || this._.canvas.height;

  if (w === this._.canvas.width && h === this._.canvas.height) {
    ctx.drawImage(this._.canvas, x, y);
  } else {
    ctx.drawImage(this._.canvas, x, y);
  }
};
