const Minimap = (function () {


  var c = document.createElement("canvas");
  var ctx = c.getContext("2d");
  var cx = 0;
  var cy = 0;

  var width = 0;
  var height = 0;

  //position of player
  var p_cx = 0;
  var p_cy = 0;




  function drawMinimap(ctxr){
  ctxr.beginPath();
  ctxr.rect(cx,cy,width,height);
  ctxr.fill();

}








  function update(du){
    width = g_viewport.getIW()/4;
    height = g_viewport.getIH()/4;
    

  }

  function render(ctxr){
    drawMinimap(ctxr);


  }



  return{
    update,
    render
  }

}());
