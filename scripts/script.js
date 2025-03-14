//tile selector menu
let tileSelector = document.getElementById("tileSelector");

//get canvas ctx
let cvs = document.getElementById("mainCanvas");
let ctx = cvs.getContext("2d");

//pixel size of tiles
let tileSize = {
    x: 16, //length 
    y: 16 //height
}

let brushRadius = parseInt(document.getElementById("brushSize").value);

let selectedTool = "pencil";

let scale = 1; //zoom scale

let tileSelectorArray = []; //array of selectable tiles, contains image and DOM element
let selectedTile = 0; //index of the tile that the user has selected

let ctxMenuAllowed = false; //whether the user can open the context menu in canvas or not

let tileArray,      // 2d array of tiles
    tileX,          // horizontal tile index for selected tile
    tileY,          // vertical tile index for selected tile

    clicking,       // if the user is left clicking (boolean)
    rightClicking;  // if the user is right clicking (boolean)
    
//resize canvas based on user's screen dimensions
function resize(){
    //cet canvas container element's dimensions
    let containerWidth = document.getElementById("canvasContainer").offsetWidth;
    let containerHeight = document.getElementById("canvasContainer").offsetHeight;

    //set canvas width to however many full tiles can fit within the canvas container
    cvs.width = containerWidth - (containerWidth % tileSize.x);
    cvs.height = containerHeight - (containerHeight % tileSize.y);
}

//initialize tile array after creating new canvas
function createCanvas(){
    //loop through 2d array
    for(let iy = 0; iy < tileArray.length; iy++){
        tileArray[iy] = new Array(cvs.width / tileSize.x); //create row (however many tiles can fit into canvas width)
        for(let ix = 0; ix < tileArray[iy].length; ix++){
            tileArray[iy][ix] = 0; //initialize tile to 0 (transparent)
        }
    }
}

//clear and redraw canvas
function redrawCanvas(){
    ctx.imageSmoothingEnabled = false; //prevent lower res images from becoming blurry when scaled up
    ctx.clearRect(0, 0, cvs.width, cvs.height); //clear canvas
    
    //loop through 2d array
    for(let iy = 0; iy < tileArray.length; iy++){
        for(let ix = 0; ix < tileArray[iy].length; ix++){
            //0 is transparent
            if(tileArray[iy][ix] != 0){
                //draw tile images             
                ctx.drawImage(tileSelectorArray[tileArray[iy][ix]].img, (ix*tileSize.x) * scale, (iy*tileSize.y) * scale, tileSize.x*scale, tileSize.y*scale);
            }
        }
    }
}

function rescale(){
    //resize canvas element based on scale variable
    cvs.width = (tileSize.x * scale) * tileArray[0].length;
    cvs.height = (tileSize.y * scale) * tileArray.length;
    
    //update scale display
    document.getElementById("scaleDisplay").innerText = "Scale = " + scale.toFixed(1);
    redrawCanvas();
}

function drawing(){
    let drawnTiles = [];

    for(let y = 0; y < (brushRadius + 1); y++){
        for(let x = 0; x < (brushRadius + 1); x++){
            drawnTiles.push([0,0]);
            drawnTiles[drawnTiles.length-1][0] = (tileY+Math.ceil(brushRadius/2))-y
            drawnTiles[drawnTiles.length-1][1] = (tileX+Math.ceil(brushRadius/2))-x
        }
    }

    return drawnTiles;
}

function drawTiles(drawnTiles, selectedTile){
    for(let i = 0; i < drawnTiles.length; i++){
        updateTile(drawnTiles[i][0], drawnTiles[i][1], selectedTile);
    }
}

function drawCursorTiles(drawnTiles, selectedTile){
    for(let i = 0; i < drawnTiles.length; i++){
        ctx.drawImage(tileSelectorArray[selectedTile].img, drawnTiles[i][1]*tileSize.x*scale, drawnTiles[i][0]*tileSize.y*scale, tileSize.x*scale, tileSize.y*scale);
    }
}

function updateMousePos(event){
    //previous selected tile
    const prevtileY = tileY;
    const prevtileX = tileX;

    //canvas 
    let cvsBoundingRect = cvs.getBoundingClientRect();

    const cvsy = cvsBoundingRect.y;
    const cvsx = cvsBoundingRect.x;

    //mouse position
    const x = event.clientX;
    const y = event.clientY;

    //calculate which tile the user is hovering over
    tileX = Math.floor((x-cvsx)/(tileSize.x*scale));
    tileY = Math.floor((y-cvsy)/(tileSize.x*scale));

    
    if(!((prevtileX === tileX) && (prevtileY === tileY))){
        //click and drag draw
        if(clicking){
            drawTiles(drawing(), selectedTile);
        }
        else if(rightClicking){
            drawTiles(drawing(), 0);
        }
    
        redrawCanvas();
    
        //cursor tiles
        if(selectedTile != 0){
            drawCursorTiles(drawing(), selectedTile);
        }
    
        //cursor box
        ctx.beginPath();
        ctx.strokeStyle = "white";

        ctx.rect((tileX-Math.floor(brushRadius/2))*tileSize.x*scale, 
                 (tileY-Math.floor(brushRadius/2))*tileSize.y*scale, 
                  tileSize.x*(brushRadius+1)*scale, 
                  tileSize.y*(brushRadius+1)*scale);
        ctx.stroke();
    }
}

//update tile position
function updateTile(ty, tx, tileNum){
    if(ty >= 0 && ty < tileArray.length && tx >= 0 && tx < tileArray[0].length){
        tileArray[ty][tx] = tileNum;
    }
}

function clickUpload(){
    document.getElementById("imageUpload").click(); // Open file picker
}

//upload custom tile
function addNewTile(image){
    tileSelectorArray.push({
        element: document.createElement("div"),
        img: image,
    })

    //newest tile
    const cur = tileSelectorArray.length - 1;

    //add tile to tile selector array
    tileSelectorArray[cur].element.classList.add("tile");

    //add clicking event listener to tile selection
    tileSelectorArray[cur].element.addEventListener("click", function(){
        selectTile(cur);
    });

    tileSelectorArray[cur].element.innerHTML = "<img src='" + tileSelectorArray[cur].img.src + "'>";
    tileSelector.appendChild(tileSelectorArray[cur].element);
}

//select tile to draw
function selectTile(i){
    tileSelectorArray[selectedTile].element.classList.remove("selected");
    tileSelectorArray[i].element.classList.add("selected");

    selectedTile = i;
}

//select new tool
function selectTool(tool){
    selectedTool = tool;
    
}

function initUI(){
    //Init canvas
    resize(); //resize canvas based on user's screen dimensions
    tileArray = new Array(cvs.height / tileSize.y); //create tile array (how ever many tiles fit within the user's canvas dimensions)
    createCanvas(); //initialize tiles array

    //Init transparent tile
    let transparentImg = new Image();
    transparentImg.src = "sampleImgs/transparentbg.png";
    addNewTile(transparentImg);
    selectTile(0);

    redrawCanvas();
}

initUI();
