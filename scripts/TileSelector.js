export default class TileSelector {
    
    constructor(){
        this.arr = [];
        this.resetArray();
        this.selected = 0;
    }

    addNewTile(image){
        this.arr.push({
            element: document.createElement("div"),
            img: image
        });

        const cur = this.arr.length - 1;

        this.arr[cur].element.classList.add("tile");
        this.arr[cur].element.addEventListener("click", () => {
            this.selectTile(cur);
        })
        this.arr[cur].element.innerHTML = "<img src='" + 
                                            this.arr[cur].img.src + 
                                            "'>";
        document.getElementById("tileSelector").appendChild(this.arr[cur].element);
    }

    loadSampleTiles() {
        const amount = 5;

        for(let i = 0; i <= amount; i++){
            // Fetch the sample tile images and store them as base 64 data
            fetch("http://www.lucusdm.com/lucus/images/tiles/sampleTiles/"+ i +".png")
                .then(response => response.blob()) 
                .then(blob => {
                    this.uploadImage(blob);
                })
            .catch(error => console.error('Error fetching image:', error));
        }
    }

    uploadImage(file){
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.addNewTile(img);
                };
    
                //store image src as base64 data
                img.src = e.target.result;
            };
    
            reader.readAsDataURL(file);
        }
    }

    selectTile(i){
        this.arr[this.selected].element.classList.remove("selected");
        this.arr[i].element.classList.add("selected");
    
        this.selected = i;
    }

    resetArray(){
        //Init transparent tile
        this.arr = [];
        let transparentImg = new Image();
        transparentImg.src = "http://www.lucusdm.com/lucus/images/tiles/tileUI/transparentbg.png";
        this.addNewTile(transparentImg);

        this.selected = 0;
        this.selectTile(0);
    }
}