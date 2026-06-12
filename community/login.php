<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="../images/pointerLogo.png">
    <title>TilePainter</title>
</head>
    <body>
        <?php include "../pageElements/navbar.php"; ?>
        
        <section class="form credentials">
            <h2>Log In</h2>

            <label for="emailInput">Email:</label><br>
            <input type="text" name="emailInput" id="emailInput"> <br>
            
            <label for="passwordInput">Password:</label><br>
            <input type="password" name="passwordInput" id="passwordInput"> <br> 

            <label for="c_passwordInput">Confirm Password:</label><br>
            <input type="password" name="c_passwordInput" id="c_passwordInput"> <br><br>

            <input type="submit" name="loginSubmit" id="loginSubmit" value="Log In" onclick="login()"><br>

            <a href="register.php">Create an Account</a>
        </section>
        
        <footer>
            
        </footer>
    </body>
    <script>
        if(userId){
            document.getElementById("usernameDisplay").innerText = userName;
        }
    </script>
    <script src="accountHandlers/handleAccounts.js"></script>
</html>