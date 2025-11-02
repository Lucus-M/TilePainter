import Canvas from './Canvas.js';
import TileSelector from './TileSelector.js';
import EventBinder from './events/EventBinder.js';

import FileHandler from './events/FileHandler.js';
import MouseHandler from './events/MouseHandler.js';
import OptionHandler from './events/OptionHandler.js';

export default class User {
    
    constructor(){
        //initialize canvas
        //                              name           tile size
        this.tileSelector = new TileSelector();
        this.canvas = new Canvas(this.tileSelector, "mainCanvas", {x: 16, y: 16});
        this.fileHandler = new FileHandler(this.tileSelector, this.canvas)
        this.mouseHandler = new MouseHandler(this);
        this.optionHandler = new OptionHandler(this);

        //load sample tiles when page loads

        //init brush radius
        this.brushRadius = 0; 
        this.setBrushRadius();
        this.tileToDraw = 0;

        new EventBinder(this).bindEvents();

        this.tool = "paintbrush";
        this.selectStartPoint = {
            x: 0,
            y: 0
        }
        this.selectEndPoint = {
            x:0,
            y:0
        }

        this.clicking = false;
        this.rightClicking = false;
        this.mouseOnCanvas = false;
        this.hoveredTile = {
            x: 0,
            y: 0
        }
    }

    setBrushRadius(){
        //update brush size
        this.brushRadius = parseInt(document.getElementById("brushSize").value);
        document.getElementById("brushSizeValue").innerText = this.brushRadius + 1;
    }

    handleKeyDown(event) {
        //scaling using + and -
        if (event.key === "=" && Canvas.scale <= 3) {
            Canvas.scale += 0.1;
            this.canvas.rescale();
        } else if (event.key === "-" && Canvas.scale > 0.2) {
            Canvas.scale -= 0.1;
            this.canvas.rescale();
        }
    }

    //decide how to handle mouse updates depending on tool used
    handleTool(){
        switch (this.tool) {
        case "paintbrush":
            this.paintbrushSelection();
            break;
        case "rectangle":
            this.rectangleSelection();
            break;
        }
    }

    paintbrushSelection(){
        //draw tiles to canvas if user is clicking
        if(this.clicking || this.rightClicking){
            this.canvas.drawTiles(this.canvas.drawing({x : this.brushRadius, y : this.brushRadius}, this.hoveredTile), this.tileToDraw);
        }

        //draw white cursor box
        this.canvas.drawCursorBox(this.brushRadius, this.hoveredTile);
        this.canvas.drawCursorTiles(this.canvas.drawing({x : this.brushRadius, y : this.brushRadius}, this.hoveredTile));
    }

    //draw rectangle ghost tiles
    rectangleSelection(){
        //mouse hovered position
        let tempHoverPoint = {
            x: this.hoveredTile.x,
            y: this.hoveredTile.y
        }

        //show ghost tiles when clicking and dragging
        if(this.clicking){
            this.canvas.drawCursorTiles(this.canvas.selectTiles(
                {x: this.selectStartPoint.x, y: this.selectStartPoint.y}, 
                {x: tempHoverPoint.x, y: tempHoverPoint.y}));
        }
    }

    //draw rectangle tiles
    rectangleDraw(){
        this.canvas.drawTiles(this.canvas.selectTiles(
            {x: this.selectStartPoint.x, y: this.selectStartPoint.y}, 
            {x: this.selectEndPoint.x, y: this.selectEndPoint.y}), this.tileToDraw);
        this.canvas.redrawCanvas();
    }

    clearCanvas(){
        this.canvas.clearCanvas();
    }
}