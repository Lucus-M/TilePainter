export default class Canvas {
    static ctxMenuAllowed = false;
    static scale = 1;

    constructor(id, tileSize){        
        this.id = id; //canvas dom element ID
        this.dom = document.getElementById(this.id); //canvas dom element
        this.ctx = this.dom.getContext("2d"); //2d context

        //dimensions of canvas
        this.height = 0;
        this.width = 0;
        //initialize canvas dimensions

        //size of each tile
        this.tileSize = tileSize;
        this.initCvsSize();

        this.tileArray;
        this.initTiles(this.dom.height / this.tileSize.y, this.dom.width / tileSize.x);    
    }

    resizeCanvas(width, height, tileSelector) {
        // resize existing array
        this.tileArray = this.tileArray
            .slice(0, height)
            .map(row => row.slice(0, width));

        // expand vertically
        while (this.tileArray.length < height) {
            const newRow = new Array(width).fill(0);
            this.tileArray.push(newRow);
        }

        // expand horizontally
        for (let y = 0; y < this.tileArray.length; y++) {
            while (this.tileArray[y].length < width) {
                this.tileArray[y].push(0);
            }
        }

        // Resize the visual canvas
        this.resizeCvsDom(Canvas.scale * this.tileArray[0].length, Canvas.scale * this.tileArray.length);
        this.redrawCanvas(tileSelector);
    }


    //change dimensions of canvas dom element
    resizeCvsDom(width, height){
        this.dom.height = height * this.tileSize.x;
        this.dom.width = width * this.tileSize.y;
    }

    initCvsSize(){
        //cet canvas container element's dimensions
        let containerWidth = document.getElementById("canvasContainer").offsetWidth;
        let containerHeight = document.getElementById("canvasContainer").offsetHeight;

        //set canvas width to however many full tiles can fit within the canvas container
        this.dom.width = containerWidth - (containerWidth % this.tileSize.x);
        this.dom.height = containerHeight - (containerHeight % this.tileSize.y);
    }

    initTiles(tileHeight, tileWidth){
        this.tileArray = new Array(tileHeight); //reset tileArray

        //loop through 2d array
        for(let iy = 0; iy < this.tileArray.length; iy++){
            this.tileArray[iy] = new Array(tileWidth); //create row
            for(let ix = 0; ix < this.tileArray[iy].length; ix++){
                this.tileArray[iy][ix] = 0; //initialize tile to 0 (transparent)
            }
        }
    }

    redrawCanvas(tileSelector){
        this.ctx.imageSmoothingEnabled = false; //prevent lower res images from becoming blurry when scaled up
        this.ctx.clearRect(0, 0, this.dom.width, this.dom.height); //clear canvas

        //loop through 2d array
        for(let iy = 0; iy < this.tileArray.length; iy++){
            for(let ix = 0; ix < this.tileArray[iy].length; ix++){
                //0 is transparent
                if(this.tileArray[iy][ix] != 0){
                    //draw tile images             
                    this.ctx.drawImage(tileSelector.arr[this.tileArray[iy][ix]].img, 
                                //positioning * scale
                                (ix*this.tileSize.x) * Canvas.scale, 
                                (iy*this.tileSize.y) * Canvas.scale,
                                //image width and height 
                                this.tileSize.x*Canvas.scale, 
                                this.tileSize.y*Canvas.scale);
                }
            }
        }
    }
    
    rescale(tileSelector){
        //resize canvas element based on scale variable
        this.resizeCvsDom(Canvas.scale * this.tileArray[0].length, Canvas.scale * this.tileArray.length);
        
        //update scale display
        document.getElementById("scaleDisplay").innerText = "Scale = " + Canvas.scale.toFixed(1);
        this.redrawCanvas(tileSelector);
    }

    drawing(tilePoints, hoveredTile){
        let drawnTiles = [];
        //selection of tile coordinates based on brush radius
        for(let y = 0; y < (tilePoints.y + 1); y++){
            for(let x = 0; x < (tilePoints.x + 1); x++){
                //add new coordinates to list of tiles to draw to
                drawnTiles.push([0,0]);
                //y position of updated tile
                drawnTiles[drawnTiles.length-1][0] = (hoveredTile.y+Math.ceil(tilePoints.y/2))-y
                //x position of updated tile
                drawnTiles[drawnTiles.length-1][1] = (hoveredTile.x+Math.ceil(tilePoints.x/2))-x
            }
        }

        //return array for drawing
        return drawnTiles;
    }
    
    selectTiles(startPoint, endPoint){
        let drawnTiles = [];

        let start = startPoint;
        let end = endPoint;

        if(start.x > end.x){
            let temp = end.x;
            end.x = start.x;
            start.x = temp;
        }
        if(start.y > end.y){
            let temp = end.y;
            end.y = start.y;
            start.y = temp;
        }

        let width = end.x - start.x;
        let height = end.y - start.y;

        for(let y = 0; y < height+1; y++){
            for(let x = 0; x < width+1; x++){
                drawnTiles.push([0,0]);
                drawnTiles[drawnTiles.length-1][0] = start.y + y;
                drawnTiles[drawnTiles.length-1][1] = start.x + x;
            }
        }
        return drawnTiles;
    }

    updateTile(ty, tx, tileNum){
        if(ty >= 0 && ty < this.tileArray.length && tx >= 0 && tx < this.tileArray[0].length){
            this.tileArray[ty][tx] = tileNum;
        }
    }

    drawTiles(tiles, tileIndex){
        for(let i = 0; i < tiles.length; i++){
            this.updateTile(tiles[i][0], tiles[i][1], tileIndex);
        }
    }

    drawCursorTiles(tiles, tileSelector){
        for(let i = 0; i < tiles.length; i++){
            this.ctx.drawImage(tileSelector.arr[tileSelector.selected].img, 
                          tiles[i][1]*this.tileSize.x*Canvas.scale, 
                          tiles[i][0]*this.tileSize.y*Canvas.scale, 
                          this.tileSize.x*Canvas.scale, this.tileSize.y*Canvas.scale);
        }
    }

    drawCursorBox(brushRadius, hoveredTile){
        //cursor box
        this.ctx.beginPath();
        this.ctx.strokeStyle = "white";
    
        this.ctx.rect((hoveredTile.x-Math.floor(brushRadius/2))*this.tileSize.x*Canvas.scale, 
                      (hoveredTile.y-Math.floor(brushRadius/2))*this.tileSize.y*Canvas.scale, 
                      this.tileSize.x*(brushRadius+1)*Canvas.scale, 
                      this.tileSize.y*(brushRadius+1)*Canvas.scale);
                      this.ctx.stroke();
    }

    clearCanvas(tileSelector){
        for(let iy = 0; iy < this.tileArray.length; iy++){
            for(let ix = 0; ix < this.tileArray[iy].length; ix++){
                this.tileArray[iy][ix] = 0; //initialize tile to 0 (transparent)
            }
        }  
        this.redrawCanvas(tileSelector)
    }
}
