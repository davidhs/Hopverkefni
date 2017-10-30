'use strict';

const g_sprites = {};


const g_debugCanvas = document.createElement('canvas');


const DEBUG = false;


const fOcclusionMap = function (canvas) {
  function occluder(rgba1, rgba2) {
    const r = rgba1.r;
    const g = rgba1.g;
    const b = rgba1.b;
    const a = rgba1.a;

    const threshold = 1;

    let brightness = 255;

    if (r <= threshold || g <= threshold || b <= threshold) {
      brightness = 0;
    }


    const tr = 0;
    const tg = 0;
    const tb = 0;
    const ta = brightness;

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
    x: g_canvas.width / 2,
    y: g_canvas.height / 2,
    // x: g_mouse.x,
    // y: g_mouse.y,
    w,
    h,
    scaler: 0.25,
  };

  const color = {
    r: 232,
    g: 217,
    b: 255,
  };


  lighting.radialLight(bctx, color, cfg);

  const selection = 3;

  if (DEBUG) {
    const dctx = g_debugCanvas.getContext('2d');
    dctx.fillStyle = '#f00';
    dctx.fillRect(0, 0, w, h);

    if (selection === 0) {
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_background, 0, 0);


      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);

      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_midground, 0, 0);
      dctx.drawImage(g_foreground, 0, 0);
    } else if (selection === 1) {
      const shadowMask = shadows.getShadowMask(cfg);
      const shadowCanvas = shadowMask.canvas;

      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_background, 0, 0);


      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(g_midground, 0, 0);
      dctx.drawImage(g_foreground, 0, 0);


      dctx.globalCompositeOperation = 'exclusion';
      dctx.drawImage(shadowCanvas, 0, 0);
    } else if (selection === 2) {
      dctx.globalAlpha = 1.0;
      dctx.drawImage(g_occlusion, 0, 0);
    } else if (selection === 3) {
      dctx.globalAlpha = 1.0;
      dctx.globalCompositeOperation = 'source-over';
      dctx.drawImage(buffer, 0, 0);
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


// Global Assets
let g_asset = {}; // Assets are loaded here.

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


  for (const prop in g_url) {
    if (!g_url.hasOwnProperty(prop)) continue;
    const url = g_url[prop];
    g_asset[prop] = resp[url];
  }

  // WORLD

  // VIEWPOERT
  g_viewport.width = g_canvas.width;
  g_viewport.height = g_canvas.height;

  // TEXTURE ATLAS

  g_asset.textureAtlas = {};

  g_asset.textureAtlas.dungeon = new TextureAtlas(g_asset.dungeon, 16, 16);

  g_asset.textureAtlas.explosion = new TextureAtlas(g_asset.explosion, 100, 100, 9 * 9 - 7);

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


  entityManager.init();


  shadows.init(
    g_asset.lights,
    g_asset.shadowMap,
    g_asset.shadowMask,
  );

  g_main.mainInit();
}

// --- ASSETS ---------------------------------------------------


// Global URLs
let g_url = {}; // URLs are eventually placed here.


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
      bullet: 'bullet.png',
      rifle: 'survivor-shoot_rifle_0.png',
    }),
  );

  // --- AUDIO ---

  util.extendObject(
    url_audio,
    util.prefixStrings('audio/', {}),
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
