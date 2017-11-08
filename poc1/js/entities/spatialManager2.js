'use strict';

/* global util document g_viewport g_asset :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

//
// Register 
// 


/**
 * Spatial manager
 * ===============
 * A module which handles spatial lookup, used for general collision
 * detection.
 * ---------------
 * It's very important to conside the tile size `tileSize' beforehand --
 * enable to change tile size -- because it can drastically affect
 * performance.  If the scene is huge and there are a lot of objects
 * spread around, you should conside using a larget tile size.
 * ----------------
 * Registering and unregistering is a rather slow process.  It's used
 * for spatial lookup.  It only indicates potential collisions.  It's
 * up to the entities themselves to resolve the collisions themselves.
 */
const spatialManager = (function () {
  // PRIVATE DATA

  // SPATIAL ID TYPES
  const NO_CONFLICT = 0;
  const POTENTIAL_CONFLICT = 1;
  const OUT_OF_BOUNDS = 2;
  const WALL_ID = 3;

  // Lorem ipsum.
  const MIN_ENTITY = 30;
  const entities = [];

  // Tiles (grid)
  // Grid should also contain path
  // finding info.
  const tiles = [];

  // TODO: tile size should match
  const tileSize = 16;  

  let nextSpatialID = MIN_ENTITY; // make all valid IDs non-falsey (i.e. don't start at 0)

  // PRIVATE METHODS



  // Gets column (x-coordinate) of grid.
  function _getX(x) {
    return Math.max(Math.floor(x / tileSize), 0);
  }


  // Gets row (y-coordinate) of grid.
  function _getY(y) {
    return Math.max(Math.floor(y / tileSize), 0);
  }


  /**
   * Returns `true' if tile is occupied with another ID,
   * otherwiser returns `false'.  Potential collision.
   *
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   */
  function _registerTile(id, x, y) {
    if (x < 0 || y < 0) return OUT_OF_BOUNDS;

    if (!tiles[y]) {
        tiles[y] = [];
    }
    if (!tiles[y][x]) {
        tiles[y][x] = {
            count: 0,
            ids: {}
        };
    }

    const obj = tiles[y][x];

    if (!obj.ids[id]) {
        obj.ids[id] = true;
        obj.count += 1;
    }
    
    return obj.count > 1 ? POTENTIAL_CONFLICT : NO_CONFLICT;
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
    if (x < 0 || y < 0) return;

    if (!tiles[y]) return;
    if (!tiles[y][x]) return;

    const obj = tiles[y][x];

    const ids = obj.ids;
    
    for (let i = 0, keys = Object.keys(ids); i < keys.length; i += 1) {
        const targetID = parseInt(keys[i], 10);
        if (id === targetID) {
            delete ids[id]
            obj.count -= 1;
        }
    }
  }

  function _resolveConflict(id, x, y) {

    const list = tiles[y][x];

    const keys = Object.keys(list.ids);

    const a = entities[id];

    for (let i = 0; i < keys.length; i += 1) {

        const bid = keys[i];
        
        // NOTE THE DOUBLE == IS DELIBERATE
        // AND CONTINUE TOO.
        if (bid == id) continue;

        if (bid == WALL_ID) {
            return WALL_ID;
        }

        const be = entities[bid];
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
  function _registerRect(id, x1, y1, x2, y2) {

    for (let y = y1; y <= y2; y += 1) {
        for (let x = x1; x <= x2; x += 1) {
            const result = _registerTile(id, x, y);

            if (result === POTENTIAL_CONFLICT) {
                const resStat = _resolveConflict(id, x, y);

                if (resStat !== NO_CONFLICT) {
                    return resStat;
                }
            }
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
    for (let x = x1; x <= x2; x += 1) {
      for (let y = y1; y <= y2; y += 1) {
        _unregisterTile(id, x, y);
      }
    }
  }


  // ==============
  // PUBLIC METHODS
  // ==============

  function getNewSpatialID() {
    const id = nextSpatialID;
    nextSpatialID += 1;
    return id;
  }

  /**
   * If it fails to register this function will do proper cleanup.
   */

  /**
   * @param {Entity} entity
   * @param {boolean} force if true don't unregister
   */
  function register(entity, force) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    const cx = pos.posX;
    const cy = pos.posY;
    const radius = entity.getRadius();

    const x1 = _getX(cx - radius);
    const y1 = _getY(cy - radius);

    const x2 = _getX(cx + radius);
    const y2 = _getY(cy + radius);

    const result = _registerRect(spatialID, x1, y1, x2, y2);

    if (result !== NO_CONFLICT) {
        _unregisterRect(spatialID, x1, y1, x2, y2);
    } else {
      entities[spatialID] = {
        posX: pos.posX,
        posY: pos.posY,
        radius: entity.getRadius(),
        entity,
      };
    }

    return result;
  }


  /**
   * 
   * @param {Entity} entity 
   * @param {boolean} force if true don't unregiser on failure
   */
  function unregister(entity, force) {
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

    const dx = g_viewport.getOX();
    const dy = g_viewport.getOY();

    // Render collision grid
    for (let i = 0, keys = Object.keys(tiles); i < keys.length; i += 1) {
      const rowNumber = keys[i];
      for (let j = 0, keys2 = Object.keys(tiles[rowNumber]); j < keys2.length; j += 1) {
        const colNumber = keys2[j];
        const obj = tiles[rowNumber][colNumber];
        const count = obj.count;
        const ids = obj.ids;

        if (count <= 0) continue;

        for (let k = 0, keys3 = Object.keys(ids); k < keys3.length; k += 1) {
            const id = parseInt(keys[k], 10);
            

            if (id >= MIN_ENTITY) {
                ctx.strokeStyle = 'violet';
              } else {
                ctx.strokeStyle = 'green';
              }
      
              const x = colNumber * tileSize;
              const y = rowNumber * tileSize;
      
              //  if (!g_viewport.inOuterRectangleBounds(x, y, tileSize, tileSize)) return;
      
              if (g_viewport.inOuterRectangleBounds(x, y, tileSize, tileSize)) {
                util.strokeRect(ctx, x - dx, y - dy, tileSize, tileSize);
              }
        }
      }
    }

    ctx.strokeStyle = 'red';
    // Render boundary "boxes".
    for (let j = 0, keys2 = Object.keys(entities); j < keys2.length; j += 1) {
      const ID = keys2[j];
      const e = entities[ID];
      const radius = (typeof e.radius !== 'undefined') ? e.radius : e.getRadius();

      if (g_viewport.inOuterSquareCircle(e.posX, e.posY, radius)) {
        util.strokeCircle(ctx, e.posX - dx, e.posY - dy, e.radius);
      }
    }
    ctx.strokeStyle = oldStyle;
  }


  function init() {}

  // FIXME: this is a hack!! Or, maybe...?
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
        const obj = tiles[rowNumber][colNumber];

        if (obj.count <= 0) continue;

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
    init,
    MIN_ENTITY,
    getTileSize: () => tileSize,

    debug: {
        _registerTile,
        WALL_ID,
        tiles,
        _unregisterTile
    }
  };
})();
