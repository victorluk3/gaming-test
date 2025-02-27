// Selección del personaje
let selectedCharacter = 0; // Índice del personaje seleccionado
const characters = ["Goku", "Vegeta", "Gohan"];
let suelo = 150
let hurtCooldown = 20
// Variables del juego
let player1 = {
    player: 'vegeta',
    x: 50,
    y: suelo,
    width: 50,
    height: 90,
    health: 100,
    isJumping: false,
    velocityY: 0,
    state: "idle",
    facingRight: true,
    attackCooldown: 0,
    hurtCooldown: 0,
    frameIndex: 0,
    frameTimer: 0
};

let player2 = {
    player: 'goku',
    x: 400,
    y: suelo,
    width: 50,
    height: 90,
    health: 100,
    state: "idle",
    facingRight: false,
    attackCooldown: 0,
    hurtCooldown: 0,
    frameIndex: 0,
    frameTimer: 0
};

const gravity = 1;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// canvas.width = 1200;
// canvas.height = 400;
// document.body.appendChild(canvas);

let keys = {};

// Cargar imágenes
const images = {
    idle: new Image(),
    walk: new Image(),
    jump: new Image(),
    attack: new Image(),
    hurt: new Image(),

    goku_idle: new Image(),
    goku_walk: new Image(),
    goku_jump: new Image(),
    goku_attack: new Image(),
    goku_hurt: new Image(),

    vegeta_idle: new Image(),
    vegeta_walk: new Image(),
    vegeta_jump: new Image(),
    vegeta_attack: new Image(),
    vegeta_hurt: new Image(),
    
};

images.idle.src = "sprites/goku_idle.png";
images.walk.src = "sprites/goku_walk.png";
images.jump.src = "sprites/goku_walk.png";
images.attack.src = "sprites/goku_attack.png";
images.hurt.src = "sprites/goku_hurt.png";

images.goku_idle.src = "sprites/goku_idle.png";
images.goku_walk.src = "sprites/goku_walk.png";
images.goku_jump.src = "sprites/goku_walk.png";
images.goku_attack.src = "sprites/goku_attack.png";
images.goku_hurt.src = "sprites/goku_hurt.png";

images.vegeta_idle.src = "sprites/vegeta_iddle.png";
images.vegeta_walk.src = "sprites/vegeta_walk.png";
images.vegeta_jump.src = "sprites/vegeta_walk.png";
images.vegeta_attack.src = "sprites/vegeta_attack.png";
images.vegeta_hurt.src = "sprites/vegeta_hurt.png";

const frameCounts = {
    idle: 1,
    walk: 3,
    jump: 1,
    attack: 2,
    hurt: 1
};

document.getElementById('left').addEventListener('touchstart', (e)=> {
    keys['a'] = true;
    console.log('left')
}, false)
document.getElementById('left').addEventListener('touchend', (e)=> {
    keys['a'] = false;


})

document.getElementById('up').addEventListener('touchstart', (e)=> {
    keys['w'] = true;
    console.log('right')

    selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
    drawCharacterSelection();
})
document.getElementById('up').addEventListener('touchend', (e)=> {
    keys['w'] = false;

})

document.getElementById('right').addEventListener('touchstart', (e)=> {
    keys['d'] = true;
    console.log('right')
})
document.getElementById('right').addEventListener('touchend', (e)=> {
    keys['d'] = false;
})

document.getElementById('attack').addEventListener('touchstart', (e)=> {
    keys['j'] = true;
    console.log('attack')

})
document.getElementById('attack').addEventListener('touchend', (e)=> {
    keys['j'] = false;
})

document.getElementById('ok').addEventListener('touchstart', (e)=> {
    keys['Enter'] = true;
    startGame();
    document.getElementById('ok').style.display = 'none'
    document.getElementById('attack').style.display = 'inline-block'
})
document.getElementById('ok').addEventListener('touchend', (e)=> {
    keys['Enter'] = false;   
})



