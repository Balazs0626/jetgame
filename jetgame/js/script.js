let canvas = document.getElementById("gameBoard");
let ctx = canvas.getContext("2d");

let jetImg = [];

for (let i = 1; i <= 5; i++) {
    let img = new Image(60, 60);
    img.src = "img/player/jet" + i + ".png";
    jetImg.push(img);
}

let enemyJetImg = [];

for (let i = 1; i <= 5; i++) {
    let img = new Image(60, 60);
    img.src = "img/enemy/jet" + i + ".png";
    enemyJetImg.push(img);
}

let healthImg = new Image(40, 40);
healthImg.src = "img/health.png";

const backgroundImg = new Image(500, 500);
backgroundImg.src = "img/bg.png";

class Jet {
    constructor(x, y, type, speed) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.type = type;
        this.speed = speed;
    }

    getPosition() {
        return {x: this.x, y: this.y};
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getHealth() {
        return this.health;
    }

    setHealth(hp) {
        this.health = hp;
    }

    moveJet(direction) {
        switch(direction) {
            case "up":
                this.y -= this.speed;
                break;
            case "down":
                this.y += this.speed;
                break;
            case "left":
                this.x -= this.speed;
                break;
            case "right":
                this.x += this.speed;
                break;
        }
    }
}

class PlayerJet extends Jet {
    constructor(x, y, type, speed) {
        super(x, y, type, speed);
        this.bullets = [];
    }

    draw() {
        ctx.drawImage(jetImg[this.type], this.x, this.y, jetSize[0], jetSize[1]);
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y + jetSize[1], jetSize[0], 10);
        ctx.fillStyle = "green";
        ctx.fillRect(this.x + 2, this.y + jetSize[1] + 2, (jetSize[0] - 4) / 100 * this.health, 6);
    }

    getBullets() {
        return this.bullets;
    }

    addBullet() {
        this.bullets.push(new Bullet(this.x + 30, this.y - 10, 25));
    }
}

class EnemyJet extends Jet {
    constructor(x, y, type, speed) {
        super(x, y, type, speed);
    }

    draw() {
        ctx.drawImage(enemyJetImg[this.type], this.x, this.y, jetSize[0], jetSize[1]);
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y - 10, jetSize[0], 10);
        ctx.fillStyle = "red";
        ctx.fillRect(this.x + 2, this.y - 10 + 2, (jetSize[0] - 4) / 100 * this.health, 6);
    }
}

class ShooterJet extends EnemyJet {
    constructor(x, y, type, speed) {
        super(x, y, type, speed);
        this.bullets = [];
    }

    getBullets() {
        return this.bullets;
    }

    addBullet() {
        this.bullets.push(new Bullet(this.x + 30, this.y + jetSize[1] + 10, 20));
    }
}

class Bullet {
    constructor(x, y, dmg) {
        this.x = x;
        this.y = y;
        this.damage = dmg;
    }

    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, 5, 10);
    }
}

class Health {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw() {
        ctx.drawImage(healthImg, this.x, this.y, 30, 30);
    }

    move() {
        this.y += 2;
    }

    handle(jet) {
        if (jet.getHealth() + 50 > 100) {
            jet.setHealth(100);
        } else {
            jet.setHealth(jet.getHealth() + 50);
        }
    }
}

let playerJet = null;
let enemyJets = [];
let boosters = [];

let bg1 = 0;
let bg2 = -495;
let direction = null;
let canShoot = true;
let score = 0;
let over = false;
let pause = false;
let shooterDirection = "left";

const jetSize = [60, 60];
const force = 0.5;
const speed = 4;

let placeTimer = null;
let gameTimer = null;
let shootTimer = null;

function startGame() {

    playerJet = new PlayerJet(canvas.width/2 - jetSize[0]/2, canvas.height - jetSize[1]*2, selectedImg-1, 3);

    placeTimerFunc();
    startTimer();

    document.getElementById("game").style.display = "block";
    document.getElementById("menu").style.display = "none";
}

function restartGame() {
    playerJet = new PlayerJet(canvas.width/2 - jetSize[0]/2, canvas.height - jetSize[1]*2, selectedImg-1, 3);

    startTimer();

    enemyJets = [];
    over = false;

    direction = null;

    score = 0;
    updateScore(score);
}

function gameOver() {
    stopTimer();
    over = true;
}

//#region Timer függvények

