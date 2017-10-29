/*

entityManager.js

A module which handles arbitrary entity-management for "Asteroids"


We create this module as a single global object, and initialise it
with suitable 'data' and 'methods'.

"Private" properties are denoted by an underscore prefix convention.

*/

"use strict";

// Tell jslint not to complain about my use of underscore prefixes (nomen),
// my flattening of some indentation (white), or my use of incr/decr ops
// (plusplus).
//
/*jslint nomen: true, white: true, plusplus: true*/

var entityManager = (function() {
	// "PRIVATE" DATA

	var _rocks = [];
	var _bullets = [];
	var _players = [];
	var _explosions = [];

	var _categories = [_rocks, _bullets, _players, _explosions];

	var _bShowRocks = true;

	// "PRIVATE" METHODS

	function _generateRocks() {
		var i,
			NUM_ROCKS = 20;

		for (i = 0; i < NUM_ROCKS; ++i) {
			generateRock();
		}
	}

	function _forEachOf(aCategory, fn) {
		for (var i = 0; i < aCategory.length; ++i) {
			fn.call(aCategory[i]);
		}
	}

	// PUBLIC METHODS

	// A special return value, used by other objects,
	// to request the blessed release of death!
	//
	var KILL_ME_NOW = -1;

	function init() {
		generatePlayer();
		_generateRocks();
	}

	function fireBullet(cx, cy, velX, velY, rotation) {
		_bullets.push(
			new Bullet({
				cx: cx,
				cy: cy,
				velX: velX,
				velY: velY,

				rotation: rotation
			})
		);
	}

	function generatePlayer(descr) {
		_players.push(new Player(descr));
	}

	function generateExplosion(descr) {
		descr.sequence = g_asset.sequence.explosion;

		_explosions.push(new AnimatedImage(descr));
	}

	function generateRock(descr) {
		_rocks.push(new Rock(descr));
	}

	function toggleRocks() {
		_bShowRocks = !_bShowRocks;
	}

	// UPDATE ///////////////////////////////////////////////

	function update(du) {
		for (var c = 0; c < _categories.length; ++c) {
			var aCategory = _categories[c];
			var i = 0;

			while (i < aCategory.length) {
				var status = aCategory[i].update(du);

				if (status === KILL_ME_NOW) {
					// remove the dead guy, and shuffle the others down to
					// prevent a confusing gap from appearing in the array
					aCategory.splice(i, 1);
				} else {
					++i;
				}
			}
		}

		if (_rocks.length === 0) _generateRocks();
	}

	// RENDER ///////////////////////////////////////////////

	function render(ctx) {
		var debugX = 10,
			debugY = 100;

		for (var c = 0; c < _categories.length; ++c) {
			var aCategory = _categories[c];

			if (!_bShowRocks && aCategory == _rocks) continue;

			for (var i = 0; i < aCategory.length; ++i) {
				aCategory[i].render(ctx);
				//debug.text(".", debugX + i * 10, debugY);
			}
			debugY += 10;
		}
	}

	return {
		init: init,
		update: update,
		render: render,
		fireBullet: fireBullet,
		generateRock: generateRock,
		generateExplosion: generateExplosion,
		KILL_ME_NOW: KILL_ME_NOW,
		getPos: () => {
			if (_players.length > 0) {
				return _players[0];
			}
		}
	};
})();
