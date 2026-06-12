function getCredential(id){
    return document.getElementById(id).value;
}

function verifyCredential(id){
    let credential = document.getElementById(id).value;
    return (credential && credential.trim().length > 0);
}

async function register(){
    if(!verifyCredential("usernameInput") || !verifyCredential("emailInput") || !verifyCredential("passwordInput") || !verifyCredential("c_passwordInput")){
        alert("Credential box cannot be empty!")
        return;
    }

    let response = await fetch("accountHandlers/createAccount.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: getCredential("usernameInput"), 
            email: getCredential("emailInput"), 
            password: getCredential("passwordInput"), 
            conf_password: getCredential("c_passwordInput") 
        }),
    });
    const text = await response.text();

    if(text != "success"){
        alert(text);
        return;
    };

    login();
}

async function login(){
    if(!verifyCredential("emailInput") || !verifyCredential("passwordInput") || !verifyCredential("c_passwordInput")){
        alert("Credential box cannot be empty!")
        return;
    }

    let response = await fetch("accountHandlers/userLogin.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: getCredential("emailInput"), 
            password: getCredential("passwordInput"), 
            conf_password: getCredential("c_passwordInput")
        }),
    });

    const data = await response.json();
    if(!data.success){
        alert(data.message)
        return;
    }
    alert(data.message);

    window.location.href = `gallery.php?user=${data.userId}`;
}
