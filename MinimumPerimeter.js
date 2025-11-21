class MinimumPerimeterSketch extends ConvexPolygonDrawer {
    constructor(parent) {
        super(parent, () => this.resetMPS());
        this.minPerimPoly = [];
            
    }

    resetMPS() {
        this.minPerimPoly = [];
    }

    ah(i){
        // Accesses convex hull as if it was a circular array quickly
        return this.convexHull[(i+this.convexHull.length)%this.convexHull.length];
    }

    getCurveLen(curve){
        let res = 0;
        for (let i = 0; i < curve.length-1; i++){
            res += Math.sqrt((curve[1].x - curve[0].x)*(curve[1].x - curve[0].x) + (curve[1].y - curve[0].y)*(curve[1].y - curve[0].y));
        }
        return res;
    }

    isTypeZero(i, j){ 
        // 1: Reflect i to all edges until j (= q*i)
        // 2: Find intersection of q*i,qj-1 and pj-1,pj-2
        // 3: Reflect q*i,qj-1 thru pj-1,pj-2
        // 4: Find intersection of reflected line and pj-2,pj-3
        // 5: Reflect reflected line thru pj-2,pj-3
        // ,.....
        if (j <= i) j = j + this.convexHull.length;
        let qi = this.ah(i);
        
        for (let t = i+1; t < j-1; t++){
            let pt1 = this.ah(t);
            let pt2 = this.ah(t+1);
            let m = (pt2.y - pt1.y) / (pt2.x - pt1.x);
            let p = pt1.y - m*pt1.x;
            let d = (qi.x + (qi.y - p) * m) / (1 + m*m); // Formula for reflected point courtesy of https://stackoverflow.com/questions/3306838/algorithm-for-reflecting-a-point-across-a-line
            qi = new Point(2*d - qi.x, 2*d*m - qi.y + 2*p);
        }
        // qi is now the point this.convexHull[i] reflected thru all subsequent edges of the convex Polygon until this.convexHull[j-2], this.convexHull[j-1]   
        
        let pt1 = 0; // pj-2
        let pt2 = 0; // pj-1
        let qj = this.ah(j); // qj-1 = pj
        let m = 0;
        let p = 0; // Slope/intercept of pj-1,pj-2
        let m1 = (qi.y - qj.y) / (qi.x - qj.x);
        let p1 = qj.y - m1*qj.x;  // Slope/intercept of q*i,qj-1

        let res = [this.ah(i)];

        for (let t = j-2; t > i; t--){
            pt1 = this.ah(t); 
            pt2 = this.ah(t+1); 

            m = (pt2.y - pt1.y) / (pt2.x - pt1.x);
            p = pt1.y - m*pt1.x;

            qj = new Point((p1-p)/(m-m1), m*((p1-p)/(m-m1))+p);
            res.push(qj);

            if (qj.x > Math.max(pt1.x, pt2.x) || 
                qj.x < Math.min(pt1.x, pt2.x) || 
                qj.y > Math.max(pt1.y, pt2.y) || 
                qj.y < Math.min(pt1.y, pt2.y)){
                    return [];
                }

            m1 = ((m1 - m1*m*m - 2*m) / (-1 + m*m - 2*m1*m));
            p1 = -m1*qj.x+qj.y;
        }

        res.push(this.ah(j))
        return res;
    }

    findMinimumPoly(){
        let minimumPerimPolys = [];
        for(let i = 0; i < this.convexHull.length; i++){
            minimumPerimPolys.push(this.recMinimumPerimPoly(i, i+this.convexHull.length));
        }

        let res = [];
        let min = 9999999;
        for (let i = 0; i < minimumPerimPolys.length; i++){
            if (minimumPerimPolys[i][1] < min) {
                res = minimumPerimPolys[i];
                min = minimumPerimPolys[i][1];
            }
        }
        return res;
    }

    recMinimumPerimPoly(i, j){
        let k = j-i;
        if (k == 1 || k == 2) return [[this.ah(i), this.ah(j)], this.getCurveLen([this.ah(i), this.ah(j)]), "k"+k+" "];
        let FOrbit = this.isTypeZero(i, j);
        if (FOrbit.length > 0) return [FOrbit, this.getCurveLen(FOrbit), "Orb"+FOrbit.length+" "];

        let types = [];
        for (let u = 1; u < k; u++){
            let p1 = this.recMinimumPerimPoly(i, i+u);
            let p2 = this.recMinimumPerimPoly(i+u, j);
            let union = p1[0];
            union.pop();
            union = union.concat(p2[0]);
            types.push([union, p1[1]+p2[1], p1[2] + p2[2]])
        }
        let min = 999999999;
        let res = [];
        for (let it = 0; it < types.length; it++){
            if (types[it][1] < min) {
                res = types[it];
                min = types[it][1];
            }
        }
        return res;
    }


    generateSketch = (p) => {

        p.setup = () => {
            this.convexSetup(p);
            let buttonDraw = p.createButton("Find");
            buttonDraw.position(30, this.canvas.position().y + BUT_POS[1]);
            buttonDraw.mousePressed(() => {
                this.minPerimPoly = this.recMinimumPerimPoly(0, 0+this.convexHull.length)[0];
            }
            );
            this.buttonBoxes.push(new BoundingBox(buttonDraw));
        }

        p.draw = () => {
            this.convexDraw(p);

            p.fill(122, 122, 122);
            
            for (let i = 0; i < this.minPerimPoly.length; i++){
                p.ellipse(this.minPerimPoly[i].x , this.minPerimPoly[i].y, 6, 6) // TODO del
            }

            p.beginShape();

            for (let s = 0; s < this.minPerimPoly.length; s++) {
                p.vertex(this.minPerimPoly[s].x, this.minPerimPoly[s].y);

            }

            p.endShape(p.CLOSE);

            p.fill("black");
            p.text("Minimum Perimeter Polygons", 30, 50);
        }

        p.mousePressed = () => {
            this.convexMousePressed(p);
            var clearDraw = true;
            for (let b in this.buttonBoxes) {
                if (this.buttonBoxes[b].isInsideHTML(p.mouseX + this.canvas.position().x, p.mouseY + this.canvas.position().y)) {
                    clearDraw = false;
                }
            }
            if (!this.canvasBox.isInside(p.mouseX, p.mouseY)) clearDraw = false;
            if (clearDraw) {
                this.minPerimPoly = [];
            }
        }
    }
}




var sketch = new MinimumPerimeterSketch("mps");
new p5(sketch.generateSketch)
