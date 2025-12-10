const hoverLabel = document.getElementById("hoverLabel");
const hoverLabelText = document.getElementById("hoverLabelText");

document.addEventListener('mousemove', (e) => {
    const target = e.target.closest("[data-hover_data]");

    if (target) {
        hoverLabel.style.display = "block";
        hoverLabelText.innerText = target.dataset.hover_data;

        hoverLabel.style.top = (e.clientY + 10) + "px";
        hoverLabel.style.left = (e.clientX + 10) + "px";
    } else {
        hoverLabel.style.display = "none";
    }
});