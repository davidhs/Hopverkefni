'use strict';

/* global g_world :true */


// TODO: split into extrinsic and intrinsic components.
//
const g_viewport = (function () {
  const viewport = {};

  viewport.cx = 500;
  viewport.cy = 500;

  viewport.width = 600;
  viewport.height = 0;

  viewport.getWidth = function () {
    return viewport.width;
  };

  viewport.getHeight = function () {
    return viewport.height;
  };

  viewport.getX = function () {
    return viewport.cx - viewport.width / 2;
  };

  viewport.getY = function () {
    return viewport.cy - viewport.height / 2;
  };

  viewport.setCenterX = function (cx) {
    viewport.cx = cx;
  };

  viewport.setCenterY = function (cy) {
    viewport.cy = cy;
  };


  viewport.getCenterX = function () {
    return viewport.cx;
  };

  viewport.getCenterY = function () {
    return viewport.cy;
  };


  // World 2 viewport
  viewport.w2vX = function (x) {
    return (x - viewport.getX()) * (viewport.getWidth() / g_world.getWidth());
  };

  viewport.w2vY = function (y) {
    return (y - viewport.getY()) * (viewport.getHeight() / g_world.getHeight());
  };

  // Viewport 2 world
  viewport.v2wX = function (x) {
    return x * (g_world.width / viewport.getWidth()) + viewport.getX();
  };

  viewport.v2wY = function (y) {
    return y * (g_world.height / viewport.getHeight()) + viewport.getY();
  };


  return viewport;
}());
