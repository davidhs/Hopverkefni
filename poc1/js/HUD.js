'use strict';

/* global  document :true */

const HUD = (function () {
  // globals for the HUDBAR itself
  let H_cx = 0;
  let H_cy = 0;
  let H_width = 0;
  let H_height = 0;


  // globals for health bar
  let xHP = 0;
  let yHP = 0;
  let widthHP = 0;
  let heightHP = 0;
  let hpLost = 0;

  // globals for weapons
  let W_cx = 0;
  let W_cy = 0;
  let weapons = [];


  // globals for Numbers
  let n_sx = 0;
  let n_sy = 0;
  let n_sw = 0;
  let n_sh = 0;
  let n_dy = 0;
  let n_dx = 0;
  let n_dw = 0;
  let n_dh = 0;




  // test key
  const KEY_HPTEST = keyCode('G');


  // toggle on or off weapon images
  let isRifle = false;
  let isHandgun = true;
  let isShotgun = false;
  let isKnife = false;
  let isSniper = false;
  let isSmg = false;
  let isRaygun = false;


  // create images
  let background = new Image();
  let heart = new Image();
  let knife = new Image();
  let shotgun = new Image();
  let rifle = new Image();
  let handgun = new Image();
  let sniper = new Image();
  let smg = new Image();
  let raygun = new Image();
  let exists = new Image();
  let notexists = new Image();
  let selected = new Image();


  // =================
  // Weapon_handler
  // =================

  // reset weapon values to false so there
  // won't be 2 guns true at the same time

  function resetweapons() {
    isRifle = false;
    isHandgun = false;
    isShotgun = false;
    isKnife = false;
    isSniper = false;
    isSmg = false;
    isRaygun = false;
  }

  // witch weapon should appear on the screen, collected by
  // string from Player.js
  function witchWeapon(gun) {
    if (gun === 'knife') {
      console.log('1');
      resetweapons();
      isKnife = true;
    }
    if (gun === 'handgun') {
      console.log('2');
      resetweapons();
      isHandgun = true;
    }
    if (gun === 'shotgun') {
      console.log('3');
      resetweapons();
      isShotgun = true;
    }

    if (gun === 'rifle') {
      console.log('4');
      resetweapons();
      isRifle = true;
    }
  }


  // =================
  // draw functions
  // =================


  // draw function for healtbar

  function draw_healthbar(ctx, x, y, perclost, width, thickness) {
    if (hpLost <= 0.5) {
      ctx.beginPath();
      ctx.fillStyle = '#00cc00';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else if (hpLost <= 0.70) {
      ctx.beginPath();
      ctx.fillStyle = '#ff9933';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else if (hpLost <= 0.9) {
      ctx.beginPath();
      ctx.fillStyle = '#ff3300';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.fillStyle = '#ff0000';
      ctx.rect(x, y, width * (1 - perclost), thickness);
      ctx.fill();
    }
  }

  // draw tiny heart next to lifebar
  function draw_heart(ctx, x, y, width, size) {
    ctx.beginPath();
    ctx.drawImage(heart, x, y, width, size);
  }

  // draw gun
  function drawWeapon(ctx, x, y) {
    if (isKnife) {
      const width = 100;
      const height = 50;
      ctx.beginPath();
      ctx.drawImage(knife, x, y, width, height);
    }
    if (isHandgun) {
      const width = 100;
      const height = 35;
      ctx.beginPath();
      ctx.drawImage(handgun, x, y, width, height);
    }
    // TODO: SHOTGUN

    if (isRifle) {
      const width = 120;
      const height = 50;
      ctx.beginPath();
      ctx.drawImage(rifle, x, y, width, height);
    }

    //
    if (isShotgun) {
      const width = 120;
      const height = 50;
      ctx.beginPath();
      ctx.drawImage(shotgun, x - 20, y, width, height);
    }
  }


  //messy but works, will probably change this to make it look better
  function drawNumber(ctx, sx, sy, sw, sh, dx, dy, dw, dh){
    if(isHandgun){
      ctx.drawImage(selected, sx, sy, sw, sh, dx,dy, dw, dh);
    }
    else{
      ctx.drawImage(exists, sx, sy, sw, sh, dx,dy, dw, dh);
    }
    sx += sw;
    dx += dw;

    if(isShotgun){
      ctx.drawImage(selected, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    else{
      ctx.drawImage(exists, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    sx += sw;
    dx += dw;

    if(isRifle){
      ctx.drawImage(selected, sx, sy, sw, sh, dx,dy, dw, dh);
    }
    else{
      ctx.drawImage(exists, sx, sy, sw, sh, dx,dy, dw, dh);
    }

    sx += sw;
    dx += dw;


    ctx.drawImage(notexists, sx, sy, sw, sh, dx,dy, dw, dh);

    sx += sw;
    dx += dw;

    ctx.drawImage(notexists, sx, sy, sw, sh, dx,dy, dw, dh);
    sx += sw;
    dx += dw;
    ctx.drawImage(notexists, sx, sy, sw, sh, dx,dy, dw, dh);

    sx += sw;
    dx += dw;

    ctx.drawImage(notexists, sx, sy, sw, sh, dx,dy, dw, dh);

    sx += sw;
    dx += dw;

    if(isKnife){
      ctx.drawImage(selected, sx, sy, sw, sh, dx,dy, dw, dh);
    }
    else{
      ctx.drawImage(exists, sx, sy, sw, sh, dx,dy, dw, dh);
    }





  }

  // draw the hud bar
  function draw(ctx) {
    ctx.clearRect(H_cx, H_cy, H_width, H_height);
    ctx.beginPath();
    ctx.drawImage(background, H_cx, H_cy, H_width, H_height);










    // draw healthbar
    if (hpLost < 1) {
      draw_healthbar(ctx, xHP, yHP, hpLost, widthHP, heightHP);
    }
    draw_heart(ctx, xHP - 22, yHP + 1, 20, 15);


    drawWeapon(ctx, W_cx, W_cy);

    drawNumber(ctx, n_sx, n_sy, n_sw, n_sh, n_dx,n_dy, n_dw, n_dh);
  }



  function update(du) {
    // test to see lifebar fades away
    // press 'G' to see
    if (eatKey(KEY_HPTEST)) {
      hpLost += 0.01;
    }

    // update HUDBAR
    H_cx = 0;
    H_cy = g_viewport.getIH() - 80;
    H_width = g_viewport.getIW();
    H_height = 80;

    // update health
    xHP = (g_viewport.getIW() / 12);
    yHP = H_cy + 20;
    widthHP = (H_width / 8);
    heightHP = 15;

    // update weapons
    W_cx = (g_viewport.getIW() / 2);
    W_cy = H_cy + 35;

    // update Numbers
    n_sx = 0;
    n_sy = 0;
    n_sw = exists.width/8;
    n_sh = exists.height;
    n_dx = H_cx + 220;
    n_dy = H_cy;
    n_dw = 30;
    n_dh = 30;


    console.log(Player.prototype.getWitchWeapon());




  }




  function render(ctx) {
    draw(ctx);


    // get images
    background = g_asset.raw.image.Hbackground;
    heart = g_asset.raw.image.heart;
    knife = g_asset.raw.image.knife;
    shotgun = g_asset.raw.image.shotgun;
    rifle = g_asset.raw.image.rifle1;
    handgun = g_asset.raw.image.handgun;
    exists = g_asset.raw.image.exists;
    notexists = g_asset.raw.image.notexists;
    selected = g_asset.raw.image.selected;

  }


  return {
    witchWeapon,
    update,
    render,
  };
}());
