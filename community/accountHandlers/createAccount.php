<?php

    header("Content-Type: application/json");


    $config = require __DIR__ . '/../config.php';

    $servername = $config['servername'];
    $username = $config['username'];
    $password = $config['password'];
    $dbname = $config['dbname'];
    
    $conn = new mysqli($servername, $username, $password, $dbname);

    $data = json_decode(file_get_contents("php://input"), true);

    $username = $data["username"];
    $email = $data["email"];
    $password = $data["password"];
    $conf_password = $data["conf_password"];
    
    if (empty($username) || empty($email) || empty($password) || empty($conf_password)) {
        echo "Empty credential field.";
        exit();
    }


    $checkEmail = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $checkEmailResult = $checkEmail->get_result();

    if ($checkEmailResult->num_rows > 0) {
        echo "There is already an account under this email.";
        exit;
    }


    //Check if passwords don't match
    if (strcmp($password, $conf_password) !== 0){
        echo "Passwords must match!";
        $conn->close();
        exit();
    }

    //hash password
    $hashed_pw = password_hash($password, PASSWORD_DEFAULT);

    //statement to insert user into database
    $stmt = $conn->prepare("
        INSERT INTO users (
            id,
            username,
            email,
            password,
            badge,
            private,
            profile_picture,
            description
        ) VALUES (
            UUID(), ?, ?, ?, 'basic', FALSE, 'profile1.png', 'No description.'
        )
    ");

    $stmt->bind_param("sss", $username, $email, $hashed_pw); // 3 string params
    
    if ($stmt->execute()) {
        echo "success";
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
?>