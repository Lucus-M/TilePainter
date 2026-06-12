<?php
    header("Content-Type: application/json");
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");

    session_start();

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    if(!isset($_SESSION["user_id"])){
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Not logged in"]);
        exit();
    }

    $userId = $_SESSION["user_id"];
    $data = json_decode(file_get_contents("php://input"), true);
    $projectId = $data['projId'] ?? null;

    if (!$projectId) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Project ID not provided"]);
        exit();
    }

    // Check ownership
    $stmt = $conn->prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ss", $projectId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized or project does not exist"]);
        exit();
    }
    $stmt->close();

    // Delete project from database
    $deleteStmt = $conn->prepare("DELETE FROM projects WHERE id = ?");
    $deleteStmt->bind_param("s", $projectId);

    if (!$deleteStmt->execute()) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete project from database"]);
        exit();
    }
    $deleteStmt->close();

    // Delete JSON file
    $filePath = __DIR__ . "/../projects/$userId/$projectId.json";
    if (file_exists($filePath)) {
        if (!unlink($filePath)) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to delete project file"]);
            exit();
        }
    }

    echo json_encode(["success" => true, "message" => "Project deleted successfully"]);

    $conn->close();
?>