"use strict";

// Animation

function AnimatedImage(descr) {
    util.extendObject(this, descr);
}

AnimatedImage.prototype.cx = 50;
AnimatedImage.prototype.cy = 50;
AnimatedImage.prototype.done = false;
AnimatedImage.prototype.dt = 0;
AnimatedImage.prototype.rate = 1.5;
AnimatedImage.prototype.sequence = [];

AnimatedImage.prototype.update = function (du) {

    if (this.done) return entityManager.KILL_ME_NOW;;

    this.dt += du;
};

AnimatedImage.prototype.render = function (ctx) {

    if (this.done) return;


    let idx = ~~(this.dt * this.rate);

    if (idx >= this.sequence.length) {
        this.done = true;
        return;
    }


    let img = this.sequence[idx];
    let w = img.width;
    let h = img.height;

    ctx.drawImage(img.getImage(), this.cx - w / 2, this.cy - h / 2, w, h);
};
