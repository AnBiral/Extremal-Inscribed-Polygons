class ConvexPolygonDrawer{
    constructor(parent, clearFunc = () => {}){
        this.parent = parent;

        this.canvasBox;
        this.buttonBoxes = [];

        this.points = [];
        this.convexHull = [];

        this.clearFunc = clearFunc; // Ugly, function from child to clear screen
    }

    convexSetup(p){
        let canvas = p.createCanvas(400, 400);
        this.canvasBox = new BoundingBox(canvas);

        canvas.parent(this.parent);

        p.fill("black");
        p.textSize(40);
        let button = p.createButton("Clear");
        button.position(this.canvasBox.left + 30, this.canvasBox.top + 85);
        button.mousePressed(() => {
            this.points = [];
            this.convexHull = [];
            this.clearFunc();
        });

        // TODO: put in child class
        let buttonDraw = p.createButton("Draw");
        buttonDraw.position(this.canvasBox.left + 30, this.canvasBox.top + 125);
        buttonDraw.mousePressed(() => {
        });


        this.buttonBoxes.push(new BoundingBox(button));
        this.buttonBoxes.push(new BoundingBox(buttonDraw));
    }

    convexDraw(p){
        p.background(200);
        for (i in this.points) {
            p.ellipse(this.points[i].x, this.points[i].y, 4, 4);
        }
        if (this.convexHull.length > 2) {
            for (var i = 0; i < this.convexHull.length - 1; i++) {
                p.line(
                    this.convexHull[i].x,
                    this.convexHull[i].y,
                    this.convexHull[i + 1].x,
                    this.convexHull[i + 1].y
                );
            }
            p.line(
                this.convexHull[0].x,
                this.convexHull[0].y,
                this.convexHull[this.convexHull.length - 1].x,
                this.convexHull[this.convexHull.length - 1].y
            );
        }
        p.text("HELLO WORLD", 30, 50);
    }

    convexMousePressed(p){
        for (let b in this.buttonBoxes) {
            if (this.buttonBoxes[b].isInsideHTML(p.mouseX + this.canvasBox.left, p.mouseY + this.canvasBox.top)) { return; }
        }
        if (!this.canvasBox.isInside(p.mouseX, p.mouseY)) { return; }
        this.points.push(new Point(p.mouseX, p.mouseY));

        this.convexHull = grahamScan(this.points);
    }

    resetpoints() {
        this.points = [];
    }

}