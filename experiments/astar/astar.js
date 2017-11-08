// {x: number, y: number}
function aStar(start, goal, hce) {

    const closedSet = new Set2D();




    const openSet = [start];

    // key is fScore
    const openPQ = new PriorityQueue();
    console.log()

    const openSet = new Set2D();
    openSet.add(start.x, start.y, 0);

    const cameFrom = [];

    //const gScore = Number.POSITIVE_INFINITY;

    // undefined should be treated as infinity

    // hce = heuristic cost estiamte
    const gScore = new Set2D();
    gScore.set(start.x, start.y, 0)    

    const fScore = new Set2D();
    fScore.set(start.x, start.y, hce(start.x, start.y, goal.x, goal.y));

    openPQ.enqueue(
        fScore.get(start.x, start.y),
        start
    );

    while (openSet.length > 0) {
        // key value, current
        const c = openPQ.dequeue();

        if (_equals(current && goal)) {
            return true;
        }

        
        closedSet.set(c.x, c.y);

        // Iterate neighbours
        for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
                // Neighbour
                const nx = c.x + dx;
                const ny = c.y + dy;
                if (dy === dx || closedSet.has(nx, ny)) continue;

                if (!openSet.has(nx, ny)) {
                    openSet.set(nx, ny);
                    
                }

                // ADD nx, ny to openPQ

                // const dist between current and neighbour
                const dist = Math.sqrt(c.x * c.x + c.y * c.y);

                const tentative_gScore = gScore.get(c.x, c.y) + dist;
                
                if (gScore.has(nx, ny)) {
                    if (tentative_gScore >= gScore.get(nx, ny)) {
                        // Not a better path
                        continue;
                    }
                }

                // This path is the best until now.  Record it
                gScore.set(nx, ny, tentative_gScore);
                fScore.set(nx, ny, tentative_gScore + hce(nx, ny, goal.x, goal.y));

                openPQ.enqueue(
                    fScore.get(nx, ny),
                    { x: nx, y: ny }
                );
            }
        }
    }

    return false;
}