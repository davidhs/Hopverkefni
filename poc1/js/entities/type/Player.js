'use strict';


const DEBUG_PLAYER = false;

/* global g_asset Entity keyCode g_viewport g_mouse g_canvas g_keys
spatialManager entityManager g_world :true */

function Player(descriptor) {
  // Common inherited setup logic from Entity
  this.setup(descriptor);

  if (!this.sprite) throw Error('NEED TO SET SPRITE TO CHARACTER');

  this._scale = this.sprite.scale;

  this._soundRunning = new Audio(g_url.running1);
  this._soundRunning.loop = true;
}

// Inherit from Entity
Player.prototype = new Entity();

Player.prototype.KEY_UP = keyCode('W');
Player.prototype.KEY_DOWN = keyCode('S');
Player.prototype.KEY_LEFT = keyCode('A');
Player.prototype.KEY_RIGHT = keyCode('D');

Player.prototype.KNIFE = keyCode('1');
Player.prototype.PISTOL = keyCode('2');
Player.prototype.SHOTGUN = keyCode('3');
Player.prototype.RIFLE = keyCode('4');
Player.prototype.MAGNUM = keyCode('5');
Player.prototype.HEAVYMG = keyCode('6');
Player.prototype.RAYGUN = keyCode('7');

Player.prototype.rotation = 0;
Player.prototype.cx = 200;
Player.prototype.cy = 200;
Player.prototype.velX = 0;
Player.prototype.velY = 0;
Player.prototype.acceleration = 0.5;
Player.prototype.maxSpeed = 5;
Player.prototype.weapons = [true, true, false, true,
  false, false, false];
Player.prototype.weaponSelected = 1;

// When the player stops accelerating then this
// factor determines how quickly it halts.  A smaller
// value it'll take a while to come to a halt,
// like slowing down when ice skating, and a higher
// value will cause it to halt quicker.
Player.prototype.decay = 0.5;

// This here is (currently) the firing rate.  Maybe different
// types of weapons should have different firing rates.
Player.prototype.bulletCooldown = 0;

Player.prototype.update = function (du) {
  spatialManager.unregister(this);

  this.bulletCooldown = Math.max(this.bulletCooldown - du, 0);

  // Convert Viewport/Canvas coordinates to World coordinates.
  const mx = g_viewport.getOCX() + g_mouse.x - g_canvas.width / 2;
  const my = g_viewport.getOCY() + g_mouse.y - g_canvas.height / 2;
  const dx = mx - this.cx;
  const dy = my - this.cy;

  this.rotation = Math.atan2(dy, dx);

  // TODO: unregister
  // spatialManager.unregister(this);

  // TODO: check for death
  // if (this._isDeadNow) return entityManager.KILL_ME_NOW;

  // TODO: do movement


  let noHorAcc = true;
  let noVerAcc = true;

  const EPS = 0.1;

  if (g_keys[this.KEY_UP]) {
    this.velY = Math.max(this.velY - this.acceleration * du, -this.maxSpeed);
    noVerAcc = false;

  }

  if (g_keys[this.KEY_DOWN]) {
    this.velY = Math.min(this.velY + this.acceleration * du, this.maxSpeed);
    noVerAcc = false;
  }

  if (g_keys[this.KEY_LEFT]) {
    this.velX = Math.max(this.velX - this.acceleration * du, -this.maxSpeed);
    noHorAcc = false;
  }

  if (g_keys[this.KEY_RIGHT]) {
    this.velX = Math.min(this.velX + this.acceleration * du, this.maxSpeed);
    noHorAcc = false;
  }

  if (eatKey(this.KNIFE) && this.weapons[0]) {
    console.log('Machete selected!');
    this.weaponSelected = 1;



    HUD.witchWeapon('knife');

  }

  if (eatKey(this.PISTOL) && this.weapons[1]) {
    console.log('Pistol selected!');
    this.weaponSelected = 2;



    HUD.witchWeapon('handgun');
  }

  if (eatKey(this.SHOTGUN) && this.weapons[2]) {
    console.log('Shotgun selected!');
    this.weaponSelected = 3;



    HUD.witchWeapon('shotgun');
  }

  if (g_keys[this.RIFLE]) {
    this.weaponSelected = 4;




    HUD.witchWeapon('rifle');
  }

  if (g_keys[this.MAGNUM]) {
    this.weaponSelected = 5;
  }

  if (g_keys[this.HEAVYMG]) {
    this.weaponSelected = 6;
  }

  if (g_keys[this.RAYGUN]) {
    this.weaponSelected = 7;
  }

  const slowDown = 1.0 / (1.0 + this.decay * du);

  if (noHorAcc) this.velX *= slowDown;
  if (noVerAcc) this.velY *= slowDown;

  // =====
  // AUDIO
  // =====

  if (this._soundRunning) {
    const pr = Math.max(Math.abs(this.velX) / this.maxSpeed, Math.abs(this.velY) / this.maxSpeed);
    this._soundRunning.playbackRate = pr;
  }

  if (Math.abs(this.velX) > EPS || Math.abs(this.velY) > EPS) {
    // In motion
    if (DEBUG_PLAYER) console.log('Player location: ', this.cx / 32, this.cy / 32);
    if (!this._soundRunning) {
      this._soundRunning = audioManager.play(g_url.audio.running1);
    }
  }

  if (Math.abs(this.velX) < EPS && Math.abs(this.velY) < EPS) {
    this._soundRunning = null;
  }

  // ======
  // FIRING
  // ======

  // TODO: Handle firitng

  if (g_mouse.isDown) {
    this.fireBullet();
  }

  // COLLISION CHECKING

  //


  const oldX = this.cx;
  const oldY = this.cy;

  let newX = this.cx + du * this.velX;
  let newY = this.cy + du * this.velY;

  this.cx = newX;
  this.cy = newY;



  if (!g_noClip) {
    if (!g_world.inBounds(this.cx, this.cy, 0)) {
      this.cx = oldX;
      this.cy = oldY;
    }

    let flags = spatialManager.register(this);
    //console.log(flags);


    // Wall crap
    if (flags !== spatialManager.NO_CONFLICT && flags < spatialManager.MIN_ENTITY) {


      if (flags !== spatialManager.NO_CONFLICT) {
        this.cx = newX;
        this.cy = oldY;
        flags = spatialManager.register(this);
      }

      if (flags !== spatialManager.NO_CONFLICT) {
        this.cx = oldX;
        this.cy = newY;
        flags = spatialManager.register(this);
      }

      if (flags !== spatialManager.NO_CONFLICT) {
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

// TODO: maybe we wan't different bullets?
Player.prototype.fireBullet = function () {
  if (!g_mouse.isDown) return;

  if (this.bulletCooldown > 0) return;

  // TODO: bind in JSON how long each bullet lives
  // until it fades away.
  this.bulletCooldown += 0.1 * SECS_TO_NOMINALS;

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

  // TODO: Do this a bit different.
  entityManager.fireBullet(
    cx,
    cy,
    velX,
    velY,
    rotation,
  );
};


Player.prototype.render = function (ctx, cfg) {
  // TODO: maybe we wan't the player to cast shadows,
  // sometimes.
  if (cfg && cfg.occlusion) return;

  const origScale = this.sprite.scale;
  // pass my scale into the sprite, for drawing
  this.sprite.scale = this._scale;
  this.sprite.drawCentredAt(ctx, this.cx, this.cy, this.rotation, cfg);
  this.sprite.scale = origScale;
};
