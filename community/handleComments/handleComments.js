export async function addComment(contents, projId) {
    if (!contents || !contents.trim()) {
        return "Comment field is blank.";
    }

    try {
        const response = await fetch("../community/handleComments/createComment.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                proj_id: projId, 
                parent_id: null,
                contents: contents.trim()
            }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.text();
        
        return data;
    } catch (error) {
        console.error("Error adding comment:", error);
        return error.message;
    }
}

export async function loadComments(projId) {
    if (!projId) {
        return "Invalid Project ID!";
    }

    try {
        const response = await fetch(`../community/handleComments/getComments.php?proj_id=${projId}`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error("Error adding comment:", error);
        return error.message;
    }
}

export async function displayComments(commentsList) {
    const template = document.getElementById("commentTemplate");
    const container = document.getElementById("commentSection");

    for (let i = 0; i < commentsList.length; i++) {
        const comment = commentsList[i];

        const commentDom = template.content.cloneNode(true);

        commentDom.querySelector(".commentNameDisplay").innerText = comment.user_name;
        commentDom.querySelector(".commentDateDisplay").innerText = new Date(comment.date.replace(" ", "T")).toLocaleDateString("en-US");
        commentDom.querySelector(".commentText").innerText = comment.content;

        commentDom.querySelector(".commentUserDisplay").dataset.userId = comment.user_id;

        container.appendChild(commentDom);
    }
}

