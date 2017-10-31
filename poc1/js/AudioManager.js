'use strict';

// TODO this crap is useless

const audioManager = (function () {

  function play(url) {
    var sound = new Audio(url);
    sound.play();
  }


  return {
    play
  };
}());
