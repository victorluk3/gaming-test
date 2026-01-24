// ==================== GAME ENGINE ====================
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Sistema de mapa
        this.tilemap = new TileMap(30, 20, 32); // 30x20 tiles de 32px
        this.tilemap.generateDemoMap();

        // Posicionar jugador en el centro del mapa
        const centerTileX = Math.floor(this.tilemap.width / 2);
        const centerTileY = Math.floor(this.tilemap.height / 2);

        this.player = new Player(
            centerTileX * 32,
            centerTileY * 32
        );

        // Sistema de equipo del jugador
        this.playerParty = new PlayerParty(3); // Máximo 3 monstruos

        this.gameObjects = [this.player];
        this.isRunning = true;
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = Date.now();

        // Estado del juego
        this.gameState = GAME_STATES.EXPLORATION;
        this.encounterManager = new EncounterManager(10); // 10% de probabilidad

        // Sistema de batalla
        this.battleSystem = null; // Se inicializa cuando comienza una batalla
        this.battleUI = null;
        this.battleTransitionTime = 0;
        this.battleTransitionDuration = 500; // ms para transición

        // Rastrear posición anterior del jugador para detectar movimientos
        this.lastPlayerGridX = this.player.gridX;
        this.lastPlayerGridY = this.player.gridY;

        // Cámara (sigue al jugador)
        this.cameraX = 0;
        this.cameraY = 0;

        // Estado de controles
        this.keysPressed = {};
        this.keyPressTimes = {}; // Para detectar presiones rápidas
        this.continuousMovementDir = null; // Dirección de movimiento continuo
        this.touchDirections = new Set();
        this.pressThreshold = 200; // Milisegundos para considerar una presión como "continua"

        this.setupEventListeners();
    }

    /**
     * Cambia el tilemap actual del juego
     * @param {string} path - Ruta del archivo JSON del tilemap
     * @param {object} playerStart - Posición donde aparecerá el jugador {x, y}
     */
    async changeTileMap(path, playerStart = null) {
        console.log(`Changing tilemap to: ${path}`);
        
        // Cargar el nuevo tilemap
        const newTilemap = await TileMapLoader.loadFromJson(path);
        
        if (!newTilemap) {
            console.error(`Failed to load tilemap: ${path}`);
            return;
        }

        // Reemplazar tilemap actual
        this.tilemap = newTilemap;
        
        // Posicionar al jugador
        if (playerStart) {
            this.player.gridX = playerStart.x;
            this.player.gridY = playerStart.y;
            this.player.x = playerStart.x * this.player.tileSize;
            this.player.y = playerStart.y * this.player.tileSize;
        } else {
            // Usar posición por defecto (centro del mapa)
            const centerX = Math.floor(this.tilemap.width / 2);
            const centerY = Math.floor(this.tilemap.height / 2);
            this.player.gridX = centerX;
            this.player.gridY = centerY;
            this.player.x = centerX * this.player.tileSize;
            this.player.y = centerY * this.player.tileSize;
        }

        // Resetear estado del movimiento
        this.player.isMoving = false;
        this.player.moveProgress = 0;
        this.player.nextDirection = null;

        // Actualizar rastreo de posición para encuentros
        this.lastPlayerGridX = this.player.gridX;
        this.lastPlayerGridY = this.player.gridY;

        console.log(`Tilemap changed successfully. Player at (${this.player.gridX}, ${this.player.gridY})`);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Redimensionar canvas
        window.addEventListener('resize', () => this.resizeCanvas());

        // Teclado
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Botones táctiles (D-Pad)
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            btn.addEventListener('mousedown', (e) => this.handleDPadPress(e));
            btn.addEventListener('mouseup', (e) => this.handleDPadRelease(e));
            btn.addEventListener('touchstart', (e) => this.handleDPadPress(e));
            btn.addEventListener('touchend', (e) => this.handleDPadRelease(e));
        });

        // Botones de acción
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleActionButton(e));
        });
    }

    /**
     * Maneja la acción de batalla (confirmar selección en menú o log)
     */
    handleBattleAction() {
        console.log('=== handleBattleAction() INICIADA ===');
        if (!this.battleSystem || this.gameState !== GAME_STATES.BATTLE) {
            console.log('Cancelada: battleSystem existe?', !!this.battleSystem, 'GameState correcto?', this.gameState === GAME_STATES.BATTLE);
            return;
        }

        const state = this.battleSystem.getState();
        
        // Si está esperando confirmación del log, confirmar y continuar
        if (state.waitingForLogConfirm) {
            console.log('Confirmando evento del log');
            this.battleSystem.confirmLog();
            return;
        }
        
        if (state.state !== BATTLE_STATES.PLAYER_TURN) {
            console.log('No es turno del jugador');
            return;
        }

        console.log('Confirmando acción en menú:', state.menuState);
        this.battleSystem.confirmMenuAction();
        console.log('=== handleBattleAction() FINALIZADA ===');
    }

    /**
     * Maneja volver al menú anterior (tecla L)
     */
    handleBattleBack() {
        if (!this.battleSystem || this.gameState !== GAME_STATES.BATTLE) {
            return;
        }

        const state = this.battleSystem.getState();
        if (state.state !== BATTLE_STATES.PLAYER_TURN) {
            return;
        }

        console.log('Volviendo al menú anterior');
        this.battleSystem.goBack();
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        console.log(`[KEY PRESSED] ${key}, GameState: ${this.gameState}`);
        
        // Controles de batalla
        if (this.gameState === GAME_STATES.BATTLE) {
            console.log(`[BATTLE MODE] Tecla: ${key}`);
            if (key === 'arrowup' || key === 'w') {
                console.log('Moviendo selección arriba');
                this.battleUI.changeSelection(-1);
                return;
            }
            if (key === 'arrowdown' || key === 's') {
                console.log('Moviendo selección abajo');
                this.battleUI.changeSelection(1);
                return;
            }
            if (key === 'k' || key === 'enter') {
                console.log('PRESIONADA K - Ejecutando handleBattleAction()');
                this.handleBattleAction();
                return;
            }
            if (key === 'l') {
                console.log('PRESIONADA L - Volviendo al menú anterior');
                this.handleBattleBack();
                return;
            }
        }
        
        // Controles de exploración
        if (['arrowup', 'w', 'arrowdown', 's', 'arrowleft', 'a', 'arrowright', 'd'].includes(key)) {
            e.preventDefault(); // Prevenir scroll
        }
        
        // Registrar tiempo de presión
        if (!this.keysPressed[key]) {
            this.keyPressTimes[key] = Date.now();
        }
        
        this.keysPressed[key] = true;
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        
        // No procesar movimiento si estamos en batalla
        if (this.gameState === GAME_STATES.BATTLE) {
            return;
        }
        
        const pressTime = Date.now() - (this.keyPressTimes[key] || Date.now());
        
        this.keysPressed[key] = false;

        // Si fue una presión rápida (menor al umbral)
        if (pressTime < this.pressThreshold) {
            const direction = this.getDirectionFromKey(key);
            if (direction) {
                // Si está mirando en esa dirección, mover 1 tile
                if (this.player.direction === direction && !this.player.isMoving) {
                    // Verificar si puede moverse
                    let nextGridX = this.player.gridX;
                    let nextGridY = this.player.gridY;

                    switch (direction) {
                        case 'up':
                            nextGridY -= 1;
                            break;
                        case 'down':
                            nextGridY += 1;
                            break;
                        case 'left':
                            nextGridX -= 1;
                            break;
                        case 'right':
                            nextGridX += 1;
                            break;
                    }

                    // Validar contra tilemap
                    if (this.tilemap.isValidPosition(nextGridX, nextGridY) && 
                        this.tilemap.isWalkable(nextGridX, nextGridY)) {
                        this.player.startMove(direction);
                    }
                } else {
                    // Si es dirección diferente, validar y cambiar sprite
                    this.player.move(direction, this.tilemap);
                }
            }
        }

        // Detener movimiento continuo si era la tecla presionada continuamente
        if (this.continuousMovementDir === key) {
            this.continuousMovementDir = null;
        }

        delete this.keyPressTimes[key];
    }

    /**
     * Convierte una tecla a dirección
     */
    getDirectionFromKey(key) {
        switch(key) {
            case 'arrowup':
            case 'w':
                return 'up';
            case 'arrowdown':
            case 's':
                return 'down';
            case 'arrowleft':
            case 'a':
                return 'left';
            case 'arrowright':
            case 'd':
                return 'right';
        }
        return null;
    }

    handleDPadPress(e) {
        const direction = e.target.dataset.direction;
        this.touchDirections.clear(); // Limpiar direcciones previas
        this.touchDirections.add(direction);
        this.currentTouchDirection = direction;

        // Si estamos en batalla, navegamos el menú en lugar de mover al jugador
        if (this.gameState === GAME_STATES.BATTLE) {
            if (direction === 'up') {
                this.battleUI.changeSelection(-1);
            } else if (direction === 'down') {
                this.battleUI.changeSelection(1);
            }
        } else {
            // En exploración, mover normalmente
            this.player.move(direction, this.tilemap);
        }
    }

    handleDPadRelease(e) {
        const direction = e.target.dataset.direction;
        this.touchDirections.delete(direction);
        if (this.currentTouchDirection === direction) {
            this.currentTouchDirection = null;
        }
    }

    handleActionButton(e) {
        const action = e.target.dataset.action;
        
        if (this.gameState === GAME_STATES.BATTLE) {
            if (action === 'attack') {
                // Botón A = K (confirmar)
                this.handleBattleAction();
            } else if (action === 'back') {
                // Botón B = L (atrás)
                this.handleBattleBack();
            }
        }
    }

    updatePlayerMovement() {
        const keys = this.keysPressed;
        const now = Date.now();
        let direction = null;

        // Buscar la primera tecla presionada
        let pressedKey = null;
        for (let key in this.keysPressed) {
            if (this.keysPressed[key]) {
                pressedKey = key;
                break;
            }
        }

        // Si hay una tecla presionada
        if (pressedKey) {
            // Verificar si es una presión continua (mayor al umbral)
            const pressTime = now - (this.keyPressTimes[pressedKey] || now);
            
            if (pressTime >= this.pressThreshold) {
                // Presión continua - permitir movimiento automático
                direction = this.getDirectionFromKey(pressedKey);
                this.continuousMovementDir = pressedKey;
                
                if (direction && !this.player.isMoving) {
                    // Solo iniciar movimiento si está parado
                    if (this.player.direction === direction) {
                        // Verificar si puede moverse
                        let nextGridX = this.player.gridX;
                        let nextGridY = this.player.gridY;

                        switch (direction) {
                            case 'up':
                                nextGridY -= 1;
                                break;
                            case 'down':
                                nextGridY += 1;
                                break;
                            case 'left':
                                nextGridX -= 1;
                                break;
                            case 'right':
                                nextGridX += 1;
                                break;
                        }

                        // Validar contra tilemap
                        if (this.tilemap.isValidPosition(nextGridX, nextGridY) && 
                            this.tilemap.isWalkable(nextGridX, nextGridY)) {
                            this.player.startMove(direction);
                        }
                    } else {
                        // Cambiar dirección primero
                        this.player.move(direction, this.tilemap);
                    }
                }
            }
        }
    }

    update() {
        // Actualizar movimiento del jugador basado en teclas presionadas
        this.updatePlayerMovement();
        
        // Actualizar player con referencia del mapa
        this.player.update(this.canvas.width, this.canvas.height, this.tilemap);

        // Actualizar otros objetos del juego
        for (let i = 1; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update(this.canvas.width, this.canvas.height);
        }

        // Actualizar según el estado del juego
        if (this.gameState === GAME_STATES.EXPLORATION) {
            // Verificar si el jugador está en un portal
            this.checkForPortal();

            // Verificar encuentros si estamos en exploración
            this.checkForRandomEncounter();
        } else if (this.gameState === GAME_STATES.BATTLE) {
            // Procesar lógica de batalla
            this.processBattle();
        }

        // Actualizar cámara para seguir al jugador
        this.updateCamera();
    }

    /**
     * Verifica si el jugador está en un portal y cambia el tilemap si es necesario
     */
    checkForPortal() {
        if (!this.tilemap.portals || this.tilemap.portals.length === 0) {
            return;
        }

        // Verificar cada portal
        for (let portal of this.tilemap.portals) {
            if (this.player.gridX === portal.x && this.player.gridY === portal.y) {
                console.log(`Portal detected at (${portal.x}, ${portal.y}). Teleporting to ${portal.destination}`);
                
                // Cambiar tilemap con la posición de inicio especificada
                this.changeTileMap(portal.destination, portal.destinationStart);
                return; // Solo procesar un portal por frame
            }
        }
    }

    /**
     * Actualiza la posición de la cámara para seguir al jugador
     */
    updateCamera() {
        // Centrar cámara en el jugador
        this.cameraX = this.player.x - this.canvas.width / 2;
        this.cameraY = this.player.y - this.canvas.height / 2;

        // Limitar cámara a los límites del mapa
        const mapWidth = this.tilemap.width * this.tilemap.tileSize;
        const mapHeight = this.tilemap.height * this.tilemap.tileSize;

        this.cameraX = Math.max(0, Math.min(this.cameraX, mapWidth - this.canvas.width));
        this.cameraY = Math.max(0, Math.min(this.cameraY, mapHeight - this.canvas.height));
    }

    /**
     * Verifica y ejecuta encuentros aleatorios
     */
    checkForRandomEncounter() {
        const playerGridX = this.player.gridX;
        const playerGridY = this.player.gridY;

        // Solo verificar encuentros si el jugador cambió de tile
        if (playerGridX === this.lastPlayerGridX && playerGridY === this.lastPlayerGridY) {
            return; // El jugador no se ha movido
        }

        // Actualizar la posición anterior
        this.lastPlayerGridX = playerGridX;
        this.lastPlayerGridY = playerGridY;

        const encounterResult = this.encounterManager.checkEncounter(
            this.tilemap,
            playerGridX,
            playerGridY
        );

        if (encounterResult.encountered) {
            // Cambiar a estado de batalla
            this.initiateBattle(encounterResult.terrainType, 1);
        }
    }

    /**
     * Inicia una batalla con enemigos aleatorios
     * @param {string} terrainType - Tipo de terreno donde ocurre el encuentro
     * @param {number} playerLevel - Nivel del jugador para escalar dificultad
     */
    initiateBattle(terrainType, playerLevel = 1) {
        // Limpiar estado de teclas presionadas para evitar que continúen en batalla
        this.keysPressed = {};
        this.keyPressTimes = {};
        this.currentTouchDirection = null;
        this.touchDirections.clear();
        
        this.gameState = GAME_STATES.BATTLE;

        // Generar enemigo basado en el terreno
        const enemies = this.encounterManager.generateEnemies(terrainType, playerLevel);
        const enemyMonster = enemies[0]; // Usar el primer enemigo generado

        console.log(`¡Encuentro aleatorio en ${TERRAIN_DATA[terrainType].name}!`);
        console.log(`¡${enemyMonster.name} salvaje aparece!`);

        // Inicializar sistema de batalla
        this.battleSystem = new BattleSystem(this.playerParty, enemyMonster);
        this.battleUI = new BattleUI(this.canvas, this.ctx, this.battleSystem);
        
        // Log inicial
        console.log('Battle system initialized');
    }

    /**
     * Procesa la lógica de batalla
     */
    processBattle() {
        if (!this.battleSystem) return;

        // Procesar turno del enemigo si es necesario
        if (this.battleSystem.battleState === BATTLE_STATES.ENEMY_TURN) {
            console.log('Ejecutando turno del enemigo');
            this.battleSystem.enemyTurn();
        }

        // Verificar si la batalla terminó
        // Pero solo terminar si no hay eventos del log pendientes de confirmar
        if (this.battleSystem.battleState === BATTLE_STATES.PLAYER_WIN) {
            if (!this.battleSystem.waitingForLogConfirm) {
                console.log('¡Victoria!');
                this.endBattle();
            }
        } else if (this.battleSystem.battleState === BATTLE_STATES.PLAYER_LOSE) {
            if (!this.battleSystem.waitingForLogConfirm) {
                console.log('¡Derrota!');
                this.endBattle();
            }
        }
    }

    /**
     * Termina la batalla y vuelve a exploración
     */
    endBattle() {
        // Limpiar estado de teclas presionadas para evitar que continúen después de batalla
        this.keysPressed = {};
        this.keyPressTimes = {};
        this.currentTouchDirection = null;
        this.touchDirections.clear();
        
        // Restaurar salud del equipo
        this.playerParty.restoreHealth();
        
        // Volver a exploración
        this.gameState = GAME_STATES.EXPLORATION;
        this.battleSystem = null;
        this.battleUI = null;
        
        console.log('Battle ended. Returning to exploration.');
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#1a3a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar mapa
        this.tilemap.draw(
            this.ctx,
            this.cameraX,
            this.cameraY,
            this.canvas.width,
            this.canvas.height
        );

        // Dibujar objetos
        this.gameObjects.forEach(obj => obj.draw(this.ctx));

        // Dibujar overlay de estado si estamos en batalla
        if (this.gameState === GAME_STATES.BATTLE) {
            this.drawBattleOverlay();
        }

        // Dibujar información
        this.updateInfo();
    }

    /**
     * Dibuja overlay de batalla
     */
    drawBattleOverlay() {
        if (!this.battleUI) return;
        
        // Dibujar la interfaz de batalla
        this.battleUI.draw();
    }

    updateInfo() {
        const info = this.player.getInfo();
        const terrain = this.tilemap.getTerrain(info.x, info.y);
        const terrainData = TERRAIN_DATA[terrain];
        
        document.getElementById('posX').textContent = info.x;
        document.getElementById('posY').textContent = info.y;
        document.getElementById('fps').textContent = this.fps;
        
        // Mostrar información del terreno en consola (opcional)
        // console.log(`Terreno: ${terrainData.name} (${terrainData.walkable ? 'Transitable' : 'Bloqueado'})`);
    }

    calculateFPS() {
        this.frameCount++;
        const currentTime = Date.now();
        if (currentTime >= this.lastTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    gameLoop() {
        this.update();
        this.draw();
        this.calculateFPS();

        if (this.isRunning) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    async start() {
        // Cargar el tilemap inicial
        const tilemap = await TileMapLoader.loadFromJson('data/tilemaps/tilemap_start.json');
        if (tilemap) {
            this.tilemap = tilemap;
            console.log('Initial tilemap loaded successfully');
        } else {
            console.warn('Failed to load initial tilemap, using default');
        }
        
        this.gameLoop();
    }
}
