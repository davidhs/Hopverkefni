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
//
// NB: if it caches audio, then it doesn't do it for very long...
const audioManager = (function () {

  const aa = {};


  // Audio files are initially loaded by the asset manager.
  // It appears by doing so the audio file is cached, so `new Audio(...)'
  // appears to play the cached audio file.
  function play(url, loop) {

    loop = (typeof loop !== "undefined") ? loop : false;

    if (!aa[url]) {
      const audio = new Audio(url);
      aa[url] = {
        idx: 0,
        list: [audio]
      };
    }

    let handle = null;

    // Search for available audio
    let found = false;
    for (let i = 0; i < aa[url].list.length && !found; i += 1) {
      if (!found && aa[url].list[i].paused) {
        found = true;
        const audio = aa[url].list[i];
        handle = audio;

        audio.playbackRate = 1.0;
        audio.volume = 1.0;
        audio.currentTime = 0;
        audio.loop = loop;
        audio.play();
      }
    }

    if (!found) {
      const audio = new Audio(url);
      handle = audio;
      audio.play();
      aa[url].list.push(audio);
    }

    return handle;
  }

  // Expose properties and functions.
  return {
    play,
    debug: aa
  };
}());
