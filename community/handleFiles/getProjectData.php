<?php
session_start();
    header("Content-Type: application/json");

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
        exit();
    }

    // Base SQL
    $sql = "
        SELECT p.*, u.username AS user_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
    ";

    $conditions = [];
    $params = [];
    $types = "";

    $data = json_decode(file_get_contents("php://input"), true);

    $projId = $data["proj_id"] ?? null;
    $userId = $data["user_id"] ?? null;
    $dateBefore = $data["date_before"] ?? null;
    $dateAfter = $data["date_after"] ?? null;
    $limit = $data["limit"] ?? null;

    // Filter by project ID
    if ($projId) {
        $conditions[] = "p.id = ?";
        $params[] = $projId;
        $types .= "s";
    }

    // Filter by user ID
    if ($userId) {
        $conditions[] = "p.user_id = ?";
        $params[] = $userId;
        $types .= "s";
    }

    // Filter by date
    if ($dateBefore && $dateAfter) {
        $conditions[] = "p.date BETWEEN ? AND ?";
        $params[] = $dateBefore;
        $params[] = $dateAfter;
        $types .= "ss";
    } elseif ($dateBefore && !$dateAfter) {
        $conditions[] = "p.date <= ?";
        $params[] = $dateBefore;
        $types .= "s";
    }

    // Filter out private projects if viewer is not the owner
    $loggedInUserId = $_SESSION['user_id'] ?? null;

    if ($loggedInUserId) {
        if ($userId) {
            if ($userId != $loggedInUserId) {
                // Viewer is logged in but looking at someone else's projects — only show public
                $conditions[] = "p.private = 0";
            }
            // else: viewer is looking at their own projects — show all (public + private)
        } else {
            // No specific user filter — show public projects plus the logged-in user's own projects
            $conditions[] = "(p.private = 0 OR p.user_id = ?)";
            $params[] = $loggedInUserId;
            $types .= "s";
        }
    } else {
        // Not logged in — only show public projects
        $conditions[] = "p.private = 0";
    }
    // Build WHERE clause
    if (!empty($conditions)) {
        $sql .= " WHERE " . implode(" AND ", $conditions);
    }

    // Order by most recent
    $sql .= " ORDER BY p.date DESC";

    // Limit results
    if ($limit) {
        $sql .= " LIMIT ?";
        $params[] = (int)$limit;
        $types .= "i";
    }

    // Prepare and execute
    $stmt = $conn->prepare($sql);

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch projects
    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }

    // Return JSON
    echo json_encode($projects);

    $stmt->close();
    $conn->close();
?>