function placeTimerFunc() {

    if (Math.floor(Math.random() * 5) == 3) {

        let randX = Math.random() * (canvas.width - 40);

        boosters.push(new Health(randX, -40));
    }

    let randCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < randCount; i++) {
        let randX = (Math.floor(Math.random() * 7) * jetSize[0]) + 10;
        let randY = Math.floor(Math.random() * 3) * jetSize[1];
        let randImg = Math.floor(Math.random() * 5);

        let randType = Math.floor(Math.random() * 20);

        if (randType > 15) {
            enemyJets.push(new ShooterJet(randX, -jetSize[1] - randY, randImg, 2));
        } else {
            enemyJets.push(new EnemyJet(randX, -jetSize[1] - randY, randImg, 2));
        }
    }
}

function shootTimerFunc() {
    for (let i = 0; i < enemyJets.length; i++) {
        if (enemyJets[i] instanceof ShooterJet) {
            enemyJets[i].bullets.push(new Bullet(enemyJets[i].getPosition().x + 30, (enemyJets[i].getPosition().y + jetSize[1]) + 10, 25));
            playSound("sound/shoot.mp3");
        }
    }
}

function gameTimerFunc() {
    if (canvas.height - 10 > playerJet.getPosition().y + jetSize[1]) {
        playerJet.setPosition(playerJet.getPosition().x, playerJet.getPosition().y + force);
    }

    for (let i = 0; i < boosters.length; i++) {

        boosters[i].move();

        if (boosters[i].y >= canvas.height) {
            boosters.splice(i, 1);
        }
    }

    for (let i = 0; i < enemyJets.length; i++) {

        updateEnemyJetPosition(enemyJets[i]);

        if (isCollide(enemyJets[i].getPosition().x, enemyJets[i].getPosition().y, playerJet.getPosition().x, playerJet.getPosition().y)) {
            playerJet.setHealth(0);
        }

        if (enemyJets[i] instanceof ShooterJet) {
            for (let j = 0; j < enemyJets[i].getBullets().length; j++) {
                enemyJets[i].getBullets()[j].y += speed;
                
                if (isHit(playerJet.getPosition().x, playerJet.getPosition().y, enemyJets[i].getBullets()[j].x, enemyJets[i].getBullets()[j].y)) {
                    let newHealth = playerJet.getHealth() - enemyJets[i].getBullets()[j].damage;

                    playerJet.setHealth(newHealth);
                    enemyJets[i].getBullets().splice(j, 1);
                }
            }
        }

        if (enemyJets[i].getPosition().y >= canvas.height) {
            enemyJets.splice(i, 1);
        }
    }

    for (let i = 0; i < playerJet.getBullets().length; i++) {
        playerJet.getBullets()[i].y -= speed;

        if (playerJet.getBullets()[i].y < 0) {
            playerJet.getBullets().splice(i, 1);
        }

        for (let j = 0; j < enemyJets.length; j++) {
            if (playerJet.getBullets()[i] != null && isHit(enemyJets[j].getPosition().x, enemyJets[j].getPosition().y, playerJet.getBullets()[i].x, playerJet.getBullets()[i].y)) {
                let newHealth = enemyJets[j].getHealth() - playerJet.getBullets()[i].damage;
                enemyJets[j].setHealth(newHealth);
                playerJet.getBullets().splice(i, 1);
                if (newHealth <= 0) {

                    if (enemyJets[i] instanceof ShooterJet) {
                        score += 5;
                    } else {
                        score++;
                    }

                    enemyJets.splice(j, 1);
                    updateScore(score);
                }
            }
        }

        for (let j = 0; j < boosters.length; j++) {
            if (playerJet.getBullets()[i] != null && isHit(boosters[j].x, boosters[j].y, playerJet.getBullets()[i].x, playerJet.getBullets()[i].y)) {
                boosters[j].handle(playerJet);
                playerJet.getBullets().splice(i, 1);
                boosters.splice(j, 1);
            }
        }
    }

    switch (direction) {
        case "left":
            if (playerJet.getPosition().x >= 10) {
                playerJet.moveJet(direction);
            }
            break;
        case "right":
            if (playerJet.getPosition().x <= canvas.width - jetSize[0] - 10) {
                playerJet.moveJet(direction);
            }
            break;
        case "up":
            if (playerJet.getPosition().y > 0) {
                playerJet.moveJet(direction);
            }
            break;     
    }

    if (playerJet.health <= 0) {
        gameOver();
    }

    drawGameContext();
}

//#endregion

