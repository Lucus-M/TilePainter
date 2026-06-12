<?php
    session_start();
    header("Content-Type: application/json");

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    $id = $_GET["proj_id"] ?? null;

    $stmt = $conn->prepare("
        SELECT 
            c.*,
            u.username AS user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.project_id = ?
        ORDER BY c.date DESC
    ");

    $stmt->bind_param("s", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    $comments = [];

    while ($row = $result->fetch_assoc()) {
        $comments[] = $row;
    }

    echo json_encode($comments);

    $stmt->close();
    $conn->close();
?>