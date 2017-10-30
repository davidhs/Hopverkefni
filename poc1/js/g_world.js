'use strict';

const g_world = (function () {
  const world = {};

  world.width = 1000;
  world.height = 1000;

  world.canvas = document.createElement('canvas');
  world.canvas.width = world.width;
  world.canvas.height = world.height;
  world.ctx = world.canvas.getContext('2d');

  world.inBounds = function (cx, cy, radius) {
    const cond1 = cx > 0 && cx < world.width;
    const cond2 = cy > 0 && cy < world.height;

    return cond1 && cond2;
  };

  world.getWidth = function () {
    return world.width;
  };
  world.getHeight = function () {
    return world.height;
  };

  return world;
}());
