'use strict';

function QuickList() {
  this._list = [];
  this._size = 0;
}


QuickList.prototype.add = function (x) {
  if (!this.has(x)) {
    this._list[this._size] = x;
    this._size += 1;
    return true;
  }

  return false;
};

QuickList.prototype._exch = function (idx1, idx2) {
  const temp = this._list[idx1];
  this._list[idx1] = this._list[idx2];
  this._list[idx2] = temp;
};

// true if removed, false if not
QuickList.prototype.remove = function (x) {
  // Search for value
  for (let i = 0; i < this._size; i += 1) {
    const y = this._list[i];
    if (x === y) {
      this._exch(i, this._size - 1);
      if (true) {
        // delete this._list[this._size - 1];
        this._list.splice(this._size - 1, 1);
      }
      this._size -= 1;
      return true;
    }
  }

  return false;
};


QuickList.prototype.has = function (x) {
  // Search for value
  for (let i = 0; i < this._size; i += 1) {
    const y = this._list[i];
    if (x === y) {
      // MAYBE BAD IDEA
      this._exch(0, i);
      return true;
    }
  }
  return false;
};

QuickList.prototype.getList = function () {
  return this._list;
};

QuickList.prototype.getSize = function () {
  return this._size;
};