// Event Listeners
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === "Enter" && selectedCharacter !== null) {
        startGame();
    }
    if (e.key === "ArrowDown" || e.key === "s") {
        selectedCharacter = (selectedCharacter + 1) % characters.length;
        drawCharacterSelection();
    }
    if (e.key === "ArrowUp" || e.key === "w") {
        selectedCharacter = (selectedCharacter - 1 + characters.length) % characters.length;
        drawCharacterSelection();
    }
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function drawCharacterSelection() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Seleccione su personaje usando las flechas y Enter:", 30, 50);

    characters.forEach((char, index) => {
        ctx.fillStyle = index === selectedCharacter ? "red" : "black";
        ctx.fillText(char, 200, 100 + index * 40);
    });
}

function startGame() {
    player1.player = selectedCharacter == 0 ? 'goku' : 'vegeta'
    selectedCharacter = null; // Bloquea más selección
    player1.health = 100
    player2.health = 100
    player1.x = 30
    player2.x = 400
    requestAnimationFrame(gameLoop);
}

function drawPlayer(player) {
    let image = images[player.player+'_'+player.state];
    if (!image) image = images.idle;

    const frameWidth = image.width / frameCounts[player.state];
    const frameHeight = image.height;

    let index = player.frameIndex > frameCounts[player.state] - 1 ? 0 : player.frameIndex; 

    const flip = player.facingRight ? 1 : -1;
    ctx.save();
    ctx.translate(player.x + (flip === -1 ? player.width : 0), 0);
    ctx.scale(flip, 1);
    ctx.drawImage(
        image,
        index * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        player.y,
        player.width,
        player.height
    );
    ctx.restore();
}

function updateAnimation(player) {
    player.frameTimer++;
    if (player.frameTimer >= 10) { // Ajusta este valor para cambiar la velocidad de animación
        player.frameTimer = 0;
        player.frameIndex = (player.frameIndex + 1) % frameCounts[player.state];

    }
}

function drawHealthBar(player, x, y) {
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, player.health * 2, 20);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, 200, 20);
}

function resetStateAfterCooldown(player) {
    if (player.attackCooldown === 0 && player.hurtCooldown === 0 && player.state !== "idle") {
        if(player.state !== "walk") {
            player.state = "idle";
            player.frameIndex = 0;
        }
    }
}

let coolDownMove = 0
let randomMoveX = 0
let coolDownLimit = 20
let wait = 0
function randomMovePlayer2() {

    if(player2.hurtCooldown > 0) {
        return
    }

    if(wait >0) {
        wait--;
        if(player2.state != "attack")
            player2.state = "idle"
        return
    }
    // Movimiento aleatorio en X
    if(coolDownMove == 0)
        randomMoveX = Math.random() > 0.05 ? -3 : 3;

    if(randomMoveX < 0) {
        player2.facingRight = false
    }
    if(randomMoveX > 0) {
        player2.facingRight = true
    }
    
    

    // Movimiento aleatorio en Y (para saltar o caer)
    const randomMoveY = Math.random() > 0.5 ? 3 : -3;

    if(coolDownMove > 0){
       
        coolDownMove--;
        
        player2.x += randomMoveX;
        // Cambiar el estado a caminar si se mueve en X
        if (randomMoveX !== 0 && !player2.isJumping) {
            player2.state = "walk";
        } else if (!player2.isJumping && player2.state !== "hurt") {
            player2.state = "idle";  // Si no se mueve y no está saltando, estado inactivo
        }
        player2.x = Math.max(0, Math.min(canvas.width - player2.width, player2.x));

        if(coolDownMove == 0) {
            wait = 100;
        }
        return;
    }

    if(randomMoveX > 0){
        coolDownMove = coolDownLimit
    }


    player2.x += randomMoveX;

    // Movimiento hacia arriba o hacia abajo
    // if (Math.random() > 0.5 && !player2.isJumping) {
    //     player2.isJumping = true;
    //     player2.velocityY = -15;  // Impulso hacia arriba
    //     player2.state = "jump";   // Establecer el estado a saltando
    // }

    // player2.y += randomMoveY;

    // Limitar al jugador 2 dentro del área del canvas
    // player2.x = Math.max(0, Math.min(canvas.width - player2.width, player2.x));
    //player2.y = Math.max(0, Math.min(canvas.height - player2.height, player2.y));

    // Cambiar el estado a caminar si se mueve en X
    if (randomMoveX !== 0 && !player2.isJumping) {
        player2.state = "walk";
    } else if (!player2.isJumping && player2.state !== "hurt") {
        player2.state = "idle";  // Si no se mueve y no está saltando, estado inactivo
    }
}

