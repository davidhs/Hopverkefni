
function Graph() {
    this._v = [];
    this._e = [];
    this._initialID = 1;
    this._nextID = this._initialID;
}


Graph.prototype.length = function (v1, v2) {
    const vid1 = v1.id;
    const vid2 = v2.id;
    return this._v[vid1].neighbours[vid2];
};


Graph.prototype.vertex = function (vertexID) {
    return this._v[vertexID];
}

// Creates a m x n grid
Graph.createGrid = function (m, n) {

    const g = new Graph();

    g.gridWidth = n;
    g.gridHeight = m;

    const size = m * n;

    const w = n;
    const h = m;

    const offsets = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1]
    ];

    if (true) {
        offsets.push([-1,-1]);
        offsets.push([1,-1]);
        offsets.push([1,1]);
        offsets.push([-1,1]);
    }

    for (let y = 0; y < m; y += 1) {
        for (let x = 0; x < n; x += 1) {
            const vid = g.addVertex({
                x, y
            });

            for (let i = 0; i < offsets.length; i += 1) {
                const ox = offsets[i][0];
                const oy = offsets[i][1];

                const nx = x + ox;
                const ny = y + oy;

                if (nx < 0 || nx >= w) continue;
                if (ny < 0 || ny >= h) continue;


                const nidx = nx + ny * w + g._initialID;

                const dx = nx - x;
                const dy = ny - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                g.addArrow(vid, nidx, dist);
            }

        }
    }

    return g;
};

Graph.prototype._getNextID = function () {
    const nextID = this._nextID;
    this._nextID += 1;
    return nextID;
};

Graph.prototype.addVertex = function (data) {

    const vertices = this._v;

    const id = this._getNextID();

    data = data ? data : {};

    vertices[id] = {
        data,
        neighbours: [],
        id
    };

    return id;
};

Graph.prototype.addArrow = function (vertexID1, vertexID2, weight) {
    const vertices = this._v;
    weight = weight ? weight : 1;
    vertices[vertexID1].neighbours[vertexID2] = weight;
};

Graph.prototype.addEdge = function (vertexID1, vertexID2, weight) {
    this.addArrow(vertexID1, vertexID2, weight);
    this.addArrow(vertexID2, vertexID1, weight);
};


Graph.prototype.forEachVertex = function (fn) {

    const vertices = this._v;

    for (let i = 0, vertexIDs = Object.keys(vertices); i < vertexIDs.length; i += 1) {
        const vertexID = vertexIDs[i];
        const vertex = vertices[vertexID];
        fn(vertex);
    }
};

Graph.prototype.forEachNeighbour = function (vertexID, fn) {

    if (typeof vertexID !== 'number') {
        vertexID = vertexID.id;
    }


    const vertices = this._v;
    const vertex = vertices[vertexID];

    for (let i = 0, neighbourIDs = Object.keys(vertex.neighbours); i < neighbourIDs.length; i += 1) {
        const neighbourID = neighbourIDs[i];
        const neighbour = vertices[neighbourID];
        fn(neighbour);
    }
};

let mx = 0;
let my = 0;

