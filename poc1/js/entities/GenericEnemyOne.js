'use strict';



/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function GenericEnemyOne(cfg) {
  // Common inherited setup logic from Entity
  this.setup(cfg);

  if (!this.sprite) throw Error('NEED TO SET SPRITE TO CHARACTER');

  this._scale = this.sprite.scale;
}

// Inherit from Entity
GenericEnemyOne.prototype = new Entity();

GenericEnemyOne.prototype.rotation = 0;
GenericEnemyOne.prototype.cx = 200;
GenericEnemyOne.prototype.cy = 200;
GenericEnemyOne.prototype.velX = 0;
GenericEnemyOne.prototype.velY = 0;
GenericEnemyOne.prototype.acceleration = 0.3;
GenericEnemyOne.prototype.maxSpeed = 4;
GenericEnemyOne.prototype.hp = 100;
GenericEnemyOne.prototype.maxHP = 100;


// When the player stops accelerating then this
// factor determines how quickly it halts.  A smaller
// value it'll take a while to come to a halt,
// like slowing down when ice skating, and a higher
// value will cause it to halt quicker.
GenericEnemyOne.prototype.decay = 0.5;
GenericEnemyOne.prototype.attackCooldown = 50;

GenericEnemyOne.prototype.update = function (du) {

  // Unregister from spatial manager.
  spatialManager.unregister(this);

  if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  // Find target
  const player = entityManager.getPlayer();

  const cx = player.cx;
  const cy = player.cy;


  const dx = player.cx - this.cx;
  const dy = player.cy - this.cy;

  const len = Math.sqrt(dx * dx + dy * dy);

  if (len < 100) {
    this.attack(du);
  }

  const udx = dx / len;
  const udy = dy / len;

  this.velX = udx * this.maxSpeed * this.hp / this.maxHP;
  this.velY = udy * this.maxSpeed * this.hp / this.maxHP;

  // COLLISION CHECKING

  if (this.velX > this.maxSpeed) this.velX = this.maxSpeed;
  if (this.velX < -this.maxSpeed) this.velX = -this.maxSpeed;
  if (this.velY > this.maxSpeed) this.velY = this.maxSpeed;
  if (this.velY < -this.maxSpeed) this.velY = -this.maxSpeed;


  // AUDIO

  const EPS = 0.1;

  if (this._soundRunning) {
    const pr = Math.max(Math.abs(this.velX) / this.maxSpeed, Math.abs(this.velY) / this.maxSpeed);
    this._soundRunning.playbackRate = pr;
    this._soundRunning.volume = pr;
  }

  if (Math.abs(this.velX) > EPS || Math.abs(this.velY) > EPS) {
    // In motion
    if (DEBUG_PLAYER) console.log("Player location: ", this.cx / 32, this.cy / 32);
    if (!this._soundRunning && len < 2 * g_viewport.getIW()) {
      this._soundRunning = audioManager.play(g_url.running1, true);
    }
  }

  if (Math.abs(this.velX) < EPS && Math.abs(this.velY) < EPS) {
    this._soundRunning = null;
  }


  const oldX = this.cx;
  const oldY = this.cy;

  const newX = this.cx + du * this.velX;
  const newY = this.cy + du * this.velY;

  this.cx = newX;
  this.cy = newY;

  
    if (!g_world.inBounds(this.cx, this.cy, 0)) {
      this.cx = oldX;
      this.cy = oldY;
    }

    let flags = spatialManager.register(this);

    // Wall crap
    if (flags > 0 && flags < spatialManager.MIN_ENTITY) {
      if (flags < spatialManager.MIN_ENTITY) {
        this.cx = newX;
        this.cy = oldY;
        flags = spatialManager.register(this);
      }

      if (flags < spatialManager.MIN_ENTITY) {
        this.cx = oldX;
        this.cy = oldY;
        flags = spatialManager.register(this);
      }

      if (flags) {
        this.cx = oldX;
        this.cy = oldY;
        flags = spatialManager.register(this);
      }
    } 
};

GenericEnemyOne.prototype.attack = function (du) {

  this.attackCooldown -= 1.0 * du;

  if (this.attackCooldown > 0) return;

  this.attackCooldown += 50;

  audioManager.play(g_url.clawing);
};

GenericEnemyOne.prototype.takeBulletHit = function () {
  this.hp -= 25;
  audioManager.play(g_url.impact1);

  if (this.hp <= 0) {
    audioManager.play(g_url.dying);
    this.kill();
  }
};

GenericEnemyOne.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

GenericEnemyOne.prototype.render = function (ctx, cfg) {
  // TODO: maybe we wan't the player to cast shadows,
  // sometimes.
  

  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};

