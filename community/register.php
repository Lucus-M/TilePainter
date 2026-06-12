

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="icon" type="image/x-icon" href="https://www.lucusdm.com/lucus/images/tiles/pointerLogo.ico">
    <title>TilePainter</title>
</head>
    <body>
        <?php include "../pageElements/navbar.php"; ?>

        <section class="form credentials">
            <h2>Create an Account</h2>

            <label for="usernameInput">Username:</label><br>
            <input type="text" name="usernameInput" id="usernameInput"> <br>
            
            <label for="emailInput">Email:</label><br>
            <input type="text" name="emailInput" id="emailInput"> <br>
            
            <label for="passwordInput">Password:</label><br>
            <input type="password" name="passwordInput" id="passwordInput"> <br> 

            <label for="c_passwordInput">Confirm Password:</label><br>
            <input type="password" name="c_passwordInput" id="c_passwordInput"> <br><br>

            <input type="submit" name="registerSubmit" id="registerSubmit" value="Create Account" onclick="register()"><br>
            <a href="login.php">Log In</a>
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