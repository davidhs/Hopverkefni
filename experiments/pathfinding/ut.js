

let pq;

(function() {

    if (true) return;

    // If false, report error
    function assert(expression) {
        if (!expression) {
            console.error("Error: ", expression);
        }
    }

    // Max PQ
    const pq1 = new PriorityQueue({});

    assert(pq1.isEmpty() === true);

    const l1 = [];

    for (let i = 0; i < 30; i += 1) {
        l1.push(i);
        pq1.push(i, i);
    }

    pq = pq1;


    console.log(pq1.toString());

    let idx = 0;

    /*
    while (!pq1.isEmpty()) {
        const value = pq1.pop(false);
        console.log(value, l1[idx])
        //assert(l1[idx] === value);
        idx += 1;
    }
    */

    // Add values


    const pq2 = new PriorityQueue({
        check: true,
        type: PriorityQueue.TYPE_MIN_PQ
    });

    console.log("hi");




})();