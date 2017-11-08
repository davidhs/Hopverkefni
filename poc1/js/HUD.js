'use strict';

/* global  document :true */


  const HUD = (function () {










  //globals for health bar
  var xHP = 30;
  var yHP = 10;
  var hpLost = 0;


  //Keycodes
  var KEY_RIFLE = '1'.charCodeAt(0);
  var KEY_HANDGUN = '2'.charCodeAt(0);
  var KEY_SHOTGUN = '3'.charCodeAt(0);
  var KEY_KNIFE = '5'.charCodeAt(0);


  //toggle on or off weapon images
  var isRifle = true;
  var isHandgun = false;
  var isShotgun = false;
  var isKnife = false;


  //draw
  function draw(){
  ctx.beginPath();
  ctx.fillStyle= "#ffffff"
  ctx.rect(0,0,640,70);
  ctx.fill();
}


  //create images
  var heart = new Image();
  var knife = new Image();
  var shotgun = new Image();
  var rifle = new Image();
  var handgun = new Image();




  //witch weapon should appear on the screen, later
  //witch weapon do you choose
  function  witchweapon(){
    if(eatKey(KEY_HANDGUN)){
      isRifle = false;
      isHandgun = true;
      isShotgun = false;
      isKnife = false;
    }

    if(eatKey(KEY_RIFLE)){
    isRifle = true;
    isHandgun = false;
    isShotgun = false;
    isKnife = false;

  }
  if(eatKey(KEY_SHOTGUN)){
    isRifle = false;
    isHandgun = false;
    isShotgun = true;
    isKnife = false;
  }
  if(eatKey(KEY_KNIFE)){
    isRifle = false;
    isHandgun = false;
    isShotgun = true;
    isKnife = false;
  }
}










  function draw_healthbar(ctx, x, y, perclost, width, thickness){
    ctx.beginPath();
    ctx.fillStyle=  "#ff0000";
    ctx.rect(x,y,width*(1-perclost), thickness);
    ctx.fill();
  }








  function update(du){


  }

  function render(ctx){



  }







  return{
    update,
    render
  }
}());
