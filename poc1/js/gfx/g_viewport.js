'use strict';

/* global g_world :true */


// We call inner (intrinsic) and outer (extrinsic).


// TODO: split into extrinsic and intrinsic components.
//
const g_viewport = (function () {
  // PRIVATE DATA

  const innerX = 0;
  const innerY = 0;

  let innerWidth = 0;
  let innerHeight = 0;

  let outerX = 0;
  let outerY = 0;

  let outerWidth = 0;
  let outerHeight = 0;

  // PUBLIC FUNCTIONS

  /**
   * Get inner width of viewport.
   */
  function getIW() {
    return innerWidth;
  }


  /**
   * Get inner height of viewport.
   */
  function getIH() {
    return innerHeight;
  }


  /**
   * Set inner width of viewport.
   *
   * @param {Number} iw
   */
  function setIW(iw) {
    innerWidth = iw;
  }


  /**
   * Set inner height of viewport.
   *
   * @param {Number} ih
   */
  function setIH(ih) {
    innerHeight = ih;
  }


  /**
   * Get outer width.
   */
  function getOW() {
    return outerWidth;
  }


  /**
   * Get outer height.
   */
  function getOH() {
    return outerHeight;
  }


  /**
   * Set outer width of viewport.
   *
   * @param {Number} ow
   */
  function setOW(ow) {
    outerWidth = ow;
  }


  /**
   * Set outer height of viewport.
   *
   * @param {Number} oh
   */
  function setOH(oh) {
    outerHeight = oh;
  }


  /**
   * Get outer X.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   */
  function getOX() {
    return outerX;
  }


  /**
   * Get outer Y.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   */
  function getOY() {
    return outerY;
  }


  /**
   * Set outer X.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   *
   * @param {Number} ox
   */
  function setOX(ox) {
    outerX = ox;
  }


  /**
   * Set outer Y.
   *
   * NOTE: This referes to the upper left corner
   *       point of the viewport.
   *
   * @param {Number} oy
   */
  function setOY(oy) {
    outerY = oy;
  }


  /**
   * Get outer center X, i.e. the middle of the viewport's
   * rectangle in world space.
   */
  function getOCX() {
    return outerX + outerWidth / 2;
  }


  /**
   * Get outer center Y, i.e. the middle of the viewport's
   * rectangle in world space.
   */
  function getOCY() {
    return outerY + outerHeight / 2;
  }


  /**
   * Set outer center X, i.e. the middle of the viewport's
   * rectangle in world space.
   *
   * @param {Number} ocx
   */
  function setOCX(ocx) {
    outerX = ocx - outerWidth / 2;
  }


  /**
   * Set outer center Y, i.e. the middle of the viewport's
   * rectangle in world space.
   *
   * @param {Number} ocy
   */
  function setOCY(ocy) {
    outerY = ocy - outerHeight / 2;
  }


  /**
   * Map X from viewport's (inner) coordinate system to
   * to world's (outer) coordinate system.
   *
   * @param {Number} ix
   */
  function mapI2OX(ix) {
    return outerX + ix * (outerWidth / innerWidth);
  }


  /**
   * Map Y from viewport's (inner) coordinate system to
   * the world's (outer) coordinate system.
   *
   * @param {Number} iy
   */
  function mapI2OY(iy) {
    return outerY + iy * (outerHeight / innerHeight);
  }


  /**
   * Map X from world's (outer) coordinate system to
   * viewport's (inner) coordinate system.
   *
   * @param {Number} ox
   */
  function mapO2IX(ox) {
    return (ow - outerX) * (innerWidth / outerWidth);
  }


  /**
   * Map Y from world's (outer) coordinate system to
   * viewport's (inner) coordinate system.
   *
   * @param {Number} oy
   */
  function mapO2IY(oy) {
    return (oy - outerY) * (innerHeight / innerWidth);
  }

  // EXPOSURE

  const obj = {};

  util.extendObject(obj, {
    getIW,
    getIH,
    setIW,
    setIH,
    getOW,
    getOH,
    setOW,
    setOH,


    getOX,
    getOY,
    setOX,
    setOY,

    getOCX,
    getOCY,
    setOCX,
    setOCY,

    mapI2OX,
    mapI2OY,
    mapO2IX,
    mapO2IY,
  });

  return obj;
}());
