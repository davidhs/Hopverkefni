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


    const x = cfg.x || 0;
    const y = cfg.y || 0;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    const shadowMask = shadows.getShadowMask(cfg);

    lightCanvas.width = w;
    lightCanvas.height = h;

    lightCtx.globalCompositeOperation = 'source-over';
    lightCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
    lightCtx.fillRect(0, 0, w, h);
    lightCtx.fill();

    let xPad = 0;
    let yPad = 0;

    if (w > h) {
      yPad = (w - h) / 2;
      yPad = yPad * shadowMask.height / h;
    } else if (w < h) {
      xPad = (h - w) / 2;
      xPad = xPad * shadowMask.width / w;
    }

    const sx = 0;
    const sy = 0;
    const sw = shadowMask.width;
    const sh = shadowMask.width;

    const s = Math.max(w, h);

    const dx = x - s / 2;
    const dy = y - s / 2;
    const dw = s;
    const dh = s;


    lightCtx.globalCompositeOperation = 'destination-in';
    lightCtx.drawImage(shadowMask, sx, sy, sw, sh, dx, dy, dw, dh);

    const oldGCO = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(lightCanvas, 0, 0);
    ctx.globalCompositeOperation = oldGCO;
  }

  return {
    radialLight,
  };
}());
