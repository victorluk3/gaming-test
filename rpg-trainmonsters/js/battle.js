/**
 * Estados posibles de una batalla
 */
const BATTLE_STATES = {
    PLAYER_TURN: 'player_turn',
    ENEMY_TURN: 'enemy_turn',
    PLAYER_WIN: 'player_win',
    PLAYER_LOSE: 'player_lose',
    BATTLE_END: 'battle_end'
};

/**
 * Estados posibles del menú en batalla
 */
const MENU_STATES = {
    MAIN: 'main',           // Menú principal: Atacar, Cambiar, Huir
    MOVES: 'moves',         // Seleccionar movimiento
    SWITCH: 'switch',       // Seleccionar monstruo a cambiar
    FLEE: 'flee'            // Confirmar huida
};

class BattleSystem {
    /**
     * Crea un sistema de batalla
     * @param {PlayerParty} playerParty - Equipo del jugador
     * @param {Monster} enemyMonster - Monstruo enemigo
     */
    constructor(playerParty, enemyMonster) {
        this.playerParty = playerParty;
        this.playerMon = playerParty.getActiveMon();
        console.log('Jugador envía a:', this.playerMon);
        this.enemyMon = enemyMonster;
        
        this.battleLog = [];
        this.battleState = BATTLE_STATES.PLAYER_TURN; // PLAYER_TURN, ENEMY_TURN, BATTLE_END
        this.menuState = MENU_STATES.MAIN; // Estado del menú
        this.selectedMoveIndex = 0; // Índice del ataque seleccionado
        this.selectedMenuIndex = 0; // Índice del elemento del menú seleccionado
        this.selectedPartyIndex = 0; // Índice del monstruo seleccionado en menú de cambio
        this.canSelectMove = true; // Si el jugador puede seleccionar ataques
        
        // Sistema de log interactivo
        this.currentLogIndex = -1; // Índice del último evento mostrado (-1 = mostrar siguiente)
        this.waitingForLogConfirm = false; // Esperar a que presione K para continuar
        this.pendingAction = null; // Acción pendiente (null, 'enemyTurn', etc)
        
        this.log('¡Comienza la batalla!');
        this.log(`¡${this.enemyMon.name} salvaje aparece!`);
        this.log(`¡Adelante ${this.playerMon.name}!`);
        
        // Asegurar que el menú está en estado correcto
        this.resetMenu();
    }

    /**
     * Agrega un mensaje al log de batalla y marca como necesitando confirmación
     * @param {string} message - Mensaje a agregar
     */
    log(message) {
        this.battleLog.push(message);
        console.log(`[BATALLA] ${message}`);
        // Marcar que hay un nuevo evento para mostrar
        this.waitingForLogConfirm = true;
    }

    /**
     * Confirma el evento actual y avanza al siguiente
     */
    confirmLog() {
        this.currentLogIndex++;
        
        // Si hay más eventos en el log, esperar confirmación del siguiente
        if (this.currentLogIndex < this.battleLog.length - 1) {
            this.waitingForLogConfirm = true;
        } else {
            // Todos los eventos se han mostrado
            this.waitingForLogConfirm = false;
            
            // Ejecutar acción pendiente
            if (this.pendingAction === 'enemyTurn') {
                this.pendingAction = null;
                this.enemyTurn();
            }
        }
    }

    /**
     * Obtiene el último mensaje del log
     * @returns {string} Último mensaje
     */
    getLastLog() {
        return this.battleLog[this.battleLog.length - 1] || '';
    }

    /**
     * Obtiene los últimos N mensajes del log
     * @param {number} count - Número de mensajes
     * @returns {array} Array de mensajes
     */
    getLastLogs(count = 3) {
        return this.battleLog.slice(-count);
    }

    /**
     * Obtiene los eventos del log visibles
     * @returns {array} Últimos eventos para mostrar
     */
    getVisibleLogs() {
        // Mostrar el evento actual y los 2 anteriores
        const start = Math.max(0, this.currentLogIndex - 1);
        const end = this.currentLogIndex + 1;
        return this.battleLog.slice(start, end + 1);
    }

