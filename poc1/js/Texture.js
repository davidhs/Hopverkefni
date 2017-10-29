"use strict";

function Texture(obj) {
	obj.scale = obj.scale || 1;

	this._ = {
		image: obj.image,
		scale: obj.scale
	};

	this.resize(obj.width, obj.height);
}

Texture.prototype.resize = function(textureWidth, textureHeight) {
	this._.width = textureWidth;
	this._.height = textureHeight;

	let image = this._.image;
	let scale = this._.scale;

	let w = image.width;
	let h = image.height;

	var dw = scale * w;
	var dh = scale * h;

	var m = 1 + ~~(textureHeight / dh);
	var n = 1 + ~~(textureWidth / dw);

	var canvas = document.createElement("canvas");
	canvas.width = textureWidth;
	canvas.height = textureHeight;

	var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	for (var i = 0; i < m; i++) {
		var y = i * dh;
		for (var j = 0; j < n; j++) {
			var x = j * dw;

			ctx.drawImage(image.getImage(), 0, 0, w, h, x, y, dw, dh);
		}
	}

	this._.texture = new FastImage(canvas);
};

Texture.prototype.getTexture = function() {
	return this._.texture;
};

Texture.prototype.render = function(ctx, x, y, w, h) {
	x = x || 0;
	y = y || 0;

	w = w || this._.texture.width;
	h = h || this._.texture.height;

	ctx.drawImage(this._.texture.getImage(), x, y, w, h);
};
