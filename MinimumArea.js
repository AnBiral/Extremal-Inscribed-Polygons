class MinimumAreaSketch extends ConvexPolygonDrawer{
    constructor(parent){
        super(parent, () => this.resetMAS());
        this.QEdges = [];
        this.triAreas = [];
        this.sQ = [];
    }

    resetMAS(){
        this.QEdges = [];
        this.triAreas = [];
        this.sQ = [];
    }

    computeTriangles(){
        for(let i in this.convexHull){
            let curr = this.convexHull[i];
            let prev = this.convexHull[(i + this.convexHull.length - 1) % this.convexHull.length];
            let next = this.convexHull[(i + this.convexHull.length + 1) % this.convexHull.length];
            this.triAreas[i] = Math.abs((prev.x-next.x)*(curr.y-prev.y) - (prev.x-curr.x)*(next.y-prev.y))/2;
        }
    }

    getA1(k, s){
        if (k <= 0) return [0, []];
        if (k == 1 || k == 2) return [this.triAreas[0], [0]];
        if (k == 3) return [this.triAreas[0]+this.triAreas[2], [0, 2]];
        let prev = this.getA1(k-1, s);
        let curr = this.getA1(k-2, s);
        curr[0] += this.triAreas[k-1];
        curr[1].push(k-1);
        if (prev[0] > curr[0]) return prev;
        else return curr;
    }

    getA2(k, s){
        if (k <= 0) return [0, []];
        if (k == 2) return [this.triAreas[1], [1]];
        if (k == 3) {
            if (this.triAreas[2] > this.triAreas[1]) return [this.triAreas[2], [2]];
            else  return [this.triAreas[1], [1]];
        }
        let prev = this.getA2(k-1, s);
        let curr = this.getA2(k-2, s);
        curr[0] += this.triAreas[k-1];
        curr[1].push(k-1);
        if (prev[0] > curr[0]) return prev;
        else return curr;
    }

    findMinimumArea(){
        this.computeTriangles();
        let a1 = this.getA1(this.triAreas.length-1);
        let a2 = this.getA2(this.triAreas.length);
        console.log(a1);
        console.log(a2);

        if (a1[0] > a2[0]) return a1[1];
        else return a2[1];
    }
    

    generateSketch = (p) => {

        p.setup = () => {
            this.convexSetup(p);
            let buttonDraw = p.createButton("Draw2");
            buttonDraw.position(30, this.canvas.position().y + BUT_POS[1]);
            buttonDraw.mousePressed(() => {
                let sQInv = this.findMinimumArea();
                for(let i = 0; i < this.convexHull.length; i++){
                    console.log(i)
                    var add = true;
                    for (let j in sQInv){
                        if (sQInv[j] == i) add = false;
                    }
                    if(add) this.sQ.push(i);
                }
                console.log(this.sQ);
            });
            this.buttonBoxes.push(new BoundingBox(buttonDraw));
        }

        p.draw = () => {
            this.convexDraw(p);
            for (let s in this.sQ){
                
                p.line(
                    this.convexHull[this.sQ[s]].x,
                    this.convexHull[this.sQ[s]].y,
                    this.convexHull[this.sQ[(s+1)%this.sQ.length]].x,
                    this.convexHull[this.sQ[(s+1)%this.sQ.length]].y
                )
            }
        }
        
        p.mousePressed =  () => {
            this.convexMousePressed(p);
        }
    }

}




var sketch = new MinimumAreaSketch("mas");
new p5(sketch.generateSketch)
