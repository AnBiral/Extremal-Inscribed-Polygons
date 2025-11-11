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
        canvas = p.createCanvas(400, 400);
        this.canvasBox = new BoundingBox(canvas);

        canvas.parent(this.parent);

        p.fill("black");
        p.textSize(40);
        button = p.createButton("Clear");
        button.position(this.canvasBox.left + 30, this.canvasBox.top + 85);
        button.mousePressed(() => {
            this.points = [];
            this.convexHull = [];
            this.clearFunc();
        });

        buttonDraw = p.createButton("Draw");
        buttonDraw.position(this.canvasBox.left + 30, this.canvasBox.top + 125);
        buttonDraw.mousePressed(() => {
            this.convexHull = grahamScan(this.points);
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
        console.log("ff");
        for (b in this.buttonBoxes) {
            if (this.buttonBoxes[b].isInsideHTML(p.mouseX + this.canvasBox.left, p.mouseY + this.canvasBox.top)) { return; }
        }
        if (!this.canvasBox.isInside(p.mouseX, p.mouseY)) { return; }
        this.points.push(new Point(p.mouseX, p.mouseY));
    }

    resetpoints() {
        console.log(this.points);
        this.points = [];
        console.log(this.points);
    }

}

function sketch1(p) {


    var canvasBox;
    var buttonBoxes = [];

    var points = [];
    var convexHull = [];

    p.setup = function () {
        canvas = p.createCanvas(400, 400);
        canvasBox = new BoundingBox(canvas);

        canvas.parent("s1");

        p.fill("black");
        p.textSize(40);
        button = p.createButton("Clear");
        button.position(canvasBox.left + 30, canvasBox.top + 85);
        button.mousePressed(resetpoints);

        buttonDraw = p.createButton("Draw");
        buttonDraw.position(canvasBox.left + 30, canvasBox.top + 125);
        buttonDraw.mousePressed(() => {
            grahamScan();
        });


        buttonBoxes.push(new BoundingBox(button));
        buttonBoxes.push(new BoundingBox(buttonDraw));
    }
    

    p.draw = function () {
        p.background(200);
        for (i in points) {
            p.ellipse(points[i].x, points[i].y, 4, 4);
        }
        if (convexHull.length > 2) {
            for (var i = 0; i < convexHull.length - 1; i++) {
                p.line(
                    convexHull[i].x,
                    convexHull[i].y,
                    convexHull[i + 1].x,
                    convexHull[i + 1].y
                );
            }
            p.line(
                convexHull[0].x,
                convexHull[0].y,
                convexHull[convexHull.length - 1].x,
                convexHull[convexHull.length - 1].y
            );
        }
        p.text("HELLO WORLD", 30, 50);
    }


    p.mousePressed = function () {
        console.log("ff");
        for (b in buttonBoxes) {
            if (buttonBoxes[b].isInsideHTML(p.mouseX + canvasBox.left, p.mouseY + canvasBox.top)) { return; }
        }
        if (!canvasBox.isInside(p.mouseX, p.mouseY)) { return; }
        points.push(new Point(p.mouseX, p.mouseY));
    }

    function resetpoints() {
        points = [];
    }

    function grahamScan() {
        let pointsStack = [];
        let sortedPoints = points.slice();
        let min_x = popMinimumX(sortedPoints);
        pointsStack.push(min_x);

        sortedPoints.sort((PointA, PointB) => {
            if (PointA.x == pointsStack[0].x) return 1;
            if (PointB.x == pointsStack[0].x) return -1;
            return (
                (PointA.y - pointsStack[0].y) / (PointA.x - pointsStack[0].x) -
                (PointB.y - pointsStack[0].y) / (PointB.x - pointsStack[0].x)
            );
        });

        pointsStack.push(sortedPoints.pop());
        let top = pointsStack[pointsStack.length - 1];
        let top2 = pointsStack[pointsStack.length - 2];

        for (let i = sortedPoints.length - 1; i >= 0; i--) {
            top = pointsStack[pointsStack.length - 1];
            top2 = pointsStack[pointsStack.length - 2];
            while (turnOrientation(top2, top, sortedPoints[i]) < 0) {
                pointsStack.pop();
                top = top2;
                top2 = pointsStack[pointsStack.length - 2];
            }
            pointsStack.push(sortedPoints[i]);
        }

        convexHull = pointsStack;
    }

    function popMinimumX(pointsList) {
        var min = Infinity;
        var minPoint = new Point(-1, -1);
        for (var i = 0; i < pointsList.length; i++) {
            if (pointsList[i].x < min) {
                min = pointsList[i].x;
                minPoint = pointsList[i];
            }
        }
        var index = pointsList.indexOf(minPoint);
        if (index > -1) {
            pointsList.splice(index, 1);
        }
        return minPoint;
    }

    function turnOrientation(p1, p2, p3) {
        //NOTE: top2 and top are swapped compared to the "normal" orientation test,
        // since y is mirrored in this environment
        return (p1.x - p2.x) * (p3.y - p2.y) - (p1.y - p2.y) * (p3.x - p2.x);
    }

}