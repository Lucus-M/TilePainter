import User from './User.js';

async function getProjData(id) {
    const response = await fetch(`../community/handleFiles/getProjectData.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            proj_id: id, 
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    if (data.length <= 0) {
        console.error("Project data not found:", data);
        return null;
    }

    const userIdVal = data[0].user_id;
    const projName = data[0].name;
    const projDate = data[0].date;

    return { userIdVal, projName, projDate };
}

async function main(){
    const user = new User();
    window.user = user; 

    let loadTiles = true;

    if(projId){
        let projData = await getProjData(projId);

        let userIdVal = projData.userIdVal;
        let projName = projData.projName;

        console.log( userIdVal + "!");

        if(userId !== userIdVal){
            console.log("user is not permit! :(")
        }
        else{
            loadTiles = false;
            document.getElementById("projectNameInput").value = projName;
            await user.fileHandler.loadJsonFromServer(
                `../community/projects/${userId}/${projId}.json?nocache=${Date.now()}`
            );
            user.optionHandler.changeValues();
        }
    }

    if(loadTiles){
        user.tileSelector.loadSampleTiles();
    }

}

window.onload = main;