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
let activeMap; // Defined in init.json
let activeManifest;

// Map information
let g_master;

const screenManager = new UIFrame();


// Canvases (except g_canvas).
const g_background = document.createElement('canvas'); // Background
const g_midground = document.createElement('canvas'); // Midground
const g_foreground = document.createElement('canvas'); // Foreground
const g_top = document.createElement('canvas');
const g_hud = document.createElement('canvas'); // HUD

const g_occlusion = document.createElement('canvas'); // Occlusion map
const g_shadows = document.createElement('canvas'); // Shadows

const g_pre = document.createElement('canvas');


// Alexander
const g_radar = document.createElement('canvas'); // radar
const g_hudbar = document.createElement('canvas');

// document.getElementById('canvi').appendChild(g_occlusion);
// document.getElementById('canvi').appendChild(g_shadows);


// TEMPORARY GLOBALS

// Temporary stuff occlude walls.  TODO: remove me later


let g_tm;

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
  spatialManager.update(du);

  // Update entities.
  entityManager.update(du);

  // Alexander
  Minimap.update(du);

  HUD.update(du);
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
  const ctxh = g_hud.getContext('2d'); // HUD
  const ctxp = g_pre.getContext('2d');
  const ctxt = g_top.getContext('2d');

  // Alexander
  const ctxr = g_radar.getContext('2d'); // radar
  const ctxhb = g_hudbar.getContext('2d'); // HUDBAR


  ctxb.imageSmoothingEnabled = false;
  ctxm.imageSmoothingEnabled = false;
  ctxf.imageSmoothingEnabled = false;
  ctxo.imageSmoothingEnabled = false;
  ctxs.imageSmoothingEnabled = false;
  ctxh.imageSmoothingEnabled = false;
  ctxp.imageSmoothingEnabled = false;
  ctxt.imageSmoothingEnabled = false;
  ctxr.imageSmoothingEnabled = false;
  ctxhb.imageSmoothingEnabled = false;


  // Width and height of rendering canvases.
  const w = g_canvas.width;
  const h = g_canvas.height;

  const player = entityManager.getPlayer();

  // Clear canvases.
  ctx.clearRect(0, 0, w, h);
  ctxb.clearRect(0, 0, w, h);
  ctxm.clearRect(0, 0, w, h);
  ctxf.clearRect(0, 0, w, h);
  ctxo.clearRect(0, 0, w, h);
  ctxs.clearRect(0, 0, w, h);
  ctxh.clearRect(0, 0, w, h);
  ctxp.clearRect(0, 0, w, h);
  ctxt.clearRect(0, 0, w, h);

  // Alexander
  ctxr.clearRect(0, 0, w, h);
  ctxhb.clearRect(0, 0, w, h);


  // === DRAWING TO VARIOUS CANVASES ===

  // --- BACKGROUND ---

  // Draw background.  TODO: remove later
  // g_asset.texture.background.render(ctxb);

  // Render better background.
  g_tm.renderBottom(ctxb);
  g_tm.renderMiddle(ctxb);
  // Draw alpha 0 background.  TODO: remove later
  // ctxb.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // --- MIDGROUND ----

  // Draw entities to midground.
  entityManager.render(ctxm);

  g_tm.renderTop(ctxt);

  // --- FOREGROUND ---


  // === OCCLUSION ===

  // Add entities to occlusion map.
  if (false) {
    entityManager.render(ctxo, {
      occlusion: true,
    });
  }

  g_tm.renderMiddle(ctxo, {
    occlusion: true,
  });

  // Add "walls" to occlusion map.  TODO: remove later.
  // ctxo.drawImage(g_testWOM, -g_viewport.getOX(), -g_viewport.getOY());

  // Alexander

  // === RADAR ===
  Minimap.render(ctxr);

  // === HUDBAR ===

  HUD.render(ctxh);


  // === SHADOWS ===

  const pcx = g_viewport.mapO2IX(player.cx);
  const pcy = g_viewport.mapO2IY(player.cy);


  // Lights!

  const lights = [{
    x: player.cx,
    y: player.cy,
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
  }, {
    x: 78,
    y: 317,
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
  }, {
    x: 570,
    y: 636,
    color: {
      r: 255,
      g: 255,
      b: 255,
    },
  }];

  if (false) {
    lights.push({
      x: g_viewport.mapI2OX(g_mouse.x),
      y: g_viewport.mapI2OY(g_mouse.y),
      color: {
        r: 100,
        g: 27,
        b: 250,
      },
    });
  }

  for (let i = 0; i < lights.length; i += 1) {
    const light = lights[i];
    const x = g_viewport.mapO2IX(light.x);
    const y = g_viewport.mapO2IY(light.y);
    const color = light.color;
    if (g_viewport.inInnerBoundsPoint(x, y, g_viewport.getIW() / 2, g_viewport.getIH() / 2)) {
      lighting.radialLight(ctxs, color, {
        occluder: g_occlusion,
        x,
        y,
      });
    }
  }


  // ctxs.filter = "blur(16px)";
  // ctxs.filter = 'drop-shadow(0 0 100 20)';



  // Subtract occluders from shadow

  ctxs.drawImage(g_occlusion, 0, 0);

  // === HUD ===

  // Draw Cursor
  if (g_mouse.getImage()) {
    g_mouse.render(ctxh);
  }

  // === DRAW TO BACK-RENDERING CANVAS ===

  // --- DRAW BACKGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_background, 0, 0);
  ctxp.globalAlpha = 1.0;
  // --- DRAW FOREGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_foreground, 0, 0);
  ctxp.globalAlpha = 1.0;

  // TEMPORARY
  // --- DRAW MIDGROUND ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_midground, 0, 0);
  ctxp.globalAlpha = 1.0;

  // --- DRAW LIGHTS/SHADOWS ---

  ctxp.globalAlpha = 1.0;
  ctxp.globalCompositeOperation = 'destination-in';
  ctxp.drawImage(g_shadows, 0, 0, w, h);



    ctxp.globalCompositeOperation = 'source-over';
    ctxp.drawImage(g_top, 0, 0);
    ctxp.globalAlpha = 1.0;





  // --- DRAW HUD ---
  ctxp.globalCompositeOperation = 'source-over';
  ctxp.drawImage(g_hud, 0, 0);
  ctxp.globalAlpha = 1.0;


  // === DRAW TO RENDERING CANVAS ===

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(g_pre, 0, 0);

  /*
  ctx.fillstyle = "#000";
  ctx.fillRect(0,0,100,100);
  ctx.drawImage(g_radar); */

  // HUD
