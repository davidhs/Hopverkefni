'use strict';

/* global Rock Bullet Player g_asset AnimatedImage :true */

// ==============
// Entity Manager
// ==============

// A "module" that handles arbitrary entity-management.

const entityManager = (function () {
  // "PRIVATE" DATA

  const DEBUG = false;

  const OK = 1;
  // A special return value, used by other objects,
  // to request the blessed release of death!
  const KILL_ME_NOW = -1;

  const _bullets = [];
  const _players = [];
  const _explosions = [];
  const _terrexplotions = [];
  const _blood = [];
  const _genericEnemiesOne = [];
  const _genericEnemiesTwo = [];

  const _categories = [
    _bullets,
    _players,
    _terrexplotions,
    _genericEnemiesOne,
    _genericEnemiesTwo,
    _explosions,
    _blood,
  ];

  // "PRIVATE" METHODS

  function _forEachOf(aCategory, fn) {
    for (let i = 0; i < aCategory.length; i += 1) {
      fn.call(aCategory[i]);
    }
  }

  // PUBLIC METHODS

  // TODO: maybe we want to fire different types of bullets.
  // figure out how to do that.
  function fireBullet(cx, cy, velX, velY, rotation, damage, through) {
    const bullet = new Bullet({
      cx,
      cy,
      velX,
      velY,
      rotation,
      damage,
      through,
    });
    if (DEBUG) console.log(bullet);
    _bullets.push(bullet);
  }

  function generatePlayer(descr) {
    _players.push(new Player(descr));
  }

  function generateItems(descr) {
    _items.push(new Items(descr));
  }

  // function generateWeapon(descr) {
  //   _weapon.push(new Weapon(descr));
  //   console.log(_weapon);
  // }

  // TODO: bind in JSON which type explosion,
  // and explosion rate.
  function generateExplosion(descr) {
    descr.sequence = g_asset.sequence.explosion3;
    _explosions.push(new AnimatedImage(descr));
  }

  function generateTerrexplotion(descr){
    descr.sequence = g_asset.sequence.explosionSpritesheet5;
    _terrexplotions.push(new AnimatedImage(descr));
  }

  function generateBlood(descr) {
    descr.sequence = g_asset.sequence.blood3;
    _blood.push(new AnimatedImage(descr));
  }

  function generateGenericEnemyOne(cfg) {
    _genericEnemiesOne.push(new GenericEnemyOne(cfg));
  }
  function generateGenericEnemyTwo(cfg){
    _genericEnemiesTwo.push(new GenericEnemyTwo(cfg));
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
  }

  function render(ctx, cfg) {
    for (let c = 0; c < _categories.length; c += 1) {
      const aCategory = _categories[c];

      for (let i = 0; i < aCategory.length; i += 1) {
        aCategory[i].render(ctx, cfg);
      }
    }


    if (_genericEnemiesOne.length < 10) {
      for (let i = 0; i < 10; i += 1) {
        const cx = Math.random() * g_world.getWidth();
        const cy = Math.random() * g_world.getHeight();
        generateGenericEnemyOne({
          cx,
          cy,
          sprite: g_asset.sprite.donkey,
        });
      }
    }
    if(_genericEnemiesTwo.length < 10){
      for (let i = 0; i < 10; i += 1) {
        const cx = Math.random() * g_world.getWidth();
        const cy = Math.random() * g_world.getHeight();
        generateGenericEnemyTwo({
          cx,
          cy,
          sprite: g_asset.sprite.terrorist,
      });
    }
  }
}

  function init() {
    for (let i = 0; i < 1000; i += 1) {
      const cx = Math.random() * g_world.getWidth();
      const cy = Math.random() * g_world.getHeight();
      generateGenericEnemyTwo({
        cx,
        cy,
        sprite: g_asset.sprite.terrorist,
      });
    }
  }

  function getPlayer() {
    if (_players.length > 0) return _players[0];
    return null;
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateExplosion,
    generateTerrexplotion,
    generateBlood,
    generatePlayer,
    generateGenericEnemyOne,
    generateGenericEnemyTwo,
    OK,
    KILL_ME_NOW,

    getPos: getPlayer,
    getPlayer,
  };
}());
