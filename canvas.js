window.onload = function() {

    // constants
    let PAD   = 30; // the min padding on all sides of the grid
    let SPACE = 60; // the spacing between Nodes

    // calculated constants
    let W;
    let H;
    let V_PAD; // vertical
    let H_PAD; // horizontal
    let ROWS;
    let COLS;

    function setHeightWidth(c) {
        W = window.innerWidth;
        H = window.innerHeight;
        c.width  = W;
        c.height = H;
    }

    function setBounds() {
        let v_side = H - 2 * PAD;
        ROWS = Math.floor(v_side / SPACE) + 1;
        V_PAD = (H - SPACE * (ROWS - 1)) / 2.0;

        let h_side = W - 2 * PAD;
        COLS = Math.floor(h_side / SPACE) + 1;
        H_PAD = (W - SPACE * (COLS - 1)) / 2.0;
    }

    function makeNodes(nodes) {
        for (let y=0; y<ROWS; y++) {
            for (let x=0; x<COLS; x++) {

                let x_pos = H_PAD + x * SPACE;
                let y_pos = V_PAD + y * SPACE;
                let uid_hash = hash(x, y)
                nodes[uid_hash] = new Node(x_pos, y_pos, x, y, uid_hash);

            }
        }
    }

    function makeEdges(nodes, edges, diag = false) {

        for (let key in nodes) {
            let node = nodes[key];

            let adj = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]];

            for (let pair of adj) {
                let ox = pair[0];
                let oy = pair[1];

                let x = node.coord.x;
                let y = node.coord.y;

                let nx = x + ox;
                let ny = y + oy;

                let uid_hash = hash(nx, ny);

                if (uid_hash in nodes) {
                    let other = nodes[uid_hash];
                    let edge_hash = hash(node.hash, other.hash);

                    // only create the edge if it does not already exist
                    if (!(edge_hash in edges)) {

                        let diag = (Math.abs(ox) + Math.abs(oy)) == 2;

                        if (diag) {

                            // store for use with prims
                            let edge = new Edge(node, other, edge_hash, "#AA0000");
                            node.edges.push(edge);
                            other.edges.push(edge);

                        } else {

                            // store for use with kruskal
                            let edge = new Edge(node, other, edge_hash, "#0000AA");
                            edges[edge_hash] = edge;

                        }
                    }
                }
            }
        }
    }

    function render(items, ctx) {
        for (let key in items) items[key].render(ctx);
    }

    function hash(x, y) { // x and y are strings or integers
        if (typeof x == "number") return x + "::" + y;

        // edges are bi-directional so hash(a -> b) == hash(b -> a)
        if (x < y) {
            return x + "::" + y;
        } else { // y < x
            return y + "::" + x;
        }
    }

    function clear(ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, W, H);
    }

    function render_loop(nodes, kruskalEdges, primsEdges, ctx) {

        clear(ctx);

        render(kruskalEdges, ctx);
        render(primsEdges, ctx);
        render(nodes, ctx);

        requestAnimationFrame(() => render_loop(nodes, kruskalEdges, primsEdges, ctx));
    }

    function startKruskal(edges, uf, kruskalEdges) {

        // convert edge dict to list
        let _edges = [];
        for (let key in edges) _edges.push(edges[key]);

        // sort list
        _edges.sort((a, b) => a.weight - b.weight);

        // take min edge
        let nextEdge = function() {

            let cur = _edges.shift();
            let a   = cur.n1.hash;
            let b   = cur.n2.hash;

            // If components are not connected...
            if (uf.find(a) != uf.find(b)) {

                // ...add edges to kruskalEdges for use in rendering loop
                uf.union(a, b);
                kruskalEdges[cur.hash] = cur;

                if (_edges.length > 0) setTimeout(nextEdge, 100);

            } else {
                // fire next line immediatly if none line was drawn during this call
                if (_edges.length > 0) setTimeout(nextEdge, 0);

            }
        }
        nextEdge();
    }

    function otherNode(node, edge) {
        if (edge.n1.hash == node.hash) {
            return edge.n2;
        } else {
            return edge.n1;
        }
    }

    function startPrims(startNode, pq, primsEdges) {

        let seen = {};
        pq.push([0, startNode, undefined]);

        let nextNode = function() {

            let cur = pq.pop();
            // let dist = cur[0]; // only used for sorting
            let node = cur[1];
            let connecting_edge = cur[2];

            if (node.hash in seen) {
                if (pq.lst.length > 0) setTimeout(nextNode, 0);
                return;
            }

            seen[node.hash] = true;

            if (connecting_edge != undefined) {
                primsEdges[connecting_edge.hash] = connecting_edge;
            }

            for (let edge of node.edges) {
                let other = otherNode(node, edge);

                if (!(other.hash in seen)) {
                    pq.push([edge.weight, other, edge]);
                }
            }

            if (pq.lst.length > 0) setTimeout(nextNode, 100);
        };
        nextNode();
    }

    function getStartNode(nodes) {
        // returns a random node with which to start prims
        let x = Math.floor(Math.random() * COLS);
        let y = Math.floor(Math.random() * ROWS);
        let uid_hash = hash(x, y);
        return nodes[uid_hash];
    }

    function main() {

        let c = document.getElementById("canvas");
        let ctx = c.getContext("2d");

        setHeightWidth(c);
        setBounds();

        let nodes = {};
        makeNodes(nodes);

        let edges = {};
        makeEdges(nodes, edges);

        let kruskalEdges = {};
        let uf = new UnionFind(nodes);
        startKruskal(edges, uf, kruskalEdges);

        let primsEdges = {};
        let pq = new PriorityQueue();
        let startNode = getStartNode(nodes);
        startPrims(startNode, pq, primsEdges);

        // enter render loop
        requestAnimationFrame(() => render_loop(nodes, kruskalEdges, primsEdges, ctx));

    }
    main();
    window.onresize = main;
}
