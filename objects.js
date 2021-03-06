class Node {
    constructor(xp, yp, xc, yc, uid_hash) {
        this.pos = { // the floating point x and y position of node
            x: xp,
            y: yp
        };
        this.coord = { // the integer coord of this node
            x: xc,
            y: yc
        };
        this.edges = [];      // list of refs to adj nodes
        this.hash = uid_hash; // uid for this node row-col
        this.radius = 5;
        this.color = "#00AA00";
    }
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Edge {
    constructor(n1, n2, uid_hash, color) {
        this.n1 = n1;
        this.n2 = n2;
        this.weight = Math.random();
        this.hash = uid_hash; // uid for this edge
        this.timestamp; // the time the edge began rendering
        this.rendertime = 1000; // number of ms the edge takes to finish rendering
        this.color = color;
        this.done = false; // true when finished rendering
    }
    render(ctx) {
        if (this.timestamp == undefined) this.timestamp = Date.now();
        let percent = (Date.now() - this.timestamp) / this.rendertime;

        if (percent >= 0.99) {
            this.done = true;

            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.n1.pos.x, this.n1.pos.y);
            ctx.lineTo(this.n2.pos.x, this.n2.pos.y);
            ctx.stroke();

            return;
        }

        let dx = this.n2.pos.x - this.n1.pos.x;
        let dy = this.n2.pos.y - this.n1.pos.y;

        let magnitude = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        let current_length = percent * magnitude;
        let angle = Math.atan2(dy, dx);

        let cur_x = current_length * Math.cos(angle) + this.n1.pos.x;
        let cur_y = current_length * Math.sin(angle) + this.n1.pos.y;
        
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.n1.pos.x, this.n1.pos.y);
        ctx.lineTo(cur_x, cur_y);
        ctx.stroke();
    }
}

class UnionFind {
    constructor(nodes) { // nodes is a dictionary of nodes
        this.lst = {};
        for (let key in nodes) {
            this.lst[key] = key; // originally each node points to itself
        }
    }
    find(a) { // return the group for the given element
        let prev; // initial value is undefined
        let cur = a;
        while (prev != cur) {
            prev = cur;
            cur = this.lst[cur];
        }
        this.lst[a] = cur;
        return cur;
    }
    union(a, b) { // join the two groups (a points to b)
        let ah = this.find(a);
        let bh = this.find(b);
        this.lst[ah] = bh;
    }
}

class PriorityQueue {
    constructor() {
        this.lst = []; // list of [distance, node_ref, connecting_edge_ref]
    }
    push(edge) {
        this.lst.push(edge);
        this.lst.sort((a, b) => a[0] - b[0]);
    }
    pop() {
        return this.lst.shift();
    }
}
