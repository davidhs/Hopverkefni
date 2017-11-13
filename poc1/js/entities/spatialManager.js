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

  let prevX = -1;
  let prevY = -1;

  // Tiles (grid)
  // Grid should also contain path
  // finding info.
  // const tiles = [];
  const tiles = new Grid();

  // TODO: tile size should match
  const tileSize = 32;

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
    if (x < 0 || x >= tiles.width) return OUT_OF_BOUNDS;
    if (y < 0 || y >= tiles.height) return OUT_OF_BOUNDS;


    const obj = tiles.get(x, y);


    const result = obj.ids.add(id);

    if (result) {
      obj.count += 1;
      if (id === WALL_ID) obj.obstruction = true;
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
    if (x < 0 || x >= tiles.width) return;
    if (y < 0 || y >= tiles.height) return;

    const obj = tiles.get(x, y);

    const result = obj.ids.remove(id);

    if (result) {
      obj.count -= 1;
    }
  }

  function _resolveConflict(id, x, y) {
    const obj = tiles.get(x, y);

    // const a = entities[id];

    const l = obj.ids.getList();

    for (let i = 0; i < obj.ids.getSize(); i += 1) {
      const bid = parseInt(l[i], 10);

      if (bid === id) continue;

      if (bid === WALL_ID) {
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


    // CRAPPY PATH FINDING
    if (true) {
      const player = entityManager.getPlayer();
      const sx = _getX(player.cx);
      const sy = _getY(player.cy);
      if (prevX !== sx || prevY !== sy) {
        prevX = sx;
        prevY = sy;
        tiles.updateStamp();
      }
    }

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

  const firstTime = true;


  function render(ctx) {
    const oldStyle = ctx.strokeStyle;

    const dx = g_viewport.getOX();
    const dy = g_viewport.getOY();

    // NNEEDZ optimization

    // Render collision grid
    for (let ty = 0; ty < tiles.height; ty += 1) {
      for (let tx = 0; tx < tiles.width; tx += 1) {
        const obj = tiles.get(tx, ty);
        const count = obj.count;

        const x = tx * tileSize;
        const y = ty * tileSize;

        if (g_viewport.inOuterRectangleBounds(x, y, tileSize, tileSize)) {
          if (obj.parent) {
            const mahx = obj.parent.x;
            const mahy = obj.parent.y;
            const x1 = x + tileSize / 2;
            const y1 = y + tileSize / 2;
            const x2 = x1 + tileSize * mahx / 2;
            const y2 = y1 + tileSize * mahy / 2;
            if (obj.stamp === tiles._stamp) {
              ctx.strokeStyle = 'orange';
            } else {
              ctx.strokeStyle = 'blue';
            }

            if (prevX === tx && prevY === ty) {
              ctx.strokeStyle = 'lime';
            }
            util.strokeCircle(ctx, x1 - dx, y1 - dy, 5);
            ctx.beginPath();
            ctx.moveTo(x1 - dx, y1 - dy);
            ctx.lineTo(x2 - dx, y2 - dy);
            ctx.stroke();
          }
        }


        // Draw direction

        if (count <= 0) continue;

        const idsList = obj.ids.getList();

        for (let k = 0; k < obj.ids.getSize(); k += 1) {
          const id = idsList[k];


          if (id >= MIN_ENTITY) {
            ctx.strokeStyle = 'violet';
          } else {
            ctx.strokeStyle = 'green';
          }


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


  function init(width, height) {
    tiles.init(width / tileSize, height / tileSize);
    console.log(tiles);
  }


  // EXPOSURE

  return {
    getNewSpatialID,
    register,
    unregister,
    findEntityInRange,
    render,
    // getWallOcclusionMap,
    init,
    MIN_ENTITY,
    getTileSize: () => tileSize,

    toX: _getX,
    toY: _getY,

    carveShortestPath: (x, y) => {
      // tiles.carveShortestPath(prevX, prevY, x, y);
      tiles.carveShortestPath(prevX, prevY);
    },

    debug: {
      _registerTile,
      WALL_ID,
      tiles,
      _unregisterTile,
    },
    NO_CONFLICT,
  };
})();