Graph.prototype.visualize = function () {

    const rn = "7548375934857934";
    
    let canvas = document.getElementById(rn);

    if (canvas === null) {
        canvas = document.createElement('canvas');
        canvas.id = rn;
        canvas.width = 500;
        canvas.height = 500;

        canvas.onmousemove = evt => {
            var rect = canvas.getBoundingClientRect();

            mx = evt.clientX - rect.left;
            my = evt.clientY - rect.top;

            console.log("visulize");

            this.visualize();
        };

        const body = document.getElementsByTagName('body')[0];
        body.appendChild(canvas);
    }

    

    const w = canvas.width;
    const h = canvas.height;

    const sx = Math.floor(this.gridWidth * mx / w);
    const sy = Math.floor(this.gridHeight * my / h);

    const sid = sx + sy * this.gridWidth + this._initialID;


    dijkstra(this, sid);
    

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, w, h);

    let x1 = Number.POSITIVE_INFINITY;
    let x2 = Number.NEGATIVE_INFINITY;

    let y1 = Number.POSITIVE_INFINITY;
    let y2 = Number.NEGATIVE_INFINITY;

    this.forEachVertex(v => {

        if (!v.data.hasOwnProperty('x')) {
            v.data.x = (Math.random() * w);
        }

        if (!v.data.hasOwnProperty('y')) {
            v.data.y = (Math.random() * h);
        }

        const x = v.data.x;
        const y = v.data.y;

        if (x < x1) x1 = x;
        if (x > x2) x2 = x;

        if (y < y1) y1 = y;
        if (y > y2) y2 = y;
    });

    console.log(x1, x2, y1, y2);

    function normalizeX(x) {

        const ux = (x - x1) / (x2 - x1);
        const tx = ux * 0.9 + 0.05;
        const px = tx * w;
        return px;
    }

    function drawLine(ctx, x1, y1, x2, y2) {

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    function drawArrow(ctx, x1, y1, x2, y2, angle, radius) {

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Body
        drawLine(ctx, x1, y1, x2, y2);

        // Head

        const _rad = radius ? radius : 15;  // pixels
        let _ang = angle ? angle : 16; // degrees

        _ang = _ang * Math.PI / 180;


        const dx = x1 - x2;
        const dy = y1 - y2;

        const bodyAngle = Math.atan2(dy, dx);


        const lx = x2 + _rad * Math.cos(bodyAngle + _ang);
        const ly = y2 + _rad * Math.sin(bodyAngle + _ang);


        const rx = x2 + _rad * Math.cos(bodyAngle - _ang);
        const ry = y2 + _rad * Math.sin(bodyAngle - _ang);



        drawLine(ctx, lx, ly, x2, y2);
        drawLine(ctx, rx, ry, x2, y2);

    }



    function normalizeY(y) {
        const uy = (y - y1) / (y2 - y1);
        const ty = uy * 0.9 + 0.05;
        const py = ty * h;
        return py;
    }


    // Draw edges
    this.forEachVertex(v => {

        const px = normalizeX(v.data.x);
        const py = normalizeY(v.data.y);

        this.forEachNeighbour(v, u => {

            const qx = normalizeX(u.data.x);
            const qy = normalizeY(u.data.y);


            if (u.prev === v.id) {
                ctx.strokeStyle = '#00f';
                drawArrow(ctx, qx, qy, px, py);
            } else {
                ctx.strokeStyle = '#f00';
                //drawLine(ctx, px, py, qx, qy);
            }
        });
    });

    // Draw vertices
    this.forEachVertex(v => {
        const px = normalizeX(v.data.x);
        const py = normalizeY(v.data.y);


        ctx.beginPath();
        ctx.arc(px, py, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
};

/**
 * Computes a path from the initial node to the destination node
 * through the graph.
 * 
 * @param {*} graph 
 * @param {*} initalNode 
 * @param {*} destinationNode 
 */
function dijkstra(graph, sourceID) {

    // Vertex set
    // This should be a priority queue.

    // min distance is highest priority
    const Q = new PriorityQueue({
        check: true,
        type: PriorityQueue.TYPE_MIN_PQ
    });

    graph.vertex(sourceID).dist = 0;

    Q.add(graph.vertex(sourceID).dist, sourceID);

    // Initialization
    graph.forEachVertex(v => {
        if (v.id !== sourceID) {
            v.dist = Number.POSITIVE_INFINITY;
            v.prev = -1;
            Q.add(v.dist, v.id);
        }
    });


    // DISTANCE FROM SOURCE TO SOURCE

    while (!Q.isEmpty()) {

        // Removes vertex with min distance
        const u = graph.vertex(Q.remove());

        // console.log("Dijkstra: Q: ", Q);

        // console.log("Dijkstra: u: ", u);

        graph.forEachNeighbour(u.id, v => {
            // console.log("Dijkstra: v: ", v);
            const alt = u.dist + graph.length(u, v);
            if (alt < v.dist) {
                v.dist = alt;
                v.prev = u.id;
                Q.changePriority(v.id, alt)
            }
        });
    }

    console.log('done!');
}

let bigG;

function test() {

    const g = Graph.createGrid(10, 9);
    bigG = g;

    g.visualize();
};

test();