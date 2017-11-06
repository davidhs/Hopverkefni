const Minimap = (function () {
  const Minimap = {};

  Minimap.canvas = document.getElementById("rightCanvas");
  Minimap.ctx = Minimap.canvas.getContext("2d");
  Minimap.cx = 0;
  Minimap.cy = 0;

  Minimap.width = g_viewport.getIW() / 10;

  Minimap.height = g_viewport.getIH()/2;
  console.log(Minimap.height);
  Minimap.ctx.beginPath();
  Minimap.ctx.rect(Minimap.cx,Minimap.cy,Minimap.width,Minimap.height)
  Minimap.ctx.fill();












  return Minimap;

}());
