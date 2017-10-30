// ====
// ROCK
// ====

'use strict';

/* jshint browser: true, devel: true, globalstrict: true */

/*
0        1         2         3         4         5         6         7         8
12345678901234567890123456789012345678901234567890123456789012345678901234567890
*/


// A generic contructor which accepts an arbitrary descriptor object
function Rock(descr) {
  // Common inherited setup logic from Entity
  this.setup(descr);

  this.randomisePosition();
  this.randomiseVelocity();

  // Default sprite and scale, if not otherwise specified
  this.sprite = this.sprite || g_asset.sprite.rock;
  this.scale = this.scale || 1;

/*
    // Diagnostics to check inheritance stuff
    this._rockProperty = true;
    console.dir(this);
*/
}

Rock.prototype = new Entity();

Rock.prototype.randomisePosition = function () {
  // Rock randomisation defaults (if nothing otherwise specified)
  this.cx = this.cx || Math.random() * g_world.width;
  this.cy = this.cy || Math.random() * g_world.height;
  this.rotation = this.rotation || 0;
};

Rock.prototype.randomiseVelocity = function () {
  let MIN_SPEED = 20,
    MAX_SPEED = 70;

  const speed = util.randRange(MIN_SPEED, MAX_SPEED) / SECS_TO_NOMINALS;
  const dirn = Math.random() * consts.FULL_CIRCLE;

  this.velX = this.velX || speed * Math.cos(dirn);
  this.velY = this.velY || speed * Math.sin(dirn);

  let MIN_ROT_SPEED = 0.5,
    MAX_ROT_SPEED = 2.5;

  this.velRot = this.velRot ||
        util.randRange(MIN_ROT_SPEED, MAX_ROT_SPEED) / SECS_TO_NOMINALS;
};

Rock.prototype.update = function (du) {
  // TODO: YOUR STUFF HERE! --- Unregister and check for death
  spatialManager.unregister(this);

  if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  this.cx += this.velX * du;
  this.cy += this.velY * du;

  this.rotation += 1 * this.velRot;
  this.rotation = util.wrapRange(
    this.rotation,
    0, consts.FULL_CIRCLE,
  );

  this.wrapPosition();

  // TODO: YOUR STUFF HERE! --- (Re-)Register
  spatialManager.register(this);
};

Rock.prototype.getRadius = function () {
  return this.scale * (this.sprite.width / 2) * 0.9;
};

// HACKED-IN AUDIO (no preloading)
Rock.prototype.splitSound = new Audio('audio/rockSplit.ogg');
Rock.prototype.evaporateSound = new Audio('audio/rockEvaporate.ogg');

Rock.prototype.takeBulletHit = function () {
  this.kill();

  if (this.scale > 0.25) {
    this._spawnFragment();
    this._spawnFragment();

    var sound = new Audio('audio/rockSplit.ogg');
    sound.play();

    // this.splitSound.play();
  } else {
    var sound = new Audio('audio/rockEvaporate.ogg');
    sound.play();

    // this.evaporateSound.play();
  }
};

Rock.prototype._spawnFragment = function () {
  entityManager.generateRock({
    cx: this.cx,
    cy: this.cy,
    scale: this.scale / 2,
  });
};

Rock.prototype.render = function (ctx, cfg) {
  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this.scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
};
