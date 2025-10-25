export default class EventBinder {
    constructor(user) {
        this.user = user;
    }

    bindEvents() {
        const { mouseHandler, fileHandler, canvas, optionHandler } = this.user;

        // mouse
        canvas.dom.addEventListener('mousemove', mouseHandler.updateMousePos.bind(mouseHandler));
        canvas.dom.addEventListener('mouseleave', mouseHandler.handleMouseLeave.bind(mouseHandler));
        canvas.dom.addEventListener('mouseenter', mouseHandler.handleMouseEnter.bind(mouseHandler));
        canvas.dom.addEventListener('mousedown', mouseHandler.handleMouseDown.bind(mouseHandler));
        canvas.dom.addEventListener('contextmenu', mouseHandler.handleContextMenu.bind(mouseHandler));
        document.addEventListener('mouseup', mouseHandler.handleMouseUp.bind(mouseHandler));
        document.addEventListener('wheel', mouseHandler.handleWheel.bind(mouseHandler));

        // keyboard
        document.addEventListener("keydown", this.user.handleKeyDown.bind(this.user));

        // brush size input
        document.getElementById("brushSize").addEventListener("input", this.user.setBrushRadius.bind(this.user));

        //options menu
        document.getElementById("resizeSubmit").addEventListener("click", optionHandler.clickResize.bind(optionHandler))


        // file input/output
        document.getElementById("imageUpload").addEventListener("change", fileHandler.handleImageUploadChange.bind(fileHandler));
        document.getElementById("jsonUpload").addEventListener("change", fileHandler.handleJsonUploadChange.bind(fileHandler));
        document.getElementById("downloadSheetButton").addEventListener("click", fileHandler.handleDownloadSheetButtonClick.bind(fileHandler));
        document.getElementById("downloadImage").addEventListener("click", fileHandler.handleDownloadImageButtonClick.bind(fileHandler));
    }
}