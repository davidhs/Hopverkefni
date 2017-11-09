'use strict';

/* global  document :true */

const HUD = (function () {





  //globals for the HUDBAR itself
  var H_cx = 0;
  var H_cy = 0;
  var H_width = 0;
  var H_height = 0;







  //globals for health bar
  var xHP = 0;
  var yHP = 0;
  var widthHP = 0;
  var heightHP = 0;
  var hpLost = 0;

  //globals for weapons
  var W_cx = 0;
  var W_cy = 0;


  //Keycodes
  var KEY_KNIFE =   keyCode('1');
  var KEY_HANDGUN = keyCode('2');
  var KEY_SHOTGUN = keyCode('3');
  var KEY_RIFLE =   keyCode('4');



  //test key
  var KEY_HPTEST =  keyCode('G');




  //toggle on or off weapon images
  var isRifle = false;
  var isHandgun = true;
  var isShotgun = false;
  var isKnife = false;







  //create images
  var background = new Image();
  var heart = new Image();
  var knife = new Image();
  var shotgun = new Image();
  var rifle = new Image();
  var handgun = new Image();


  // =================
  // Weapon_handler
  // =================

  //witch weapon should appear on the screen, collected by
  //string from Player.js
  function witchWeapon(gun){
    if(gun === 'knife'){
      console.log("1");
      resetweapons();
      isKnife = true;
    }
    if(gun === 'handgun'){
      console.log("2");
      resetweapons();
      isHandgun = true;
    }
    if(gun === 'shotgun'){
      console.log("3");
      resetweapons();
      isShotgun = true;
    }

    if(gun === 'rifle'){
      console.log("4");
      resetweapons();
      isRifle = true;
    }


  }

  //reset weapon values to false so there
  //won't be 2 guns true at the same time

  function resetweapons(){
    isRifle = false;
    isHandgun = false;
    isShotgun = false;
    isKnife = false;

  }


  // =================
  // draw functions
  // =================




  //draw the hud bar
  function draw(ctx){
  ctx.clearRect(H_cx, H_cy, H_width, H_height);
  ctx.beginPath();
  ctx.drawImage(background,H_cx,H_cy,H_width,H_height);




  //draw healthbar
  if(hpLost < 1){
    draw_healthbar(ctx, xHP, yHP, hpLost, widthHP, heightHP);
  }
  draw_heart(ctx, xHP-22, yHP+1, 20, 15);


  drawWeapon(ctx, W_cx, W_cy);


}

//draw function for healtbar

  function draw_healthbar(ctx, x, y, perclost, width, thickness){
    if(hpLost <= .5){
      ctx.beginPath();
      ctx.fillStyle=  "#00cc00";
      ctx.rect(x,y,width*(1-perclost), thickness);
      ctx.fill();
    }
    else if(hpLost <= .70){
      ctx.beginPath();
      ctx.fillStyle=  "#ff9933";
      ctx.rect(x,y,width*(1-perclost), thickness);
      ctx.fill();
    }
      else if(hpLost <= .9){
      ctx.beginPath();
      ctx.fillStyle=  "#ff3300";
      ctx.rect(x,y,width*(1-perclost), thickness);
      ctx.fill();
    }
    else{
      ctx.beginPath();
      ctx.fillStyle=  "#ff0000";
      ctx.rect(x,y,width*(1-perclost), thickness);
      ctx.fill()

    }
  }




  //draw tiny heart next to lifebar
  function draw_heart(ctx, x, y, width, size){
    ctx.beginPath();
    ctx.drawImage(heart, x, y, width, size );
  }


  //draw gun
  function drawWeapon(ctx, x, y){
    if(isKnife){
      var width = 100;
      var height = 50;
      ctx.beginPath();
      ctx.drawImage(knife, x,  y, width, height);
    }
    if(isHandgun){
      var width = 100;
      var height = 35;
      ctx.beginPath();
      ctx.drawImage(handgun, x, y, width, height);
    }
    //TODO: SHOTGUN

    if(isRifle){
      var width = 120;
      var height = 50;
      ctx.beginPath();
      ctx.drawImage(rifle, x, y, width, height);
    }

    //
    if(isShotgun){
      console.log('shotgun');
    }

  }








  function update(du){
    //test to see lifebar fades away
    //press 'G' to see
    if(eatKey(KEY_HPTEST)){
      hpLost += .01
  }

    //update HUDBAR
    H_cx = 0;
    H_cy = g_viewport.getIH() - 80;
    H_width = g_viewport.getIW();
    H_height = 80;

    //update health
    xHP = (g_viewport.getIW()/12);
    yHP = H_cy + 20;
    widthHP = (H_width/8);
    heightHP = 15;

    //update weapons
    W_cx = (g_viewport.getIW()/10) * 4;
    W_cy = H_cy + 35;





}







  function render(ctx){
      draw(ctx);



    //get images
    background = g_asset.raw.image.Hbackground;
    heart = g_asset.raw.image.heart;
    knife = g_asset.raw.image.knife;
    shotgun = g_asset.raw.image.shotgun;
    rifle = g_asset.raw.image.rifle1;
    handgun = g_asset.raw.image.handgun;






}







  return{
    witchWeapon,
    update,
    render
  }
}());
