//submit a comment on a post
export async function addComment(contents, projId) {
    //reject if comment field is blank, leave messgae
    if (!contents || !contents.trim()) {
        return "Comment field is blank.";
    }

    try {
        //send server request to create comment
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

//load all comments on a post
export async function loadComments(projId) {
    if (!projId) {
        return "Invalid Project ID!";
    }

    //send server request to display all comments
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

//display all loaded comments
export async function displayComments(commentsList) {
    //comment dom element template & container
    const template = document.getElementById("commentTemplate");
    const container = document.getElementById("commentSection");

    //for every loaded comment:
    for (let i = 0; i < commentsList.length; i++) {
        const comment = commentsList[i];
        //clone template to add comment to dom
        const commentDom = template.content.cloneNode(true);

        //set display for username, date, and text
        commentDom.querySelector(".commentNameDisplay").innerText = comment.user_name;
        commentDom.querySelector(".commentDateDisplay").innerText = new Date(comment.date.replace(" ", "T")).toLocaleDateString("en-US");
        commentDom.querySelector(".commentText").innerText = comment.content;

        //give the comment element the user's id (for linking to user's gallery page)
        commentDom.querySelector(".commentUserDisplay").dataset.userId = comment.user_id;

        container.appendChild(commentDom);
    }
}

