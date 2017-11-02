const Minimap = (function () {
  const Minimap = {};
  Minimap.canvas = document.createElement('canvas');

  Minimap.canvas.cx = g_world.width + 10;
  Minimap.canvas.cy = g_world.height/3;

  Minimap.canvas.width = g_world.width/10;
  Minimap.canvas.height = g_world.height/6;
  Minimap.ctx = Minimap.canvas.getContext('2d');
  Minimap.ctx.beginPath();
  Minimap.ctx.lineWidth="6";
  Minimap.ctx.strokeStyle="red";
  Minimap.ctx.fill();
  Minimap.ctx.stroke();
  Minimap.ctx.drawImage(..\img\crate2.png, 100, 100);











  return Minimap;

}());
