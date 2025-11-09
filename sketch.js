/* eslint-disable no-undef, no-unused-vars */

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return "(${this.x}, ${this.y})";
  }
}
var cnvas;
var hullDrawnFlag = false;

var tangents = [];
var points = [];
var convexHull = [];

var pointToCheck = null;
var isPointInPolygon = false;

function setup() {
  cnvas = createCanvas(windowWidth, windowHeight);
  cnvas.position(0,0);

  // Put setup code here
  fill("black");
  textSize(40);
  button = createButton("Clear");
  button.position(30, 85);
  button.mousePressed(resetpoints);

  buttonDraw = createButton("Draw");
  buttonDraw.position(30, 125);
  buttonDraw.mousePressed(() => {
    grahamScan();
    hullDrawnFlag = true;
  });
}

function resetpoints() {
  points = [];
  convexHull = [];
  tangents = [];
  hullDrawnFlag = false;
  pointToCheck = null;
  isPointInPolygon = false;
}

function draw() {
  // Put drawings here
  background(200);
  for (i in points) {
    ellipse(points[i].x, points[i].y, 4, 4);
  }
  if (convexHull.length > 2) {
    for (var i = 0; i < convexHull.length - 1; i++) {
      line(
        convexHull[i].x,
        convexHull[i].y,
        convexHull[i + 1].x,
        convexHull[i + 1].y
      );
    }
    line(
      convexHull[0].x,
      convexHull[0].y,
      convexHull[convexHull.length - 1].x,
      convexHull[convexHull.length - 1].y
    );
  }
  if (pointToCheck != null) {
    ellipse(pointToCheck.x, pointToCheck.y, 4, 4);
    if (isPointInPolygon) text("Inside", 30, 50);
    else text("Outside", 30, 50);

    if (tangents.length > 0) {
      for (var i = 0; i < tangents.length; i++) {
        line(
          convexHull[tangents[i]].x,
          convexHull[tangents[i]].y,
          pointToCheck.x,
          pointToCheck.y
        );
      }
    }
  }
  text("HELLO WORLD", 30, 50);
}

function mousePressed() {
  if (
    (mouseX >= 30 && mouseX <= 78 && mouseY >= 85 && mouseY <= 107) ||
    (mouseX >= 30 && mouseX <= 78 && mouseY >= 125 && mouseY <= 147)
  ) {
    return; // Make program not draw a point if a button is clicked
  }
  if (!hullDrawnFlag) {
    points.push(new Point(mouseX, mouseY));
  }
  if (hullDrawnFlag) {
    pointToCheck = new Point(mouseX, mouseY);
    isPointInPolygon = pointInPolygon(pointToCheck);
    if (!isPointInPolygon) tangents = findTangents(pointToCheck);
    else tangents = [];
  }
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};

//==================  Part 1 - Convex Hull ==================

function turnOrientation(p1, p2, p3) {
  //NOTE: top2 and top are swapped compared to the "normal" orientation test,
  // since y is mirrored in this environment
  return (p1.x - p2.x) * (p3.y - p2.y) - (p1.y - p2.y) * (p3.x - p2.x);
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

function grahamScan() {
  var pointsStack = [];
  var sortedPoints = points.slice();
  var min_x = popMinimumX(sortedPoints);
  pointsStack.push(min_x);

  sortedPoints.sort((PointA, PointB) => {
    // NB: I compared angles using slopes instead of dot products to avoid Normalization overhead.
    if (PointA.x == pointsStack[0].x) return 1;
    if (PointB.x == pointsStack[0].x) return -1;
    return (
      (PointA.y - pointsStack[0].y) / (PointA.x - pointsStack[0].x) -
      (PointB.y - pointsStack[0].y) / (PointB.x - pointsStack[0].x)
    );
  });

  pointsStack.push(sortedPoints.pop());
  var top = pointsStack[pointsStack.length - 1];
  var top2 = pointsStack[pointsStack.length - 2];

  for (var i = sortedPoints.length - 1; i >= 0; i--) {
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

//==================  Part 2 - Binary Search ==================

function binarySearch(a, b, f) {
  if (f(a) && a == b) return a;
  if (f(a) && !f(a + 1)) return a;
  if (a == b && !f(arr[a])) return -1;
  var middle = Math.ceil((a + b) / 2);

  if (f(middle)) return binarySearch(middle, b, f);
  return binarySearch(a, middle, f);
}

//==================  Part 3 - Point in Polygon ==================

function pointInPolygon(pt) {
  var leftmostPoint = convexHull[0];
  var index = binarySearch(0, convexHull.length - 1, (extrIndex) => {
    return turnOrientation(leftmostPoint, convexHull[extrIndex], pt) >= 0;
  });
  if (index == -1) return false; // All right turns
  if (index == convexHull.length - 1) return false; // all left turns
  if (turnOrientation(convexHull[index], convexHull[index + 1], pt) >= 0) {
    return true;
  }
  return false;
}

//==================  Part 3 - Tangents ==================

function findOppositeSide(a, b, pt) {
  // Variation of Binary Search that given a list of Extreme Points and an outside point
  // finds any element of the list whose orientation is opposite to the first in the list's.
  // This allows us to split the list in 2, and do a binary search on each side to find the tangents.
  var middle = Math.ceil((a + b) / 2);
  if (
    turnOrientation(
      pt,
      convexHull[a],
      convexHull[(a + 1) % convexHull.length]
    ) *
      turnOrientation(
        pt,
        convexHull[middle],
        convexHull[(middle + 1) % convexHull.length]
      ) <
    0
  ) {
    return middle;
  }
  if (turnOrientation(pt, convexHull[middle], convexHull[a]) >= 0) {
    return findOppositeSide(a, middle, pt);
  } else {
    return findOppositeSide(middle, b, pt);
  }
}

function findTangents(pt) {
  var cl = convexHull.length;
  var tangents = [];
  var opp = findOppositeSide(0, cl, pt);
  var leftStart = turnOrientation(pt, convexHull[0], convexHull[1]) >= 0;
  // leftStart = true if array looks like LLLL..RRRRR...LLL..., False if RRRR...LLL...RRR...

  tangents.push(
    (binarySearch(0, opp, (x) => {
      return !(
        // The logical XNOR is to not rewrite very similar code for the
        // case where leftStart = true and leftStart false.
        (
          turnOrientation(pt, convexHull[x], convexHull[(x + 1) % cl]) >= 0 !=
          leftStart
        )
      );
    }) +
      1) %
      cl
  );
  tangents.push(
    (binarySearch(opp, cl - 1, (x) => {
      return !(
        turnOrientation(pt, convexHull[x], convexHull[(x + 1) % cl]) < 0 !=
        leftStart
      );
    }) +
      1) %
      cl
  );
  return tangents;
}
