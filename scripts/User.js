import Canvas from './Canvas.js';
import TileSelector from './TileSelector.js';

export default class User {
    
    constructor(){
        this.canvas = new Canvas("mainCanvas", {x: 16, y: 16});
        
        this.tileSelector = new TileSelector();

        this.tileSelector.loadSampleTiles();
        this.brushRadius; 
        this.setBrushRadius();

        this.tool = "rectangle";
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
        this.hoveredTile = {
            x: 0,
            y: 0
        }

        this.canvas.dom.addEventListener('mousemove', this.updateMousePos.bind(this));
        this.canvas.dom.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        this.canvas.dom.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.dom.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("wheel", this.handleWheel.bind(this));
        document.getElementById("brushSize").addEventListener("input", this.setBrushRadius.bind(this));

        document.getElementById("imageUpload").addEventListener("change", this.handleImageUploadChange.bind(this));
        document.getElementById("jsonUpload").addEventListener("change", this.handleJsonUploadChange.bind(this));
        document.getElementById("downloadSheetButton").addEventListener("click", this.handleDownloadSheetButtonClick.bind(this));
        document.getElementById("downloadImage").addEventListener("click", this.handleDownloadImageButtonClick.bind(this));

    }

    handleImageUploadChange(event) {
        //tile image upload
        const file = event.target.files[0];
    
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.tileSelector.addNewTile(img);
                };
    
