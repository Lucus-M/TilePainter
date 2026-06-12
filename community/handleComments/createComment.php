<?php

    header("Content-Type: application/json");

    session_start();
    

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);

    if(!isset($_SESSION["user_id"])){
        echo "Not logged in.";
        exit();
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $projId = $data["proj_id"];
    $parentId = $data["parent_id"];
    $contents = $data["contents"];

    //statement to insert user into database
    $stmt = $conn->prepare("
        INSERT INTO comments (
            id,
            project_id,
            user_id,
            parent_comment,
            content,
            date
        ) VALUES (
            UUID(), ?, ?, ?, ?, current_timestamp()
        )
    ");

    $stmt->bind_param("ssss", $projId, $_SESSION["user_id"], $parentId, $contents); // 4 string params
    
    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
?>