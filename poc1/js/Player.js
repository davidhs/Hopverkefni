"use strict";

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
Player.prototype.KEY_RIGHT  = keyCode('D');

Player.prototype.rotation = 0;
Player.prototype.cx = 200;
Player.prototype.cy = 200;
Player.prototype.velX = 0;
Player.prototype.velY = 0;

Player.prototype.bulletCooldown = 0;

Player.prototype.update = function (du) {


    this.bulletCooldown = Math.max(this.bulletCooldown - 10, 0);

    // Convert Viewport/Canvas coordinates to World coordinates.
    var mx = g_viewport.cx + g_mouse.x - g_canvas.width / 2;
    var my = g_viewport.cy + g_mouse.y - g_canvas.height / 2;

    
    var dx = mx - this.cx;
    var dy = my - this.cy;

    this.rotation = Math.atan2(dy, dx);




    // TODO: unregister
    // spatialManager.unregister(this);


    // TODO: check for death
    // if (this._isDeadNow) return entityManager.KILL_ME_NOW;

    let speed = 10;

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


    var new_x = this.cx + du * this.velX;
    var new_y = this.cy + du * this.velY;
    

    if (g_world.inBounds(new_x, new_y, 0)) {

        this.cx = new_x;
        this.cy = new_y;
    }



    // TODO: Handle firitng

    if (g_mouse.isDown) {
        this.fireBullet();
    }

    // this.maybeFireBullet();

    
    // TODO: YOUR STUFF HERE! --- Warp if isColliding, otherwise Register

    // TODO: check if colliding.
    
    // TODO: re-register with spatial manager.
    //spatialManager.register(this);
};

Player.prototype.getRadius = function () {
    return (this._scale * this.sprite.width / 2) * 0.9;
};

Player.prototype.fireBullet = function () {

    if (!g_mouse.isDown) return;

    if (this.bulletCooldown > 0) return;

    this.bulletCooldown += 100;

    var angle = Math.PI / 2 + this.rotation;


    var dX = +Math.sin(angle);
    var dY = -Math.cos(angle);

    var launchDist = this.getRadius() * 1.2;
    
    var relVel = Math.max(this.velX, this.velY);

    var speed = 15;

    var red = 0.01;

    var cx = this.cx + dX * launchDist;
    var cy = this.cy + dY * launchDist;

    var velX = dX * speed;
    var velY = dY * speed;

    var rotation = this.rotation;

    entityManager.fireBullet(
       cx,
       cy,
       velX,
       velY,
       rotation
    );
};


Player.prototype.render = function (ctx) {

    var origScale = this.sprite.scale;
    // pass my scale into the sprite, for drawing
    this.sprite.scale = this._scale;
    this.sprite.drawCentredAt(
        ctx, this.cx, this.cy, this.rotation
    );
    this.sprite.scale = origScale;
};