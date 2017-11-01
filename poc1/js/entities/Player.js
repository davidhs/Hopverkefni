'use strict';

/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function Player(descriptor) {
  // Common inherited setup logic from Entity
  this.setup(descriptor);

  // Default sprite
  this.sprite = this.sprite || g_asset.sprite.player;

  // Set normal drawing scale, and warp state off
  this._scale = 0.25;
}

// Inherit from Entity
Player.prototype = new Entity();

Player.prototype.KEY_UP = keyCode('W');
Player.prototype.KEY_DOWN = keyCode('S');
Player.prototype.KEY_LEFT = keyCode('A');
Player.prototype.KEY_RIGHT = keyCode('D');

Player.prototype.rotation = 0;
Player.prototype.cx = 200;
Player.prototype.cy = 200;
Player.prototype.velX = 0;
Player.prototype.velY = 0;

Player.prototype.bulletCooldown = 0;

Player.prototype.update = function (du) {
  spatialManager.unregister(this);

  this.bulletCooldown = Math.max(this.bulletCooldown - du, 0);

  // Convert Viewport/Canvas coordinates to World coordinates.
  const mx = g_viewport.cx + g_mouse.x - g_canvas.width / 2;
  const my = g_viewport.cy + g_mouse.y - g_canvas.height / 2;
  const dx = mx - this.cx;
  const dy = my - this.cy;

  this.rotation = Math.atan2(dy, dx);


  // TODO: unregister
  // spatialManager.unregister(this);

  // TODO: check for death
  // if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  const speed = 10;

  this.velX = 0;
  this.velY = 0;

  // TODO: do movement

  if (g_keys[this.KEY_UP]) {
    this.velY = -speed;
  }

  if (g_keys[this.KEY_DOWN]) {
    this.velY = +speed;
  }

  if (g_keys[this.KEY_LEFT]) {
    this.velX = -speed;
  }

  if (g_keys[this.KEY_RIGHT]) {
    this.velX = +speed;
  }

  // TODO: Handle firitng

  if (g_mouse.isDown) {
    this.fireBullet();
  }

  // COLLISION CHECKING


  const oldX = this.cx;
  const oldY = this.cy;

  const newX = this.cx + du * this.velX;
  const newY = this.cy + du * this.velY;

  this.cx = newX;
  this.cy = newY;

  if (!g_noClip) {
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
    } else if (flags) {
      // Entity stuff
      const hitEntity = this.findHitEntity();
      if (hitEntity) {
        const cx1 = this.cx;
        const cy1 = this.cy;
        const r1 = this.getRadius();

        const cx2 = hitEntity.cx;
        const cy2 = hitEntity.cy;
        const r2 = hitEntity.getRadius();

        const dr = r2 + r1;
        const r = Math.sqrt(util.distSq(cx1, cy1, cx2, cy2));

        const p = r / dr;

        this.cx = oldX + p * (du * this.velX);
        this.cy = oldY + p * (du * this.velY);

        flags = 0;
      }
    }
    spatialManager.register(this);
  }
};

Player.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

Player.prototype.fireBullet = function () {
  if (!g_mouse.isDown) return;

  if (this.bulletCooldown > 0) return;

  this.bulletCooldown += 0.05 * SECS_TO_NOMINALS;

  const angle = Math.PI / 2 + this.rotation;


  const dX = +Math.sin(angle);
  const dY = -Math.cos(angle);

  const launchDist = this.getRadius() * 1.2;

  const relVel = Math.max(this.velX, this.velY);

  const speed = 15;

  const red = 0.01;

  const cx = this.cx + dX * launchDist;
  const cy = this.cy + dY * launchDist;

  const velX = dX * speed;
  const velY = dY * speed;

  const rotation = this.rotation;

  entityManager.fireBullet(
    cx,
    cy,
    velX,
    velY,
    rotation,
  );
};


Player.prototype.render = function (ctx, cfg) {
  if (cfg && cfg.occlusion) return;

  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};