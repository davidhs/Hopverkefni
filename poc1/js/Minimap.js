const Minimap = (function () {
  const cx = 0;
  const cy = 0;

  let width = 0;
  let height = 0;

  // position of player
  const p_cx = 0;
  const p_cy = 0;


  function drawMinimap(ctxr) {
    ctxr.beginPath();
    ctxr.rect(cx, cy, width, height);
    ctxr.fill();
  }


  function update(du) {
    width = g_viewport.getIW() / 4;
    height = g_viewport.getIH() / 4;
  }

  function render(ctxr) {
    drawMinimap(ctxr);
  }


  return {
    update,
    render,
  };
}());
