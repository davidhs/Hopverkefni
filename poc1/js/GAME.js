'use strict';

/* global document util entityManager g_viewport g_canvas g_mouse lighting
shadows TextureAtlas Sprite g_main spatialManager FastImage assetManager
g_world Texture  :true */

const g_sprites = {};
const g_debugCanvas = document.createElement('canvas');
const DEBUG = false;

let g_testWOM;

let chosenMap = "map2";

let g_master;
let g_shadowSize;


const g_debug = {};

g_debug.DEBUG_MODE = {
  UNKNOWN1: 0,
  UNKNOWN2: 1,
  UNKNOWN3: 3,
  ORIGINAL_OCCLUSION_MAP: 10,
  PROJECTED_OCCLUSION_MAP: 11,
  SHADOW_MAP: 12,
  SHADOW_MASK: 13,
};

g_debug.selection = g_debug.PROJECTED_OCCLUSION_MAP;

// Global URLs
let g_url = {}; // URLs are eventually placed here.

// Global Assets
let g_asset = {}; // Assets are loaded here.


const fOcclusionMap = function (canvas) {
  function occluder(rgba1, rgba2) {
    const rgbaInit = [rgba1.r, rgba1.g, rgba1.b, rgba1.a];
    const [r, g, b, a] = rgbaInit;

    const threshold = 1;

    let brightness = 255;

    if (r <= threshold || g <= threshold || b <= threshold) {
      brightness = 0;
    }

    const tRgba = [0, 0, 0, brightness];
    const [tr, tg, tb, ta] = tRgba;

    rgba2.r = tr;
    rgba2.g = tg;
    rgba2.b = tb;
    rgba2.a = ta;
  }

  return util.forAllPixels(canvas, occluder);
};


// =============
// GATHER INPUTS
// =============

function gatherInputs() {}

// =================
// UPDATE SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `update` routine handles generic stuff such as
// pausing, single-step, and time-handling.
//
// It then delegates the game-specific logic to `updateSimulation`


// GAME-SPECIFIC UPDATE LOGIC


function updateSimulation(du) {
  entityManager.update(du);

  g_viewport.setOCX(entityManager.getPos().cx);
  g_viewport.setOCY(entityManager.getPos().cy);
}


// =================
// RENDER SIMULATION
// =================

// We take a very layered approach here...
//
// The primary `render` routine handles generic stuff such as
// the diagnostic toggles (including screen-clearing).
//
// It then delegates the game-specific logic to `gameRender`


// GAME-SPECIFIC RENDERING

const g_background = document.createElement('canvas');
const g_midground = document.createElement('canvas');
const g_foreground = document.createElement('canvas');
const g_occlusion = document.createElement('canvas');


const occ = document.createElement('canvas');
const buffer = document.createElement('canvas');