    /**
     * Procesa el turno del jugador
     * @param {number} moveIndex - Índice del ataque seleccionado
     */
    playerTurn(moveIndex) {
        console.log('=== playerTurn() INICIADA ===');
        console.log('moveIndex:', moveIndex, 'canSelectMove:', this.canSelectMove);
        
        if (!this.canSelectMove) {
            console.log('No puede seleccionar movimiento');
            return;
        }
        if (moveIndex >= this.playerMon.moves.length) {
            console.log('Índice de movimiento fuera de rango');
            return;
        }

        this.canSelectMove = false;
        const move = this.playerMon.moves[moveIndex];
        console.log('Movimiento seleccionado:', move.name);

        // Verificar si el ataque acerta
        const hitRoll = Math.random() * 100;
        if (hitRoll > move.accuracy) {
            this.log(`${this.playerMon.name} intentó usar ${move.name}... ¡pero falló!`);
            this.battleState = BATTLE_STATES.ENEMY_TURN;
            console.log('Ataque falló');
            return;
        }

        // Calcular daño
        const damageResult = this.playerMon.calculateDamage(move, this.enemyMon);
        const damage = damageResult.damage;
        this.enemyMon.takeDamage(damage);

        this.log(`${this.playerMon.name} usó ${move.name}!`);
        this.log(`¡Le hizo ${damage} de daño!`);
        console.log(`Daño calculado: ${damage}`);

        if (this.enemyMon.hp <= 0) {
            this.log(`¡${this.enemyMon.name} fue derrotado!`);
            
            // Otorgar XP al monstruo del jugador
            const xpGain = this.enemyMon.level * 5;
            this.log(`¡${this.playerMon.name} ganó ${xpGain} de XP!`);
            
            // Ganar XP y obtener niveles alcanzados
            const levelsUp = this.playerMon.gainXp(xpGain);
            levelsUp.forEach(newLevel => {
                this.log(`¡${this.playerMon.name} subió a nivel ${newLevel}!`);
            });
            
            this.battleState = BATTLE_STATES.PLAYER_WIN;
            this.menuState = MENU_STATES.MAIN;

            return;
        }

        // Preparar para el turno del enemigo, pero esperar confirmación del log
        this.battleState = BATTLE_STATES.ENEMY_TURN;
        this.pendingAction = 'enemyTurn';
        console.log('Turno cambiado a ENEMY_TURN (pendiente)');
        console.log('=== playerTurn() FINALIZADA ===');
    }

    /**
     * Procesa el turno del enemigo
     */
    enemyTurn() {
        // Seleccionar un ataque aleatorio del enemigo
        const randomMoveIndex = Math.floor(Math.random() * this.enemyMon.moves.length);
        const move = this.enemyMon.moves[randomMoveIndex];

        // Verificar si el ataque acerta
        const hitRoll = Math.random() * 100;
        if (hitRoll > move.accuracy) {
            this.log(`¡El ${this.enemyMon.name} intentó usar ${move.name}... pero falló!`);
            this.battleState = BATTLE_STATES.PLAYER_TURN;
            this.canSelectMove = true;
            this.pendingAction = 'returnToMenu';
            return;
        }

        // Calcular daño
        const damageResult = this.enemyMon.calculateDamage(move, this.playerMon);
        const damage = damageResult.damage;
        this.playerMon.takeDamage(damage);

        this.log(`¡El ${this.enemyMon.name} usó ${move.name}!`);
        this.log(`¡Le hizo ${damage} de daño a tu ${this.playerMon.name}!`);

        if (this.playerMon.hp <= 0) {
            this.log(`¡Tu ${this.playerMon.name} fue derrotado!`);
            
            // Intentar enviar el siguiente monstruo
            if (this.playerParty.switchToNext()) {
                this.playerMon = this.playerParty.getActiveMon();
                this.log(`¡${this.playerMon.name} está listo para batallar!`);
                this.battleState = BATTLE_STATES.PLAYER_TURN;
                this.canSelectMove = true;
                this.resetMenu(); // Reiniciar menú
                this.pendingAction = 'returnToMenu';
            } else {
                this.log(`¡Tu equipo fue derrotado!`);
                this.battleState = BATTLE_STATES.PLAYER_LOSE;
                this.pendingAction = null;
            }
        } else {
            this.battleState = BATTLE_STATES.PLAYER_TURN;
            this.canSelectMove = true;
            this.resetMenu(); // Reiniciar menú
            this.pendingAction = 'returnToMenu';
        }
    }

    /**
     * Reinicia el menú al estado inicial
     */
    resetMenu() {
        this.menuState = MENU_STATES.MAIN;
        this.selectedMenuIndex = 0;
        this.selectedMoveIndex = 0;
        this.selectedPartyIndex = 0;
    }

