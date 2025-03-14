cvs.addEventListener('mousemove', (event) => {
    updateMousePos(event);
});

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

cvs.addEventListener('mouseup', function(){
    clicking = false;
    rightClicking = false;
})

cvs.addEventListener('contextmenu', function(event){
    if(!ctxMenuAllowed){
        event.preventDefault();
    }
});

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