function renderSimulation(ctx) {
  const ctxb = g_background.getContext('2d');
  const ctxm = g_midground.getContext('2d');
  const ctxf = g_foreground.getContext('2d');
  const ctxo = g_occlusion.getContext('2d');

  const w = g_canvas.width;
  const h = g_canvas.height;

  ctxb.clearRect(0, 0, w, h);
  ctxm.clearRect(0, 0, w, h);
  ctxf.clearRect(0, 0, w, h);
  ctxo.clearRect(0, 0, w, h);


  // Clear world
  // g_world.ctx.clearRect(0, 0, g_world.width, g_world.height);

  // === BACKGROUND ===

  // Draw background
  g_asset.texture.background.render(ctxb);

  ctxb.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // === MIDGROUND ===

  // Draw onto world
  entityManager.render(ctxm);

  // === FOREGROUND ===

  // Draw cursor
  g_mouse.render(ctxf);


  // === OCCLUSION ===


  entityManager.render(ctxo, {
    occlusion: true,
  });


  ctxo.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());


  buffer.width = w;
  buffer.height = h;
  const bctx = buffer.getContext('2d');

  const cfg = {};

  cfg.occluder = g_occlusion;

  if (false) {
    cfg.x = g_mouse.x;
    cfg.y = g_mouse.y;
  } else {
    cfg.x = g_canvas.width / 2;
    cfg.y = g_canvas.height / 2;
  }

  const color = {
    r: 232,
    g: 217,
    b: 255,
  };

  lighting.radialLight(bctx, color, cfg);


  if (DEBUG) {
    const _w = g_debugCanvas.width;
    const _h = g_debugCanvas.height;

    const dctx = g_debugCanvas.getContext('2d');
    g_debugCanvas.width = g_canvas.width;
    g_debugCanvas.height = g_canvas.height;
    dctx.fillStyle = '#f00';
    dctx.fillRect(0, 0, _w, _h);

    if (g_debug.selection === g_debug.DEBUG_MODE.UNKNOWN1) {
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_background, 0, 0);


      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);

      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_midground, 0, 0);
      dctx.drawImage(g_foreground, 0, 0);
    }

    if (g_debug.selection === g_debug.DEBUG_MODE.UNKNOWN2) {
      // Only look at shadow mask
      const shadowMask = shadows.getShadowMask(cfg);
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(shadowMask, 0, 0, g_debugCanvas.width, g_debugCanvas.height);
    }


    if (g_debug.selection === g_debug.DEBUG_MODE.UNKNOWN3) {
      dctx.globalAlpha = 1.0;
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);
    }

    // Look at original occlusion map.
    if (g_debug.selection === g_debug.DEBUG_MODE.ORIGINAL_OCCLUSION_MAP) {
      dctx.globalAlpha = 1.0;

      g_debugCanvas.width = shadows.debug.original.canvas.width;
      g_debugCanvas.height = shadows.debug.original.canvas.height;

      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, g_debugCanvas.width, g_debugCanvas.height);

      dctx.drawImage(shadows.debug.original.canvas, 0, 0);
    }

    // Look at projected occlusion map.
    if (g_debug.selection === g_debug.DEBUG_MODE.PROJECTED_OCCLUSION_MAP) {
      dctx.globalAlpha = 1.0;

      g_debugCanvas.width = shadows.debug.projected.canvas.width;
      g_debugCanvas.height = shadows.debug.projected.canvas.height;


      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, g_debugCanvas.width, g_debugCanvas.height);

      dctx.drawImage(shadows.debug.projected.canvas, 0, 0);
    }

    // Look at shadow map
    if (g_debug.selection === g_debug.DEBUG_MODE.SHADOW_MAP) {
      dctx.globalAlpha = 1.0;

      g_debugCanvas.width = shadows.debug.shadowMap.canvas.width;
      g_debugCanvas.height = shadows.debug.shadowMap.canvas.height;


      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, g_debugCanvas.width, g_debugCanvas.height);

      dctx.drawImage(shadows.debug.shadowMap.canvas, 0, 0);
    }

    // Look at shadow mask
    if (g_debug.selection === g_debug.DEBUG_MODE.SHADOW_MASK) {
      dctx.globalAlpha = 1.0;

      g_debugCanvas.width = shadows.debug.shadowMask.canvas.width;
      g_debugCanvas.height = shadows.debug.shadowMask.canvas.height;

      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, g_debugCanvas.width, g_debugCanvas.height);

      dctx.drawImage(shadows.debug.shadowMask.canvas, 0, 0);
    }

    if (g_debug.selection === 15) {
      const sx = 0;
      const sy = 0;
      const sw = g_testWOM.width;
      const sh = g_testWOM.height;
      const dx = 0;
      const dy = 0;
      const dw = dctx.canvas.width;
      const dh = dctx.canvas.height;
      dctx.drawImage(g_testWOM, sx, sy, sw, sh, dx, dy, dw, dh);
    }
  }


  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);


  // === TO CANVAS ===

  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(g_background, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(buffer, 0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(g_midground, 0, 0);
  ctx.drawImage(g_foreground, 0, 0);
}


mapHandler.openMap(chosenMap, response => {
  const map = response.map;
  const assets = response.assets;
  const raw = response.raw;
  const urls = response.urls;

  g_master = response;
  
  g_background.width = g_canvas.width;
  g_background.height = g_canvas.height;

  g_midground.width = g_canvas.width;
  g_midground.height = g_canvas.height;

  g_foreground.width = g_canvas.width;
  g_foreground.height = g_canvas.height;

  g_occlusion.width = g_canvas.width;
  g_occlusion.height = g_canvas.height;


  g_url = response.urls;
  g_asset = response.assets;

  const stuff = {};

  for (let i = 0, keys = Object.keys(urls); i < keys.length; i += 1) {
    const name = keys[i];
    const url = urls[name];

    stuff[url] = raw[name];
  }

  util.extendObject(g_asset, raw);
  util.extendObject(g_asset, assets);

  ///////
  
  entityManager.generatePlayer({
    sprite: mapHandler.getItem(g_master, map.init.entities.player.sprite.path)
  });
  entityManager.init();


  
  shadows.init(
    g_asset.lights,
    g_asset.shadowMap,
    g_asset.shadowMask,
    g_shadowSize,
  );
  
  
  spatialManager.init();
  
  g_testWOM = spatialManager.getWallOcclusionMap();
  
  g_main.mainInit();

});
