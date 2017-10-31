'use strict';

/* global document shadows  :true */

// This code isn't very good. :/
const lighting = (function () {
  const lightCanvas = document.createElement('canvas');
  const lightCtx = lightCanvas.getContext('2d');

  function radialLight(ctx, color, cfg) {
    const r = color.r || 0;
    const g = color.g || 0;
    const b = color.b || 0;
    const a = color.a || 255;

    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const shadowMask = shadows.getShadowMask(cfg);
    const shadowCanvas = shadowMask.canvas;

    lightCanvas.width = w;
    lightCanvas.height = h;

    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
    lightCtx.fillRect(0, 0, w, h);
    lightCtx.fill();


    lightCtx.globalCompositeOperation = 'destination-in';
    // ctx.drawImage(dom.image_canvas, 0, 0);
    lightCtx.drawImage(shadowCanvas, shadowMask.dx, shadowMask.dy);


    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }

  return {
    radialLight,
  };
}());
