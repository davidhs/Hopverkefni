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
  // PRIVATE DATA

  // SPATIAL ID TYPES
  const NO_CONFLICT = 0;
  const OUT_OF_BOUNDS = 1;
  const WALL_ID = 2;

  // Lorem ipsum.
  const MIN_ENTITY = 10;
  const entities = [];

  // Tiles (grid)
  const tiles = [];
  const tileSize = 16;

  let nextSpatialID = MIN_ENTITY; // make all valid IDs non-falsey (i.e. don't start at 0)

  // PRIVATE METHODS


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _registerTile(id, x, y) {
    if (x < 0 || y < 0) return OUT_OF_BOUNDS;

    if (!tiles[y]) tiles[y] = [];

    const targetID = tiles[y][x];

    if (targetID) {
      if (id !== targetID) {
        return targetID;
      }
      tiles[y][x] = id;
      return NO_CONFLICT;
    }

    tiles[y][x] = id;
    return NO_CONFLICT;
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
    if (!tiles[y]) return NO_CONFLICT;

    const targetID = tiles[y][x];

    if (id === targetID) {
      delete tiles[y][x];
      return NO_CONFLICT;
    }

    return targetID;
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * NOTE: make sure x1 <= x2 and y1 <= y2.
   *
   * @param {Number} id
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   */
  function _registerRect(id, x1, y1, x2, y2) {
    let minConflictID = Number.MAX_VALUE;

    // Horizontal "exterior" boundaries.
    for (let x = x1; x <= x2; x += 1) {
      // Upper boundary
      minConflictID = Math.min(minConflictID, _registerTile(id, x, y1));
      // Lower boundary
      minConflictID = Math.min(minConflictID, _registerTile(id, x, y2));
    }

    // Vertical "exterious boundaries"
    for (let y = y1 + 1; y <= (y2 - 1); y += 1) {
      // Left boundary
      minConflictID = Math.min(minConflictID, _registerTile(id, x1, y));
      // Right boundary
      minConflictID = Math.min(minConflictID, _registerTile(id, x2, y));
    }

    if (minConflictID) return minConflictID;

    // Interior
    for (let x = x1 + 1; x <= (x2 - 1); x += 1) {
      for (let y = y1 + 1; y <= (y2 - 1); y += 1) {
        const b = _registerTile(id, x, y);
        if (b) return b;
      }
    }

    return NO_CONFLICT;
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.
   *
   * NOTE: make sure x1 <= x2 and y1 <= y2.
   *
   * @param {Number} id
   * @param {Number} x1
   * @param {Number} y1
   * @param {Number} x2
   * @param {Number} y2
   */
  function _unregisterRect(id, x1, y1, x2, y2) {
    let targetID = NO_CONFLICT;
    for (let x = x1; x <= x2; x += 1) {
      for (let y = y1; y <= y2; y += 1) {
        const b = _unregisterTile(id, x, y);
        if (b) {
          targetID = b;
        }
      }
    }
    return targetID;
  }


  // Gets column (x-coordinate) of grid.
  function _getX(x) {
    return Math.max(Math.floor(x / tileSize), 0);
  }


  // Gets row (y-coordinate) of grid.
  function _getY(y) {
    return Math.max(Math.floor(y / tileSize), 0);
  }


  // PUBLIC METHODS

  function getNewSpatialID() {
    const id = nextSpatialID;
    nextSpatialID += 1;
    return id;
  }

  /**
   * If it fails to register this function will do proper cleanup.
   */
  function register(entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    const x1 = _getX(cx - radius);
    const y1 = _getY(cy - radius);

    const x2 = _getX(cx + radius);
    const y2 = _getY(cy + radius);

    const flag = _registerRect(spatialID, x1, y1, x2, y2);

    // Cleanup
    if (flag) {
      _unregisterRect(spatialID, x1, y1, x2, y2);
    } else {
      entities[spatialID] = {
        posX: pos.posX,
        posY: pos.posY,
        radius: entity.getRadius(),
        entity,
      };
    }

    return flag;
  }


  function unregister(entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    const x1 = _getX(cx - radius);
    const y1 = _getY(cy - radius);

    const x2 = _getX(cx + radius);
    const y2 = _getY(cy + radius);

    const flag = _unregisterRect(spatialID, x1, y1, x2, y2);

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

    // Render collision grid
    for (let i = 0, keys = Object.keys(tiles); i < keys.length; i += 1) {
      const rowNumber = keys[i];
      for (let j = 0, keys2 = Object.keys(tiles[rowNumber]); j < keys2.length; j += 1) {
        const colNumber = keys2[j];
        const id = tiles[rowNumber][colNumber];

        if (id >= 10) {
          ctx.strokeStyle = 'violet';
        } else {
          ctx.strokeStyle = 'green';
        }

        const x = colNumber * tileSize;
        const y = rowNumber * tileSize;

        util.strokeRect(ctx, x - dx, y - dy, tileSize, tileSize);
      }
    }

    ctx.strokeStyle = 'red';
    // Render boundary "boxes".
    for (let j = 0, keys2 = Object.keys(entities); j < keys2.length; j += 1) {
      const ID = keys2[j];
      const e = entities[ID];
      util.strokeCircle(ctx, e.posX - dx, e.posY - dy, e.radius);
    }
    ctx.strokeStyle = oldStyle;
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
        _registerTile(WALL_ID, _getX(x), _getY(y));
      }

      x += 1;

      if (x >= w) {
        x = 0;
        y += 1;
      }
    }
  }

  function init() {
    if (false) {
      setBlockMap(g_asset.blockMap);
    } else {
      const canvas = document.createElement('canvas');
      const w = g_world.width;
      const h = g_world.height;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(255, 255, 255, 255)';
      util.fillBox(ctx, 0, 0, w, h);

      ctx.fillStyle = 'rgba(0, 0, 0, 255)';
      for (let i = 0; i < 100; i += 1) {
        const bx = Math.random() * w;
        const by = Math.random() * h;
        const bw = Math.random() * 100;
        const bh = Math.random() * 100;
        util.fillBox(ctx, bx, by, bw, bh);
      }
      setBlockMap(canvas);
    }
  }

  function getWallOcclusionMap() {
    const canvas = document.createElement('canvas');
    canvas.width = g_world.getWidth();
    canvas.height = g_world.getHeight();
    const ctx = canvas.getContext('2d');
    util.clearCanvas(ctx);

    for (let i = 0, keys = Object.keys(tiles); i < keys.length; i += 1) {
      const rowNumber = keys[i];
      for (let j = 0, keys2 = Object.keys(tiles[rowNumber]); j < keys2.length; j += 1) {
        const colNumber = keys2[j];
        const id = tiles[rowNumber][colNumber];

        if (!(id > 0 && id < 10)) continue;
        ctx.strokeStyle = 'rgba(0, 0, 0, 255)';

        const x = colNumber * tileSize;
        const y = rowNumber * tileSize;

        util.fillBox(ctx, x, y, tileSize, tileSize);
      }
    }

    return canvas;
  }


  // EXPOSURE

  return {
    getNewSpatialID,
    register,
    unregister,
    findEntityInRange,
    render,
    getWallOcclusionMap,
    debug() {
      return {
        tiles,
        entities,
      };
    },
    init,
    MIN_ENTITY,
  };
})();
