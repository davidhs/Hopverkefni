'use strict';

/* global Rock Bullet Player g_asset AnimatedImage :true */

// ==============
// Entity Manager
// ==============

// A "module" that handles arbitrary entity-management.

const entityManager = (function () {
  // "PRIVATE" DATA

  const OK = 1;
  // A special return value, used by other objects,
  // to request the blessed release of death!
  const KILL_ME_NOW = -1;

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

  // TODO: maybe we want to fire different types of bullets.
  // figure out how to do that.
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

  // TODO: bind in JSON which type explosion,
  // and explosion rate.
  function generateExplosion(descr) {
    descr.sequence = g_asset.sequence.explosion;

    _explosions.push(new AnimatedImage(descr));
  }

  // TODO: maybe we don't want rocks in the future?
  function generateRock(descr) {
    _rocks.push(new Rock(descr));
  }

  // TODO: yes, surely we don't, don't we?
  function _generateRocks() {
    const NUM_ROCKS = 1000;

    for (let i = 0; i < NUM_ROCKS; i += 1) {
      generateRock();
    }
  }

  // TODO: remove this later
  function toggleRocks() {
    _bShowRocks = !_bShowRocks;
  }

  function update(du) {
    for (let c = 0; c < _categories.length; c += 1) {
      const aCategory = _categories[c];
      let i = 0;

      while (i < aCategory.length) {
        const status = aCategory[i].update(du);

        if (status === KILL_ME_NOW) {
          // Probably superfluous
          delete aCategory[i];

          // remove the dead guy, and shuffle the others down to
          // prevent a confusing gap from appearing in the array
          aCategory.splice(i, 1);
        } else {
          i += 1;
        }
      }
    }

    // TODO: remove this.
    if (_rocks.length === 0) _generateRocks();
  }

  function render(ctx, cfg) {
    for (let c = 0; c < _categories.length; c += 1) {
      const aCategory = _categories[c];

      if (!_bShowRocks && aCategory === _rocks) { continue; }

      for (let i = 0; i < aCategory.length; i += 1) {
        aCategory[i].render(ctx, cfg);
      }
    }
  }

  function init() {
    _generateRocks();
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateRock,
    generateExplosion,
    generatePlayer,
    OK,
    KILL_ME_NOW,

    // FIXME: this is just a hack to get
    // the player's position so the viewport can
    // track the player.
    getPos: () => {
      if (_players.length > 0) {
        return _players[0];
      }
      return null;
    },
  };
}());
