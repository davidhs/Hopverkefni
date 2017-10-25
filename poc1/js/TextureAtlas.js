"use strict";

// https://en.wikipedia.org/wiki/Texture_atlas


/**
 * Uniformly-sized sub-images.
 */
function TextureAtlas(image, subimageWidth, subimageHeight, nrOfSubimages) {

    image = new FastImage(image);

    this.image = image;

    let subimages = [];


    this.subimageWidth = subimageWidth;
    this.subimageHeight = subimageHeight;

    let tw = subimageWidth;
    let th = subimageHeight;

    let m = Math.floor(image.height / th);
    let n = Math.floor(image.width / tw);

    this.rows = m;
    this.cols = n;
    
    this.nrOfSubimages = nrOfSubimages || m * n;


    // Rows
    for (let i = 0; i < m; i++) {

        let ty = th * i;

        let row = [];


        // Columns
        for (let j = 0; j < n; j++) {

            let tx = tw * j;

            let subimage = image.crop(tx, ty, tw, th);
            row.push(subimage);
        }

        subimages.push(row);
    }

    this.subimages = subimages;
}

TextureAtlas.prototype.image = null;
TextureAtlas.prototype.subimages = [];
TextureAtlas.prototype.nrOfSubimages = 0;

TextureAtlas.prototype.cols = 0;
TextureAtlas.prototype.rows = 0;

TextureAtlas.prototype.subimageWidth = 0;
TextureAtlas.prototype.subimageHeight = 0;


/**
 * rowFirst
 * LR
 * TB
 */
TextureAtlas.prototype.getSequence = function (description) {

    let msg = description;


    let sequence = [];


    if (msg.rowFirst && msg.LR && msg.TB) {
        let qty = msg.qty || this.nrOfSubimages;

        let count = 0;

        let m = this.rows;
        let n = this.cols;

        for (let i = 0; i < m; i++) {
            for (let j = 0; j < n; j++) {
                count++;

                sequence.push(this.subimages[i][j]);

                if (count === qty) {
                    i = m;
                    j = n;
                }
            }
        }

    }

    return sequence;
};

TextureAtlas.prototype.getSubimage = function (row, col) {

    if (row >= this.subimages.length) {
        console.error(this);
        console.error(row, col);
        throw Error();
    } else if (col >= this.subimages[0].length) {
        console.error(this);
        console.error(row, col);
        throw Error();
    }

    return this.subimages[row][col];
};

TextureAtlas.prototype.renderSubimage = function (ctx, row, col, x, y, w, h) {

    let img = this.getSubimage(row, col);

    if (!img) {
        console.error(row, col, this.subimages);
        throw Error();
    }

    w = w || img.width;
    h = h || img.height;

    ctx.imageSmoothingEnabled = false;

    if (w === img.width && h === img.height) {
        ctx.drawImage(img.getImage(), x, y, w, h);
    } else {
        ctx.drawImage(
            img.getImage(), 
            0, 0, img.width, img.height, 
            x, y, w, h
        );

    }    
};

