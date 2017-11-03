'use strict';

/* global FastImage:true */


/**
 * Uniformly-sized sub-images.
 *
 * TODO: I don't know if it's such a good idea to split a large
 * sprite sheet into 1000 images.
 *
 * https://en.wikipedia.org/wiki/Texture_atlas
 * 
 * {
 *  image, tileWidth, tileHeight, nrOfTiles
 * }
 * 
 * image, subimageWidth, subimageHeight, nrOfSubimages
 */
function TextureAtlas(cfg) {

  let image = cfg.image;
  let canvas, ctx;

  if (image instanceof Image) {
    canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx = canvas.getContext('2d');
    // TODO do I need to clear canvas?
    ctx.drawImage(image, 0, 0);
  } else {
    canvas = image;
    ctx = canvas.getContext('2d');
  }

  // Might be bad.
  ctx.imageSmoothingEnabled = false;
  this.canvas = canvas;

  // Default behavior

  // JavaScript is garbage. If somewhere in the code,
  //
  //   x = 0;
  //
  // And later we set,
  // 
  //   let a = x || 3;
  // 
  // Where the 1 is a default value, then 
  // a evaluates to 3. :(
  this.primaryDirection = util.value(cfg.primaryDirection, 'right');
  this.secondaryDirection = util.value(cfg.secondaryDirection, 'down');
  this.mode = util.value(cfg.mode, 1);
  this.tileWidth = util.value(cfg.tileWidth, 0);
  this.tileHeight = util.value(cfg.tileHeight, 0);
  this.nrOfTiles = util.value(cfg.nrOfTiles, 0);

  if (this.nrOfTiles === 0) {
    const m = Math.ceil(canvas.height / this.tileHeight);
    const n = Math.ceil(canvas.width / this.tileWidth);
    this.rows = m;
    this.cols = n;
    this.nrOfTiles = m * n;
  }

  if (this.mode === 1) {
    image = new FastImage({
      image,
    });
    // OLD BACKWARDS COMPATIBLE
    this.image = image;
    const subimages = [];
    this.subimageWidth = this.tileWidth;
    this.subimageHeight = this.tileHeight;
    const tw = this.tileWidth;
    const th = this.tileHeight;
    const m = this.rows;
    const n = this.cols;
    // Rows
    for (let i = 0; i < m; i += 1) {
      const ty = th * i;
      const row = [];
      // Columns
      for (let j = 0; j < n; j += 1) {
        const tx = tw * j;
        const subimage = image.crop(tx, ty, tw, th);
        row.push(subimage);
      }
      subimages.push(row);
    }
    this.subimages = subimages;
  }
}

TextureAtlas.prototype.tileWidth = 0;
TextureAtlas.prototype.tileHeight = 0;
TextureAtlas.prototype.nrOfTiles = 0;

// OLD

TextureAtlas.prototype.image = null;
TextureAtlas.prototype.subimages = [];
TextureAtlas.prototype.nrOfSubimages = 0;

TextureAtlas.prototype.cols = 0;
TextureAtlas.prototype.rows = 0;

TextureAtlas.prototype.subimageWidth = 0;
TextureAtlas.prototype.subimageHeight = 0;


/**
 * rowFirst
 * LR
 * TB
 */
TextureAtlas.prototype.getSequence = function (cfg) {


  const sequence = [];

  const c1 = cfg.primaryDirection === 'right';
  const c2 = cfg.secondaryDirection === 'down';
  const nrOfTiles = cfg.nrOfTiles;

  if (c1 && c2) {
    const qty = nrOfTiles || this.nrOfTiles;

    let count = 0;

    const m = this.rows;
    const n = this.cols;

    for (let i = 0; i < m; i += 1) {
      for (let j = 0; j < n; j += 1) {
        count += 1;

        sequence.push(this.subimages[i][j]);

        if (count === qty) {
          i = m;
          j = n;
        }
      }
    }
  }

  return sequence;
};

TextureAtlas.prototype.getSubimage = function (row, col) {
  if (row >= this.subimages.length) {
    console.error(this);
    console.error(row, col);
    throw Error();
  } else if (col >= this.subimages[0].length) {
    console.error(this);
    console.error(row, col);
    throw Error();
  }

  return this.subimages[row][col];
};

TextureAtlas.prototype.getIndex = function (tx, ty) {
  return tx + ty * this.cols;
};

TextureAtlas.prototype.renderIndexTile = function (ctx, index, x, y, w, h) {
  
  const tx = index % this.cols;
  const ty = Math.floor(index / this.cols);
  this.renderTile(ctx, tx, ty, x, y, w, h);
};

TextureAtlas.prototype.renderTile = function (ctx, tx, ty, x, y, w, h) {

  // From this canvas
  const sx = tx * this.tileWidth;
  const sy = ty * this.tileHeight;
  const sw = this.tileWidth;
  const sh = this.tileHeight;

  // Into that canvas
  const dx = x;
  const dy = y;
  const dw = w;
  const dh = h;

  ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);
}

TextureAtlas.prototype.renderSubimage = function (ctx, row, col, x, y, w, h) {
  const img = this.getSubimage(row, col);

  if (!img) {
    console.error(row, col, this.subimages);
    throw Error();
  }

  w = w || img.width;
  h = h || img.height;

  // Positively bad.
  ctx.imageSmoothingEnabled = false;

  if (w === img.width && h === img.height) {
    ctx.drawImage(img.getImage(), x, y, w, h);
  } else {
    ctx.drawImage(
      img.getImage(),
      0, 0, img.width, img.height,
      x, y, w, h,
    );
  }
};
