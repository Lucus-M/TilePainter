export default class OptionHandler {
    constructor(user){
        this.user = user;
        this.canvas = user.canvas;

        const heightInput = document.getElementById("heightInput");
        const widthInput = document.getElementById("widthInput");

        heightInput.value = this.canvas.tileArray.length;
        widthInput.value = this.canvas.tileArray[0].length;
    }

    //click submit button to resize canvas
    clickResize(){
        const height = Number(heightInput.value);
        const width = Number(widthInput.value);

        this.canvas.resizeCanvas(width, height);
    }
}