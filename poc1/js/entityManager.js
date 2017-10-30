/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/


'use strict';


// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/* jslint nomen: true, white: true, plusplus: true */


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


  function _generateRocks() {
    let i,
      NUM_ROCKS = 20;

    for (i = 0; i < NUM_ROCKS; ++i) {
      generateRock();
    }
  }

  function _forEachOf(aCategory, fn) {
    for (let i = 0; i < aCategory.length; ++i) {
      fn.call(aCategory[i]);
    }
  }

  // PUBLIC METHODS


  // A special return value, used by other objects,
  // to request the blessed release of death!
  //
  const KILL_ME_NOW = -1;


  function init() {
    generatePlayer();
    _generateRocks();
  }

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

  function toggleRocks() {
    _bShowRocks = !_bShowRocks;
  }

  // UPDATE ///////////////////////////////////////////////

  function update(du) {
    for (let c = 0; c < _categories.length; ++c) {
      const aCategory = _categories[c];
      let i = 0;

      while (i < aCategory.length) {
        const status = aCategory[i].update(du);

        if (status === KILL_ME_NOW) {
          // remove the dead guy, and shuffle the others down to
          // prevent a confusing gap from appearing in the array
          aCategory.splice(i, 1);
        } else {
          ++i;
        }
      }
    }

    if (_rocks.length === 0) _generateRocks();
  }

  // RENDER ///////////////////////////////////////////////

  function render(ctx, cfg) {
    let debugX = 10,
      debugY = 100;

    for (let c = 0; c < _categories.length; ++c) {
      const aCategory = _categories[c];

      if (!_bShowRocks &&
                aCategory == _rocks) { continue; }

      for (let i = 0; i < aCategory.length; ++i) {
        aCategory[i].render(ctx, cfg);
        // debug.text(".", debugX + i * 10, debugY);
      }
      debugY += 10;
    }
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateRock,
    generateExplosion,
    KILL_ME_NOW,
    getPos: () => {
      if (_players.length > 0) {
        return _players[0];
      }
    },
  };
}());

