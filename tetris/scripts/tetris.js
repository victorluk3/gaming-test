
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
let dropCounter = 0;
let dropInterval = 900; 
let lastTime = 0;
let currentLevel = 0; 
let paused = false;
let totalLines = 0;
let gameOver = false; 

context.scale(20, 20);

// 1. Definición de Piezas
function createPiece(type) {
    if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    if (type === 'O') return [[2, 2], [2, 2]];
    if (type === 'L') return [[0, 0, 3], [3, 3, 3], [0, 0, 0]];
    if (type === 'J') return [[4, 0, 0], [4, 4, 4], [0, 0, 0]];
    if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
}

// 2. Lógica del Tablero
const arena = Array.from({length: 20}, () => Array(12).fill(0));

const player = {
    pos: {x: 5, y: 0},
    matrix: createPiece('T'),
    score: 0,
};

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan'][value - 1];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function arenaSweep() {
    let linesCombo = 0; // Líneas completadas en esta jugada

    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        
        linesCombo++; // Sumamos una línea al combo actual
    }

    if (linesCombo > 0) {
        totalLines += linesCombo; // Añadimos al contador global para los niveles
        
        // CÁLCULO DE PUNTOS CON MULTIPLICADOR:
        // Base de 10 puntos por línea. 
        // Si hay más de 1 línea, aplica (1.5 elevado a la cantidad de líneas extras)
        let basePoints = linesCombo * 10;
        let multiplier = linesCombo > 1 ? Math.pow(1.5, linesCombo - 1) : 1;
        
        player.score += Math.floor(basePoints * multiplier);
        
        updateScore(); // Verifica si sube de nivel y actualiza la pantalla
    }
}

function drawGameOver() {
    // Reseteamos el escalado temporalmente para dibujar texto en alta resolución
    context.setTransform(1, 0, 0, 1, 0, 0);

    // Fondo oscuro semi-transparente
    context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Texto de GAME OVER
    context.fillStyle = '#ff4d4d';
    context.font = 'bold 28px sans-serif';
    context.textAlign = 'center';
    context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    // Puntuación Final
    context.fillStyle = '#fff';
    context.font = '18px sans-serif';
    context.fillText(`Puntaje: ${player.score}`, canvas.width / 2, canvas.height / 2);
    context.fillText(`Líneas: ${totalLines}`, canvas.width / 2, canvas.height / 2 + 25);

    // Instrucción para reiniciar
    context.fillStyle = '#00ffcc';
    context.font = '14px sans-serif';
    context.fillText('Toca la pantalla para reiniciar', canvas.width / 2, canvas.height / 2 + 70);

    // Restauramos el escalado de 20x20 para el resto del juego
    context.scale(20, 20);
}

function updateScore() {
    // Mostramos el Nivel, las Líneas totales y los Puntos
    scoreElement.innerHTML = `Lvl: ${currentLevel} | Score: ${player.score}`;

    // NUEVO: El nivel sube cada 20 líneas
    let newLevel = Math.floor(totalLines / 20);

    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        
        // Aumentamos la velocidad (reducimos el intervalo)
        dropInterval = Math.max(100, 1000 - (currentLevel * 50));
        
        console.log(`¡Subiste de nivel! Nivel: ${currentLevel}, Nueva Velocidad: ${dropInterval}ms`);
    }
}

function update(time = 0) {
    if (paused || gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    requestAnimationFrame(update);
}

function restartGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    totalLines = 0;
    currentLevel = 0;
    dropInterval = 900;
    gameOver = false;
    
    updateScore();
    playerReset();
    update();
}

// --- GESTOS MÓVILES ---
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});

canvas.addEventListener('touchend', e => {
    if (gameOver) {
        restartGame();
        e.preventDefault();
        return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        // Tap: Rotar
        rotate(player.matrix, 1);
        if (collide(arena, player)) rotate(player.matrix, -1);
    } else if (Math.abs(dx) > Math.abs(dy)) {
        // Swipe Horizontal: Mover
        playerMove(dx > 0 ? 1 : -1);
    } else if (dy > 30) {
        // Swipe Abajo: Caída rápida
        playerDrop();
    }
    e.preventDefault();
}, {passive: false});

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        rotate(player.matrix, 1);
        if (collide(arena, player)) rotate(player.matrix, -1);
    } else if (event.key === 'p' || event.key === 'P') {
        togglePause();
    }
});

// Al final del script, vinculamos el botón
document.getElementById('pause-btn').addEventListener('click', () => {
if (gameOver) {
        restartGame();
    } else {
        togglePause();
    }
});

function togglePause() {
    paused = !paused;
    if (!paused) {
        update(); // Reanuda el bucle
    } else {
        saveGameState(); // Guarda al pausar
    }
}


function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    // Si la pieza nueva colisiona al salir, el jugador pierde
    if (collide(arena, player)) {
        gameOver = true; 
        localStorage.removeItem('tetrisSave'); // Borramos el guardado ya que perdió
        drawGameOver(); // Dibujamos la pantalla de Game Over
    } else {
        if (!paused) saveGameState();
    }
}


function saveGameState() {
    // Aseguramos que guardamos valores actuales
    const gameState = {
        arena: arena,
        player: player,
        dropInterval: dropInterval,
        currentLevel: currentLevel,
        totalLines: totalLines
    };
    localStorage.setItem('tetrisSave', JSON.stringify(gameState));
}

function loadGameState() {
    const savedData = localStorage.getItem('tetrisSave');
    if (savedData) {
        try {
            const state = JSON.parse(savedData);
            
            // Restaurar arena
            state.arena.forEach((row, y) => {
                row.forEach((value, x) => {
                    arena[y][x] = value;
                });
            });

            // Restaurar datos del jugador
            player.score = state.player.score;
            player.pos = state.player.pos;
            player.matrix = state.player.matrix;
            dropInterval = state.dropInterval;
            currentLevel = state.currentLevel || 0;
            totalLines = state.totalLines || 0;
            updateScore();
            draw();
            return true; // Éxito al cargar
        } catch (e) {
            console.error("Error cargando partida", e);
            return false;
        }
    }
    return false;
}


// Intentamos cargar partida. Si no devuelve true, reseteamos al jugador para empezar de cero.
const loaded = loadGameState();
if (!loaded) {
    playerReset();
}

updateScore();
update();