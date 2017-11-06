'use strict';

/* global  document :true */

  const HUD = (function () {
  const HUD = {};






  //globals for health bar
  HUD.xHP = 30;
  HUD.yHP = 10;
  HUD.hpLost = 0;

  //Keycodes
  HUD.KEY_RIFLE = '1'.charCodeAt(0);
  HUD.KEY_HANDGUN = '2'.charCodeAt(0);
  HUD.KEY_SHOTGUN = '3'.charCodeAt(0);
  HUD.KEY_KNIFE = '5'.charCodeAt(0);


  //toggle on or off weapon images
  HUD.isRifle = true;
  HUD.isHandgun = false;
  HUD.isShotgun = false;
  HUD.isKnife = false;


  HUD.canvas = document.getElementById('hudCanvas');
  HUD.ctx = HUD.canvas.getContext('2d');
  HUD.ctx.beginPath();
  HUD.ctx.fillStyle= "#ffffff"
  HUD.ctx.rect(0,0,640,70);
  HUD.ctx.fill();


  //create images
  HUD.heart = new Image();
  HUD.knife = new Image();
  HUD.shotgun = new Image();
  HUD.rifle = new Image();
  HUD.handgun = new Image();




  //witch weapon should appear on the screen, later
  //witch weapon do you choose
  HUD.witchweapon = function(){
    if(eatKey(this.KEY_HANDGUN)){
      HUD.isRifle = false;
      HUD.isHandgun = true;
      HUD.isShotgun = false;
      HUD.isKnife = false;
    }

    if(eatKey(this.KEY_RIFLE)){
    HUD.isRifle = true;
    HUD.isHandgun = false;
    HUD.isShotgun = false;
    HUD.isKnife = false;

  }
  if(eatKey(this.KEY_SHOTGUN)){
    HUD.isRifle = false;
    HUD.isHandgun = false;
    HUD.isShotgun = true;
    HUD.isKnife = false;
  }
  if(eatKey(this.KEY_KNIFE)){
    HUD.isRifle = false;
    HUD.isHandgun = false;
    HUD.isShotgun = true;
    HUD.isKnife = false;
  }
}






  //draw heart in front of health bar
  HUD.heart.addEventListener('load', function() {
  HUD.ctx.beginPath();
  HUD.ctx.drawImage(HUD.heart,10,10,15,15);
  }, false);
  HUD.heart.src = 'img/hp.png'; // Set source path



  function draw_healthbar(x, y, perclost, width, thickness){
    HUD.ctx.beginPath();
    HUD.ctx.fillStyle=  "#ff0000";
    HUD.ctx.rect(x,y,width*(1-perclost), thickness);
    HUD.ctx.fill();
  }


  //when you lose hp you call this, but
  //perclost goes higher depends on how much
  //hp you lose
  draw_healthbar(HUD.xHP, HUD.yHP, 0,100, 15);


  //draw the defult gun, as for now,

  HUD.handgun.addEventListener('load', function(){
    HUD.ctx.beginPath();
    HUD.ctx.drawImage(HUD.handgun, 280,40,60,30);
  }, false);
  HUD.handgun.src = 'img/guns/handgun.png'; //set source path



  HUD.update = function(du){

    //if you are hit

    //if hit then call
    //(draw_healthbar(HUD.xHP, HUD.yHP, hpLost++,100, 15))


    //if you press buttons 1 to 5, you change weapon
    //and another weapon appears on the screen

  }







  return HUD;
}());
