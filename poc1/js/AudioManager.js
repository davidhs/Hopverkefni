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

    const assetsAudio = assets[url].audio;
    const audio = assetsAudio;

    audio.currentTime = 0;
    audio.play();
  }

  function add(arr) {
    for (let i = 0; i < arr.length; i++) {
      const obj = arr[i];

      const objUrl = obj.url;
      const url = objUrl;

      if (assets[url]) continue;

      const objVolume = obj.volume;
      const volume = objVolume;

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
