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

    function makeEdges(nodes, edges) {

        //console.log("makeEdges");

        for (let key in nodes) {
            let node = nodes[key];

            //console.log("Node: " + node.hash);

            let adj = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

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
                        let edge = new Edge(node, other, edge_hash);
                        edges[edge_hash] = edge;

                        node.edges.push(other);
                        other.edges.push(node);
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

    function render_loop(nodes, spanEdges, ctx) {

        clear(ctx);

        render(spanEdges, ctx);
        render(nodes, ctx);

        requestAnimationFrame(() => render_loop(nodes, spanEdges, ctx));
    }

    function startKruskal(nodes, edges, spanEdges) {
        // convert edge dict to list
        // sort list
        // take min edge
        // make use of UnionFind
        // add edges to spanEdges when ready to render
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

        let spanEdges = {};
        startKruskal(nodes, edges, spanEdges);

        // enter render loop
        requestAnimationFrame(() => render_loop(nodes, spanEdges, ctx));

    }
    main();
    window.onresize = main;
}
