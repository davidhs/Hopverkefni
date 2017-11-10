

function UIFrame(canvas) {
  this.setup(this);
  this.setPosition(0, 0);
  this.setDimensions(canvas.width, canvas.height);

  this._cards = [];
}

UIFrame.prototype = Object.create(UIElement.prototype);

// UIFrame.prototype = new UIElement();


UIFrame.prototype.render = function (ctx) {
  const oldfillStyle = ctx.fillStyle;

  const x = this.getOuterX();
  const y = this.getOuterY();
  const w = this.getWidth();
  const h = this.getHeight();

  const backgroundColor = this.backgroundColor;
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(x, y, w, h);
  ctx.fill();
  ctx.fillStyle = oldfillStyle;


  if (this.layout === this.LAYOUT_DEFAULT) {
    this._renderChildren(ctx);
  } else if (this.layout === this.LAYOUT_CARD) {
    this._cards[this.cardSelection].render(ctx);
  }
};

UIFrame.prototype.addChild = function (child, cardID) {
  if (child === this) throw Error();
  child.setParent(this);
  this._children.push(child);

  if (this.layout === this.LAYOUT_DEFAULT) {
    // FILLER COMMENT
  } else if (this.layout === this.LAYOUT_CARD) {
    this._cards[cardID] = child;
  }

  this.update();
};


UIFrame.prototype.selectCard = function (card) {
  this.cardSelection = card;
};
