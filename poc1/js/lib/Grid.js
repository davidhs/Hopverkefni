

function Grid(width, height) {
  this.init(width, height);
  this._counter = 0;
  this._worker = new Worker('carver.js');
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
        score: Number.POSITIVE_INFINITY,
        parent: { x: 0, y: 0 },
        stamp: 0,
        x: j,
        y: i
      };
      row.push(obj);
    }
    grid.push(row);
  }

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

/*
const TPL = [
  
  [0, -1],
  
  [1, 0],
  
  [0, 1],
  
  [-1, 0],
];*/


// Source is player, d is monster
// from source to destination
Grid.prototype.carveShortestPath = function (sx, sy) {
  if (sx < 0 || sx >= this.width) return false;
  if (sy < 0 || sy >= this.height) return false;
  // if (true) return;

  // n is the last node on the path.  g(n) is the cost
  // of the path from the start node to n, and
  // h(n) a heuristic estiamge the cheapest path
  // from n to the goal.


  const currentStamp = this._stamp;


  
  const sNode = this.get(sx, sy);

  if (sNode.stamp === currentStamp) return;


  const Q = new PriorityQueue({
    check: false,
    type: PriorityQueue.TYPE_MIN_PQ
  });

  // Add everyone to priority queue

  let id = 0;

  const w = this.width;
  const h = this.height;

  for (let y = 0; y < this.height; y += 1) {
    for (let x = 0; x < this.width; x += 1) {
      if (x === sx && y === sy) continue;
      const node = this.get(x, y);
      node.score = Number.POSITIVE_INFINITY;
      Q.add(node.score, x + y * w);
    }
  }

  sNode.score = 0;
  sNode.parent.x = 0;
  sNode.parent.y = 0;
  sNode.stamp = this._stamp;

  Q.add(sNode.score, sx + sy * w);

  while (!Q.isEmpty()) {
    // key value, current
    // console.log(">> Before dequeueing: " + JSON.stringify(openPQ));
    const idx = Q.remove();

    const _x = idx % w;
    const _y = (idx - _x) / w;

    const cNode = this.get(_x, _y);

    const cx = cNode.x;
    const cy = cNode.y;
    // console.log(">> After dequeueing: " + JSON.stringify(openPQ));
    // console.log(">> Current node: ", JSON.stringify(c));

    cNode.closed = true;

    // Check neighbours
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


      const dist = this._hce(cx, cy, nx, ny);

      const newScore = cNode.score + dist;

      if (newScore >= nNode.score) continue;

      nNode.score = newScore;
      
      nNode.parent.x = -ox;
      nNode.parent.y = -oy;

      Q.changePriority(nx + ny * w, newScore);
    }
  }


  return false;
};