//#region Kirajzolás függvényei
function drawBackground() {
    bg1 += force*3;
    bg2 += force*3;

    ctx.drawImage(backgroundImg, 0, bg1, 500, 500);
    ctx.drawImage(backgroundImg, 0, bg2, 500, 500);

    if (bg1 >= canvas.height) {
        bg1 = -490;
    }

    if (bg2 >= canvas.height) {
        bg2 = -490;
    }
}

function drawGameContext() {
    clearBoard();

    drawBackground();

    playerJet.draw();

    for (let i = 0; i < playerJet.getBullets().length; i++) {
        playerJet.getBullets()[i].draw();
    }

    for (let i = 0; i < enemyJets.length; i++) {
        enemyJets[i].draw();

        if (enemyJets[i] instanceof ShooterJet) {
            for (j = 0; j < enemyJets[i].getBullets().length; j++) {
                enemyJets[i].getBullets()[j].draw();
            }
        }
    }

    for (let i = 0; i < boosters.length; i++) {
        boosters[i].draw();
    }

    if (over) {
        drawText("GAME OVER", "Press ENTER to restart");
    }
}

function drawText(title, subtitle) {
    ctx.fillStyle = "black";
    ctx.font = "50px bold Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width/2, canvas.height/2);
    ctx.font = "20px bold Arial";
    ctx.fillText(subtitle, canvas.width/2, canvas.height/2 + 40);
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//#endregion

//#region Segédfüggvények
function isHit(enemyJetX, enemyJetY, bulletX, bulletY) {
    if ((enemyJetX <= bulletX && (enemyJetX + jetSize[0]) >= bulletX) && ((enemyJetY + jetSize[1]) >= bulletY && enemyJetY <= bulletY)) {
        return true;
    }
    return false;
}

function isCollide(enemyJetX, enemyJetY, playerJetX, playerJetY) {
    if (playerJetX >= enemyJetX && playerJetX <= (enemyJetX + jetSize[0]) - 30 && playerJetY <= (enemyJetY + jetSize[1]) && (playerJetY + jetSize[1]) >= enemyJetY) {
        return true;
    } else if ((playerJetX + jetSize[0]) >= enemyJetX + 30 && (playerJetX + jetSize[0]) <= (enemyJetX + jetSize[0]) && playerJetY <= (enemyJetY + jetSize[1]) && (playerJetY + jetSize[1]) >= enemyJetY) {
        return true;
    }
    return false;
}

function updateEnemyJetPosition(jet) {
    if (jet instanceof ShooterJet) {
        if (jet.getPosition().y <= 150) {
            jet.moveJet("down");
        } else {
            if (jet.getPosition().x <= 0) {
                shooterDirection = "right";
            } else if ((jet.getPosition().x + jetSize[0]) >= canvas.width) {
                shooterDirection = "left";
            }

            jet.moveJet(shooterDirection);
        }
    } else {
        jet.moveJet("down");
    }
}

function playSound(path) {

    let slider = document.getElementById("soundSlider");

    let sound = new Audio(path);
    sound.volume = slider.value / 100;
    sound.play();
}

function updateScore(score) {
    document.getElementById("score").innerText = "Score: " + score;
}

function startTimer() {
    placeTimer = setInterval(placeTimerFunc, 1000*10);
    gameTimer = setInterval(gameTimerFunc, 20);
    shootTimer = setInterval(shootTimerFunc, 1000*1);
}

function stopTimer() {
    clearInterval(gameTimer);
    clearInterval(placeTimer);
    clearInterval(shootTimer);
}
//#endregion

//#region Eventek

document.getElementById("startBtn").addEventListener("click", () => {
    startGame();
});

window.addEventListener("keydown", (event) => {

    if (over) return;

    if (event.key == "ArrowLeft") {
        direction = "left";
    }

    if (event.key == "ArrowRight") {
        direction = "right";
    }

    if (event.key == "ArrowUp") {
        direction = "up";
     }

    if (event.key == " ") {
        if (canShoot) {
            playerJet.getBullets().push(new Bullet(playerJet.getPosition().x + 30, playerJet.getPosition().y - 10, 25));
            canShoot = false;
            playSound("sound/shoot.mp3");
        }
    }
    
})

window.addEventListener("keyup", (event) => {

    if (!over) {
        direction = "";

        if (event.key == " ") {
            if (!canShoot) {
                canShoot = true;
            }
        }

        if (event.key == "p") {
            if (pause) {
                pause = false;
                startTimer();
                
            } else {
                pause = true;
                stopTimer();
                drawText("PAUSED", "Press P to resume");
            }
        }
    }

    if (over && event.key == "Enter") {
        restartGame();
    }
})
//#endregion
