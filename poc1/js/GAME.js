'use strict';

/* global document util entityManager g_viewport g_canvas g_mouse lighting
shadows TextureAtlas Sprite g_main spatialManager FastImage assetManager
g_world Texture  :true */

const g_sprites = {};
const g_debugCanvas = document.createElement('canvas');
const DEBUG = true;
const g_shadowSize = 256;


// Global URLs
const g_url = {}; // URLs are eventually placed here.

// Global Assets
const g_asset = {}; // Assets are loaded here.


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

  g_viewport.setCenterX(entityManager.getPos().cx);
  g_viewport.setCenterY(entityManager.getPos().cy);
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


  buffer.width = w;
  buffer.height = h;
  const bctx = buffer.getContext('2d');


  const cfg = {
    occluder: g_occlusion,
    x: g_mouse.x,
    y: g_mouse.y,
    scaler: 0.25,
  };

  const color = {
    r: 232,
    g: 217,
    b: 255,
  };


  lighting.radialLight(bctx, color, cfg);

  const DEBUG_MODE = {
    UNKNOWN1: 0,
    UNKNOWN2: 1,
    UNKNOWN3: 3,

    ORIGINAL_OCCLUSION_MAP: 10,
    PROJECTED_OCCLUSION_MAP: 11,
    SHADOW_MAP: 12,
    SHADOW_MASK: 13,
  };

  const selection = DEBUG_MODE.PROJECTED_OCCLUSION_MAP;

  if (DEBUG) {
    let _w = g_debugCanvas.width;
    let _h = g_debugCanvas.height;

    const dctx = g_debugCanvas.getContext('2d');
    dctx.fillStyle = '#f00';
    dctx.fillRect(0, 0, _w, _h);

    if (selection === DEBUG_MODE.UNKNOWN1) {
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_background, 0, 0);


      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);

      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_midground, 0, 0);
      dctx.drawImage(g_foreground, 0, 0);
    }

    if (selection === DEBUG_MODE.UNKNOWN2) {
      // Only look at shadow mask
      const shadowMask = shadows.getShadowMask(cfg);
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(shadowMask, 0, 0, g_debugCanvas.width, g_debugCanvas.height);
    }


    if (selection === DEBUG_MODE.UNKNOWN3) {
      dctx.globalAlpha = 1.0;
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);
    }

    // Look at original occlusion map.
    if (selection === DEBUG_MODE.ORIGINAL_OCCLUSION_MAP) {
      dctx.globalAlpha = 1.0;

      _w = shadows.debug.original.canvas.width;
      _h = shadows.debug.original.canvas.height;

      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, _w, _h);

      dctx.drawImage(shadows.debug.original.canvas, 0, 0);
    }

    // Look at projected occlusion map.
    if (selection === DEBUG_MODE.PROJECTED_OCCLUSION_MAP) {
      dctx.globalAlpha = 1.0;

      _w = shadows.debug.projected.canvas.width;
      _h = shadows.debug.projected.canvas.height;

      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, _w, _h);

      dctx.drawImage(shadows.debug.projected.canvas, 0, 0);
    }

    // Look at shadow map
    if (selection === DEBUG_MODE.SHADOW_MAP) {
      dctx.globalAlpha = 1.0;

      _w = shadows.debug.shadowMap.canvas.width;
      _h = shadows.debug.shadowMap.canvas.height;


      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, _w, _h);

      dctx.drawImage(shadows.debug.shadowMap.canvas, 0, 0);
    }

    // Look at shadow mask
    if (selection === DEBUG_MODE.SHADOW_MASK) {
      dctx.globalAlpha = 1.0;

      _w = shadows.debug.shadowMask.canvas.width;
      _h = shadows.debug.shadowMask.canvas.height;

      dctx.fillStyle = '#00f';
      dctx.fillRect(0, 0, _w, _h);

      dctx.drawImage(shadows.debug.shadowMask.canvas, 0, 0);
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


// ======
// ASSETS
// ======


function processAssets(resp) {
  if (DEBUG) {
    g_debugCanvas.width = g_canvas.width;
    g_debugCanvas.height = g_canvas.height;
    document.getElementById('canvi').appendChild(g_debugCanvas);
  }


  g_background.width = g_canvas.width;
  g_background.height = g_canvas.height;

  g_midground.width = g_canvas.width;
  g_midground.height = g_canvas.height;

  g_foreground.width = g_canvas.width;
  g_foreground.height = g_canvas.height;

  g_occlusion.width = g_canvas.width;
  g_occlusion.height = g_canvas.height;


  for (let i = 0, keys = Object.keys(g_url); i < keys.length; i += 1) {
    const url = g_url[keys[i]];
    g_asset[keys[i]] = resp[url];
  }

  // WORLD

  // VIEWPOERT
  g_viewport.width = g_canvas.width;
  g_viewport.height = g_canvas.height;

  // TEXTURE ATLAS

  g_asset.textureAtlas = {};

  g_asset.textureAtlas.dungeon = new TextureAtlas(g_asset.dungeon, 16, 16);

  g_asset.textureAtlas.explosion = new TextureAtlas(g_asset.explosion, 100, 100, (9 * 9) - 7);

  g_asset.textureAtlas.blood = new TextureAtlas(g_asset.blood, 512, 512);

  // TEXTURE

  g_asset.texture = {};

  g_asset.texture.background = new Texture({
    image: g_asset.textureAtlas.dungeon.getSubimage(1, 1),
    scale: 4,
    width: g_world.width,
    height: g_world.height,
  });

  // SEQUENCE

  g_asset.sequence = {};

  g_asset.sequence.explosion = g_asset.textureAtlas.explosion.getSequence({
    rowFirst: true,
    LR: true,
    TB: true,
    qty: g_asset.textureAtlas.explosion.nrOfSubimages,
  });

  g_mouse.setFastImage(new FastImage(g_asset.cursor));

  // SPRITES

  g_asset.sprite = {};

  g_asset.sprite.rock = new Sprite(g_asset.rock);

  g_asset.sprite.bullet = new Sprite(g_asset.bullet);
  g_asset.sprite.bullet.scale = 0.15;

  g_asset.sprite.player = new Sprite(g_asset.rifle);
  g_asset.sprite.player.scale = 0.1;

  g_asset.sprite.blood = new Sprite(g_asset.blood);

  entityManager.init();


  shadows.init(
    g_asset.lights,
    g_asset.shadowMap,
    g_asset.shadowMask,
    g_shadowSize,
  );


  spatialManager.init();

  g_main.mainInit();
}

// --- ASSETS ---------------------------------------------------


function setup() {
  const url_text = {};
  const url_images = {};
  const url_audio = {};

  // --- TEXT ---

  // Shaders
  util.extendObject(
    url_text,
    util.prefixStrings('glsl/', {
      lights: 'lights.vert', // vertexShader
      shadowMap: 'shadowMap.frag', // fragmentShader
      shadowMask: 'shadowMask.frag', // shadowRender
    }),
  );

  // --- IMAGES ---

  util.extendObject(
    url_images,
    util.prefixStrings('img/', {
      cursor: 'cursor.png',
      dungeon: 'dungeonTileset.png',
      explosion: 'spritesheet1.png',
      rock: 'rock.png',
      blood: 'blood.png',
      bullet: 'bullet.png',
      rifle: 'survivor-shoot_rifle_0.png',
      blockMap: 'block-map.png',
    }),
  );

  // --- AUDIO ---

  util.extendObject(
    url_audio,
    util.prefixStrings('audio/', {
      bulletFire: 'bulletFire.ogg',
      bulletZapped: 'bulletZapped.ogg',
      rockEvapoate: 'rockEvaporate.ogg',
      rockSplit: 'rockSplit.ogg',
    }),
  );

  util.extendObject(g_url, url_text);
  util.extendObject(g_url, url_images);
  util.extendObject(g_url, url_audio);

  assetManager.load({
    text: util.objPropsToList(url_text),
    image: util.objPropsToList(url_images),
    audio: util.objPropsToList(url_audio),
  }, processAssets);
}


setup();
