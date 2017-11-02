'use strict';

/* global document fOcclusionMap g_viewport:true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// ============
// SPRITE STUFF
// ============

// Construct a "sprite" from the given `image`,
//
function Sprite(obj) {
  this.image = obj.image;
  if (!this.image) throw Error('Sprite has not image.');
  this.width = this.image.width;
  this.height = this.image.height;

  this.scale = obj.scale || 1.0;


  const canvas = document.createElement('canvas');
  canvas.width = this.image.width;
  canvas.height = this.image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(this.image, 0, 0);

  this.occlusion = fOcclusionMap(canvas);
}

Sprite.prototype.biasX = 0;
Sprite.prototype.biasY = 0;

Sprite.prototype.drawAt = function (ctx, x, y) {
  ctx.drawImage(
    this.image,
    x, y,
  );
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation, cfg) {
  if (rotation === undefined) rotation = 0;

  cfg = cfg || {};

  const w = this.width;
  const h = this.height;

  cx -= g_viewport.getOX();
  cy -= g_viewport.getOY();


  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.scale(this.scale, this.scale);

  // drawImage expects "top-left" coords, so we offset our destination
  // coords accordingly, to draw our sprite centred at the origin
  if (cfg.occlusion) {
    ctx.drawImage(this.occlusion, -w / 2, -h / 2);
  } else {
    ctx.drawImage(this.image, -w / 2, -h / 2);
  }


  ctx.restore();
};