function randomAttackPlayer2() {
    if(player2.hurtCooldown > 0) {
        return
    }

    if (player2.attackCooldown === 0 && Math.random() > 0.982) { // 2% de probabilidad de atacar
        player2.attackCooldown = 20; // Cooldown de 20 frames
        player2.state = "attack";
        player2.frameIndex = 0;
        if (collide(player1, player2)) {

            if(player1.state = "walk" && player1.facingRight == false && player1.x < player2.x){
                //blocks the attack
            } else if(player1.state = "walk" && player1.facingRight == true && player1.x > player2.x){
                //blocks the attack
            } else {
                player1.health -= 5;  // El jugador 1 recibe daño
                player1.state = "hurt";
                player1.frameIndex = 0;
                player1.hurtCooldown = hurtCooldown; // Duración de estado "hurt"
            }

        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimiento jugador 1
    if (keys["a"] && player1.x > 0) {
        player1.x -= 3;
        player1.state = "walk";
        player1.facingRight = false;
    } else if (keys["d"] && player1.x < canvas.width - player1.width) {
        player1.x += 3;
        player1.state = "walk";
        player1.facingRight = true;
    } else if (!player1.isJumping && player1.state !== "attack" && player1.state !== "hurt") {
        player1.state = "idle";
        player1.width = 50
    }

    if (keys["w"] && !player1.isJumping) {
        player1.isJumping = true;
        player1.velocityY = -15;
        player1.state = "jump";
    }

    // Aplicar gravedad
    if (player1.isJumping) {
        player1.velocityY += gravity;
        player1.y += player1.velocityY;

        if (player1.y >= suelo) { // Suelo
            player1.y = suelo;
            player1.isJumping = false;
            player1.velocityY = 0;
            player1.state = "idle";
        }
    }

        randomMovePlayer2();
       // Intentar ataque aleatorio para el jugador 2
       randomAttackPlayer2();

    // Actualizar cooldowns
    if (player1.attackCooldown > 0) player1.attackCooldown--;
    if (player1.hurtCooldown > 0) player1.hurtCooldown--;
    if (player2.hurtCooldown > 0) player2.hurtCooldown--;
    if (player2.attackCooldown > 0) player2.attackCooldown--;

    // Dibujar jugadores y barras de vida
    updateAnimation(player1);
    updateAnimation(player2);
    drawPlayer(player1);
    drawPlayer(player2);
    drawHealthBar(player1, 30, 20);
    drawHealthBar(player2, 280, 20);

    // Ataques
    if (keys["j"] && player1.attackCooldown === 0) {
        player1.attackCooldown = 20; // Cooldown de 20 frames
        player1.state = "attack";
        player1.width = 70
        player1.frameIndex = 0;
        if (collide(player1, player2)) {
            player2.health -= 5;
            player2.state = "hurt";
            player2.frameIndex = 0;
            player2.hurtCooldown = hurtCooldown; // Duración de estado "hurt"
        }
    } else if (keys["k"] && player1.attackCooldown === 0) {
        player1.attackCooldown = 20; // Cooldown de 20 frames
        player1.state = "attack";
        player1.frameIndex = 0;
        if (collide(player1, player2)) {
            player2.health -= 10;
            player2.state = "hurt";
            player2.frameIndex = 0;
            player2.hurtCooldown = hurtCooldown; // Duración de estado "hurt"
        }
    }

    resetStateAfterCooldown(player1);
    resetStateAfterCooldown(player2);

    // Verificar victoria
    if (player1.health <= 0 || player2.health <= 0) {
        ctx.font = "40px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(player1.health <= 0 ? "Player 2 Wins!" : "Player 1 Wins!", canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    requestAnimationFrame(gameLoop);
}

function collide(player1, player2) {
    return (
        player1.x < player2.x + player2.width &&
        player1.x + player1.width > player2.x &&
        player1.y < player2.y + player2.height &&
        player1.y + player1.height > player2.y
    );
}

function main() {
    drawCharacterSelection();
}

main();
