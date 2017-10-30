'use strict';

// TODO this crap is useless

const audioManager = (function () {
  const assets = {};


  function play(url) {
    if (!assets[url]) {
      add([{
        url,
        volume: 0.5,
      }]);
    }

    const audio = assets[url].audio;

    audio.currentTime = 0;
    audio.play();
  }

  function add(arr) {
    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];

      const url = obj.url;

      if (assets[url]) continue;

      const volume = obj.volume;

      const audio = new Audio(url);
      audio.volume = volume;

      assets[url] = {
        url,
        volume,
        audio,
      };
    }
  }


  return {
    add,
    play,
  };
}());
