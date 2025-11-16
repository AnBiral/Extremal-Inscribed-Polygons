var sharedX = 200;

class MovableArea {
    constructor(parent, points) {
        this.movablePoint = new Point(200, 300);

        this.parent = parent;

        this.canvas;
        this.canvasBox;

        this.polyPoints = [new Point(50, 100), new Point(125, 300), new Point(275, 300), new Point(350, 100)];
        this.points = points;
    }

    areaSetup(p) {
        this.canvas = p.createCanvas(400, 400);
        this.canvasBox = new BoundingBox(this.canvas);

        this.canvas.parent(this.parent);

        p.fill("black");

        p.textSize(15);
    }

    areaDraw(p) {
        p.background(200);

        p.fill("black");
        p.textSize(30);
        p.text("Area: " + Math.round(Math.abs((this.points[0].x - this.points[1].x) *
            (this.movablePoint.y - this.points[0].y) - (this.points[0].x - this.movablePoint.x) *
            (this.points[1].y - this.points[0].y)) / 2), 30, 50);

        
        let mvx = this.movablePoint.x;
        let mvy = this.movablePoint.y;
        
        p.textSize(12);
        p.text("p", 30, 100);
        p.text("p", 105, 300);
        p.text("p", 285, 300);
        p.text("p", 360, 100);

        p.text("q", this.points[0].x-10, this.points[0].y+15);
        p.text("q", sharedX, mvy+12);
        p.text("q", this.points[1].x+10, this.points[1].y);

        p.textSize(8);
        p.text("i-1", 38, 102);
        p.text("i", 113, 302);
        p.text("i+1", 293, 302);
        p.text("i+2", 368, 102);

        p.text("j-1", this.points[0].x-2, this.points[0].y+17);
        p.text("j", sharedX+8, mvy+14);
        p.text("j+1", this.points[1].x+18, this.points[1].y+2);
        

        for (let i in this.polyPoints) {
            p.ellipse(this.polyPoints[i].x, this.polyPoints[i].y, 4, 4);
        }
        for (let i = 0; i < this.polyPoints.length - 1; i++) {
            p.line(
                this.polyPoints[i].x,
                this.polyPoints[i].y,
                this.polyPoints[i + 1].x,
                this.polyPoints[i + 1].y
            )

        }


        for (let i in this.points) {
            p.ellipse(this.points[i].x, this.points[i].y, 4, 4);
        }


        p.ellipse(this.movablePoint.x, this.movablePoint.y, 4, 4);

        p.fill(122, 122, 122);
        p.triangle(this.points[0].x,
            this.points[0].y,
            this.movablePoint.x,
            this.movablePoint.y,
            this.points[1].x,
            this.points[1].y);

        p.line(
            this.points[0].x,
            this.points[0].y,
            this.movablePoint.x,
            this.movablePoint.y
        )

        p.line(
            this.points[1].x,
            this.points[1].y,
            this.movablePoint.x,
            this.movablePoint.y
        )

        p.line(
            this.points[1].x,
            this.points[1].y,
            this.points[0].x,
            this.points[0].y,
        )


    }

    areaMousePressed(p) {
    }

    generateSketch = (p) => {

        const areaSlider = document.getElementById("areaslider");

        areaSlider.oninput = function () {
            sharedX = this.value;
        }

        p.setup = () => {
            this.areaSetup(p);
        }

        p.draw = () => {
            this.areaDraw(p);
            this.movablePoint.x = sharedX;
        }

        p.mousePressed = () => {
            this.areaMousePressed(p);
        }
    }
}