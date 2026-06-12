import { createCanvas } from "./imgDisplayTest.js";
import Canvas from '../create/scripts/Canvas.js';
import FileHandler from '../create/scripts/events/FileHandler.js';
import {addComment, loadComments, displayComments} from '../community/handleComments/handleComments.js';

export function initView(userId, projId){
    let hoveringProj = false;

    if(userId && userName){
        document.getElementById("usernameDisplay").innerText = userName;
    }
    
    const nameCont = document.getElementById("nameDisplayCont");
    const descCont = document.getElementById("descCont");
    const editNameCont = document.getElementById("editNameInputCont");
    const editDescCont = document.getElementById("editDescInputCont");

    const openNameEdit = document.getElementById("editNameButton");
    const openDescEdit = document.getElementById("editDescButton");

    const nameEditField = document.getElementById("editNameInput");
    const descEditField = document.getElementById("editDescInput");

    const nameSubmit = document.getElementById("nameSubmit");
    const descSubmit = document.getElementById("descSubmit");

    openNameEdit.addEventListener("click", (e)=>{
        nameCont.style.display = "none";
        editNameCont.style.display = "block";
    })

    openDescEdit.addEventListener("click", (e)=>{
        descCont.style.display = "none";
        editDescCont.style.display = "block";        
    })

    nameSubmit.addEventListener("click", (e)=>{
        updateProjInfo(nameEditField.value, null);
    })

    descSubmit.addEventListener("click", (e)=>{
        updateProjInfo(null, descEditField.value);
    })
    
    //update name and description of project
    async function updateProjInfo(name, desc){
        let response = await fetch("../community/handleFiles/updateProjInfo.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                proj_id: projId,
                name: name,
                desc: desc,
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } 
        else{
            window.location.reload();
        }
    }

    //delete a project
    async function deleteProject() {
        // Ask for confirmation first
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        try {
            // Send request to delete the project
            const response = await fetch("handleFiles/deleteProject.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projId })
            });

            const data = await response.json();

            if (data.success) {
                alert("Project deleted successfully.");

                // Redirect to the user's gallery page
                window.location.href = `gallery.php?user=${userId}`;
            } else {
                alert("Failed to delete project: " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting the project.");
        }
    }

    //toggle the project to private/public
    async function setPrivate(currentPrivate) {
        // Toggle private: if 1 -> 0, if 0 -> 1
        const newPrivate = currentPrivate == 1 ? 0 : 1;

        try {
            const response = await fetch("../community/handleFiles/updateProjInfo.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proj_id: projId,
                    private: newPrivate
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === "success") {
                alert(`Project is now ${newPrivate ? "private" : "public"}.`);
                window.location.reload();
            } else {
                alert("Failed to update private status.");
            }
        } catch (err) {
            console.error("Error updating private:", err);
            alert("Error updating private status.");
        }
    }

    //init canvas & comments
    window.addEventListener("load", async function() {
        //request project metadata from server, providing project id
        let response = await fetch(`handleFiles/getProjectData.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                proj_id: projId, 
            }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } 
        
        const list = await response.json();
        let data = list[0];
        
        if(Array.isArray(list) && list.length > 0){

            //go to project owner's gallery
            document.getElementById("projUserDisplay").addEventListener('click', function() { 
                window.location.href = `../community/gallery.php?user=${data.user_id}`;
            });

            //date project was published
            document.getElementById("dateText").innerText = new Date(data.date.replace(" ", "T")).toLocaleDateString("en-US");

            //create canvas display element
            let canvasData = await createCanvas(data.user_id, data.id, document.getElementById("canvasContainer"));
            let canvas = canvasData.canvas;

            //show project name & description
            document.getElementById("projNameDisplay").innerText = data.name || "Untitled"; //show untitled if project name is null
            document.getElementById("projDescription").innerText = data.description || "No Description"; //show untitled if project name is null

            document.getElementById("projUserNameDisplay").innerText = data.user_name;

            //display special buttons when user is logged in
            if(data.user_id === userId){
                document.getElementById("editButton").style.display = "block";
                document.getElementById("privateButton").style.display = "block";
                document.getElementById("deleteButton").style.display = "block";
                openNameEdit.style.display = "block";
                openDescEdit.style.display = "block";
            }

            console.log(data.private);
            if(data.private == 1){
                document.getElementById("privateButton").dataset.hover_data = "Make Public";
            }

            //display special buttons when user is logged in
            if(data.private == 1 && (data.user_id !== userId)){
                window.location.href = '../community/login.php';
            }
        }
        //alert(data.message);


        document.getElementById("commentSubmit").dataset.projectId = projId;

        const commentSubmit = document.getElementById("commentSubmit");
        const commentBox = document.getElementById("commentInput");
        const commentMessage = document.getElementById("commentMessage");

        commentSubmit.addEventListener("click",  async function(){
            let response = await addComment(commentBox.value, commentSubmit.dataset.projectId);

            if(response == "success"){
                window.location.reload();
            }
            else{
                commentMessage.style.display = "block";
                commentMessage.innerText = response;
            }
        })

        //load each comment
        let comments = await loadComments(commentSubmit.dataset.projectId);

        if(comments.length > 0){
            //display all comments on project
            await displayComments(comments);

            document.querySelectorAll(".commentUserDisplay").forEach(commentUserDisplay => {
                commentUserDisplay.addEventListener("click", (e) => {
                    window.location.href = `../community/gallery.php?user=${commentUserDisplay.dataset.userId}`;
                });
            });
        }
        else{
            document.getElementById("commentsMessage").style.display = "none";
        }

        document.getElementById("loadingOverlay").style.display = "none";

                //privatize project
        document.getElementById("privateButton").addEventListener('click', function() {
            setPrivate(data.private);
        });

        //delete project
        document.getElementById("deleteButton").addEventListener('click', function() {
            deleteProject();
        });

        document.getElementById("editButton").addEventListener('click', function() {
            window.location.href = `../create/index.php?proj_id=${projId}`;
        });

        document.getElementById("reportButton").addEventListener('click', async function() {
            try {
                let response = await fetch(`handleFiles/reportProject.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ proj_id: projId })
                });

                let data = await response.json();

                if (data.success) {
                    alert("Project has been reported. The project will be manually reviewed soon.");
                } else {
                    alert("Failed to report project: " + data.message);
                }

            } catch (error) {
                alert("An error occurred while reporting the project.");
                console.error(error);
            }
        });

        //show project screen buttons
        document.getElementById("buttonsContainer").addEventListener('mouseenter', function() {
            document.getElementById("projButtons").style.display = "flex";
            hoveringProj = true;
        })

        //hide buttons
        document.getElementById("buttonsContainer").addEventListener('mouseleave', function() {
            document.getElementById("projButtons").style.display = "none";
            hoveringProj = false;
        })

        //zoom button click
        document.getElementById("zoomInButton").addEventListener('click', function() {
            if(Canvas.scale <= 5){
                Canvas.scale += 0.5;
                canvas.rescale();
            }
        })

        document.getElementById("zoomOutButton").addEventListener('click', function() {
            if(Canvas.scale > 0.5){
                Canvas.scale -= 0.5;
                canvas.rescale();
            }
        })

        document.getElementById("downloadProjButton").addEventListener('click', function() {
            const fileHandler = new FileHandler(canvas.tileSelector, canvas);

            fileHandler.downloadSheet(document.getElementById("projNameDisplay").innerText);
        })

        //scroll wheel zoom
        document.getElementById("canvasContainer").addEventListener('wheel', function(e) {
                e.preventDefault(); 

            if (e.deltaY < 0 && Canvas.scale <= 5) {
                Canvas.scale += 0.1;
            } else if (e.deltaY > 0 && Canvas.scale > 0.2) {
                Canvas.scale -= 0.1;
            }
        
            canvas.rescale();

        }, {passive: false});
    });
}