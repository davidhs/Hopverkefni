// ============
// SPRITE STUFF
// ============

"use strict";

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// Construct a "sprite" from the given `image`,
//
function Sprite(image) {
    this.image = image;

    this.width = image.width;
    this.height = image.height;
    this.scale = 1;

    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(this.image, 0, 0);

    this.occlusion = fOcclusionMap(canvas);
}

Sprite.prototype.drawAt = function (ctx, x, y) {
    ctx.drawImage(this.image, 
                  x, y);
};

Sprite.prototype.drawCentredAt = function (ctx, cx, cy, rotation, cfg) {
    if (rotation === undefined) rotation = 0;

    cfg = cfg || {};
    
    var w = this.width;
    var h = this.height;

    cx = cx - g_viewport.getX();
    cy = cy - g_viewport.getY();
    

    

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(this.scale, this.scale);

    // drawImage expects "top-left" coords, so we offset our destination
    // coords accordingly, to draw our sprite centred at the origin
    if (cfg.occlusion) {
        ctx.drawImage(this.occlusion, -w/2, -h/2);
    } else {
        ctx.drawImage(this.image, -w/2, -h/2);
    }
    
    
    ctx.restore();
};