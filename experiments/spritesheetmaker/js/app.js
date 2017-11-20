
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

    const ctx = canvas.getContext('2d');

    const imageData = ctx.getImageData(0, 0, w, h);

    const data = imageData.data;

    let leftPad = 0;
    let rightPad = 0;

    let topPad = 0;
    let bottomPad = 0;

    // Left to right
    for (let x = 0; x < w; x += 1) {
        // Scan from top to bottom
        for (let y = 0; y < h; y += 1) {
            const pixel = getPixel(data, x, y, w, h);
            if (pixel.a !== 0) {
                leftPad = x;
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
                rightPad = x;
                // Breaking.
                x = 0;
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
                topPad = y;
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
                bottomPad = y;
                // Breaking.
                x = w;
                y = 0;
            }
        }
    }

    const croppedCanvas = document.createElement('canvas');

    const rangeX = Math.max(Math.abs(rightPad - leftPad), 0);
    const rangeY = Math.max(Math.abs(bottomPad - topPad), 0);

    croppedCanvas.width = rangeX;
    croppedCanvas.height = rangeY;


    const croppedCtx = croppedCanvas.getContext('2d');

    const sx = leftPad;
    const sy = topPad;
    const sw = rangeX;
    const sh = rangeY;

    const dx = 0;
    const dy = 0;
    const dw = rangeX;
    const dh = rangeY;


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


function getScaledCanvas(sourceCanvas, maxWidth, maxHeight) {


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
}

function doStuff() {
    const canvases = document.getElementById('canvases');
    const body = document.getElementsByTagName('body')[0];

    const urls = Object.keys(objects);


    let list = [];

    const itw = document.getElementById('itw');
    const ith = document.getElementById('ith');

    console.log(itw);






    let tileWidth = settings.max.width;
    let tileHeight = settings.max.height;

    if (itw.placeholder) {
        tileWidth = parseInt(itw.placeholder, 10);

        if (itw.value) {
            tileWidth = parseInt(itw.value, 10);
        }
    }

    if (ith.placeholder) {
        tileHeight = parseInt(ith.placeholder, 10);

        if (ith.value) {
            tileHeight = parseInt(ith.value, 10);
        }
    }


    for (let i = 0; i < urls.length; i += 1) {
        const url = urls[i];

        const _canvas1 = objects[url].canvas;

        const _canvas2 = autocrop(_canvas1);

        const _canvasFinal = getScaledCanvas(_canvas2, tileWidth, tileHeight);

        // body.appendChild(_canvas2);

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
