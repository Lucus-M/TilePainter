<?php
    session_start();
    header("Content-Type: application/json");


    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);

    //get id
    $id = $_GET["user_id"] ?? null;

    //check users talbe for id
    $stmt = $conn->prepare("
        SELECT * FROM users WHERE id = ?
    ");

    $stmt->bind_param("s", $id); // 3 string params
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        // get row 
        $row = $result->fetch_assoc();

        echo json_encode([
            "success" => true,
            "message" => "Successfuly retrieved info from, " . $row["username"],
            "id" => $row["id"],
            "username" => $row["username"],
            "description" => $row["description"],
            "userId" => $row["id"],
        ]);
    } else{
        echo json_encode([
            "success" => false,
            "message" => $id,
        ]);
    }

    $stmt->close();
    $conn->close();
?>