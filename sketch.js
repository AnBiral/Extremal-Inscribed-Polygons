class Sketch extends ConvexPolygonDrawer{
    constructor(parent){
        super(parent);
    }

    generateSketch = (p) => {

        p.setup = () => {
            this.convexSetup(p);
        }

        p.draw = () => {
            this.convexDraw(p);
        }
        
        p.mousePressed =  () => {
            this.convexMousePressed(p);
        }
    }

}


var sketch = new Sketch("sketch");
new p5(sketch.generateSketch)
