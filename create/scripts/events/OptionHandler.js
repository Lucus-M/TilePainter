export default class OptionHandler {
    constructor(user){
        this.user = user;
        this.canvas = user.canvas;

        this.heightInput = document.getElementById("heightInput");
        this.widthInput = document.getElementById("widthInput");

        this.tileHeightInput = document.getElementById("tileHeightInput");
        this.tileWidthInput = document.getElementById("tileWidthInput");

        this.changeValues();
    }

    //click submit button to resize canvas
    clickResize(){
        const height = Number(heightInput.value);
        const width = Number(widthInput.value);

        this.canvas.resizeCanvas(width, height);
    }

    clickTileResize(){
        const height = Number(tileHeightInput.value);
        const width = Number(tileWidthInput.value);

        this.canvas.resizeTiles(width, height);
    }

    changeValues(){
        console.log(this.canvas.tileSize);
        this.heightInput.value = this.canvas.tileArray.length;
        this.widthInput.value = this.canvas.tileArray[0].length;
        this.tileHeightInput.value = this.canvas.tileSize.y;
        this.tileWidthInput.value = this.canvas.tileSize.x;
    }
}