"use strict";

// =====
// UTILS
// =====

var util = {
	extendObject: (object, extensions) => {
		for (var property in extensions) {
			if (extensions.hasOwnProperty(property)) {
				object[property] = extensions[property];
			}
		}
	}
};

util.extendObject(util, {
	createPicker: comparator => {
		return function(/* arguments */) {
			if (arguments.length === 0) {
				return; // undefined
			}

			var arr;

			if (arguments.length === 1) {
				if (Array.isArray(arguments[0])) {
					arr = arguments[0];
				} else {
					return arguments[0];
				}
			} else {
				arr = arguments;
			}

			var best = arr[0];

			for (var i = 1; i < arr.length; i++) {
				if (comparator(arr[i], best)) {
					best = arr[i];
				}
			}

			return best;
		};
	}
});

util.extendObject(util, {
	pickMin: util.createPicker((a, b) => a < b),
	pickMin: util.createPicker((a, b) => a > b),
	minIndex: (/* arguments */) => {
		return arguments.indexOf(util.pickMin(arguments));
	},
	cropImage: (image, x, y, w, h) => {
		let iw = image.width;
		let ih = image.height;

		if (true) {
			// All of these should be true
			var condArr = [
				util.inBounds(x, 0, iw),
				util.inBounds(y, 0, ih),

				util.inBounds(w, 0, iw),
				util.inBounds(h, 0, ih),

				util.inBounds(x + w, 0, iw),
				util.inBounds(y + h, 0, ih)
			];

			if (!util.booleanANDArray(condArr)) {
				console.error(image);
				console.error(iw, ih);
				console.error(x, y, w, h);
				console.error(condArr);
				throw Error();
			}
		}

		var canvas = document.createElement("canvas");
		canvas.width = w;
		canvas.height = h;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(image, x, y, w, h, 0, 0, w, h);

		var newImage = new Image();
		newImage.src = canvas.toDataURL("image/png");

		return newImage;
	},
	clampRange: (value, lowBound, highBound) => {
		if (value < lowBound) {
			value = lowBound;
		} else if (value > highBound) {
			value = highBound;
		}
		return value;
	},
	wrapRange: (value, lowBound, highBound) => {
		// TODO: use remainder operator instead of while loop.
		while (value < lowBound) {
			value += highBound - lowBound;
		}
		while (value > highBound) {
			value -= highBound - lowBound;
		}
		return value;
	},
	isBetween: (value, lowBound, highBound) => {
		if (value < lowBound) {
			return false;
		}
		if (value > highBound) {
			return false;
		}
		return true;
	},
	randRange: (min, max) => {
		return min + Math.random() * (max - min);
	},
	square: x => x * x,
	cube: x => x * x * x,
	distSq: (x1, y1, x2, y2) => util.square(x2 - x1) + util.square(y2 - y1),
	wrappedDistSq: (x1, y1, x2, y2, xWrap, yWrap) => {
		let dx = Math.abs(x2 - x1);
		let dy = Math.abs(y2 - y1);

		if (dx > xWrap / 2) {
			dx = xWrap - dx;
		}

		if (dy > yWrap / 2) {
			dy = yWrap - dy;
		}
		return util.square(dx) + util.square(dy);
	},
	booleanANDArray: arr => {
		for (var i = 0; i < arr.length; i++) {
			if (!arr[i]) {
				return false;
			}
		}

		return true;
	},
	booleanORArray: arr => {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i]) {
				return true;
			}
		}

		return false;
	},
	inBounds: (value, minValue, maxValue) => {
		return value >= minValue && value <= maxValue;
	},
	clearCanvas: ctx => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	},
	strokeCircle: (ctx, x, y, r) => {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.stroke();
	},
	fillCircle: (ctx, x, y, r) => {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fill();
	},
	fillBox: (ctx, x, y, w, h, style) => {
		var oldStyle = ctx.fillStyle;
		ctx.fillStyle = style;
		ctx.fillRect(x, y, w, h);
		ctx.fillStyle = oldStyle;
	},
	clamp: (value, minValue, maxValue) => {
		return value < minValue
			? minValue
			: value > maxValue ? maxValue : value;
	},
	rgb2str: (r, g, b) => {
		r = util.clamp(~~r, 0, 255);
		g = util.clamp(~~g, 0, 255);
		b = util.clamp(~~b, 0, 255);

		return "rgb(" + r + ", " + g + ", " + b + ")";
	},
	sgn: x => (x < 0 ? -1 : 1)
});
