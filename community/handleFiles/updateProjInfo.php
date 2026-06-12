<?php
    session_start();
    header("Content-Type: application/json");


    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);

    $sql = "
        UPDATE projects SET
    ";

    $conditions = [];
    $params = [];
    $types = "";

    $data = json_decode(file_get_contents("php://input"), true);

    $projId = $data["proj_id"] ?? null;
    if (!$projId) {
        http_response_code(400);
        echo "Missing project id";
        exit;
    }

    // Check ownership
    $getUserStmt = "SELECT user_id FROM projects WHERE id = ?";
    $getProjUser = $conn->prepare($getUserStmt);
    $getProjUser->bind_param("s", $projId);
    $getProjUser->execute();
    $userResult = $getProjUser->get_result();
    $row = $userResult->fetch_assoc();

    if (!isset($_SESSION["user_id"]) || $row["user_id"] != $_SESSION["user_id"]) {
        http_response_code(403);
        echo "Unauthorized";
        exit;
    }

    $sql = "UPDATE projects SET ";
    $conditions = [];
    $params = [];
    $types = "";

    $name = $data["name"] ?? null;
    $desc = $data["desc"] ?? null;
    $private = $data["private"] ?? null;

    if ($name !== null) {
        $conditions[] = "name = ?";
        $params[] = $name;
        $types .= "s";
    }

    if ($desc !== null) {
        $conditions[] = "description = ?";
        $params[] = $desc;
        $types .= "s";
    }

    if ($private !== null && ($private == 0 || $private == 1)) {
        // Ensure private is either 0 or 1
        $conditions[] = "private = ?";
        $params[] = $private;
        $types .= "i";
    }


    if (empty($conditions)) {
        http_response_code(400);
        echo "Nothing to update";
        exit;
    }

    // Join conditions correctly
    $sql .= implode(", ", $conditions);
    $sql .= " WHERE id = ?";
    $params[] = $projId;
    $types .= "s";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        http_response_code(500);
        echo "Update failed";
    }

    $stmt->close();
    $conn->close();
?>