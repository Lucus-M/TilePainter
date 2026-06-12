<?php 
    if (!isset($_GET["user"])) {

        if (!isset($_SESSION["user_id"])) {
            header("Location: ../community");
            exit;
        }

        $userId = $_SESSION["user_id"];

        header("Location: ../community/gallery.php?user=" . $userId);
        exit;
    }

    
    $pageName = $_GET["user"] ?? "";

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
    <?php include "../pageElements/navbar.php"; ?>

    <div id="loadingOverlay">
        <img src="../images/tiles/tileUI/loading.gif" style="height: 64px;">
    </div>

    <div id="hoverLabel">
        <h3 id="hoverLabelText">Project Name</h3>
    </div>

    <section class="form galleryScreen">
        <section style="display: flex; margin-top: 0.5em; height: 128px">
            <div>
                <img src="../images/tiles/profilePics/default_pfp.png" style="height: 100%;">
            </div>
            <div style="margin-left: 0.7em;">
                <h1 id="userDisplay"></h1>
                <p id="descriptionDisplay"></p>
            </div>
        </section>

        <section id="projectList">

            <h1 id="message">Projects :</h1>
            <!--
            <input type="file" name="file" id="fileUpload" required>
            -->

            <div id="canvasContainer">
            </div>

        </section>
    </section>

    
    <footer>
        <p id="scaleDisplay" style="display: none"></p>
    </footer>

    <script type="module">    
        import { loadAll } from "./imgDisplayTest.js";

        // Pass the PHP variable to JS
        let userName = <?= json_encode($userName) ?>;
        let userId = <?= json_encode($userId)?>;
        let pageName = <?= json_encode($pageName)?>;

        let userPage = <?= json_encode($description)?>;

        if(userId && userName){
            document.getElementById("usernameDisplay").innerText = userName;
        }
        
        window.addEventListener("load", async function() {
            console.log(pageName);
            let response = await fetch(`accountHandlers/getAccountData.php?user_id=${pageName}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } 
            const data = await response.json();
            console.log(data.username);

            if(data.success){
                document.getElementById("userDisplay").innerText = data.username;
                document.getElementById("descriptionDisplay").innerText = data.description;

                await loadAll(data.userId);
                document.getElementById("loadingOverlay").style.display = "none";
            }
            //alert(data.message);
            

        });
    </script>

    <script src="../create/scripts/events/HoverLabel.js"></script>
</body>
</html>