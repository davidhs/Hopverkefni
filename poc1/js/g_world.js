"use strict";

var g_world = (function () {

    var world = {};

    world.width = 1000;
    world.height = 1000;

    world.canvas = document.createElement('canvas');
    world.canvas.width = world.width;
    world.canvas.height = world.height;
    world.ctx = world.canvas.getContext('2d');



    world.inBounds = function (cx, cy, radius) {

        var cond1 = cx > 0 && cx < world.width;
        var cond2 = cy > 0 && cy < world.height;

        return cond1 && cond2;
    };


    return world;
})();
