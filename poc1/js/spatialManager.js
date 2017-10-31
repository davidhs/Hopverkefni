/*

spatialManager.js

A module which handles spatial lookup, as required for...
e.g. general collision detection.

*/

'use strict';

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

const spatialManager = (function () {

  // "PRIVATE" DATA


  const WALL_ID = 2;

  let nextSpatialID = 10;  // make all valid IDs non-falsey (i.e. don't start at 0)
  let entities = [];

  let tiles = [];

  let tileSize = 16;

  // PRIVATE METHODS

  let _ITER = 0;
  let _ITERLIMIT = 1000;

  _registerRect(WALL_ID, 10, 10, 100, 200);

  function setBlockMap(bm) {

    let canvas = document.createElement('canvas');
    canvas.width = bm.width;
    canvas.height = bm.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(bm, 0, 0);
    let w = bm.width;
    let h = bm.height;

    let imageData = ctx.getImageData(0, 0, w, h);
    let data = imageData.data;

    let x = 0;
    let y = 0;
    for (let i = 0; i < data.length; i += 4) {

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (r !== 255 || g !== 255 || b !== 255) {
        _registerTile(WALL_ID, x, y);
      }


      x += 1;

      if (x >= w) {
        x = 0;
        y += 1;
      }
    }
  }



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

    let targetID = tiles[i][j];

    if (targetID) {
      if (id !== targetID) {
        return true;
      } else {
        tiles[i][j] = id;
        return false;
      }
    } else {
      tiles[i][j] = id;
      return false;
    }
  }

  let BIT_UP = 8;
  let BIT_LEFT = 4;
  let BIT_DOWN = 2;
  let BIT_RIGHT = 1;

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
    } else {
      return true;
    }
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
    let flag = 0;
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let b = _registerTile(id, x + i, y + j);
        if (b) {
          if (j < h/2) flag = flag | BIT_UP;
          if (i < w/2) flag = flag | BIT_LEFT;
          if (j >= h/2) flag = flag | BIT_DOWN;
          if (i >= w/2) flag = flag | BIT_RIGHT;
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
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        let b = _unregisterTile(id, x + i, y + j);
        if (b) {
          if (j < h/2)     flag |= BIT_UP;
          if (i < w/2)     flag |= BIT_LEFT;
          if (j >= h/2) flag |= BIT_DOWN;
          if (i >= w/2) flag |= BIT_RIGHT;
        }
      }
    }
    return flag;
  }


  // PUBLIC METHODS

  function getNewSpatialID() {
    return nextSpatialID++;
  }

  function register (entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    let cx = pos.posX;
    let cy = pos.posY;
    let radius = entity.getRadius();

    let flag = false;

    if (true) {
      let x = cx - radius;
      let y = cy - radius;
      let w = 2 * radius;
      let h = 2 * radius;

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

  function unregister (entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();

    let cx = pos.posX;
    let cy = pos.posY;
    let radius = entity.getRadius();

    let flag = 0;

    if (true) {

      let x = cx - radius;
      let y = cy - radius;
      let w = 2 * radius;
      let h = 2 * radius;
      flag = _unregisterRect(spatialID, x, y, w, h);

    } else if (false) {
      flag = _unregisterTile(spatialID, cx, cy);
    }

    delete entities[spatialID];

    return flag;
  }

  function findEntityInRange (posX, posY, radius) {
    const result = null;

    let best_distanceSq = Number.POSITIVE_INFINITY;
    let best_spatialID = null;

    for (const spatialID in entities) {
      if (!entities.hasOwnProperty(spatialID)) continue;

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

    let dx = g_viewport.getX();
    let dy = g_viewport.getY();


    for (let i in tiles) {
      if (!tiles.hasOwnProperty(i)) continue;
      let tileRow = tiles[i];
      for (let j in tileRow) {
        if (!tileRow.hasOwnProperty(j)) continue;

        let id = tiles[i][j];

        if (id >= 10) {
          ctx.strokeStyle = 'red';

        } else {
          ctx.strokeStyle = 'green';

        }

        let x = j * tileSize;
        let y = i * tileSize;

        util.strokeRect(ctx, x - dx, y - dy, tileSize, tileSize);
      }
    }


    ctx.strokeStyle = 'red';

    // Render grid
    for (const label in tiles) {
      if (!tiles.hasOwnProperty(label)) continue;

      const xy = label.split(',');
      const id = tiles[label];

      let x = parseInt(xy[0]);
      let y = parseInt(xy[1]);





    }

    for (const ID in entities) {
      if (!entities.hasOwnProperty(ID)) continue;
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
    getNewSpatialID: getNewSpatialID,
    register: register,
    unregister: unregister,
    findEntityInRange: findEntityInRange,
    render: render,
    debug: function () {
      return {
        tiles: tiles,
        entities: entities
      };
    },
    init: init,


    BIT_UP: BIT_UP,
    BIT_LEFT: BIT_LEFT,
    BIT_DOWN: BIT_DOWN,
    BIT_RIGHT: BIT_RIGHT
  };
})();
