class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return "(${this.x}, ${this.y})";
    }
}


class BoundingBox {
    constructor(canvas) {
        this.canvas = canvas;

        this.top = canvas.position().y;
        this.left = canvas.position().x;
        this.width = canvas.size().width;
        this.height = canvas.size().height;
    };

    isInside(x, y) {
        // Returns element relative to Canvas positions
        if (x > 0 && x < this.width && y > 0 && y < this.height) {
            return true;
        }
        else return false;
    }

    isInsideHTML(x, y) {
        // Returns element relative to HTML Element positions
        if (x > this.left && x < this.left + this.width && y > this.top && y < this.top + this.height) {
            return true;
        }
        else return false;
    }

    toString() {
        return "This is a bounding box!";
    }
}

function grahamScan(points) {
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

    return pointsStack;
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