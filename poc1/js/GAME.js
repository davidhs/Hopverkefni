'use strict';

/* global document util entityManager g_viewport g_canvas g_mouse lighting
shadows TextureAtlas Sprite g_main spatialManager FastImage assetManager
g_world Texture  :true */

// ====
// GAME
// ====

// Global URLs
let g_url = {}; // URLs are eventually placed here.

// Global Assets
let g_asset = {}; // Assets are loaded here.

// Which map to open.
const chosenMap = 'map2';

// Map information
let g_master;

// The resolution of the shadow.
let g_shadowSize;

// Temporary stuff occlude walls.  TODO: remove me later
let g_testWOM;

// Canvases (except g_canvas).
const g_background = document.createElement('canvas'); // Background
const g_midground = document.createElement('canvas'); // Midground
const g_foreground = document.createElement('canvas'); // Foreground

const g_occlusion = document.createElement('canvas'); // Occlusion map
const g_shadows = document.createElement('canvas'); // Shadows

const g_debugGAME = {};

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
  // Update entities.
  entityManager.update(du);

  // Set viewport to follow player.
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

function renderSimulation(ctx) {
  // === SETUP & CLEARING ===

  // Get 2D contexts for canvases.
  const ctxb = g_background.getContext('2d');
  const ctxm = g_midground.getContext('2d');
  const ctxf = g_foreground.getContext('2d');
  const ctxo = g_occlusion.getContext('2d'); // Occlusion map context
  const ctxs = g_shadows.getContext('2d'); // Shadows context

  // Width and height of rendering canvases.
  const w = g_canvas.width;
  const h = g_canvas.height;

  // Clear canvases.
  ctxb.clearRect(0, 0, w, h);
  ctxm.clearRect(0, 0, w, h);
  ctxf.clearRect(0, 0, w, h);
  ctxo.clearRect(0, 0, w, h);
  ctxs.clearRect(0, 0, w, h);

  // Clear rendering canvas.
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  // === DRAWING TO VARIOUS CANVASES ===

  // --- BACKGROUND ---

  // Draw background.  TODO: remove later
  g_asset.texture.background.render(ctxb);

  // Draw alpha 0 background.  TODO: remove later
  ctxb.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // --- MIDGROUND ----

  // Draw entities to midground.
  entityManager.render(ctxm);

  // --- FOREGROUND ---

  // Draw Cursor
  if (g_mouse.getFastImage()) {
    g_mouse.render(ctxf);
  }

  // === OCCLUSION ===

  // Add entities to occlusion map.
  entityManager.render(ctxo, {
    occlusion: true,
  });

  // Add "walls" to occlusion map.  TODO: remove later.
  ctxo.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // === SHADOWS ===

  // Draw the light.
  //
  // NB: color doesn't work and the blending doesn't
  // work very well.
  lighting.radialLight(ctxs, {
    r: 232,
    g: 217,
    b: 255,
  }, {
    occluder: g_occlusion,
    x: g_canvas.width / 2,
    y: g_canvas.height / 2,
  });

  // === DEBUG ===

  // Draw debug stuff.
  g_debugGAME.render(ctx);

  // === DRAW TO RENDERING CANVAS ===

  // --- DRAW BACKGROUND ---
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(g_background, 0, 0);

  // --- DRAW LIGHTS/SHADOWS ---
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(g_shadows, 0, 0, w, h);

  // --- DRAW MIDGROUND ---
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(g_midground, 0, 0);

  // --- DRAW FOREGROUND ---
  ctx.drawImage(g_foreground, 0, 0);
}


function setup(response) {
  // Unroll response.
  const map = response.map;
  const assets = response.assets;
  const raw = response.raw;
  const urls = response.urls;

  // Store response in g_master.
  g_master = response;

  // Set canvas width and heights.
  g_background.width = g_canvas.width;
  g_background.height = g_canvas.height;

  g_midground.width = g_canvas.width;
  g_midground.height = g_canvas.height;

  g_foreground.width = g_canvas.width;
  g_foreground.height = g_canvas.height;

  g_occlusion.width = g_canvas.width;
  g_occlusion.height = g_canvas.height;

  g_shadows.width = g_canvas.width;
  g_shadows.height = g_canvas.height;

  // Init debug
  g_debugGAME.init();

  // Set g_url.
  g_url = response.urls;

  // Set g_asset
  g_asset = response.assets;

  const stuff = {};

  for (let i = 0, keys = Object.keys(urls); i < keys.length; i += 1) {
    const name = keys[i];
    const url = urls[name];

    stuff[url] = raw[name];
  }

  util.extendObject(g_asset, raw);
  util.extendObject(g_asset, assets);

  // --- Mouse ---

  // Set mouse cursor image.
  if (g_master.map.mouse.image) {
    g_mouse.setFastImage(mapHandler.getItem(g_master, g_master.map.mouse.image));
  }

  // Enable cursor lock, if applicable.
  if (g_master.map.mouse.cursorLock) {
    g_mouse.enableCursorLock();
  }

  // --- Entity Manager ---

  // Assign a player a sprite image.
  entityManager.generatePlayer({
    sprite: mapHandler.getItem(g_master, map.init.entities.player.sprite.path),
  });

  // Initialize entity manager.
  entityManager.init();

  // --- Shadows ---

  // Initialize shadows: load in shader source code and
  // resolution of shadow.
  shadows.init(
    g_asset.lights,
    g_asset.shadowMap,
    g_asset.shadowMask,
    g_shadowSize,
  );

  // --- Spatial Manager ---

  // Initialize spatial manager.
  spatialManager.init();

  // Temporary occlusion map from spatial manager.  TODO: remove later.
  g_testWOM = spatialManager.getWallOcclusionMap();

  // --- Start Game ---

  // Start game!
  g_main.mainInit();
}


// =========================
// DEBUG STUFF, REMOVE LATER
// =========================

// Eughh...
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

const g_debug = {};

const g_debugCanvas = document.createElement('canvas');
const DEBUG = false;

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


g_debugGAME.init = () => {};

g_debugGAME.render = (ctx) => {
  if (!DEBUG) return;

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
      dctx.drawImage(g_shadows, 0, 0);

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
      dctx.drawImage(g_shadows, 0, 0);
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
};

// ==========
// START GAME
// ==========

mapHandler.openMap(chosenMap, setup);