/*  ctx.fillstyle = "#ffffff";
  ctx.fillRect(0, g_viewport.getIH() -100, g_viewport.getIW(), 200);
  ctx.drawImage(g_hud, 0, g_viewport.getIH()-100); */


  // util.fillCircle(ctx, pcx, pcy, 10);
}


function setup(response) {
  // console.log('Setting up...');
  // Unroll response.
  const map = response.map;
  const assets = response.assets;


  g_viewport.stickToWorld(true);


  g_muted = map.cfg.muted ? map.cfg.muted : false;

  // Setting world
  g_world.setWidth(map.cfg.world.height, map.cfg.world.unit);
  g_world.setHeight(map.cfg.world.width, map.cfg.world.unit);
  g_world.setTileWidth(map.cfg.tile.width);
  g_world.setTileHeight(map.cfg.tile.height);


  const viewportWidth = activeManifest.cfg.screen.width;
  const viewportHeight = activeManifest.cfg.screen.height;

  // Set "rendering" canvas.
  g_canvas.width = viewportWidth;
  g_canvas.height = viewportHeight;


  // Setting viewport
  g_viewport.setIW(viewportWidth);
  g_viewport.setIH(viewportHeight);

  g_viewport.setOW(viewportWidth);
  g_viewport.setOH(viewportHeight);


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

  g_hud.width = g_canvas.width;
  g_hud.height = g_canvas.height;

  g_pre.width = g_canvas.width;
  g_pre.height = g_canvas.height;

  g_top.width = g_canvas.width;
  g_top.height = g_canvas.height;

  // Init g_url.
  g_url = response.urls;

  // Init g_asset.
  g_asset = response.assets;

  // --- Mouse ---

  // Set mouse cursor image.
  if (g_master.map.mouse.image) {
    g_mouse.setImage(mapHandler.getItem(g_master, g_master.map.mouse.image));
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
    g_asset.raw.text.lights,
    g_asset.raw.text.shadowMap,
    g_asset.raw.text.shadowMask,
    map.cfg.shadowSize ? map.cfg.shadowSize : 64,
  );


  // Experimental
  g_tm = g_asset.tiledMap.tm1;
  // console.log(g_asset);

  // --- Spatial Manager ---

  // Initialize spatial manager.
  spatialManager.init(g_world.getWidth(), g_world.getHeight());


  spatialManager.onready(() => {
    g_tm.addObstructions();
  });


  // Temporary occlusion map from spatial manager.  TODO: remove later.
  // g_testWOM = spatialManager.getWallOcclusionMap();

  // --- Start Game ---

  // Start game!
  g_main.mainInit();
}


