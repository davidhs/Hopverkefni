
function UIContainer() {
    this.setup(this);
};

// UIContainer.prototype = new UIElement();

UIContainer.prototype = Object.create(UIElement.prototype);


UIContainer.prototype.render = function (ctx) {
    this._renderChildren(ctx);
};

UIContainer.prototype.addChild = function (child) {

    if (child === this) throw Error();

    child.setParent(this);
    this._children.push(child);

    this.update();
};