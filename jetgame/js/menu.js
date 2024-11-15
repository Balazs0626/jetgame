let selectedImg = 1;

let menuCanvas = document.getElementById("menuCanvas");
let menuCtx = menuCanvas.getContext("2d");

let bgImg = new Image(500, 500);
bgImg.src = "img/bg.png";

let bg1Y = 0;
let bg2Y = -495;

function moveBackground(timestamp) {
    menuCtx.clearRect(0, 0, menuCanvas.width, menuCanvas.height);
    
    if (bg1Y >= menuCanvas.height) {
        bg1Y = -490;
    }

    if (bg2Y >= menuCanvas.height) {
        bg2Y = -490;
    }

    bg1Y += 0.5;
    bg2Y += 0.5;
    
    menuCtx.drawImage(bgImg, 0, bg2Y, 500, 500);
    menuCtx.drawImage(bgImg, 0, bg1Y, 500, 500);

    requestAnimationFrame(moveBackground);
}
requestAnimationFrame(moveBackground);

document.getElementById("select-left").addEventListener("click", () => {
    let img = document.getElementById("selectorImg");

    if (selectedImg > 1) {
        selectedImg--;
    } else {
        selectedImg = 5;
    }

    img.src = "img/player/jet" + selectedImg + ".png";
});

document.getElementById("select-right").addEventListener("click", () => {
    let img = document.getElementById("selectorImg");
    
    if (selectedImg < 5) {
        selectedImg++;
    } else {
        selectedImg = 1;
    }
    
    img.src = "img/player/jet" + selectedImg + ".png";
});