// ==========
// START GAME
// ==========

function startGame() {
  // Adding asset loader processors.
  assetLoader.addProcessor('texture', Texture);
  assetLoader.addProcessor('textureAtlas', TextureAtlas);
  assetLoader.addProcessor('sequence', Sequence);
  assetLoader.addProcessor('sprite', Sprite);
  // assetLoader.addProcessor('fastImage', FastImage);
  assetLoader.addProcessor('tiledMap', TiledMap);
  assetLoader.addProcessor('tiledTileset', TiledTileset);

  const canvas = g_canvas;

  // NNEEDS NOT BE HARDCODED!
  // screenManager.setDimensions(640, 480);

  screenManager.setDimensions(800, 600);

  g_canvas.width = screenManager.getWidth();
  g_canvas.height = screenManager.getHeight();

  const mel = (evt) => {
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;

    screenManager.press(x, y);
  };


  canvas.addEventListener('mousedown', mel);

  const ctx = canvas.getContext('2d');

  const startScreen = new UIContainer();

  const list1 = new UIList();

  const button1 = new UIButton('Select Map');
  const button2 = new UIButton('About');
  const button3 = new UIButton('Exit');

  button1.setWidth(300);

  button1.addEventListener('press', (evt) => {
    screenManager.selectCard(1);
    screenManager.render(ctx);
  });

  list1.addChild(button1);
  list1.addChild(button2);
  list1.addChild(new UIBlank());
  list1.addChild(button3);

  startScreen.addChild(list1);

  const mapSelectionScreen = new UIContainer();
  const list2 = new UIList();

  mapSelectionScreen.addChild(list2);

  screenManager.setLayout('card');
  screenManager.addChild(startScreen, 0);
  screenManager.addChild(mapSelectionScreen, 1);

  screenManager.setBackgroundColor('#f0f0f0');
  screenManager.selectCard(0);

  // Event handling

  // TODO this should be loaded first
  mapHandler.getManifest((manifest) => {
    const maps = manifest.maps;

    activeManifest = manifest;

    const w = manifest.cfg.screen.width;
    const h = manifest.cfg.screen.height;

    g_canvas.width = w;
    g_canvas.height = h;

    screenManager.setDimensions(w, h);

    for (let i = 0, keys = Object.keys(maps); i < keys.length; i += 1) {
      const mapKey = keys[i];

      const mapThing = maps[mapKey];

      const mapName = mapThing.name;

      const btn = new UIButton(mapName || mapKey);

      // Except that I do want to create a bunch of functions!
      btn.addEventListener('press', (evt) => {
        canvas.removeEventListener('mousedown', mel);
        mapHandler.openMap(mapKey, setup);
      });
      list2.addChild(btn);
    }

    const button7 = new UIButton('Back');
    list2.addChild(new UIBlank());
    list2.addChild(button7);
    button7.addEventListener('press', (evt) => {
      screenManager.selectCard(0);
      screenManager.render(ctx);
    });


    loader.load({
      image: {
        background1: 'img/scifi_main_menu.jpg',
        background2: 'img/background2.jpg',
      },
    }, (assets) => {
      startScreen.setBackground(assets.image.background1);
      mapSelectionScreen.setBackground(assets.image.background2);
      screenManager.render(ctx);
    });
  });
}

startGame();


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
