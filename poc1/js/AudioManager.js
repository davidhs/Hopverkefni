'use strict';

/* global Audio :true */

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/

// =============
// AUDIO MANAGER
// =============

// The audio manager is responsible for playing sounds.  Currently plays sounds
// whos URL is passed to the play "method".
//
// Later on the URL might take position and occlusion map as parameter to
// modify the sound, e.g. sound that is farther away isn't as loud,  sound
// that is blocked by some corner or "outside" is muffled.
const audioManager = (function () {
  // Audio files are initially loaded by the asset manager.
  // It appears by doing so the audio file is cached, so `new Audio(...)'
  // appears to play the cached audio file.
  function play(url) {
    const sound = new Audio(url);
    sound.play();
  }

  // Expose properties and functions.
  return {
    play,
  };
}());
