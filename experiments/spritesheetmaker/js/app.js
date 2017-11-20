
const mainCanvas = document.createElement('canvas');

document.getElementById('canvases').appendChild(mainCanvas);

const settings = {
    max: {
        width: 64,
        height: 64
    }
};

let objects = {};


function getPixel(data, x, y, w, h) {

    const idx = 4 * (x + y * w);

    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    return { r, g, b, a };
}


function autocrop(canvas) {

    const w = canvas.width;
    const h = canvas.height;

    console.log("<>");
    console.log(w, h);

    const ctx = canvas.getContext('2d');

    const imageData = ctx.getImageData(0, 0, w, h);

    const data = imageData.data;

    let x1 = 0;
    let x2 = 0;

    let y1 = 0;
    let y2 = 0;

    // Left to right
    for (let x = 0; x < w; x += 1) {
        // Scan from top to bottom
        for (let y = 0; y < h; y += 1) {
            const pixel = getPixel(data, x, y, w, h);
            if (pixel.a !== 0) {
                x1 = x;
                // Breaking.
                x = w;
                y = h;
            }
        }
    }

    // Right to left
    for (let x = w - 1; x >= 0; x -= 1) {
        // Scan from top to bottom
        for (let y = 0; y < h; y += 1) {
            const pixel = getPixel(data, x, y, w, h);
            if (pixel.a !== 0) {
                x2 = x;
                // Breaking.
                x = -1;
                y = h;
            }
        }
    }

    // Top to bottom
    for (let y = 0; y < h; y += 1) {
        // Scan from left to right
        for (let x = 0; x < w; x += 1) {
            const pixel = getPixel(data, x, y, w, h);
            if (pixel.a !== 0) {
                y1 = y;
                // Breaking.
                x = w;
                y = h;
            }
        }
    }

    // Bottom to top
    for (let y = h - 1; y >= 0; y -= 1) {
        // Scan from left to right
        for (let x = 0; x < w; x += 1) {
            const pixel = getPixel(data, x, y, w, h);
            if (pixel.a !== 0) {
                y2 = y;
                // Breaking.
                x = w;
                y = -1;
            }
        }
    }

    const croppedCanvas = document.createElement('canvas');

    // Add 1 pixel padding.

    const padding = 1;

    x1 = Math.max(x1 - padding, 0);
    x2 = Math.min(x2 + padding, w);

    y1 = Math.max(y1 - padding, 0);
    y2 = Math.min(y2 - padding, h);


    let w2 = Math.max(Math.abs(x2 - x1), 0);
    let h2 = Math.max(Math.abs(y2 - y1), 0);

    croppedCanvas.width = w2;
    croppedCanvas.height = h2;


    const croppedCtx = croppedCanvas.getContext('2d');

    const sx = x1;
    const sy = y1;
    const sw = w2;
    const sh = h2;

    const dx = 0;
    const dy = 0;
    const dw = w2;
    const dh = h2;


    croppedCtx.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);




    return croppedCanvas;
}


function dataURL2Canvas(cfg) {

    const url = cfg.url;
    const filename = cfg.filename;                

    const image = new Image();
    image.onload = evt => {

        if (image.complete) {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            objects[filename].canvas = canvas;
            objects[filename].done = true;
            preDoStuff();
        }
    };
    image.src = url;
};

