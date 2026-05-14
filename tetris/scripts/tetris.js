
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
let dropCounter = 0;
let dropInterval = 900; // Velocidad inicial (1 segundo)
let lastTime = 0;
let currentLevel = 0; // Nueva variable para controlar los saltos de nivel
let paused = false;
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
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += 10;
        updateScore();
    }
}

function updateScore() {
    scoreElement.innerText = currentLevel+" Puntos: " + player.score;

    // Calcular el nivel actual (cada 100 puntos)
    let newLevel = Math.floor(player.score / 100);

    // Si el nivel ha subido
    if (newLevel > currentLevel) {
        currentLevel = newLevel;
        
        // Reducir el intervalo de caída (Aumentar velocidad)
        // Ejemplo: Empieza en 1000ms, baja a 900ms, 800ms...
        // El Math.max asegura que no baje de 100ms
        dropInterval = Math.max(100, 1000 - (currentLevel * 50));
        
        console.log(`¡Nivel subido! Nivel: ${currentLevel}, Velocidad: ${dropInterval}ms`);
    }
}


function update(time = 0) {
    if (paused) return; // Si está pausado, no hace nada y sale del bucle

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    requestAnimationFrame(update);
}

// --- GESTOS MÓVILES ---
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});

canvas.addEventListener('touchend', e => {
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

// Al final del script, vinculamos el botón
document.getElementById('pause-btn').addEventListener('click', () => {
    togglePause();
});

function togglePause() {
    paused = !paused;
    if (!paused) {
        update(); // Reanuda el bucle
    } else {
        saveGameState(); // Guarda al pausar
    }
}


// ... (Toda la parte inicial de piezas y arena se mantiene igual) ...

function playerReset() {
    // REPARADO: Se volvió a incluir la lógica para generar piezas
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        // Al perder, limpiamos todo
        arena.forEach(row => row.fill(0));
        player.score = 0;
        currentLevel = 0;
        dropInterval = 1000;
        localStorage.removeItem('tetrisSave');
        updateScore();
    }
    // Solo guardamos si el juego no está pausado
    if (!paused) saveGameState();
}

// ... (arenaSweep y updateScore se mantienen igual) ...

function saveGameState() {
    // Aseguramos que guardamos valores actuales
    const gameState = {
        arena: arena,
        player: player,
        dropInterval: dropInterval,
        currentLevel: currentLevel
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

// --- INICIALIZACIÓN CORREGIDA ---

// Intentamos cargar partida. Si no devuelve true, reseteamos al jugador para empezar de cero.
const loaded = loadGameState();
if (!loaded) {
    playerReset();
}

updateScore();
update();