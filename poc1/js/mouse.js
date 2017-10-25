"use strict";

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;


var g_mouse = (function () {

    let setMousePos = (obj, evt, target) => {

        if (mouse.cursorLock) {
            target.x = util.clamp(target.x + evt.movementX, 0, obj.width);
            target.y = util.clamp(target.y + evt.movementY, 0, obj.height);
        } else {
            var rect = obj.getBoundingClientRect();
            target.x = evt.clientX - rect.left;
            target.y = evt.clientY - rect.top;
        }
    };

    let theImage = null;

    let mouse = {};

    mouse.cursorLock = false;


    let lockedObject = null;

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
            }
        },
    
        isDown: false,

        handleEvent: (type, evt, obj) => {
            if (type === "mousemove") {
                setMousePos(obj, evt, mouse);
                if (mouse.isDown) {
                    setMousePos(obj, evt, mouse.pos.drag);
                }
            } else if (type === "mousedown") {
                mouse.isDown = true;
                setMousePos(obj, evt, mouse.pos.down);
            } else if (type === "mouseup") {
                mouse.isDown = false;
            } else if (type === "pointerlockchange" || type === "mozpointerlockchange") {

                if (document.pointerLockElement === obj ||
                    document.mozPointerLockElement === obj) {
                    mouse.cursorLock = true;
                } else {
                    mouse.cursorLock = false;
                }
            } 
        },

        setFastImage: img => {
            theImage = img;
        },
        getFastImage: () => {
            return theImage;
        },
        render: ctx => {
            
            // Convert Viewport/Canvas coordinates to World coordinates.
            var mx = g_viewport.cx + g_mouse.x - g_canvas.width / 2;
            var my = g_viewport.cy + g_mouse.y - g_canvas.height / 2;

            if (mouse.cursorLock && theImage) {
                theImage.render(ctx, mx, my);
            }
        },
        lockOn: targetObject => {
            if (!mouse.cursorLock) {
                lockedObject = targetObject;
                targetObject.requestPointerLock();
            }
        }
    });

    return mouse;
})();


window.addEventListener("mousedown", evt => {
    g_mouse.handleEvent("mousedown", evt, g_canvas);
});
window.addEventListener("mouseup", evt => {
    g_mouse.handleEvent("mouseup", evt, g_canvas);
});
window.addEventListener("mousemove", evt => {
    g_mouse.handleEvent("mousemove", evt, g_canvas);
});

// Cursor lock: slower mouse
if (false) {

    g_canvas.requestPointerLock = g_canvas.requestPointerLock || g_canvas.mozRequestPointerLock;
    g_canvas.onclick = evt => g_mouse.lockOn(g_canvas);

    document.addEventListener('pointerlockchange', evt => {
        g_mouse.handleEvent("pointerlockchange", evt, g_canvas);
    }, false);
    
    document.addEventListener('mozpointerlockchange', evt => {
        g_mouse.handleEvent("mozpointerlockchange", evt, g_canvas);
    }, false);
}


