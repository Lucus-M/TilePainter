export default class FileHandler{
    constructor(tileSelector, canvas) {
        this.tileSelector = tileSelector;
        this.canvas = canvas;
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
                this.loadFromJson(jsonContent);
            };
            reader.readAsText(file);
        } else {
            alert("Please upload a valid JSON file.");
        }
    }

    async loadJsonFromServer(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status}`);
            }

            const jsonContent = await response.json();
            this.loadFromJson(jsonContent);
        } catch (err) {
            console.error("Error loading JSON:", err);
            alert("Failed to load project file.");
        }
    }

    loadFromJson(jsonContent){
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
    }

    createJson(){
        const jsonData = {
            //size of each tile
            "tileSize": {
                "x": this.canvas.tileSize.x,
                "y": this.canvas.tileSize.y
            },
            "availableTiles": [], // store base64 image data
            "tileMap": [] // store canvas tile map
        }
    
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

        return jsonData;
    }

    handleDownloadSheetButtonClick() {
        const jsonData = this.createJson();
    
        //create and download JSON project file
        const blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});
    
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tilemap.json';
    
        link.click();
    }

    async saveJsonDataToServer(){
        const jsonData = this.createJson();

        await fetch("../community/handleFiles/saveProject.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(this.createJson())
        })
        .then(res => res.text())
        .then(result => {
            if(result == "Not logged in"){
                console.log(result);
                return;
            }
            window.open(`../community/testpage.php?user=${userName}`, "_blank");
        })
        .catch(err => {
            console.error("Error saving project:", err);
        });

    }
}