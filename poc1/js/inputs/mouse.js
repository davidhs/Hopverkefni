'use strict';

/* global document util g_viewport g_canvas window :true */

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;


const g_mouse = (function () {
  let theImage = null;

  const mouse = {};

  mouse.cursorLock = false;


  let lockedObject = null;

  const setMousePos = (obj, evt, target) => {
    if (mouse.cursorLock) {
      target.x = util.clamp(target.x + evt.movementX, 0, obj.width);
      target.y = util.clamp(target.y + evt.movementY, 0, obj.height);
    } else {
      const rect = obj.getBoundingClientRect();
      target.x = evt.clientX - rect.left;
      target.y = evt.clientY - rect.top;
    }
  };


  util.extendObject(mouse, {

    x: 0,
    y: 0,

    pos: {
      down: {
        x: 0,
        y: 0,
      },
      up: {
        x: 0,
        y: 0,
      },
      drag: {
        x: 0,
        y: 0,
      },
    },

    isDown: false,

    handleEvent: (type, evt, obj) => {
      if (type === 'mousemove') {
        setMousePos(obj, evt, mouse);
        if (mouse.isDown) {
          setMousePos(obj, evt, mouse.pos.drag);
        }
      } else if (type === 'mousedown') {
        mouse.isDown = true;
        setMousePos(obj, evt, mouse.pos.down);
      } else if (type === 'mouseup') {
        mouse.isDown = false;
      } else if (type === 'pointerlockchange' || type === 'mozpointerlockchange') {
        if (document.pointerLockElement === obj ||
                    document.mozPointerLockElement === obj) {
          mouse.cursorLock = true;
        } else {
          mouse.cursorLock = false;
        }
      }
    },

    setImage: (img) => {
      theImage = img;
    },
    getImage: () => theImage,
    render: (ctx) => {
      // Convert Viewport/Canvas coordinates to World coordinates.
      const mx = g_mouse.x;
      const my = g_mouse.y;

      const bx = -theImage.width / 2;
      const by = -theImage.height / 2;

      if (!mouse.cursorLock && theImage) {
        g_canvas.style.cursor = 'none';
        ctx.drawImage(theImage, bx + mx, by + my);
      }

      if (mouse.cursorLock && !theImage) {
        const oldStyle = ctx.fillStyle;
        ctx.fillStyle = '#0f0';
        util.fillCircle(ctx, mx, my, 10);
        ctx.fillStyle = oldStyle;
      }

      if (mouse.cursorLock && theImage) {
        ctx.drawImage(theImage, bx + mx, by + my);
      }
    },
    lockOn: (targetObject) => {
      if (!mouse.cursorLock) {
        lockedObject = targetObject;
        targetObject.requestPointerLock();
      }
    },
  });

  function enableCursorLock() {
    g_canvas.requestPointerLock = g_canvas.requestPointerLock || g_canvas.mozRequestPointerLock;
    g_canvas.onclick = evt => g_mouse.lockOn(g_canvas);

    document.addEventListener('pointerlockchange', (evt) => {
      g_mouse.handleEvent('pointerlockchange', evt, g_canvas);
    }, false);

    document.addEventListener('mozpointerlockchange', (evt) => {
      g_mouse.handleEvent('mozpointerlockchange', evt, g_canvas);
    }, false);
  }

  util.extendObject(mouse, {
    enableCursorLock,
  });

  return mouse;
}());


window.addEventListener('mousedown', (evt) => {
  g_mouse.handleEvent('mousedown', evt, g_canvas);
});
window.addEventListener('mouseup', (evt) => {
  g_mouse.handleEvent('mouseup', evt, g_canvas);
});
window.addEventListener('mousemove', (evt) => {
  g_mouse.handleEvent('mousemove', evt, g_canvas);
});
