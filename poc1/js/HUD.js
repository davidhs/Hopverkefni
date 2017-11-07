'use strict';

/* global  document :true */

console.log("hello");

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
  witchweapon = function(){
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






  //draw heart in front of health bar
  heart.addEventListener('load', function() {
  ctx.beginPath();
  ctx.drawImage(heart,10,10,15,15);
  }, false);
  heart.src = 'img/hp.png'; // Set source path



  function draw_healthbar(x, y, perclost, width, thickness){
    ctx.beginPath();
    ctx.fillStyle=  "#ff0000";
    ctx.rect(x,y,width*(1-perclost), thickness);
    ctx.fill();
  }


  //when you lose hp you call this, but
  //perclost goes higher depends on how much
  //hp you lose
  draw_healthbar(xHP, yHP, 0,100, 15);


  //draw the defult gun, as for now,

  handgun.addEventListener('load', function(){
    ctx.beginPath();
    ctx.drawImage(handgun, 280,40,60,30);
  }, false);
  handgun.src = 'img/guns/handgun.png'; //set source path



  update = function(du){


  }

  render = function(ctx){



  }







  return{
    update,
    render
  }
}());
