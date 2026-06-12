<?php
    session_start();
    header("Content-Type: application/json");

    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];

    $conn = new mysqli($servername, $username, $password, $dbname);

    //get credentials
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data["email"];
    $password = $data["password"];
    $conf_password = $data["conf_password"];
    
    if (empty($email) || empty($password) || empty($conf_password)) {
        echo "Empty credential field.";
        exit();
    }

    //Check if passwords don't match
    if (strcmp($password, $conf_password) !== 0){
        echo json_encode([
            "success" => false,
            "message" => "Passwords do not match.",
        ]);
        $conn->close();
        exit();
    }

    //statement to insert user into database
    $stmt = $conn->prepare("
        SELECT * FROM users WHERE email = ?
    ");

    $stmt->bind_param("s", $email); // 3 string params
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        // get row 
        $row = $result->fetch_assoc();

        if (password_verify($password, $row["password"])){
            session_start();
            $_SESSION["user_id"] = $row["id"];
            $_SESSION["username"] = $row["username"];
            $_SESSION["description"] = $row["description"];

            echo json_encode([
                "success" => true,
                "message" => "Login successful. Welcome, " . $row["username"],
                "username" => $row["username"],
                "userId" => $row["id"],
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Incorrect password.",
            ]);
        }
    } else{
        echo json_encode([
            "success" => false,
            "message" => "Login unsuccessful.",
        ]);
    }

    $stmt->close();
    $conn->close();
?>