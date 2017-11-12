

function Grid(width, height) {
  this.init(width, height);
  this._counter = 0;
}

Grid.prototype.init = function (width, height) {
  this.width = width;
  this.height = height;

  const grid = [];
  for (let i = 0; i < this.height; i += 1) {
    const row = [];
    for (let j = 0; j < this.width; j += 1) {
      const obj = {
        ids: new QuickList(),
        count: 0,
        closed: false,
        gScore: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        parent: { x: 0, y: 0 },
        stamp: 0,
      };
      row.push(obj);
    }
    grid.push(row);
  }


  const openPQ = new PriorityQueue();
  this._openPQ = openPQ;


  this._grid = grid;
  this._stamp = 1;
};

Grid.prototype.toString = function (path, undefinedMarker) {
  path = typeof path !== 'undefined' ? path : [];
  undefinedMarker = typeof undefinedMarker !== 'undefined' ? undefinedMarker : 'undefined';

  let msg = '';

  const grid = this._grid;

  for (let i = 0; i < this.height; i += 1) {
    for (let j = 0; j < this.width; j += 1) {
      let val = grid[i][j];
      for (let k = 0; k < path.length; k += 1) {
        val = val[path[k]];
      }
      if (typeof val !== 'undefined') {
        msg += `${val}`;
      } else {
        msg += `${undefinedMarker}`;
      }
    }
    msg += '\n';
  }

  return msg;
};

Grid.prototype.shortestPathGridString = function (sx, sy, dx, dy) {
  let msg = '';

  const grid = this._grid;

  for (let i = 0; i < this.height; i += 1) {
    for (let j = 0; j < this.width; j += 1) {
      const obj = grid[i][j];

      const parent = obj.parent;

      if (i === sy && j === sx) {
        msg += 's';
        continue;
      } else if (i === dy && j === dx) {
        msg += 'd';
        continue;
      } else if (grid[i][j].obstruction) {
        msg += '█';
        continue;
      }

      if (!parent) {
        msg += '.';
      } else {
        const dx = parent.x - j;
        const dy = parent.y - i;

        if (dx < 0 && dy < 0) {
          msg += '↖';
        } else if (dx < 0 && dy === 0) {
          msg += '←';
        } else if (dx < 0 && dy > 0) {
          msg += '↙';
        } else if (dx === 0 && dy > 0) {
          msg += '↓';
        } else if (dx > 0 && dy > 0) {
          msg += '↘';
        } else if (dx > 0 && dy === 0) {
          msg += '→';
        } else if (dx > 0 && dy < 0) {
          msg += '↗';
        } else if (dx === 0 && dy === 0) {
          msg += '.';
        } else if (dx === 0 && dy < 0) {
          msg += '↑';
        }
      }
    }
    msg += '\n';
  }

  return msg;
};


Grid.prototype.addNoise = function (p, n) {
  const grid = this._grid;

  for (let i = 0; i < this.height; i += 1) {
    for (let j = 0; j < this.width; j += 1) {
      if (Math.random() < p) {
        grid[i][j].obstruction = true;
      }
    }
  }
};

Grid.prototype.set = function (x, y, value) {
  if (x < 0 || x >= this.width) throw Error();
  if (y < 0 || y >= this.height) throw Error();
  this._grid[y][x] = value;
};

Grid.prototype.get = function (x, y) {
  if (x < 0 || x >= this.width) throw Error();
  if (y < 0 || y >= this.height) throw Error();
  return this._grid[y][x];
};

Grid.prototype.updateStamp = function () {
  this._stamp += 1;
};

const SQRT_2 = Math.sqrt(2);


Grid.prototype._hce = function (x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  const max = Math.max(dx, dy);
  const min = Math.min(dx, dy);


  const dist = SQRT_2 * min + (max - min);

  /*
    const D = 1.0;
    const D2 = SQRT_2;

    const hd = D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);

    const dist = dx + dy;
    */
  return dist;
};

const TPL = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];

// Source is player, d is monster
// from source to destination
Grid.prototype.carveShortestPath = function (sx, sy, dx, dy) {
  if (sx < 0 || sx >= this.width) return false;
  if (sy < 0 || sy >= this.height) return false;
  if (dx < 0 || dx >= this.width) return false;
  if (dy < 0 || dy >= this.height) return false;
  // if (true) return;

  // n is the last node on the path.  g(n) is the cost
  // of the path from the start node to n, and
  // h(n) a heuristic estiamge the cheapest path
  // from n to the goal.


  const dNode = this.get(dx, dy);
  const sNode = this.get(sx, sy);
  if (dNode.stamp === this._stamp) {
    return true;
  }

  if (dNode.obstruction) {
    return false;
  }

  // console.log(sx, sy, dx, dy);

  if (sNode.stamp !== this._stamp) {
    this._openPQ._size = 0;

    sNode.stamp = this._stamp;

    sNode.gScore = 0;

    sNode.parent.x = 0;
    sNode.parent.y = 0;

    this._counter += 1;

    this._openPQ.enqueue(
      this._counter,
      { x: sx, y: sy },
    );
  }

  const openPQ = this._openPQ;

  while (!openPQ.isEmpty()) {
    // key value, current
    // console.log(">> Before dequeueing: " + JSON.stringify(openPQ));
    const current = openPQ.dequeue();

    const cx = current.x;
    const cy = current.y;
    // console.log(">> After dequeueing: " + JSON.stringify(openPQ));
    // console.log(">> Current node: ", JSON.stringify(c));

    const cNode = this.get(cx, cy);


    cNode.closed = true;
    cNode.stamp = this._stamp;

    if (cx === dx && cy === dy) {
      // console.log("-------------- DONE! --------------");
      return true;
    }

    // if (this.get(dx, dy).stamp === this._stamp) return;


    for (let i = 0; i < TPL.length; i += 1) {
      const ox = TPL[i][0];
      const oy = TPL[i][1];

      const nx = cx + ox;
      const ny = cy + oy;

      if (nx < 0 || nx >= this.width) continue;
      if (ny < 0 || ny >= this.height) continue;
      if (nx === cx && ny === cy) continue;
      const nNode = this.get(nx, ny);
      if (nNode.obstruction) {
        nNode.closed = true;
        continue;
      }


      if (nNode.stamp !== this._stamp) {
        nNode.stamp = this._stamp;
        nNode.closed = false;
        nNode.gScore = Number.POSITIVE_INFINITY;
        nNode.parent.x = 0;
        nNode.parent.y = 0;
      }

      if (nNode.closed === true) continue;


      const distanceCurrentNeighbour = this._hce(cx, cy, nx, ny);

      const tentative_gScore = cNode.gScore + distanceCurrentNeighbour;

      if (tentative_gScore >= nNode.gScore) continue;

      nNode.gScore = tentative_gScore;


      nNode.parent.x = -ox;
      nNode.parent.y = -oy;

      this._counter += 1;

      openPQ.enqueue(
        this._counter,
        { x: nx, y: ny },
      );
    }
  }


  return false;
};


if (false) {
  const grid = new Grid(100, 100);

  const sx = Math.floor(Math.random() * grid.width);
  const sy = Math.floor(Math.random() * grid.height);

  const dx = Math.floor(Math.random() * grid.width);
  const dy = Math.floor(Math.random() * grid.height);

  grid.addNoise(0.25);

  grid.carveShortestPath(sx, sy, dx, dy);


  console.log(grid.shortestPathGridString(sx, sy, dx, dy));
}
