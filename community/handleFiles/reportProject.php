<?php
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Headers: Content-Type");


    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);


    // Read incoming request
    $data = json_decode(file_get_contents("php://input"), true);
    $proj_id = $data["proj_id"] ?? null;

    if (!$proj_id) {
        echo json_encode([
            "success" => false,
            "message" => "No project ID provided."
        ]);
        exit;
    }

    // Database connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        echo json_encode([
            "success" => false,
            "message" => "Database connection failed."
        ]);
        exit;
    }

    // Step 1: Verify the project exists
    $stmt = $conn->prepare("SELECT id FROM projects WHERE id = ?");
    $stmt->bind_param("i", $proj_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "Project not found."
        ]);
        exit;
    }
    $stmt->close();

    // Step 2: Increment the reports_count column
    $update = $conn->prepare("
        UPDATE projects 
        SET reports_count = reports_count + 1 
        WHERE id = ?
    ");
    $update->bind_param("s", $proj_id);

    if ($update->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Report count updated successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update report count."
        ]);
    }

    $update->close();
    $conn->close();
?>