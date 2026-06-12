<?php
    header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    header("Pragma: no-cache");

    session_start();


    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);

    $data = json_decode(file_get_contents("php://input"), true);

    if(!isset($_SESSION["user_id"])){
        echo "Not logged in";
        exit();
    }

    $userId = $_SESSION["user_id"];
    $projectName = $_GET['projName'] ?? "";
    $projectId = $_GET['projId'] ?? "";

    if(!$projectName){
        echo "Project name not set.";
    }

    $json = json_encode($data, JSON_PRETTY_PRINT);

    //check if project with input id exists
    $checkProjects = $conn->prepare("SELECT * FROM projects WHERE id = ? AND user_id = ?");
    $checkProjects->bind_param("ss", $projectId, $userId);
    $checkProjects->execute();
    $result = $checkProjects->get_result();
    $numRows = $result->num_rows;

    if($numRows <= 0){
        //generate random project ID
        $projectId = bin2hex(random_bytes(16));
        //add project to database
        $stmt = $conn->prepare("
            INSERT INTO projects (id, user_id, name, date, private) VALUES (
                ?,
                ?,
                ?,
                current_timestamp(),
                FALSE
            );
        ");

        $stmt->bind_param("sss", $projectId, $userId, $projectName);
    }
    else{
        $stmt = $conn->prepare("
            UPDATE projects
            SET name = ?
            WHERE id = ?;
        ");

        $stmt->bind_param("ss", $projectName, $projectId);

    }

    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
        exit();
    }

    //find/make directory & store project json file in it
    $dir = __DIR__ . "/../projects/$userId";
    if (!is_dir($dir)) {
        if (!mkdir($dir, 0755, true)) {
            die("Failed to create directory $dir");
        }
    }

    $filePath = "$dir/$projectId.json";
    if (file_put_contents($filePath, $json) === false) {
        die("Failed to write file $filePath");
    }

    //set perms
    chmod($filePath, 0775);
    //chown($filePath, 'lucus'); // change file owner

    echo "Saved project $projectName successfully";

?>