function snapshot(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/*
function getScaledCanvasOld(sourceCanvas, maxWidth, maxHeight) {


    const scalarW = maxWidth  / sourceCanvas.width;
    const scalarH = maxHeight / sourceCanvas.height;

    const scalar = Math.min(scalarW, scalarH);

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    const canvas = document.createElement('canvas');

    canvas.width = scalar * width;
    canvas.height = scalar * height;


    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;


    ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

    return canvas;
}*/


function getScaledCanvas(sourceCanvas, scalar) {

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    const canvas = document.createElement('canvas');

    canvas.width = scalar * width;
    canvas.height = scalar * height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;


    ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

    return canvas;
}

function getSquareCanvas(sourceCanvas) {

    const w = sourceCanvas.width;
    const h = sourceCanvas.height;

    const s = Math.max(w, h);

    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;


    const xPad = (s - w) / 2;
    const yPad = (s - h) / 2;


    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(sourceCanvas, xPad, yPad, w, h);

    return canvas;
}

function getSquareUpscaledCanvas(sourceCanvas, size) {

    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const s = size;

    if (s < w) throw Error();
    if (s < h) throw Error();


    if (s === w && s === h) {
        return sourceCanvas;
    } else {
        const canvas = document.createElement('canvas');
        canvas.width = s;
        canvas.height = s;

        const xPad = (s - w) / 2;
        const yPad = (s - h) / 2;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(sourceCanvas, xPad, yPad, w, h);

        return canvas;
    }
}


function doStuff() {
    const canvases = document.getElementById('canvases');
    const body = document.getElementsByTagName('body')[0];

    const urls = Object.keys(objects);


    let list = [];

    // const itw = document.getElementById('itw');
    // const ith = document.getElementById('ith');

    const isf = document.getElementById('isf');

    let scalar = 1.0;

    if (isf.placeholder) {
        scalar = parseFloat(isf.placeholder);

        if (isf.value) {
            scalar = parseFloat(isf.value);
        }
    }

    for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i];

        const _canvas1 = objects[url].canvas;
        const _canvas2 = getSquareCanvas(_canvas1);
        const _canvasFinal = getScaledCanvas(_canvas2, scalar);

        // body.appendChild(_canvasFinal);

        list.push({
            url, canvas: _canvasFinal
        });
    }

    list = list.sort((a, b) => {
        return compareAscendingLexicographic(a.url, b.url);
    });



    let maxWidth = 0;
    let maxHeight = 0;

    for (let i = 0; i < list.length; i += 1) {
        const width = list[i].canvas.width;
        const height = list[i].canvas.height;

        maxWidth = Math.max(maxWidth, width);
        maxHeight = Math.max(maxHeight, height);
    }

    const maxSize = Math.max(maxWidth, maxHeight);

    console.log(maxWidth, maxHeight);

    for (let i = 0; i < list.length; i += 1) {
        const canvas = list[i].canvas;
        const _canvas1 = getSquareUpscaledCanvas(canvas, maxSize);

        list[i].canvas = _canvas1;
    }

    const tileWidth = maxSize;
    const tileHeight = maxSize;


    const n = list.length;


    const widthInTiles = Math.max(1, Math.ceil(Math.sqrt(n)));
    const heightInTiles = Math.ceil(n / widthInTiles);

    console.log(widthInTiles, heightInTiles);

    const width = tileWidth * widthInTiles;
    const height = tileHeight * heightInTiles;

    const spritesheet = document.createElement('canvas');
    spritesheet.width = width;
    spritesheet.height = height;

    const ctx = spritesheet.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < list.length; i += 1) {
        const canvas = list[i].canvas;

        const tx = i % widthInTiles;
        const ty = Math.floor(i / widthInTiles);


        const xPad = (tileWidth - canvas.width) / 2;
        const yPad = (tileHeight - canvas.height) / 2;


        const dx = tx * tileWidth + xPad;
        const dy = ty * tileHeight + yPad;
        const dw = canvas.width;
        const dh = canvas.height;

        ctx.drawImage(canvas, dx, dy, dw, dh);
    }



    mainCanvas.width = spritesheet.width;
    mainCanvas.height = spritesheet.height;

    const mctx = mainCanvas.getContext('2d');
    mctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    mctx.drawImage(spritesheet, 0, 0);

}

let doCount = 0;
let masterDone = false;


function compareAscendingLexicographic(a, b) {
    return a.localeCompare(b);
}


function preDoStuff() {
    let allDone = true;


    for (let i = 0; i < objects.length; i += 1) {
        const object = objects[i];
        if (!object.done) {
            allDone = false;
            break;
        }
    }


    if (allDone && !masterDone) {
        masterDone = true;

        setTimeout(doStuff, 250);
        doCount += 1;

        if (doCount > 1) {
            console.log(objects);
            throw new Error();
        }
    }
}



function changeHandler(evt) {

    objects = {};
    masterDone = false;
    
    const files = event.target.files; //FileList object
    const output = document.getElementById("result");
    doCount = 0;

    // Populate objects
    for (let i = 0; i < files.length; i += 1) {
        const file = files[i];

        const filename = file.name;
        if(!file.type.match('image')) continue;

        objects[filename] = {
            canvas: null,
            done: false
        };
    }
    
    for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const filename = file.name;
        
        if(!file.type.match('image')) continue;
        
        const fr = new FileReader();

        fr.onload = event => {

            if (fr.readyState === 2) {
                    
                const picFile = event.target;
                const dataURL = picFile.result;
    
                dataURL2Canvas({
                    url: dataURL, 
                    filename: filename 
                });
            }
        };
        
        fr.readAsDataURL(file);
    }                               
};


window.onload = function() {
    if(window.File && window.FileList && window.FileReader) {
        const filesInput = document.getElementById("files");
        filesInput.addEventListener("change", changeHandler);
    } else {
        console.error("Your browser does not support File API");
    }
}
