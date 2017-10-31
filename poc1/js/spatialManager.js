'use strict';

/* global util document g_viewport g_asset :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

const spatialManager = (function () {
  // "PRIVATE" DATA


  const WALL_ID = 2;

  let nextSpatialID = 10; // make all valid IDs non-falsey (i.e. don't start at 0)
  const entities = [];

  const tiles = [];

  const tileSize = 16;

  // PRIVATE METHODS

  const _ITER = 0;
  const _ITERLIMIT = 1000;

  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _registerTile(id, x, y) {
    const j = Math.max(Math.floor(x / tileSize), 0);
    const i = Math.max(Math.floor(y / tileSize), 0);


    if (i < 0 || j < 0) return true;

    if (!tiles[i]) tiles[i] = [];

    const targetID = tiles[i][j];

    if (targetID) {
      if (id !== targetID) {
        return true;
      }
      tiles[i][j] = id;
      return false;
    }
    tiles[i][j] = id;
    return false;
  }

  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _unregisterTile(id, x, y) {
    const j = Math.max(Math.floor(x / tileSize), 0);
    const i = Math.max(Math.floor(y / tileSize), 0);

    if (!tiles[i]) return false;

    if (id === tiles[i][j]) {
      delete tiles[i][j];
      return false;
    }
    return true;
  }

  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   * @param {Number} w
   * @param {Number} h
   */
  function _registerRect(id, x, y, w, h) {
    let flag = false;
    for (let i = 0; i < w; i += 1) {
      for (let j = 0; j < h; j += 1) {
        const b = _registerTile(id, x + i, y + j);
        if (b) {
          flag = true;
        }
      }
    }
    return flag;
  }

  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   * @param {Number} w
   * @param {Number} h
   */
  function _unregisterRect(id, x, y, w, h) {
    let flag = false;
    for (let i = 0; i < w; i += 1) {
      for (let j = 0; j < h; j += 1) {
        const b = _unregisterTile(id, x + i, y + j);
        if (b) {
          flag = true;
        }
      }
    }
    return flag;
  }

  function setBlockMap(bm) {
    const canvas = document.createElement('canvas');
    canvas.width = bm.width;
    canvas.height = bm.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bm, 0, 0);
    const w = bm.width;
    const h = bm.height;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    let x = 0;
    let y = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r !== 255 || g !== 255 || b !== 255) {
        _registerTile(WALL_ID, x, y);
      }


      x += 1;

      if (x >= w) {
        x = 0;
        y += 1;
      }
    }
  }

  // PUBLIC METHODS

  function getNewSpatialID() {
    const id = nextSpatialID;
    nextSpatialID += 1;
    return id;
  }

  function register(entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    let flag = false;

    if (true) {
      const x = cx - radius;
      const y = cy - radius;
      const w = 2 * radius;
      const h = 2 * radius;

      flag = _registerRect(spatialID, x, y, w, h);
    } else if (false) {
      flag = _registerTile(spatialID, cx, cy);
    }


    entities[spatialID] = {
      posX: pos.posX,
      posY: pos.posY,
      radius: entity.getRadius(),
      entity,
    };

    return flag;
  }

  function unregister(entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    let flag = 0;

    if (true) {
      const x = cx - radius;
      const y = cy - radius;
      const w = 2 * radius;
      const h = 2 * radius;
      flag = _unregisterRect(spatialID, x, y, w, h);
    } else if (false) {
      flag = _unregisterTile(spatialID, cx, cy);
    }

    delete entities[spatialID];

    return flag;
  }

  function findEntityInRange(posX, posY, radius) {
    const result = null;

    let best_distanceSq = Number.POSITIVE_INFINITY;
    let best_spatialID = null;

    for (let i = 0, keys = Object.keys(entities); i < keys.length; i += 1) {
      const spatialID = keys[i];
      const entity = entities[spatialID];

      const r2 = util.square(radius + entity.radius);

      const d2 = util.distSq(posX, posY, entity.posX, entity.posY);

      const td = Math.max(0, d2 - r2);

      if (d2 > 0 && d2 <= r2 && td < best_distanceSq) {
        best_distanceSq = td;
        best_spatialID = spatialID;
      }
    }

    if (!best_spatialID) return null;

    return entities[best_spatialID].entity;
  }

  function render(ctx) {
    const oldStyle = ctx.strokeStyle;

    const dx = g_viewport.getX();
    const dy = g_viewport.getY();


    for (let i = 0, keys = Object.keys(tiles); i < keys.length; i += 1) {
      const rowNumber = keys[i];
      const row = tiles[rowNumber];
      for (let j = 0, keys2 = Object.keys(row); j < keys2.length; j += 1) {
        const colNumber = keys2[j];
        const id = row[colNumber];

        if (id >= 10) {
          ctx.strokeStyle = 'red';
        } else {
          ctx.strokeStyle = 'green';
        }

        const x = j * tileSize;
        const y = i * tileSize;

        util.strokeRect(ctx, x - dx, y - dy, tileSize, tileSize);
      }
    }


    ctx.strokeStyle = 'red';

    // Render grid
    for (let i = 0, labels = Object.keys(tiles); i < labels.length; i += 1) {
      const label = labels[i];

      const xy = label.split(',');
      const id = tiles[label];

      const x = parseInt(xy[0], 10);
      const y = parseInt(xy[1], 10);
    }

    for (let j = 0, keys2 = Object.keys(entities); j < keys2.length; j += 1) {
      const ID = keys2[j];
      const e = entities[ID];
      util.strokeCircle(ctx, e.posX - dx, e.posY - dy, e.radius);
    }
    ctx.strokeStyle = oldStyle;
  }

  function init() {
    setBlockMap(g_asset.blockMap);
  }

  // PUBLIC

  return {
    getNewSpatialID,
    register,
    unregister,
    findEntityInRange,
    render,
    debug() {
      return {
        tiles,
        entities,
      };
    },
    init,
  };
})();
