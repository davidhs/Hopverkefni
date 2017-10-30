'use strict';

function Texture(obj) {
  obj.scale = obj.scale || 1;

  this._ = {
    image: obj.image,
    scale: obj.scale,
  };

  this.resize(obj.width, obj.height);
}

Texture.prototype.resize = function (textureWidth, textureHeight) {
  this._.width = textureWidth;
  this._.height = textureHeight;

  const image = this._.image;
  const scale = this._.scale;

  const w = image.width;
  const h = image.height;

  const dw = scale * w;
  const dh = scale * h;

  const m = 1 + ~~(textureHeight / dh);
  const n = 1 + ~~(textureWidth / dw);

  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < m; i++) {
    const y = i * dh;
    for (let j = 0; j < n; j++) {
      const x = j * dw;

      ctx.drawImage(
        image.getImage(),
        0, 0, w, h,
        x, y, dw, dh,
      );
    }
  }

  this._.texture = new FastImage(canvas);
};

Texture.prototype.getTexture = function () {
  return this._.texture;
};

Texture.prototype.render = function (ctx, cfg) {
  var x = x || 0;
  var y = y || 0;

  var w = w || this._.texture.width;
  var h = h || this._.texture.height;


  var x = -g_viewport.getX();
  var y = -g_viewport.getY();


  // console.log(g_viewport.getX(), g_viewport.getY());

  ctx.drawImage(this._.texture.getImage(), x, y);
};
