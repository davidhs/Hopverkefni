

function UIElement() {}

UIElement.prototype.setup = function (obj) {

    obj._children = [];

    obj.name = "";

    // Is relative to parent
    obj._x = null;
    obj._y = null;

    obj.parent = null;

    obj._requestedWidth = null;
    obj._requestedHeight = null;

    obj._providedWidth = null;
    obj._providedHeight = null;

    obj._actualX = null;
    obj._actualY = null;
    obj._actualWidth = null;
    obj._actualHeight = null;

    obj.typeCallbacks = {};
};

// Private 

UIElement.prototype.setName = function (name) {
    this.name = name;
};

UIElement.prototype.addEventListener = function (type, callback) {

    const typeCallbacks = this.typeCallbacks;

    if (!typeCallbacks.hasOwnProperty(type)) {
        typeCallbacks[type] = [];
    }

    typeCallbacks[type].push(callback);
};

UIElement.prototype.cardSelection = -1;

UIElement.prototype.layout = "default";

UIElement.prototype.borderColor = "#888";
UIElement.prototype.foregroundColor = "#111";
UIElement.prototype.backgroundColor = "#f00";

UIElement.prototype.LAYOUT_DEFAULT = 'default';
UIElement.prototype.LAYOUT_CARD = 'card';

UIElement.prototype.setLayout = function (layout) {
    this.layout = layout;
};


UIElement.prototype.press = function (x, y) {
    const el = this.getElement(x, y);

    const inputObject = {
        x, y
    };

    if (el.typeCallbacks['press']) {
        const callbacks = el.typeCallbacks['press'];
        for (let i = 0; i < callbacks.length; i += 1) {
            const callback = callbacks[i];
            callback(inputObject);
        }
    }
};


UIElement.prototype.setParent = function (parent) {
    // One can not be one's own parent
    if (this !== parent) {
        this.parent = parent;
    }
};

UIElement.prototype.setPosition = function (x, y) {
    this._x = x;
    this._y = y;
};

// Inner X
UIElement.prototype.getInnerX = function () {
    return this._x;
};

UIElement.prototype.getInnerY = function () {
    return this._y;
};

UIElement.prototype.getOuterX = function () {
    let padX = this.parent ? this.parent.getOuterX() : 0;
    padX = padX ? padX : 0;
    return padX + this.getInnerX();
};

UIElement.prototype.getOuterY = function () {
    let padY = this.parent ? this.parent.getOuterY() : 0;
    padY = padY ? padY : 0;
    return padY + this.getInnerY();
};

UIElement.prototype._updateUI = function () {};

UIElement.prototype.setDimensions = function (width, height) {
    // TODO fix later
    this._setRequestedDimensions(width, height);
    this._setProvidedDimensions(width, height);
};

UIElement.prototype.getElement = function (x, y) {

    if (this.inBounds(x, y)) {

        const selection = null;
        const children = this._children;

        if (this.layout === this.LAYOUT_DEFAULT) {
            // Check children
            for (let i = 0; i < children.length; i += 1) {
                const child = children[i];
                const el = child.getElement(x, y);
                if (el) {
                    return el;
                }
            }
        } else if (this.layout === this.LAYOUT_CARD) {
            const child = this._cards[this.cardSelection];
            const el = child.getElement(x, y);
            if (el) {
                return el;
            }
        }

        return this;
    }

    return null;
};

UIElement.prototype.inBounds = function (x, y) {
    const x1 = this.getOuterX();
    const x2 = x1 + this.getWidth();
    const y1 = this.getOuterY();
    const y2 = y1 + this.getHeight();

    const cond1 = x >= x1 && x <= x2;
    const cond2 = y >= y1 && y <= y2;

    return cond1 && cond2;
};

UIElement.prototype.getWidth = function () {

    let a = this._providedWidth;
    let b = this._requestedWidth;


    a = a ? a : null;
    b = b ? b : a;

    const c = Math.min(a, b);

    return c;
};

UIElement.prototype.getHeight = function () {

    let a = this._providedHeight;    
    let b = this._requestedHeight;

    a = a ? a : null;
    b = b ? b : a;

    const c = Math.min(a, b);

    return c;
};

UIElement.prototype.getRoot = function () {

    const root = this;

    while (root.parent) {
        root = root.parent;
    }

    return root;
};

UIElement.prototype._setRequestedDimensions = function (width, height) {
    this._requestedWidth = width;
    this._requestedHeight = height;
};

UIElement.prototype._setProvidedDimensions = function (width, height) {
    this._providedWidth = width;
    this._providedHeight = height;
};

UIElement.prototype.setBackgroundColor = function (color) {
    this.backgroundColor = color;
};

UIElement.prototype.render = function (ctx) {
    this._renderChildren(ctx);
};

UIElement.prototype._renderChildren = function (ctx) {
    for (let i = 0; i < this._children.length; i += 1) {
        this._children[i].render(ctx);
    }
};

UIElement.prototype.getTextWidth = function (fontStyle, text) {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = fontStyle;

    return ctx.measureText(text).width;
};

UIElement.prototype.addChild = function (child) {

    if (child === this) throw Error();

    const children = this._children;
    
    child.setParent(this);
    children.push(child);

    this.update();
};

UIElement.prototype._fontHeightCache = {};

UIElement.prototype.getFontHeight = function (fontStyle) {

    if (this._fontHeightCache.hasOwnProperty(fontStyle)) {
        return this._fontHeightCache[fontStyle];
    }

    const result = this._getFontHeight(fontStyle);

    this._fontHeightCache[fontStyle] = result;

    return result;
};

UIElement.prototype.update = function () {
    const children = this._children;
    for (let i = 0; i < children.length; i += 1) {
        const child = children[i];
        child.setPosition(this.getOuterX(), this.getOuterY());
        child.setDimensions(this.getWidth(), this.getHeight());
        child.update()
    }
};


UIElement.prototype._getFontHeight = function (fontStyle) {

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fff';
    ctx.font = fontStyle;
    ctx.fillText('gM', 0, 0);
    const pixels = ctx.getImageData(0, 0, w, h).data;


    let top = h;
    let bottom = 0;

    for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
            const idx = 4 * (x + y * w);
            const r = pixels[idx];

            if (r === 255) {
                if (top > y) {
                    top = y;
                }
                if (bottom < y) {
                    bottom = y;
                }
            }
        }
    }

    return {
        top, bottom
    };
};