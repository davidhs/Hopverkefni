"use strict";

// TODO this crap is useless

var audioManager = (function() {
	let assets = {};

	function play(url) {
		if (!assets[url]) {
			add([
				{
					url: url,
					volume: 0.5
				}
			]);
		}

		let audio = assets[url].audio;

		audio.currentTime = 0;
		audio.play();
	}

	function add(arr) {
		for (let i = 0; i < arr.length; i++) {
			let obj = arr[i];

			let url = obj.url;

			if (assets[url]) continue;

			let volume = obj.volume;

			let audio = new Audio(url);
			audio.volume = volume;

			assets[url] = {
				url: url,
				volume: volume,
				audio: audio
			};
		}
	}

	return {
		add: add,
		play: play
	};
})();
