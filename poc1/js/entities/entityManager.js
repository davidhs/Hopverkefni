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

  const categories = {
    bullets: [],
    players: [],
    genericEnemiesOne: [],
    explosions: [],
    blood: [],
  };

  const categoryNames = Object.keys(categories);

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
    categories.bullets.push(bullet);
  }

  function generatePlayer(descr) {
    categories.players.push(new Player(descr));
  }

  function generateItems(descr) {
    categories.items.push(new Items(descr));
  }

  // function generateWeapon(descr) {
  //   _weapon.push(new Weapon(descr));
  //   console.log(_weapon);
  // }

  // TODO: bind in JSON which type explosion,
  // and explosion rate.
  function generateExplosion(descr) {
    descr.sequence = g_asset.sequence.explosion3;
    categories.explosions.push(new AnimatedImage(descr));
  }

  function generateBlood(descr) {
    descr.sequence = g_asset.sequence.blood3;
    categories.blood.push(new AnimatedImage(descr));
  }

  function generateGenericEnemyOne(cfg) {
    categories.genericEnemiesOne.push(new GenericEnemyOne(cfg));
  }

  function update(du) {
    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      const items = categories[categoryName];

      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];

        const status = item.update(du);

        if (status === KILL_ME_NOW) {
          delete items[j];
          items.splice(j, 1);
        }
      }
    }
  }

  function render(ctx, cfg) {
    for (let i = 0; i < categoryNames.length; i += 1) {
      const categoryName = categoryNames[i];

      // If the configuration has a blacklist for the categories
      // and this category name is in it, then do not render.
      if (cfg.categoryBlacklist && cfg.categoryBlacklist.has(categoryName)) {
        continue;
      }

      // If the configuration has a whitelist for the categories
      // and this category is not found in the whitelist, then do not render.
      if (cfg.categoryWhitelist && !cfg.categoryWhitelist.has(categoryName)) {
        continue;
      }

      const items = categories[categoryName];

      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];

        item.render(ctx, cfg);
      }
    }
  }

  function init() {
    for (let i = 0; i < 0; i += 1) {
      const cx = Math.random() * g_world.getWidth();
      const cy = Math.random() * g_world.getHeight();
      generateGenericEnemyOne({
        cx,
        cy,
        sprite: g_asset.sprite.donkey,
      });
    }
  }

  function getPlayer() {
    if (categories.players.length > 0) {
      return categories.players[0];
    }
    return null;
  }

  return {
    init,
    update,
    render,
    fireBullet,
    generateExplosion,
    generateBlood,
    generatePlayer,
    generateGenericEnemyOne,
    OK,
    KILL_ME_NOW,

    getPos: getPlayer,
    getPlayer,
  };
}());
