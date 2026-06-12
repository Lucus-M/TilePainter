import Canvas from '../Canvas.js';

export default class MouseHandler{
    constructor(user) {
        this.user = user;
        // cache commonly used object references
        this.canvas = user.canvas;
        this.tileSelector = user.tileSelector;
    }

    handleMouseLeave(){
        const { canvas, user } = this;
        user.mouseOnCanvas = false;
        canvas.redrawCanvas(this.tileSelector);
    }

    handleMouseEnter(){
        const { user } = this;
        user.mouseOnCanvas = true;
    }

    handleMouseDown(event){
        const { user, canvas, tileSelector } = this;

        // right or left click (right click for erasing)
        if (event.button === 0) {
            user.clicking = true;
            user.tileToDraw = tileSelector.selected;
        } else if (event.button === 2) {
            user.rightClicking = true;
            user.tileToDraw = 0;
        }

        if(user.tool == "paintbrush"){
            user.paintbrushSelection();
        }
        else if(user.tool == "rectangle" && user.mouseOnCanvas){
            user.selectStartPoint = {
                x: user.hoveredTile.x,
                y: user.hoveredTile.y
            }
        }

        canvas.redrawCanvas(tileSelector);
    }

    handleMouseUp(){
        const { user } = this;

        if(user.tool == "rectangle" && user.mouseOnCanvas){
            user.selectEndPoint = {
                x: user.hoveredTile.x,
                y: user.hoveredTile.y
            }
            user.rectangleDraw();
        }
        user.clicking = false;
        user.rightClicking = false;
    }

    handleContextMenu(event){
        const { canvas } = this;
        if(!canvas.ctxMenuAllowed){
            event.preventDefault();
        }
    }

    //scaling using scroll wheel
    handleWheel(event) {
        const { canvas, tileSelector } = this;

        if (event.deltaY < 0 && Canvas.scale <= 3) {
            Canvas.scale += 0.1;
        } else if (event.deltaY > 0 && Canvas.scale > 0.2) {
            Canvas.scale -= 0.1;
        }
    
        canvas.rescale(tileSelector);
    }

    updateMousePos(event){
        const { user, canvas, tileSelector } = this;

        //store previous tile coordinates
        const prevX = user.hoveredTile.x;
        const prevY = user.hoveredTile.y

        //cvs dimensions
        const cvsBoundingRect = canvas.dom.getBoundingClientRect();
        const cvsy = cvsBoundingRect.y;
        const cvsx = cvsBoundingRect.x;

        //find mouse coordinates
        const x = event.clientX;
        const y = event.clientY;

        //calculate new hovered tile based on mouse coordinates
        user.hoveredTile.x = Math.floor((x-cvsx)/(user.canvas.tileSize.x*Canvas.scale));
        user.hoveredTile.y = Math.floor((y-cvsy)/(user.canvas.tileSize.y*Canvas.scale)); 
        
        //handle mouse position change
        //if previous tile is not the same as current tile
        if(!((prevX === user.hoveredTile.x) && (prevY === user.hoveredTile.y))){
            canvas.redrawCanvas(tileSelector);
            user.handleTool();
        }
    }
}
