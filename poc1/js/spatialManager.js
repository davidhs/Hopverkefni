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

const spatialManager = {

// "PRIVATE" DATA

  _nextSpatialID: 1, // make all valid IDs non-falsey (i.e. don't start at 0)

  _entities: [],

  // "PRIVATE" METHODS
  //
  // <none yet>


  // PUBLIC METHODS

  getNewSpatialID() {
    // TODO: YOUR STUFF HERE!
    this._nextSpatialID += 1;
    return this._nextSpatialID;
  },

  register(entity) {
    const pos = entity.getPos();
    const spatialID = entity.getSpatialID();


    // TODO: YOUR STUFF HERE!
    this._entities[spatialID] = {
      posX: pos.posX,
      posY: pos.posY,
      radius: entity.getRadius(),
      entity,
    };
  },

  unregister(entity) {
    const spatialID = entity.getSpatialID();


    // this._entities[spatialID] = undefined;

    // TODO: YOUR STUFF HERE!
    // this._entities.splice(spatialID, 1);
    delete this._entities[spatialID];
  },

  findEntityInRange(posX, posY, radius) {
    // TODO: YOUR STUFF HERE!
    const result = null;

    let best_distanceSq = Number.POSITIVE_INFINITY;
    let best_spatialID = null;

    for (const spatialID in this._entities) {
      if (!this._entities.hasOwnProperty(spatialID)) continue;

      const entity = this._entities[spatialID];

      const r2 = util.square(radius + entity.radius);

      const d2 = util.wrappedDistSq(posX, posY, entity.posX, entity.posY);

      const td = Math.max(0, d2 - r2);

      if (d2 > 0 && d2 <= r2 && td < best_distanceSq) {
        best_distanceSq = td;
        best_spatialID = spatialID;
      }
    }

    if (!best_spatialID) return null;

    return this._entities[best_spatialID].entity;
  },

  render(ctx) {
    const oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = 'red';

    for (const ID in this._entities) {
      const e = this._entities[ID];
      util.strokeCircle(ctx, e.posX, e.posY, e.radius);
    }
    ctx.strokeStyle = oldStyle;
  },

};
