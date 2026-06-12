
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="homeStyle.css">
    <link rel="icon" type="image/x-icon" href="../../images/tiles/pointerLogo.ico">
    <title>TilePainter</title>
</head>
<body>
    <?php include "../pageElements/navbar.php"; ?>

    <div id="loadingOverlay">
        <img src="../../images/tiles/tileUI/loading.gif" style="height: 64px;">
    </div>

    <div id="hoverLabel">
        <h3 id="hoverLabelText">...</h3>
    </div>

    <section class="form homeScreen">
        <h1>Recent Projects -</h1>
        <div id="thumbList">
            <template id="projectThumbTemplate">
                <div class="projectThumbnail">
                    <div class="cvsThumbnail">
                    </div>
                    <div class="thumbNameContainer">
                        <h1 class="thumbNameDisplay">AAA</h1>
                    </div>
                    <p class="dateDisplay">a</p>
                    <div class="commentUserDisplay">
                        <img src="../../images/tiles/profilePics/default_pfp.png">
                        <p class="commentNameDisplay">MyName</p>
                    </div>
                </div>
            </template>
        </div>
    </section>

    
    <footer>
        <p id="scaleDisplay" style="display: none"></p>
    </footer>

    <script type="module">
        import { createCanvas } from "./imgDisplayTest.js";

        let userName = <?= json_encode($userName) ?>;
        let userId = <?= json_encode($userId) ?>;

        if(userId){
            document.getElementById("usernameDisplay").innerText = userName;
        }


        async function setThumbs(){
            const response = await fetch("../community/handleFiles/getProjectData.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    limit: 25, 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); 
            } 

            const projects = await response.json();
            console.log(projects)


            if(!Array.isArray(projects) && projects.length <= 0){
                console.log("No projects.");
                return;
            }

            const container = document.getElementById("thumbList");
            const template = document.getElementById("projectThumbTemplate");

            for(let i = 0; i < projects.length; i++){
                const clone = template.content.cloneNode(true);
                const thumbDom = clone.querySelector(".projectThumbnail");

                thumbDom.querySelector(".thumbNameDisplay").innerText = projects[i].name;
                thumbDom.querySelector(".commentNameDisplay").innerText = projects[i].user_name;
                thumbDom.querySelector(".dateDisplay").innerText = new Date(projects[i].date.replace(" ", "T")).toLocaleDateString("en-US");
                const canvasContainer = thumbDom.querySelector(".cvsThumbnail");

                container.appendChild(thumbDom);

                thumbDom.dataset.hover_data = projects[i].name || "Untitled";
                thumbDom.dataset.proj_id = projects[i].id;

                console.log(canvasContainer);
                const canvas = await createCanvas(projects[i].user_id, projects[i].id, canvasContainer);
                const canvasDom = canvas.canvasDom;

                document.querySelectorAll(".projectThumbnail").forEach(projThumbnail => {
                    projThumbnail.addEventListener("click", (e) => {
                        window.open(`../community/viewProj.php?proj_id=${projThumbnail.dataset.proj_id}`, "_blank");
                    });
                });
            }
        }

        await setThumbs();

        document.getElementById("loadingOverlay").style.display = "none";
    </script>

    <script src="../create/scripts/events/HoverLabel.js"></script>
</body>
</html>