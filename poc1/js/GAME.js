"use strict";

var g_sprites = {};

// ======
// ASSETS
// ======

var g_asset = {
    image: {
        cursor: {
            url: "img/cursor.png"
        },
        dungeon: {
            url: 'img/dungeonTileset.png'
        },
        explosion: {
            url: "img/spritesheet1.png"
        },
        rock: {
            url: "img/rock.png"
        },
        bullet: {
            url: "img/bullet.png"
        },
        rifle: {
            url: "img/survivor-shoot_rifle_0.png"
        }
    },
    audio: {}
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

function renderSimulation(cctx) {

    // Draw onto world context
    var wctx = g_world.ctx;


    // Clear canvas
    cctx.fillStyle = "#000";
    cctx.fillRect(0, 0, g_canvas.width, g_canvas.height);
    
    // Clear world
    g_world.ctx.clearRect(0, 0, g_world.width, g_world.height);

    // Draw background
    g_asset.texture.background.render(wctx);

    // Draw onto world
    entityManager.render(wctx);

    // Draw cursor
    g_mouse.render(wctx);

    // Draw onto canvas.

    var vp = g_viewport;

    vp.cx = entityManager.getPos().cx;
    vp.cy = entityManager.getPos().cy;

    // Source: g_world.canvas
    var sx = vp.cx - vp.width / 2;
    var sy = vp.cy - vp.height / 2;
    var sw = vp.width;
    var sh = vp.height;

    // Destination: g_canvas
    var dx = 0;
    var dy = 0;
    var dw = g_canvas.width;
    var dh = g_canvas.height;

    cctx.drawImage(
        g_world.canvas,
        sx, sy, sw, sh,
        dx, dy, dw, dh
    );
}

assetManager.load(
g_asset, 
() => {

    // WORLD

    // VIEWPOERT
    g_viewport.width = g_canvas.width;
    g_viewport.height = g_canvas.height;

    // TEXTURE ATLAS

    g_asset.textureAtlas = {};

    g_asset.textureAtlas.dungeon = new TextureAtlas(
        g_asset.image.dungeon.asset, 16, 16
    );

    g_asset.textureAtlas.explosion = new TextureAtlas(
        g_asset.image.explosion.asset, 100, 100, 9 * 9 - 7
    );

    // TEXTURE

    g_asset.texture = {};

    g_asset.texture.background = new Texture({
        image: g_asset.textureAtlas.dungeon.getSubimage(1, 1),
        scale: 4,
        width: g_world.width,
        height: g_world.height
    });

    // SEQUENCE

    g_asset.sequence = {};

    g_asset.sequence.explosion = g_asset.textureAtlas.explosion.getSequence({
        rowFirst: true,
        LR: true,
        TB: true,
        qty: g_asset.textureAtlas.explosion.nrOfSubimages
    });

    g_mouse.setFastImage(new FastImage(g_asset.image.cursor.asset));

    // SPRITES

    g_asset.sprite = {};

    g_asset.sprite.rock = new Sprite(g_asset.image.rock.asset);

    g_asset.sprite.bullet = new Sprite(g_asset.image.bullet.asset);
    g_asset.sprite.bullet.scale = 0.15;

    g_asset.sprite.player = new Sprite(g_asset.image.rifle.asset);
    g_asset.sprite.player.scale = 0.1;


    
    entityManager.init();


    

    g_main.mainInit();
},
true);
