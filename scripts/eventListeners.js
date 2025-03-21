cvs.addEventListener('mousemove', (event) => {
    updateMousePos(event);
});

cvs.addEventListener('mouseleave', redrawCanvas);

cvs.addEventListener('mousedown', (event) => {
    //right or left click (right click for erasing)
    if(event.button === 0){
        clicking = true;
        drawTiles(drawing(), selectedTile);
    }
    else if(event.button === 2){
        drawTiles(drawing(), 0);
        rightClicking = true;
    }
    
    redrawCanvas();
})

cvs.addEventListener('contextmenu', function(event){
    if(!ctxMenuAllowed){
        event.preventDefault();
    }
});

document.addEventListener("mouseup", function(){
    clicking = false;
    rightClicking = false;
})

document.addEventListener("keydown", (event) => {
    if(event.key === "=" && scale <= 3){
        scale += 0.1;
        rescale();
    }
    else if(event.key === "-" && scale > 0.2){
        scale -= 0.1;
        rescale();
    }
});

document.addEventListener("wheel", function(event) {
    if (event.deltaY < 0 && scale <= 3) {
        scale += 0.1;
    } else if (event.deltaY > 0 && scale > 0.2) {
        scale -= 0.1;
    }

    console.log("scroll down")
    rescale();
});

document.getElementById("imageUpload").addEventListener("change", function(event){
    const file = event.target.files[0];

    if(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = function (e) {
                addNewTile(img);
            };

            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }
});

document.getElementById("brushSize").addEventListener("input", function(event){
    brushRadius = parseInt(document.getElementById("brushSize").value);
    document.getElementById("brushSizeValue").innerText = brushRadius + 1;
})

document.getElementById("jsonUpload").addEventListener("change", function(event){
    const file = event.target.files[0];

    if (file && file.name.endsWith(".json")) {
        const reader = new FileReader();
      
        reader.onload = function (e) {
            try {
                const jsonContent = JSON.parse(e.target.result);

                console.log(jsonContent);

                tileSize.x = jsonContent.tileSize.x;
                tileSize.y = jsonContent.tileSize.y;

                //reset tile selection
                selectTile(0);
                document.querySelectorAll('.tile').forEach(element => {
                    element.remove();
                });
                resetTileSelectorArray();

                for(let i = 0; i < jsonContent.availableTiles.length; i++){
                    const tileImage = new Image();
                    tileImage.src = jsonContent.availableTiles[i];

                    addNewTile(tileImage);
                }

                tileArray = jsonContent.tileMap;
                
                rescale();
                console.log("redrew canvas");

            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Invalid JSON format.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid JSON file.");
    }
});

document.getElementById("downloadSheetButton").addEventListener("click", function(event){
    const jsonData = {
        "tileSize": {
            "x": tileSize.x,
            "y": tileSize.y
        },
        "availableTiles": [], //store base64 image data
        "tileMap": [] //store canvas tile map
    }

    for(let i = 1; i < tileSelectorArray.length; i++){
        jsonData.availableTiles.push(tileSelectorArray[i].img.src);
    }

    for(let y = 0; y < tileArray.length; y++){
        jsonData.tileMap.push([])
        for(x = 0; x < tileArray[y].length; x++){
            jsonData.tileMap[y].push(tileArray[y][x]);
        }
    }

    const blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tilemap.json';

    link.click();
})

document.getElementById("downloadImage").addEventListener("click", function(event){
    redrawCanvas();

    const dataURL = cvs.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'drawing.png';
    link.click();
})