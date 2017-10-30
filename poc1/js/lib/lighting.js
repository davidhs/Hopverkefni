

// This code isn't very good. :/
var lighting = (function () {

    var lightCanvas = document.createElement('canvas');
    var lightCtx = lightCanvas.getContext('2d');
    
    function radialLight(ctx, color, cfg) {
    
    
        var r = color.r || 0;
        var g = color.g || 0;
        var b = color.b || 0;
        var a = color.a || 255;
    
        var w = ctx.canvas.width;
        var h = ctx.canvas.height;
    
        var shadowMask = shadows.getShadowMask(cfg);
        var shadowCanvas = shadowMask.canvas;
    
        lightCanvas.width = w;
        lightCanvas.height = h;
    
        lightCtx.globalCompositeOperation = 'source-over';
        lightCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        lightCtx.fillRect(0, 0, w, h);
        lightCtx.fill();
    
    
        lightCtx.globalCompositeOperation = 'destination-in';
        //ctx.drawImage(dom.image_canvas, 0, 0);
        lightCtx.drawImage(shadowCanvas, shadowMask.dx, shadowMask.dy);
    
    
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(lightCanvas, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
    }

    return {
        radialLight: radialLight
    };
})();
