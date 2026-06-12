<?php
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");
    
    session_start(); 

    //initialize user logged in
    $userId = null;
    $userName = null;

    if (isset($_SESSION["user_id"]) && isset($_SESSION["username"])) {
        $userId = $_SESSION["user_id"];
        $userName = $_SESSION["username"];
        $description = $_SESSION["description"];
    }

    $createUrl = "../create";
    $communityUrl = "../community";

?>

<header>
    <style>
        #dropdown{
            position: fixed;
            display: none;
            right: 0;
            top: 32px;
            background-color: black;
            list-style-type: none;
            border-radius: 0px 0px 10px 10px;
            overflow: hidden;
            z-index: 9999999;
        }

        .navlink{
            padding: 0px 15px;
            height: 100%;
        }

        .navlink:hover{
            background-color: gray;
        }

        nav > a, #usernameDisplay > a{
            color: white;
        }
        
        #dropdown > ul{
            list-style-type: none;
        }

        li{
            padding: 10px 18px;
        }

        li:hover{
            background-color: #1C1C29;
        }
    </style>
    <div id="titleDisplay" style="display: inline-block">
        <a href="<?= $createUrl ?>">
            <img src="../images/tileUI/tilePainterLogo.png" style="height: 32px;">
        </a>
    </div>

    <nav style="float: right; display: flex;">
        <a href="<?= $createUrl ?>">
            <div class="navlink">
                <p>Create</p>
            </div>
        </a>
        <a href="<?= $communityUrl ?>">
            <div class="navlink">
                <p>Explore</p>
            </div>
        </a>
        <div class="userButton" id="userClick">
            <img id="pfp" src="../images/profilePics/default_pfp.png">
            <p>
                <span id="usernameDisplay">
                    <a href="../community/login.php">Log In</a>
                </span>
            </p>
        </div>

        <div id="dropdown">
            <ul>
                <a href="<?= $communityUrl ?>/gallery.php?user=<?= $userId ?>"><li>My Gallery</li></a>
                <a href="<?= $communityUrl ?>/logout.php"><li>Log Out</li></a>
            </ul>
        </div>
    </nav>
</header>

<script>
    let dropDownOpen = false;
    const dropdown = document.getElementById("dropdown");
    const userBtn = document.getElementById("userClick");

    let userId = <?= json_encode($userId)?>;
    let userName = <?=json_encode($userName)?>;

    userBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        if(userId){
            dropDownOpen = !dropDownOpen;
            dropdown.style.display = dropDownOpen ? "block" : "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (dropDownOpen && !dropdown.contains(e.target) && !userBtn.contains(e.target)) {
            dropdown.style.display = "none";
            dropDownOpen = false;
        }
    });
</script>