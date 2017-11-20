'use strict';

/* global Audio g_muted :true */

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
// d s
// NB: if it caches audio, then it doesn't do it for very long...
const audioManager = (function () {
  const aa = {};

  let muted = false;

  function mute() {
    if (muted) return;
    muted = true;
    console.log('muted');

    for (let i = 0, urls = Object.keys(aa); i < urls.length; i += 1) {
      const url = urls[i];
      const audioList = aa[url];
      for (let j = 0; j < audioList.length; j += 1) {
        const audio = audioList[j];
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
        }
      }
    }
  }

  function unmute() {
    if (!muted) return;
    muted = false;
    console.log('unmuted');
  }


  // Audio files are initially loaded by the asset manager.
  // It appears by doing so the audio file is cached, so `new Audio(...)'
  // appears to play the cached audio file.
  function play(url, loop) {
    if (g_muted) {
      if (!muted) mute();
      return null;
    }

    if (muted) unmute();

    loop = (typeof loop !== 'undefined') ? loop : false;

    if (!aa[url]) {
      const audio = new Audio(url);
      aa[url] = {
        idx: 0,
        list: [audio],
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
        audio.volume = 0.5;
        audio.currentTime = 0;
        audio.loop = loop;
        audio.play();
      }
    }

    const HARD_LIMIT = 8;

    // && aa[url].list.length <= 16

    if (!found && aa[url].list.length < HARD_LIMIT) {
      for (let i = 0; i < HARD_LIMIT; i += 1) {
        const audio = new Audio(url);
        aa[url].list.push(audio);
      }


      // TODO sound is too loud
      // handle = audio;
      // audio.play();
    }

    return handle;
  }


  // Expose properties and functions.
  return {
    play,
    debug: aa,
  };
}());
