'use strict';

/* global  document :true */

  const HUD = (function () {
  const HUD = {};
  HUD.canvas = document.getElementById('hudCanvas');
  HUD.ctx = HUD.canvas.getContext('2d');
  HUD.ctx.beginPath();
  HUD.ctx.fillStyle= "#ffffff"
  HUD.ctx.rect(0,0,640,70);
  HUD.ctx.fill();


  //globals for health bar
  var xHP = 30;
  var yHP = 10;

  //draw heart in front of health bar
  var heart = document.getElementById("heart");
  HUD.ctx.beginPath();
  HUD.ctx.drawImage(heart,10,10,15,15);


  function draw_healthbar(x, y, perclost, width, thickness){
    HUD.ctx.beginPath();
    HUD.ctx.fillStyle=  "#ff0000";
    HUD.ctx.rect(x,y,width*(1-perclost), thickness);
    HUD.ctx.fill();
  }

  draw_healthbar(xHP, yHP, 0,100, 15);




  return HUD;
}());
