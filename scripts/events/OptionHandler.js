export default class OptionHandler {
    constructor(user){
        this.user = user;
        this.canvas = user.canvas;

        const heightInput = document.getElementById("heightInput");
        const widthInput = document.getElementById("widthInput");
    }

    //click submit button to resize canvas
    clickResize(){
        const height = heightInput.value;
        const width = widthInput.value;

        this.canvas.resizeCanvas(width, height);
    }
}