    /**
     * Obtiene el estado actual de la batalla
     * @returns {object} Estado de la batalla
     */
    getState() {
        return {
            state: this.battleState,
            menuState: this.menuState,
            playerMon: {
                name: this.playerMon.name,
                hp: this.playerMon.hp,
                maxHp: this.playerMon.stats.hp,
                level: this.playerMon.level,
                xp: this.playerMon.xp
            },
            enemyMon: {
                name: this.enemyMon.name,
                hp: this.enemyMon.hp,
                maxHp: this.enemyMon.stats.hp,
                level: this.enemyMon.level
            },
            playerMoves: this.playerMon.moves,
            canSelectMove: this.canSelectMove,
            selectedMoveIndex: this.selectedMoveIndex,
            selectedMenuIndex: this.selectedMenuIndex,
            selectedPartyIndex: this.selectedPartyIndex,
            partyMonsters: this.playerParty.monsters,
            waitingForLogConfirm: this.waitingForLogConfirm,
            visibleLogs: this.getVisibleLogs()
        };
    }

    /**
     * Maneja la selección en los menús
     * @param {number} direction - Dirección del movimiento (-1 arriba, 1 abajo)
     */
    navigateMenu(direction) {
        if (this.menuState === MENU_STATES.MAIN) {
            const mainMenuOptions = 3; // Atacar, Cambiar, Huir
            this.selectedMenuIndex = (this.selectedMenuIndex + direction + mainMenuOptions) % mainMenuOptions;
        } else if (this.menuState === MENU_STATES.MOVES) {
            const moveCount = this.playerMon.moves.length;
            this.selectedMoveIndex = (this.selectedMoveIndex + direction + moveCount) % moveCount;
        } else if (this.menuState === MENU_STATES.SWITCH) {
            const partyCount = this.playerParty.monsters.length;
            this.selectedPartyIndex = (this.selectedPartyIndex + direction + partyCount) % partyCount;
        } else if (this.menuState === MENU_STATES.FLEE) {
            this.selectedMenuIndex = (this.selectedMenuIndex + direction + 2) % 2; // Sí, No
        }
    }

    /**
     * Confirma la acción en el menú actual
     */
    confirmMenuAction() {
        if (this.menuState === MENU_STATES.MAIN) {
            // 0: Atacar, 1: Cambiar, 2: Huir
            if (this.selectedMenuIndex === 0) {
                this.menuState = MENU_STATES.MOVES;
                this.selectedMoveIndex = 0;
            } else if (this.selectedMenuIndex === 1) {
                this.menuState = MENU_STATES.SWITCH;
                this.selectedPartyIndex = 0;
            } else if (this.selectedMenuIndex === 2) {
                this.menuState = MENU_STATES.FLEE;
                this.selectedMenuIndex = 0;
            }
        } else if (this.menuState === MENU_STATES.MOVES) {
            // Ejecutar ataque
            this.playerTurn(this.selectedMoveIndex);
        } else if (this.menuState === MENU_STATES.SWITCH) {
            // Cambiar monstruo
            const targetMon = this.playerParty.monsters[this.selectedPartyIndex];
            if (targetMon.hp > 0 && targetMon !== this.playerMon) {
                this.playerParty.currentIndex = this.selectedPartyIndex;
                this.playerMon = targetMon;
                this.log(`¡Adelante ${this.playerMon.name}!`);
                this.battleState = BATTLE_STATES.ENEMY_TURN;
                this.canSelectMove = true;
                this.menuState = MENU_STATES.MAIN;
            }
        } else if (this.menuState === MENU_STATES.FLEE) {
            if (this.selectedMenuIndex === 0) {
                // Confirmar huida
                this.log('¡El jugador huyó de la batalla!');
                this.battleState = BATTLE_STATES.PLAYER_LOSE; // Por ahora tratamos como derrota
            }
            // Si es 1, simplemente volver al menú principal
            this.menuState = MENU_STATES.MAIN;
        }
    }

    /**
     * Vuelve al menú anterior (tecla L)
     */
    goBack() {
        if (this.menuState === MENU_STATES.MOVES || 
            this.menuState === MENU_STATES.SWITCH || 
            this.menuState === MENU_STATES.FLEE) {
            this.menuState = MENU_STATES.MAIN;
            this.selectedMenuIndex = 0;
        }
    }
}
