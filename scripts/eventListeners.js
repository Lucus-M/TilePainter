// Define the event listener functions
function handleMouseMove(event) {
    updateMousePos(event);
}

function handleMouseLeave() {
    redrawCanvas();
}

function handleMouseDown(event) {
    // right or left click (right click for erasing)
    if (event.button === 0) {
        clicking = true;
        drawTiles(drawing(), selectedTile);
    } else if (event.button === 2) {
        drawTiles(drawing(), 0);
        rightClicking = true;
    }
    
    redrawCanvas();
}

function handleContextMenu(event) {
    //prevent context menu from appearing
    if (!ctxMenuAllowed) {
        event.preventDefault();
    }
}

function handleMouseUp() {
    //user releases mouse
    clicking = false;
    rightClicking = false;
}

function handleKeyDown(event) {
    //scaling using + and -
    if (event.key === "=" && scale <= 3) {
        scale += 0.1;
        rescale();
    } else if (event.key === "-" && scale > 0.2) {
        scale -= 0.1;
        rescale();
    }
}

function handleWheel(event) {
    //scaling using scroll wheel
    if (event.deltaY < 0 && scale <= 3) {
        scale += 0.1;
    } else if (event.deltaY > 0 && scale > 0.2) {
        scale -= 0.1;
    }

    console.log("scroll down");
    rescale();
}

function handleImageUploadChange(event) {
    //tile image upload
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                addNewTile(img);
            };

            //store image src as base64 data
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
}

function handleBrushSizeInput(event) {
    //update brush size
    brushRadius = parseInt(document.getElementById("brushSize").value);
    document.getElementById("brushSizeValue").innerText = brushRadius + 1;
}

function handleJsonUploadChange(event) {
    const file = event.target.files[0];

    if (file && file.name.endsWith(".json")) {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                //parse json file content
                const jsonContent = JSON.parse(e.target.result);

                //read tile size from json
                tileSize.x = jsonContent.tileSize.x;
                tileSize.y = jsonContent.tileSize.y;

                // reset tile selection
                selectTile(0); //select tile 0 (transparent)

                //remove all tile elements & event listeners
                document.querySelectorAll('.tile').forEach(element => {
                    element.remove();
                });

                //new tile selector array
                resetTileSelectorArray();

                //load new tiles from JSON
                for (let i = 0; i < jsonContent.availableTiles.length; i++) {
                    const tileImage = new Image();
                    //read image data as base64
                    tileImage.src = jsonContent.availableTiles[i];
                    addNewTile(tileImage);
                }

                //load tile map
                tileArray = jsonContent.tileMap;

                //rescale & draw new canvas when data is loaded
                rescale();
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Invalid JSON format.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid JSON file.");
    }
}

function handleDownloadSheetButtonClick(event) {
    const jsonData = {
        //size of each tile
        "tileSize": {
            "x": tileSize.x,
            "y": tileSize.y
        },
        "availableTiles": [], // store base64 image data
        "tileMap": [] // store canvas tile map
    };

    //store each tile index
    for (let i = 1; i < tileSelectorArray.length; i++) {
        jsonData.availableTiles.push(tileSelectorArray[i].img.src);
    }

    //store tile selection images as base64 data
    for (let y = 0; y < tileArray.length; y++) {
        jsonData.tileMap.push([]);
        for (let x = 0; x < tileArray[y].length; x++) {
            jsonData.tileMap[y].push(tileArray[y][x]);
        }
    }

    //create and download JSON project file
    const blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tilemap.json';

    link.click();
}

function handleDownloadImageButtonClick(event) {
    //redraw before downloading
    redrawCanvas();

    //download image drawn as png
    const dataURL = cvs.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
}

function createEventListeners(){
    cvs.addEventListener('mousemove', handleMouseMove);
    cvs.addEventListener('mouseleave', handleMouseLeave);
    cvs.addEventListener('mousedown', handleMouseDown);
    cvs.addEventListener('contextmenu', handleContextMenu);

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel);

    document.getElementById("imageUpload").addEventListener("change", handleImageUploadChange);
    document.getElementById("brushSize").addEventListener("input", handleBrushSizeInput);
    document.getElementById("jsonUpload").addEventListener("change", handleJsonUploadChange);
    document.getElementById("downloadSheetButton").addEventListener("click", handleDownloadSheetButtonClick);
    document.getElementById("downloadImage").addEventListener("click", handleDownloadImageButtonClick);
}

// Add event listeners
window.addEventListener("load", (event) => {
    createEventListeners();
})