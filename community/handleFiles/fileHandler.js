async function getJson(event) {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".json")) {
        alert("Please upload a valid JSON file.");
        return null;
    }

    const jsonContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                resolve(data);
            } catch (err) {
                reject(new Error("Invalid JSON format."));
            }
        };

        reader.onerror = () => reject(new Error("Error reading file."));
        reader.readAsText(file);
    });

    return jsonContent;
}

async function sendFile(project_json){
    fetch("handleFiles/saveProject.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(project_json)
    })
    .then(res => res.text())
    .then(result => {
        console.log("Server response:", result);
    })
    .catch(err => {
        console.error("Error saving project:", err);
    });

    window.location.reload()
}

async function uploadFile(event) {
    const project_json = await getJson(event);

    if (project_json) {
        sendFile(project_json);
    } else {
        console.error("No JSON data found.");
    }
}

//document.getElementById("fileUpload").addEventListener("change", uploadFile);