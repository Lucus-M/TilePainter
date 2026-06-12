<?php
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");

    if(!isset($_GET["proj_id"])){
        header("Location: ../community");
        exit;
    }

    //$projUser = $_GET["user"] ?? "";
    $projId = $_GET["proj_id"] ?? "";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="../images/pointerLogo.png">
    <title>TilePainter</title>
</head>
<body>
    <!--
    <div id="loadingOverlay">
        <img src="../images/tileUI/loading.gif" style="height: 64px;">
    </div>
    -->
    <?php include "../pageElements/navbar.php"; ?>

    <div id="loadingOverlay">
        <img src="../images/tileUI/loading.gif" style="height: 64px;">
    </div>

    <div id="hoverLabel">
        <h3 id="hoverLabelText">Project Name</h3>
    </div>

    <section class="form viewProjScreen">
        <div id="buttonsContainer">
            <div id="projButtons">
                <div id="zoomInButton" class="option" data-hover_data="Zoom In">
                    <img src="../images/tileUI/zoom_in.png" alt="download as image">
                </div>

                <div id="zoomOutButton" class="option" data-hover_data="Zoom Out">
                    <img src="../images/tileUI/zoom_out.png" alt="download as image">
                </div>

                <div id="downloadProjButton" class="option" data-hover_data="Download Project">
                    <img src="../images/tileUI/download_proj.png" alt="download as image">
                </div>

                <div id="reportButton" class="option" data-hover_data="Report" style="background-color: orange;">
                    <img src="../images/tileUI/report.png" alt="download as image">
                </div>

                <div id="editButton" class="option" data-hover_data="Edit" style="display: none; background-color: green;">
                    <img src="../images/tileUI/edit.png" alt="download as image">
                </div>

                <div id="privateButton" class="option" data-hover_data="Make Private" style="display: none; background-color: blue;">
                    <img src="../images/tileUI/lock.png" alt="download as image">
                </div>

                <div id="deleteButton" class="option" data-hover_data="Delete" style="display: none; background-color: red;">
                    <img src="../images/tileUI/delete.png" alt="download as image">
                </div>
            </div>

            <div id="canvasContainer" class="showProj">
            </div>
        </div>

        <div id="nameDisplayCont">
            <h1 id="projNameDisplay">...</h1>
            <input type="submit" id="editNameButton" name="editNameButton" value="Change Name" style="display: none;">
        </div>

        <div id="editNameInputCont" style="display: none;">
            <input type="text" id="editNameInput" name="editNameInput" value="">
            <input type="submit" id="nameSubmit" name="nameSubmit" value="Submit">
        </div>

        <div id="projUserDisplay">
            <img id="pfp" src="../images/tiles/profilePics/default_pfp.png" style="width: 32px;">
            <p id="projUserNameDisplay">...</p>
        </div>

        <div id="descriptionDisplay">
            <p style="color: gray">Created on <span id="dateText">...</span></p>
            <div id="descCont">
                <p id="projDescription">...</p>
                <input type="submit" id="editDescButton" name="editDescButton" value="Edit Description" style="display: none;">
            </div>
            <div id="editDescInputCont" style="display: none;">
                <input type="text" id="editDescInput" name="editDescInput" value="" style="width: 75%;">
                <input type="submit" id="descSubmit" name="descSubmit" value="Submit">
            </div>
        </div>
        
        <br>
        
        <div id="commentSection">
            <div id="leaveComment">
                <h4>Write a Comment -</h4>
                <p id="commentMessage" style="color: red; display: none;">aa</p>
                <input type="text" id="commentInput" name="commentInput" value="">
                <input type="submit" id="commentSubmit" name="commentSubmit" value="Submit">
            </div>

            <br>
            <h3 id="commentsMessage">Comments</h3>
            
            <template id="commentTemplate">
                <div class="comment">
                    <div class="commentUserDisplay">
                        <img class="pfp" src="../images/profilePics/default_pfp.png" style="width: 32px;">
                        <p class="commentNameDisplay">MyName</p>
                    </div>
                    <p style="color: gray" class="commentDateDisplay">00/00/0000</p>
                    <p class="commentText">...</p>
                </div>
            </template>
        </div>
    </section>

    <footer>
        <p id="scaleDisplay" style="display: none"></p>
    </footer>

    <script type="module">    
        import { createCanvas } from "./imgDisplayTest.js";
        import Canvas from '../create/scripts/Canvas.js';
        import FileHandler from '../create/scripts/events/FileHandler.js';
        import {addComment, loadComments, displayComments} from '../community/handleComments/handleComments.js';

        // Pass the PHP variable to JS
        let projId = <?= json_encode($projId)?>;

        let canvasData = null;
        let canvas = null;

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

        async function setPrivate(currentPrivate) {
            // Toggle private: if 1 -> 0, if 0 -> 1
            const newPrivate = currentPrivate == 1 ? 0 : 1;

            console.log(projId)

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

        window.addEventListener("load", async function() {
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
                document.getElementById("projUserDisplay").addEventListener('click', function() { 
                    window.location.href = `../community/gallery.php?user=${data.user_id}`;
                });

                document.getElementById("dateText").innerText = new Date(data.date.replace(" ", "T")).toLocaleDateString("en-US");

                canvasData = await createCanvas(data.user_id, data.id, document.getElementById("canvasContainer"));
                canvas = canvasData.canvas;
                document.getElementById("projNameDisplay").innerText = data.name || "Untitled"; //show untitled if project name is null
                document.getElementById("projDescription").innerText = data.description || "No Description"; //show untitled if project name is null

                document.getElementById("projUserNameDisplay").innerText = data.user_name;

                //display special buttons when user is logged in
                if(data.user_id === <?= json_encode($userId)?>){
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
                if(data.private == 1 && (data.user_id !== <?= json_encode($userId ?? null) ?>)){
                    window.location.href = '../community/login.php';
                }
            }
            //alert(data.message);
            
            //delete project
            document.getElementById("privateButton").addEventListener('click', function() {
                setPrivate(data.private);
            });

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

            let comments = await loadComments(commentSubmit.dataset.projectId);

            if(comments.length > 0){
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


            document.getElementById("")

            document.getElementById("loadingOverlay").style.display = "none";
        });
    </script>

    <script src="../create/scripts/events/HoverLabel.js"></script>
</body>
</html>
