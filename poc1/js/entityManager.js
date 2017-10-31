'use strict';

/* global Rock Bullet Player g_asset AnimatedImage :true */

// ==============
// Entity Manager
// ==============

// A "module" that handles arbitrary entity-management.

const entityManager = (function () {
  // "PRIVATE" DATA

  const _rocks = [];
  const _bullets = [];
  const _players = [];
  const _explosions = [];

  const _categories = [
    _rocks,
    _bullets,
    _players,
    _explosions,
  ];

  let _bShowRocks = true;

  // "PRIVATE" METHODS


  function _forEachOf(aCategory, fn) {
    for (let i = 0; i < aCategory.length; i += 1) {
      fn.call(aCategory[i]);
    }
  }

  // PUBLIC METHODS


  // A special return value, used by other objects,
  // to request the blessed release of death!
  //
  const OK = 1;
  const KILL_ME_NOW = -1;


  function fireBullet(cx, cy, velX, velY, rotation) {
    _bullets.push(new Bullet({
      cx,
      cy,
      velX,
      velY,

      rotation,
    }));
  }

  function generatePlayer(descr) {
    _players.push(new Player(descr));
  }

  function generateExplosion(descr) {
    descr.sequence = g_asset.sequence.explosion;

    _explosions.push(new AnimatedImage(descr));
  }

  function generateRock(descr) {
    _rocks.push(new Rock(descr));
  }

  function _generateRocks() {
    const NUM_ROCKS = 20;

    for (let i = 0; i < NUM_ROCKS; i += 1) {
      generateRock();
    }
  }


  function toggleRocks() {
    _bShowRocks = !_bShowRocks;
  }

  // UPDATE ///////////////////////////////////////////////

  function update(du) {
    for (let c = 0; c < _categories.length; c += 1) {
      const aCategory = _categories[c];
      let i = 0;

      while (i < aCategory.length) {
        const status = aCategory[i].update(du);

        if (status === KILL_ME_NOW) {
          // remove the dead guy, and shuffle the others down to
          // prevent a confusing gap from appearing in the array
          aCategory.splice(i, 1);
        } else {
          i += 1;
        }
      }
    }

    if (_rocks.length === 0) _generateRocks();
  }

  // RENDER ///////////////////////////////////////////////

  function render(ctx, cfg) {
    const debugX = 10;
    let debugY = 100;

    for (let c = 0; c < _categories.length; c += 1) {
      const aCategory = _categories[c];

      if (!_bShowRocks &&
                aCategory === _rocks) { continue; }

      for (let i = 0; i < aCategory.length; i += 1) {
        aCategory[i].render(ctx, cfg);
        // debug.text(".", debugX + i * 10, debugY);
      }
      debugY += 10;
    }
  }

  function init() {
    generatePlayer();
    _generateRocks();
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateRock,
    generateExplosion,
    OK,
    KILL_ME_NOW,
    getPos: () => {
      if (_players.length > 0) {
        return _players[0];
      }
      return null;
    },
  };
}());
