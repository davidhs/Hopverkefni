"use strict";

// A generic contructor which accepts an arbitrary descriptor object
function Bullet(descr) {
	// Common inherited setup logic from Entity
	this.setup(descr);

	// Make a noise when I am created (i.e. fired)
	//this.fireSound.play();

	var sound = new Audio("audio/bulletFire.ogg");
	sound.play();
}

Bullet.prototype = new Entity();

// TODO: Move Audio to Preloader
Bullet.prototype.fireSound = new Audio("audio/bulletFire.ogg");
Bullet.prototype.zappedSound = new Audio("audio/bulletZapped.ogg");

// Initial, inheritable, default values
Bullet.prototype.rotation = 0;
Bullet.prototype.cx = 200;
Bullet.prototype.cy = 200;
Bullet.prototype.velX = 1;
Bullet.prototype.velY = 1;

// Convert times from milliseconds to "nominal" time units.
Bullet.prototype.lifeSpan = 3000 / NOMINAL_UPDATE_INTERVAL;

Bullet.prototype.update = function(du) {
	// TODO: YOUR STUFF HERE! --- Unregister and check for death
	spatialManager.unregister(this);

	if (!g_world.inBounds(this.cx, this.cy)) return entityManager.KILL_ME_NOW;

	this.lifeSpan -= du;
	if (this.lifeSpan < 0) return entityManager.KILL_ME_NOW;

	this.cx += this.velX * du;
	this.cy += this.velY * du;

	var hitEntity = this.findHitEntity();
	if (hitEntity) {
		var canTakeHit = hitEntity.takeBulletHit;
		if (canTakeHit) canTakeHit.call(hitEntity);

		entityManager.generateExplosion({
			cx: this.cx,
			cy: this.cy
		});

		return entityManager.KILL_ME_NOW;
	}

	// TODO: YOUR STUFF HERE! --- (Re-)Register
	spatialManager.register(this);
};

Bullet.prototype.getRadius = function() {
	return 4;
};

Bullet.prototype.takeBulletHit = function() {
	this.kill();

	var sound = new Audio("audio/bulletZapped.ogg");
	sound.play();

	// Make a noise when I am zapped by another bullet
	//this.zappedSound.play();
};

Bullet.prototype.render = function(ctx) {
	var fadeThresh = Bullet.prototype.lifeSpan / 3;

	if (this.lifeSpan < fadeThresh) {
		ctx.globalAlpha = this.lifeSpan / fadeThresh;
	}

	g_asset.sprite.bullet.drawCentredAt(ctx, this.cx, this.cy, this.rotation);

	ctx.globalAlpha = 1;
};
