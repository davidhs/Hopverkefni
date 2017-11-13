'use strict';

function PriorityQueue(check) {
  // First element is unused
  this._pq = [0];
  this._size = 0;
  this._check = typeof check !== 'undefined' ? check : false;
}

PriorityQueue.prototype.clear = function () {
  this._pq.splice(1);
  this._size = 0;
};

PriorityQueue.prototype._subcmp = function (a, b) {
  return a.key > b.key;
};

PriorityQueue.prototype._cmp = function (i, j) {
  const a = this._pq[i];
  const b = this._pq[j];

  return this._subcmp(a.key, b.key);
};


PriorityQueue.prototype._verify = function (k) {
  k = k || 1;

  const n = this._size;

  if (k > n) return true;

  const left = 2 * k;
  const right = 2 * k + 1;
  if (left <= n && this._cmp(k, left)) {
    return false;
  }
  if (right <= n && this._cmp(k, right)) {
    return false;
  }
  return this._verify(left) && this._verify(right);
};


PriorityQueue.prototype._exch = function (i, j) {
  const temp = this._pq[i];
  this._pq[i] = this._pq[j];
  this._pq[j] = temp;
};

PriorityQueue.prototype._sink = function (k) {
  const n = this._size;
  while (2 * k <= n) {
    let j = 2 * k;
    if (j < n && this._cmp(j, j + 1)) {
      j += 1;
    }
    if (!this._cmp(k, j)) {
      break;
    }
    this._exch(k, j);
    k = j;
  }
};

PriorityQueue.prototype._swim = function (k) {
  while (k > 1 && this._cmp(Math.floor(k / 2), k)) {
    this._exch(k, Math.floor(k / 2));
    k = Math.floor(k / 2);
  }
};

/**
 *
 */
PriorityQueue.prototype.enqueue = function (key, value) {
  // Add item to end of array
  this._pq[this._size + 1] = { key, value };
  this._size += 1;
  this._swim(this._size);

  if (this._check && !this._verify()) {
    console.error('Failure in enqueueing.');
    throw Error();
  }
};

PriorityQueue.prototype.push = function (key, value) {
  this.enqueue(key, value);
};

/**
 * Returns the largest key
 */
PriorityQueue.prototype.peek = function () {
  return this._pq[1];
};

/**
 * Return and remove the largest key.
 */
PriorityQueue.prototype.dequeue = function (valueOnly) {
  if (this._size === 0) throw Error();
  valueOnly = typeof valueOnly !== 'undefined' ? valueOnly : true;
  const maxElement = this._pq[1];
  this._exch(1, this._size);
  this._size -= 1;
  this._sink(1);
  // this._pq[this._size + 1] = null;
  delete this._pq[this._size + 1];
  if (this._check && !this._verify()) {
    console.error('Failure in dequeueing.');
    throw Error();
  }
  return valueOnly ? maxElement.value : valueOnly;
};

PriorityQueue.prototype.pop = function (valueOnly) {
  return this.dequeue(valueOnly);
}

PriorityQueue.prototype.toString = function (k, p) {
  k = k || 1;
  p = p || '';

  if (k >= this._size) return '';

  const entry = this._pq[k];

  let str = `${p + entry.key}: ${entry.value}\n`;

  str += this.toString(2 * k, `${p}  `);
  str += this.toString(2 * k + 1, `${p}  `);

  return str;
};

PriorityQueue.prototype.isEmpty = function () {
  return this._size === 0;
};

PriorityQueue.prototype.size = function () {
  return this._size;
};

/**
 * Function `fn' compares two keys.  Determines which
 * less(a, b), works like a < b
 */
PriorityQueue.prototype.setComparator = function (fn) {
  this._subcmp = fn;
};


// unit test
if (true) {
  (function () {
    // UNIT TEST

    // MAX PRIORITY QUEUE
    const fmin = (k1, k2) => k1 > k2;

    const fmax = (k1, k2) => k1 < k2;


    const b1 = [1, 2, 3, 4, 5, 6, 7];

    const a = new PriorityQueue(true);
    a.setComparator(fmin);

    for (let i = 0; i < b1.length; i += 1) {
      a.enqueue(i, b1[i]);
    }

    let idx = 0;

    while (!a.isEmpty()) {
      const val = a.dequeue();
      if (val !== b1[idx]) {
        console.error(`Got ${val} but expected ${b1[idx]}`);
        throw Error();
      }

      idx += 1;
    }

    idx = 0;


    // MIN PRIORITY QUEUE

    const b = new PriorityQueue(true);
    b.setComparator(fmax);
  })();
}
