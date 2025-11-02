import User from './User.js';

function main(){
    const user = new User();
    window.user = user; 

    if(userId && userName){
        document.getElementById("usernameDisplay").innerText = userName;
        if(projId){
            user.fileHandler.loadJsonFromServer(`../community/projects/${userId}/${projId}.json`);
        }
    }

    if(!projId){
        user.tileSelector.loadSampleTiles();
    }
}

window.onload = main;