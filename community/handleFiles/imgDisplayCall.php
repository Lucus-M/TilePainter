<?php

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    if (!$user_id) {
        echo "No user id provided.";
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY date DESC");
    $stmt->bind_param("s", $user_id); // "s" for string
    $stmt->execute();
    $result = $stmt->get_result();

    $projects = [];
    while ($row = $result->fetch_assoc()) {
        $projects[] = $row;
    }

    // Return JSON
    header('Content-Type: application/json');
    echo json_encode($projects);

    $stmt->close();
    $conn->close();
?>

