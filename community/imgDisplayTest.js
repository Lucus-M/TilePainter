import Canvas from '../create/scripts/Canvas.js';
import FileHandler from '../create/scripts/events/FileHandler.js';
import TileSelector from '../create/scripts/TileSelector.js';


export async function createCanvas(userId, projectId, parentDom){
    //create new canvas object
    let canvasDom = document.createElement("canvas");
    canvasDom.id = projectId;

    parentDom.appendChild(canvasDom);
    const tileSelector = new TileSelector();
    const canvas = new Canvas(tileSelector, canvasDom.id, {x: 1, y: 1});

    //load project from file
    const projectJson = await loadProject(userId, projectId)
    new FileHandler(tileSelector, canvas).loadFromJson(projectJson);

    return {canvas, canvasDom};
}

export async function loadAll(userId) {
    try {                
        // Fetch and wait for JSON to load
        const response = await fetch("../community/handleFiles/getProjectData.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                user_id: userId, 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`); 
        } 

        const projects = await response.json();
            console.log(projects);

        if(!Array.isArray(projects) && projects.length <= 0){
            document.getElementById("message").innerText = "User has no projects.";
            return;
        }

        for(let i = 0; i < projects.length; i++){

            const canvas = await createCanvas(userId, projects[i].id, document.getElementById("canvasContainer"));
            const canvasDom = canvas.canvasDom;

            //get project id from canvas
            canvasDom.dataset.projectId = projects[i].id;

            let projectName = projects[i].name;
            if(!projects[i].name){
                projectName = "Untitled";
            }

            canvasDom.dataset.hover_data = projectName;

            //redirect to project view page when clickqued!
            canvasDom.addEventListener('click', (e) => {
                window.location.href = `./viewProj.php?proj_id=${projects[i].id}`;
            });
        }

    } catch (err) {
        console.error("Error:", err);
        document.getElementById("message").innerText = "Failed to load JSON.";
    }
}

async function loadProject(userId, projId){
    const url = `./projects/${userId}/${projId}.json?nocache=${Date.now()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to load JSON file");

    const data = await response.json();
    return data;
}

