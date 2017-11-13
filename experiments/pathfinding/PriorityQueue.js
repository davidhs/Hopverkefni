'use strict';

/**
 * Creates a priority queue.  Can specify whether it's a min or max
 * priority queue, or supply custom comparator.
 * 
 * By default it's a max priority queue.
 * 
 * @param {*} cfg 
 */
function PriorityQueue(cfg) {
  // Defaults

  // First element is unused
  this._pq = [0];
  this._size = 0;
  this._check = false;
  this._vilut = new Map();  // value --> index lookup table

  if (cfg) {
    if (cfg.check) this._check = cfg.check;
    if (cfg.type) {
      if (cfg.type === PriorityQueue.TYPE_MAX_PQ) {
        this._subcmp = this._subcmpMax;
      } else if (cfg.type === PriorityQueue.TYPE_MIN_PQ) {
        this._subcmp = this._subcmpMin;
      } else {
        console.error("None specified:", cfg.type);
      }
    }
  }
}

// Static variables
PriorityQueue.TYPE_MAX_PQ = 1;
PriorityQueue.TYPE_MIN_PQ = 2;


/**
 * Clears the priority queue.
 */
PriorityQueue.prototype.clear = function () {
  this._pq.splice(1);
  this._size = 0;
};


/**
 * 
 * @param {number} a 
 * @param {number} b 
 */
PriorityQueue.prototype._subcmpMin = function (key1, key2) {
  return key1 > key2;
};


/**
 * 
 * @param {number} a 
 * @param {number} b 
 */
PriorityQueue.prototype._subcmpMax = function (key1, key2) {
  return key1 < key2;
};

/**
 * 
 * @param {number} a 
 * @param {number} b 
 */
PriorityQueue.prototype._subcmp = function (key1, key2) {
  return this._subcmpMax(key1, key2);
};

/**
 * Compares items at indicies index1 and index2 in internal
 * array.
 * 
 * @param {number} i 
 * @param {number} j 
 */
PriorityQueue.prototype._cmp = function (index1, index2) {
  const a = this._pq[index1];
  const b = this._pq[index2];

  return this._subcmp(a.key, b.key);
};


/**
 * Verifies the priority queue, that's it's in a legal state.
 * 
 * @param {number} k 
 */
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

/**
 * Swaps items at indices i and j in internal array.
 * 
 * @param {number} i 
 * @param {number} j 
 */
PriorityQueue.prototype._exch = function (i, j) {

  const item1 = this._pq[i];
  const item2 = this._pq[j];

  this._vilut.set(item1.value, j);
  this._vilut.set(item2.value, i);

  this._pq[i] = item2
  this._pq[j] = item1;
};

/**
 * 
 * @param {number} k 
 */
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


/**
 * Pushes item at index k up the priority queue
 * 
 * @param {number} k index of item
 */
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

  const idx = this._size + 1;

  this._vilut.set(value, idx);

  this._pq[idx] = { key, value };
  this._size += 1;
  this._swim(this._size);

  if (this._check && !this._verify()) {
    console.error('Failure in enqueueing.');
    throw Error();
  }
};

/**
 * 
 * @param {*} key 
 * @param {*} value 
 */
PriorityQueue.prototype.push = function (key, value) {
  this.enqueue(key, value);
};

PriorityQueue.prototype.add = function (key, value) {
  this.enqueue(key, value);
};


/**
 * Returns the largest key
 */
PriorityQueue.prototype.peek = function () {
  return this._pq[1];
};

PriorityQueue.prototype.changePriority = function (value, newPriority) {

  // Index of the value in this._pq.
  const idx = this._vilut.get(value);
  
  const oldPriority = this._pq[idx].key;

  // Only sink/swim if change of priority
  if (newPriority != oldPriority) {
    // We sink with lower priority

    this._pq[idx].key = newPriority;

    if (this._subcmp(oldPriority, newPriority)) {
      // New priority is of higher priority.
      this._swim(idx);
    } else {
      // New priority is of lower priority.
      this._sink(idx);
    }

    // We swim with higher priorty
  }

  

  // Do sink or swim.
};

/**
 * Return and remove the largest key.
 */
PriorityQueue.prototype.dequeue = function (valueOnly) {
  if (this._size === 0) throw Error();
  valueOnly = typeof valueOnly !== 'undefined' ? valueOnly : true;
  const maxElement = this._pq[1];

  this._vilut.delete(maxElement.value);

  this._exch(1, this._size);
  this._size -= 1;
  this._sink(1);
  // this._pq[this._size + 1] = null;
  delete this._pq[this._size + 1];
  if (this._check && !this._verify()) {
    console.error('Failure in dequeueing.');
    throw Error();
  }
  return valueOnly ? maxElement.value : maxElement;
};

PriorityQueue.prototype.pop = function (valueOnly) {
  return this.dequeue(valueOnly);
}

PriorityQueue.prototype.remove = function (valueOnly) {
  return this.dequeue(valueOnly);
}

PriorityQueue.prototype.toString = function (k, p) {

  k = (typeof k === 'undefined') ? 1 : k;
  p = p || '';

  if (k > this._size) return '';

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