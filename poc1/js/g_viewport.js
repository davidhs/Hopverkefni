"use strict";

var g_viewport = (function() {
	var viewport = {};

	viewport.canvas = document.createElement("canvas");
	viewport.ctx = viewport.canvas.getContext("2d");

	var _world = null;

	viewport.cx = 500;
	viewport.cy = 500;

	viewport.width = 600;
	viewport.height = 0;

	var width = 0;
	var height = 0;

	var _canvas = null;

	function setWorld(world) {
		_world = world;
	}

	function setCanvas(canvas) {
		_canvas = canvas;
	}

	viewport.update = function() {};

	viewport.setWorld = setWorld;
	viewport.setCanvas = setCanvas;

	return viewport;
})();
