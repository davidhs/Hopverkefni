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

// Movements
Player.prototype.KEY_UP = keyCode('W');
Player.prototype.KEY_DOWN = keyCode('S');
Player.prototype.KEY_LEFT = keyCode('A');
Player.prototype.KEY_RIGHT = keyCode('D');

// Weapon Keys
Player.prototype.KNIFE = keyCode('0');
Player.prototype.PISTOL = keyCode('1');
Player.prototype.SHOTGUN = keyCode('2');
Player.prototype.RIFLE = keyCode('3');
Player.prototype.MAGNUM = keyCode('4');
Player.prototype.HEAVYMG = keyCode('5');
Player.prototype.RAYGUN = keyCode('6');

// Rendering properties
Player.prototype.rotation = 0;
Player.prototype.cx = 180;
Player.prototype.cy = 180;
Player.prototype.velX = 0;
Player.prototype.velY = 0;

// Misc
Player.prototype.RELOAD = keyCode('R');
Player.prototype.acceleration = 0.5;
Player.prototype.maxSpeed = 5;
Player.prototype.health = 100;
Player.prototype.useWeapon = 1;
Player.prototype.autoFire = false;

const armory = [];

const knife = {
  name: 'knife',
  auto: true,
  has: true,
  weapon: 0,
  damage: 150,
  accuracy: 1,
  bulletSpeed: Infinity,
  fireRate: 5,
  reloadTime: 0,
  through: 0,
  ammo: Infinity,
  magazineSize: Infinity,
  magazineAmmo: Infinity,
};

const pistol = {
  name: 'pistol',
  auto: false,
  has: true,
  weapon: 1,
  damage: 24,
  accuracy: 0.8,
  bulletSpeed: 5,
  fireRate: 60,
  reloadTime: 1,
  through: 0,
  ammo: 96,
  magazineSize: 12,
  magazineAmmo: 12,
};

const shotgun = {
  name: 'shotgun',
  auto: false,
  has: true,
  weapon: 2,
  damage: 9,
  accuracy: 0.1,
  bulletSpeed: 5,
  fireRate: 100,
  reloadTime: 4,
  through: 0,
  ammo: 40,
  magazineSize: 8,
  magazineAmmo: 8,
};

const rifle = {
  name: 'rifle',
  auto: true,
  has: true,
  weapon: 3,
  damage: 86,
  accuracy: 0.9,
  bulletSpeed: 5,
  fireRate: 20,
  reloadTime: 2,
  through: 2,
  ammo: 90,
  magazineSize: 30,
  magazineAmmo: 30,
};

const sniper = {
  name: 'sniper',
  auto: false,
  has: false,
  weapon: 4,
  damage: 160,
  accuracy: 1,
  bulletSpeed: 100,
  fireRate: 1,
  reloadTime: 3,
  through: 3,
  ammo: 30,
  magazineSize: 10,
  magazineAmmo: 10,
};

const mg = {
  name: 'mg',
  auto: true,
  has: false,
  weapon: 5,
  damage: 70,
  accuracy: 0.8,
  bulletSpeed: 50,
  fireRate: 8,
  reloadTime: 8,
  through: 1,
  ammo: 300,
  magazineSize: 100,
  magazineAmmo: 100,
};

const ray = {
  name: 'ray',
  auto: false,
  has: false,
  weapon: 6,
  damage: 300,
  accuracy: 1,
  bulletSpeed: 100,
  fireRate: 1,
  reloadTime: 2,
  through: 0,
  ammo: 30,
  magazineSize: 10,
  magazineAmmo: 10,
};

armory.push(knife);
armory.push(pistol);
armory.push(shotgun);
armory.push(rifle);
armory.push(sniper);
armory.push(mg);
armory.push(ray);

// When the player stops accelerating then this
// factor determines how quickly it halts.  A smaller
// value it'll take a while to come to a halt,
// like slowing down when ice skating, and a higher
// value will cause it to halt quicker.
Player.prototype.decay = 0.5;

// This here is (currently) the firing rate.  Maybe different
// types of weapons should have different firing rates.
// NOTE: Works actually like a reload time
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

  // NOTE: Svona (sirka) mun thetta vera i stad fullt af IF fyrir oll vopnin
  // if (eatKey( i in weaponKeys )) {
  //   if (armory[this.key].has) {
  //      this.useWeapon = armory[this.key].weapon
  //      this.bulletCooldown = armory[this.key].fireRate
  //      }
  //   }

  if (eatKey(this.KNIFE) && armory[0].has) {
    console.log('Knife selected!');
    this.useWeapon = 0;
    this.bulletCooldown = armory[this.useWeapon].fireRate;

    // Alexander

    HUD.witchWeapon('knife');
  }

  if (eatKey(this.PISTOL) && armory[1].has) {
    console.log('PISTOL selected!');
    this.useWeapon = 1;
    this.bulletCooldown = armory[this.useWeapon].fireRate;

    // Alexander

    HUD.witchWeapon('handgun');
  }

  if (eatKey(this.SHOTGUN) && armory[2].has) {
    console.log('Shotgun selected!');
    this.useWeapon = 2;
    this.bulletCooldown = armory[this.useWeapon].fireRate;

    // Alexander

    HUD.witchWeapon('shotgun');
  }

  if (eatKey(this.RIFLE) && armory[3].has) {
    console.log('AK selected!');
    this.useWeapon = 3;
    this.bulletCooldown = armory[this.useWeapon].fireRate;

    // Alexander

    HUD.witchWeapon('rifle');
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
    if (armory[this.useWeapon].magazineAmmo > 0) {
      // console.log(`Firing ${armory[this.useWeapon].name}`);
      this.fireBullet();
    } else {
      // console.log(`Reload ${armory[this.useWeapon].name}`);
    }
  }

  if (eatKey(this.RELOAD)) {
    this.reloadWeapon();
  }

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

    let spatialID = spatialManager.register(this);


    // Wall crap
    if (spatialID !== spatialManager.NO_CONFLICT) {

      if (spatialID !== spatialManager.NO_CONFLICT) {
        this.cx = newX;
        this.cy = oldY;
        spatialID = spatialManager.register(this);
      }

      if (spatialID !== spatialManager.NO_CONFLICT) {
        this.cx = oldX;
        this.cy = newY;
        spatialID = spatialManager.register(this);
      }

      if (spatialID !== spatialManager.NO_CONFLICT) {
        this.cx = oldX;
        this.cy = oldY;
        spatialID = spatialManager.register(this);
      }
    }

    if (!spatialManager.isRegistered(this)) {
      spatialManager.register(this);
      if (!spatialManager.isRegistered(this)) {
        throw Error();
      }
    }
  }
};

Player.prototype.getAmmoStatus = function () {
  return armory[this.useWeapon].ammo;
};

Player.prototype.getRadius = function () {
  return (this._scale * this.sprite.width / 2) * 0.9;
};

Player.prototype.reloadWeapon = function () {
  if (armory[this.useWeapon].ammo >= armory[this.useWeapon].magazineSize) {
    armory[this.useWeapon].magazineAmmo = armory[this.useWeapon].magazineSize;
    armory[this.useWeapon].ammo -= armory[this.useWeapon].magazineSize;
  } else {
    armory[this.useWeapon].magazineAmmo = armory[this.useWeapon].ammo;
    armory[this.useWeapon].ammo -= armory[this.useWeapon].ammo;
  }
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

  const speed = armory[this.useWeapon].bulletSpeed;

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


Player.prototype.getWitchWeapon = function () {
  return this.useWeapon;
};