                //store image src as base64 data
                img.src = e.target.result;
            };
    
            reader.readAsDataURL(file);
        }
    }

    handleDownloadImageButtonClick(event) {
        //redraw before downloading
        this.canvas.redrawCanvas(this.tileSelector);
    
        //download image drawn as png
        const dataURL = this.canvas.dom.toDataURL('image/png');
    
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'drawing.png';
        link.click();
    }

    handleJsonUploadChange(event) {
        const file = event.target.files[0];
    
        if (file && file.name.endsWith(".json")) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                    //parse json file content
                    const jsonContent = JSON.parse(e.target.result);
    
                    //read tile size from json
                    this.canvas.tileSize.x = jsonContent.tileSize.x;
                    this.canvas.tileSize.y = jsonContent.tileSize.y;
    
                    // reset tile selection
                    this.tileSelector.selectTile(0); //select tile 0 (transparent)
    
                    //remove all tile elements & event listeners
                    document.querySelectorAll('.tile').forEach(element => {
                        element.remove();
                    });
    
                    //new tile selector array
                    this.tileSelector.resetArray();
                    let loaded = 0;
                    //load new tiles from JSON
                    for (let i = 0; i < jsonContent.availableTiles.length; i++) {
                        const tileImage = new Image();
                        //read image data as base64
                        tileImage.src = jsonContent.availableTiles[i];

                        this.tileSelector.addNewTile(tileImage);

                        tileImage.onload = () =>{
                            loaded++;
                        }
                    }
    
                    //load tile map
                    this.canvas.tileArray = jsonContent.tileMap;
    
                    //rescale & draw new canvas when data is loaded
                    let checkloaded = setInterval(() => {
                        if(loaded == jsonContent.availableTiles.length){
                            this.canvas.rescale(this.tileSelector);
                            clearInterval(checkloaded);
                        }
                    }, 50)
                
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid JSON file.");
        }
    }

    handleDownloadSheetButtonClick(event) {
        const jsonData = {
            //size of each tile
            "tileSize": {
                "x": this.canvas.tileSize.x,
                "y": this.canvas.tileSize.y
            },
            "availableTiles": [], // store base64 image data
            "tileMap": [] // store canvas tile map
        };
    
        //store each tile index
        for (let i = 1; i < this.tileSelector.arr.length; i++) {
            jsonData.availableTiles.push(this.tileSelector.arr[i].img.src);
        }
    
        //store tile selection images as base64 data
        for (let y = 0; y < this.canvas.tileArray.length; y++) {
            jsonData.tileMap.push([]);
            for (let x = 0; x < this.canvas.tileArray[y].length; x++) {
                jsonData.tileMap[y].push(this.canvas.tileArray[y][x]);
            }
        }
    
        //create and download JSON project file
        const blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tilemap.json';
    
        link.click();
    }

    handleMouseLeave(){
        this.canvas.redrawCanvas(this.tileSelector);
    }

    handleMouseDown(event){
        // right or left click (right click for erasing)
        if (event.button === 0) {
            this.clicking = true;
            //this.canvas.drawTiles(this.canvas.drawing(this.brushRadius, this.hoveredTile), this.tileSelector.selected);
        } else if (event.button === 2) {
            this.rightClicking = true;
            //this.canvas.drawTiles(this.canvas.drawing(this.brushRadius, this.hoveredTile), 0);
        }

        if(this.tool == "paintbrush"){
            this.paintbrushDraw();
        }
        else if(this.tool == "rectangle"){
            this.selectStartPoint = {
                x: this.hoveredTile.x,
                y: this.hoveredTile.y
            }
        }

        this.canvas.redrawCanvas(this.tileSelector);
    }

    handleMouseUp(){
    
        console.log(this.clicking)
        console.log(this.rightClicking)
        if(this.tool == "rectangle"){
            this.selectEndPoint = {
                x: this.hoveredTile.x,
                y: this.hoveredTile.y
            }
            //console.log(this.selectStartPoint.x + ", " + this.selectStartPoint.y + " " + this.selectEndPoint.x + ", " + this.selectEndPoint.y);
            this.rectangleDraw();
        }
        this.clicking = false;
        this.rightClicking = false;
    }

    handleContextMenu(event){
        if(!this.canvas.ctxMenuAllowed){
            event.preventDefault();
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
            this.canvas.rescale(this.tileSelector);
        } else if (event.key === "-" && Canvas.scale > 0.2) {
            Canvas.scale -= 0.1;
            this.canvas.rescale(this.tileSelector);
        }
    }

    handleWheel(event) {
        //scaling using scroll wheel
        if (event.deltaY < 0 && Canvas.scale <= 3) {
            Canvas.scale += 0.1;
        } else if (event.deltaY > 0 && Canvas.scale > 0.2) {
            Canvas.scale -= 0.1;
        }
    
        this.canvas.rescale(this.tileSelector);
    }

    updateMousePos(event){
        const prevX = this.hoveredTile.x;
        const prevY = this.hoveredTile.y

        const cvsBoundingRect = this.canvas.dom.getBoundingClientRect();

        const cvsy = cvsBoundingRect.y;
        const cvsx = cvsBoundingRect.x;

        const x = event.clientX;
        const y = event.clientY;

        this.hoveredTile.x = Math.floor((x-cvsx)/(this.canvas.tileSize.x*Canvas.scale));
        this.hoveredTile.y = Math.floor((y-cvsy)/(this.canvas.tileSize.y*Canvas.scale)); 
        
        //click and drag draw
        if(!((prevX === this.hoveredTile.x) && (prevY === this.hoveredTile.y))){
            this.canvas.redrawCanvas(this.tileSelector);

            if(this.tool == "paintbrush" && (this.clicking || this.rightClicking)){
                this.paintbrushDraw(this.hoveredTile)
                this.canvas.drawCursorBox(this.brushRadius, this.hoveredTile);
                if(this.tileSelector.selected != 0) this.canvas.drawCursorTiles(this.canvas.drawing({x : this.brushRadius, y : this.brushRadius}, this.hoveredTile), this.tileSelector);
            }
            if(this.tool == "rectangle"){
                let tempEndPoint = {
                    x: this.hoveredTile.x,
                    y: this.hoveredTile.y
                }

                console.log(this.selectStartPoint)
                if(this.tileSelector.selected != 0 && this.clicking){
                    this.canvas.drawCursorTiles(this.canvas.selectTiles(
                        {x: this.selectStartPoint.x, y: this.selectStartPoint.y}, 
                        {x: tempEndPoint.x, y: tempEndPoint.y}), this.tileSelector);
                }
            }
        }
    }

    rectangleDraw(){
        if(this.clicking){
            this.canvas.drawTiles(this.canvas.selectTiles(
                {x: this.selectStartPoint.x, y: this.selectStartPoint.y}, 
                {x: this.selectEndPoint.x, y: this.selectEndPoint.y}), this.tileSelector.selected);
        }
        else if(this.rightClicking){
            this.canvas.drawTiles(this.canvas.selectTiles(
                {x: this.selectStartPoint.x, y: this.selectStartPoint.y}, 
                {x: this.selectEndPoint.x, y: this.selectEndPoint.y}), 0);
        }
        this.canvas.redrawCanvas(this.tileSelector);
    }

    paintbrushDraw(){
        if(this.clicking){
            this.canvas.drawTiles(this.canvas.drawing({x : this.brushRadius, y : this.brushRadius}, this.hoveredTile), this.tileSelector.selected);
        }
        else if(this.rightClicking){
            this.canvas.drawTiles(this.canvas.drawing({x : this.brushRadius, y : this.brushRadius}, this.hoveredTile), 0);
        }
    }
}