<?php
    session_start(); 

    //initialize user logged in
    $userId = null;
    $userName = null;

    if (isset($_SESSION["user_id"]) && isset($_SESSION["username"])) {
        $userId = $_SESSION["user_id"];
        $userName = $_SESSION["username"];
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="https://www.lucusdm.com/lucus/images/tiles/pointerLogo.ico">
    <title>TilePainter</title>
</head>
<body>
    <header>
        <h1 style="display: inline-block">TilePainter</h1>
        <h3 style="float: right; display: inline-block">User: <span id="usernameDisplay">Logged Out</span></h3>
    </header>
    <section id="UIScreen">
        <div class="sideBar" id="tools">
            <div id="toolSelectorContainer">
                <div>
                    <h2 style="display: inline-block">Tools</h2>
                </div>

                <!--brush size slider-->
                <div>
                    <label for="brushSize">Brush Size: <span id="brushSizeValue">1</span><br></label>
                    <input type="range" id="brushSize" name="brushSize" value="0" min="0" max="15">
                </div>

                <!--tool selection-->
                <div class="toolSelection" onclick="user.tool = 'paintbrush'">
                    <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/brush.png" alt="paintbrush">
                    <p>Brush</p>
                </div>
                <!--
                <div class="toolSelection">
                    <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/bucket.png">
                    <p>Fill Bucket</p>
                </div>
                -->
                <div class="toolSelection" onclick="user.tool = 'rectangle'">
                    <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/rectangle.png" alt="rectangle">
                    <p>Rectangle</p>
                </div>
                <!--
                <div class="toolSelection">
                    <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/ellipse.png">
                    <p>Ellipse</p>
                </div>
                -->

                <div class="toolSelection" onclick="user.clearCanvas()">
                    <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/trash.png" alt="trash">
                    <p>Delete</p>
                </div>
                <br>
            </div>
        </div>

        <!--canvas for drawing-->
        <div id="canvasContainer">
            <canvas id="mainCanvas">

            </canvas>
        </div>

        <!--right sidebar, tile selector and options-->
        <div class="sideBar" id="tileset">
            <!--tab list at top-->
            <div id="tabSelect">
                <div class="tabSelection" id="tileSelectorTabSelect" onclick="selectTab(this)">
                    <h4>Tiles</h4>
                </div>
                <div class="tabSelection" id="fileTabSelect" onclick="selectTab(this)">
                    <h4>File</h4>
                </div>
                <div class="tabSelection" id="optionTabSelect" onclick="selectTab(this)">
                    <h4>Options</h4>
                </div>
            </div>

            <!--file tab-->
            <div class="sideBar tab " id="tileSelectorTab">
                <div>
                    <div id="uploadButton" class="optionButton" onclick="document.getElementById('imageUpload').click()">
                        <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/add.png" alt="add tile">
                    </div>
                    <input style="display: none;" type="file" id="imageUpload" accept="image/*">
                </div>
                <div id="tileSelectorContainer">
                    <div id="tileSelector">
                    
                    </div>
                </div>
            </div>

            <!--file tab-->
            <div class="sideBar tab" id="fileTab">
                <div>
                    <div id="saveToSerer" class="optionButton">
                        <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/floppySave.png" alt="save to account">
                    </div>
                    <div id="uploadSheetButton" class="optionButton" onclick="document.getElementById('jsonUpload').click()">
                        <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/uploadtileset.png" alt="upload project json">
                    </div>
                    <input style="display: none;" type="file" id="jsonUpload" accept=".json">
                    <div id="downloadSheetButton" class="optionButton">
                        <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/downloadtileset.png" alt="download project json">
                    </div>
                    <div id="downloadImage" class="optionButton">
                        <img src="https://www.lucusdm.com/lucus/images/tiles/tileUI/downloadImage.png" alt="download as image">
                    </div>
                </div>
            </div>

            <!--options tab-->
            <div class="sideBar tab" id="optionTab">
                <div>
                    <div>
                        <h2 style="display: inline-block">Resize</h2>
                    </div>

                    <!--Will make this look better l8r-->
                    <div id="resizeContainer">
                        <label for="heightInput">Height:</label>
                        <input type="number" id="heightInput" name="heightInput" min="1" max="128"><br>
                        <label for="widthInput">Width:</label>
                        <input type="number" id="widthInput" name="widthInput" min="1" max="128"><br>
                        <p style="font-size: 13px">Max: 128x128 tiles</p>
                        <input type="submit" id="resizeSubmit" value="Resize">
                    </div>
                </div>
            </div>

            
        </div>

        
    </section>

    <footer>
        <p style="display: inline-block;">&copy; 
            <a href="https://www.lucusdm.com/lucus" target="_blank">Lucus M</a>, 2025 -  
        </p>
        <a href="https://github.com/Lucus-M/TilePainter" target="_blank">GitHub</a>
        <p id="scaleDisplay" style="float:right;">Scale = 1.0</p>
    </footer>

    <script>
        let selectedTab = "tileSelectorTab";

        //tab switching
        function selectTab(clickedElement) {
            // reset selection
            document.querySelectorAll("#tabSelect .tabSelection").forEach(tab => {
                tab.classList.remove("selected");
            });

            clickedElement.classList.add("selected");

            document.querySelectorAll(".tab").forEach(tabContent => {
                tabContent.classList.remove("selected");
                tabContent.style.display = "none";
            });

            // determine which tab to show
            if (clickedElement.id === "tileSelectorTabSelect") {
                selectedTab = "tileSelectorTab";
            } else if (clickedElement.id === "fileTabSelect") {
                selectedTab = "fileTab";
            } else if (clickedElement.id === "optionTabSelect") {
                selectedTab = "optionTab";
            }

            // show seleted tab
            const activeTab = document.getElementById(selectedTab);
            if (activeTab) {
                activeTab.classList.add("selected");
                activeTab.style.display = "flex";
            }
        }

        // Initialize first tab on page load
        window.addEventListener("DOMContentLoaded", () => {
            document.getElementById(selectedTab + "Select").classList.add("selected");
            document.querySelectorAll(".tab").forEach(tab => {
                tab.style.display = tab.id === selectedTab ? "flex" : "none";
            });
        });

        //get js cookie
        function getCookie(name) {
            const cookies = document.cookie.split('; ');
            for (let cookie of cookies) {
                const [key, value] = cookie.split('=');
                if (key === name) return decodeURIComponent(value);
            }
            return null; // if not found
        }

        function deleteCookie(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }

        let userId = <?= json_encode($userId) ?>;
        let userName = <?= json_encode($userName) ?>;
        let projId = getCookie("projId");

        deleteCookie("projId");

    </script>
    <script type="module" src="scripts/main.js"></script>
    
</body>
</html>