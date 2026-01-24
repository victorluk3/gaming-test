// ==================== INTERFAZ VISUAL DE BATALLA ====================

/**
 * Renderizador de interfaz de batalla
 */
class BattleUI {
    /**
     * Crea la interfaz de batalla
     * @param {Canvas} canvas - Canvas del juego
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {BattleSystem} battleSystem - Sistema de batalla
     */
    constructor(canvas, ctx, battleSystem) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.battleSystem = battleSystem;
        
        // Colores para la UI
        this.colors = {
            player: '#FF6B6B',      // Rojo
            enemy: '#4D96FF',       // Azul
            background: '#1a1a2e',
            panel: '#16213e',
            text: '#ffffff',
            hp: '#2ecc71',
            damage: '#e74c3c',
            selected: '#FFD700'
        };

        // Layout
        this.padding = 20;
        this.monSize = 80; // Tamaño de los cubos de monstruos
    }

    /**
     * Dibuja la interfaz completa de batalla
     */
    draw() {
        // Dibujar fondo
        this.drawBackground();
        
        // Dibujar monstruos
        this.drawMonsters();
        
        // Dibujar barras de HP
        this.drawHPBars();
        
        // Dibujar información de monstruos
        this.drawMonsterInfo();
        
        // Si está esperando confirmación del log, mostrar overlay del log interactivo
        const state = this.battleSystem.getState();
        if (state.waitingForLogConfirm) {
            this.drawInteractiveLog();
        } else {
            // Dibujar menú según estado
            if (state.menuState === MENU_STATES.MAIN) {
                this.drawMainMenu();
            } else if (state.menuState === MENU_STATES.MOVES) {
                this.drawMoveSelection();
            } else if (state.menuState === MENU_STATES.SWITCH) {
                this.drawSwitchMenu();
            } else if (state.menuState === MENU_STATES.FLEE) {
                this.drawFleeMenu();
            }
        }
        
        // Dibujar log de batalla
        //this.drawBattleLog();
    }

    /**
     * Dibuja el fondo
     */
    drawBackground() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Dibuja los monstruos como cubos de colores
     */
    drawMonsters() {
        const state = this.battleSystem.getState();
        const centerY = this.canvas.height / 2 - this.monSize / 2;

        // Monstruo enemigo (arriba a la izquierda)
        const enemyX = this.padding + 40;
        const enemyY = this.padding + 20;
        this.drawMonsterBox(
            enemyX,
            enemyY,
            this.colors.enemy,
            state.enemyMon.name,
            `Lv. ${state.enemyMon.level}`
        );

        // Monstruo del jugador (abajo a la derecha)
        const playerX = 40;
        const playerY = this.canvas.height - this.padding - this.monSize - 160;
        this.drawMonsterBox(
            playerX,
            playerY,
            this.colors.player,
            state.playerMon.name,
            `Lv. ${state.playerMon.level}`
        );
    }

    /**
     * Dibuja un cubo representando un monstruo
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} color - Color del cubo
     * @param {string} name - Nombre del monstruo
     * @param {string} info - Información adicional
     */
    drawMonsterBox(x, y, color, name, info) {
        // Cubo
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.monSize, this.monSize);

        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, this.monSize, this.monSize);

        // Nombre
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x + this.monSize / 2, y + this.monSize / 2 - 5);

        // Info
        this.ctx.font = '10px Arial';
        this.ctx.fillText(info, x + this.monSize / 2, y + this.monSize / 2 + 10);
    }

    /**
     * Dibuja las barras de HP
     */
    drawHPBars() {
        const state = this.battleSystem.getState();
        const barWidth = 150;
        const barHeight = 20;

        // Barra enemiga (arriba)
        const enemyBarX = this.padding + this.monSize + 40;
        const enemyBarY = this.padding + 30;
        this.drawHPBar(
            enemyBarX,
            enemyBarY,
            barWidth,
            barHeight,
            state.enemyMon.hp,
            state.enemyMon.maxHp
        );

        // Barra del jugador (abajo)
        const playerBarX = this.padding + 40;
        const playerBarY = this.canvas.height - this.padding - 150;
        this.drawHPBar(
            playerBarX,
            playerBarY,
            barWidth,
            barHeight,
            state.playerMon.hp,
            state.playerMon.maxHp
        );
    }

    /**
     * Dibuja una barra de HP individual
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} width - Ancho de la barra
     * @param {number} height - Alto de la barra
     * @param {number} currentHP - HP actual
     * @param {number} maxHP - HP máximo
     */
    drawHPBar(x, y, width, height, currentHP, maxHP) {
        // Fondo (rojo)
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(x, y, width, height);

        // Barra de HP (verde)
        const hpPercent = Math.max(0, currentHP / maxHP);
        const hpWidth = width * hpPercent;
        
        if (currentHP > maxHP / 2) {
            this.ctx.fillStyle = this.colors.hp; // Verde
        } else if (currentHP > maxHP / 4) {
            this.ctx.fillStyle = '#f39c12'; // Naranja
        } else {
            this.ctx.fillStyle = this.colors.damage; // Rojo
        }
        this.ctx.fillRect(x, y, hpWidth, height);

        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Texto de HP
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HP: ${currentHP}/${maxHP}`, x + 5, y + 15);
    }

    /**
     * Dibuja la información de los monstruos
     */
    drawMonsterInfo() {
        const state = this.battleSystem.getState();

        // Info enemiga (arriba)
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(
            `${state.enemyMon.name} (Lv. ${state.enemyMon.level})`,
            this.padding + this.monSize + 40,
            this.padding + 15
        );

        // Info del jugador (abajo)
        this.ctx.fillText(
            `${state.playerMon.name} (Lv. ${state.playerMon.level})`,
            this.padding + 40,
            this.canvas.height - this.padding - 60 - 55
        );

        // Barra de XP del jugador
        this.drawXPBar(state.playerMon.xp);
    }

    /**
     * Dibuja la barra de experiencia
     * @param {number} xp - Experiencia actual del monstruo
     */
    drawXPBar(xp) {
        const barX = this.padding + 40;
        const barY = this.canvas.height - this.padding - 55;
        const barWidth = 150;
        const barHeight = 15;

        // Fondo de la barra
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        // Borde de la barra
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Relleno de XP
        const xpPercent = (xp % 100) / 100;
        const fillWidth = barWidth * xpPercent;
        this.ctx.fillStyle = '#4DB8FF'; // Azul claro para XP
        this.ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Texto de XP
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`XP: ${xp}/100`, barX + 5, barY - 2);
    }

    /**
     * Dibuja la selección de movimientos
     */
    drawMoveSelection() {
        const state = this.battleSystem.getState();
        
        // Panel de selección
        const panelX = this.padding;
        const panelY = this.canvas.height - this.padding - 100;
        const panelWidth = this.canvas.width - this.padding * 2;
        const panelHeight = 90;

        // Fondo del panel
        this.ctx.fillStyle = this.colors.panel;
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Título
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Ataques disponibles:', panelX + 10, panelY + 20);

        // Mostrar movimientos
        const moveStartY = panelY + 35;
        const moveHeight = 25;
        const movesPerRow = 2;

        state.playerMoves.forEach((move, index) => {
            const row = Math.floor(index / movesPerRow);
            const col = index % movesPerRow;
            
            const moveX = panelX + 10 + col * (panelWidth / 2);
            const moveY = moveStartY + row * moveHeight;

            // Fondo de movimiento
            const isSelected = index === this.battleSystem.selectedMoveIndex;
            const bgColor = isSelected ? this.colors.selected : '#2a2a3e';
            this.ctx.fillStyle = bgColor;
            this.ctx.fillRect(moveX, moveY, panelWidth / 2 - 15, moveHeight - 5);

            // Borde
            this.ctx.strokeStyle = isSelected ? this.colors.selected : '#666666';
            this.ctx.lineWidth = isSelected ? 2 : 1;
            this.ctx.strokeRect(moveX, moveY, panelWidth / 2 - 15, moveHeight - 5);

            // Nombre del movimiento
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = isSelected ? 'bold 12px Arial' : '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                `${index + 1}. ${move.name} (${move.type})`,
                moveX + 5,
                moveY + 16
            );
        });

        // Indicador de turno
        if (state.state === BATTLE_STATES.PLAYER_TURN && state.canSelectMove) {
            this.ctx.fillStyle = this.colors.selected;
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('↑↓ Seleccionar | K Aceptar', this.canvas.width - this.padding - 10, panelY + 20);
        } else if (state.state === BATTLE_STATES.ENEMY_TURN) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText('Turno del enemigo...', this.canvas.width - this.padding - 10, panelY + 20);
        }
    }

    /**
     * Dibuja el log de batalla
     */
    drawBattleLog() {
        const logs = this.battleSystem.getLastLogs(2);
        const logX = this.padding;
        const logY = this.canvas.height - this.padding - 40;

        const lineHeight = 20;

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'left';

        logs.forEach((log, index) => {
            this.ctx.fillText(log, logX, logY + index * lineHeight);
        });
    }

    /**
     * Cambia la selección de movimiento
     * @param {number} direction - -1 (arriba), 1 (abajo)
     */
    changeSelection(direction) {
        this.battleSystem.navigateMenu(direction);
    }

    /**
     * Dibuja el menú principal de batalla
     */
    drawMainMenu() {
        const menuX = this.canvas.width - 250;
        const menuY = this.canvas.height - 180;
        const menuWidth = 220;
        const menuHeight = 140;
        const itemHeight = 40;

        // Fondo del menú
        this.ctx.fillStyle = this.colors.panel;
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

        // Opciones del menú
        const options = ['Atacar', 'Cambiar', 'Huir'];
        const state = this.battleSystem.getState();

        options.forEach((option, index) => {
            const optionY = menuY + 15 + index * itemHeight;
            
            // Fondo de selección
            if (index === state.selectedMenuIndex) {
                this.ctx.fillStyle = this.colors.selected;
                this.ctx.fillRect(menuX + 5, optionY - 5, menuWidth - 10, itemHeight - 5);
            }

            // Texto
            this.ctx.fillStyle = index === state.selectedMenuIndex ? '#000000' : this.colors.text;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(option, menuX + 20, optionY + 20);
        });

        // Instrucciones
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('↑↓ Navegar | K Seleccionar', menuX + menuWidth - 10, menuY + menuHeight + 15);
    }

    /**
     * Dibuja el menú de cambio de monstruo
     */
    drawSwitchMenu() {
        const menuX = this.canvas.width - 300;
        const menuY = this.canvas.height - 220;
        const menuWidth = 270;
        const itemHeight = 35;

        const state = this.battleSystem.getState();
        const menuHeight = Math.min(state.partyMonsters.length * itemHeight + 30, 200);

        // Fondo del menú
        this.ctx.fillStyle = this.colors.panel;
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

        // Título
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Elige tu monstruo:', menuX + 15, menuY + 20);

        // Lista de monstruos
        state.partyMonsters.forEach((mon, index) => {
            const optionY = menuY + 40 + index * itemHeight;
            const isAlive = mon.hp > 0;
            const isCurrent = mon === state.playerMon;

            // Fondo de selección
            if (index === state.selectedPartyIndex) {
                this.ctx.fillStyle = this.colors.selected;
                this.ctx.fillRect(menuX + 5, optionY - 5, menuWidth - 10, itemHeight - 5);
            }

            // Texto
            if (!isAlive) {
                this.ctx.fillStyle = '#888888';
            } else if (isCurrent) {
                this.ctx.fillStyle = '#FFD700';
            } else {
                this.ctx.fillStyle = index === state.selectedPartyIndex ? '#000000' : this.colors.text;
            }

            this.ctx.font = index === state.selectedPartyIndex ? 'bold 14px Arial' : '12px Arial';
            this.ctx.textAlign = 'left';
            const hpText = `${mon.name} - HP: ${mon.hp}/${mon.stats.hp}`;
            this.ctx.fillText(hpText, menuX + 20, optionY + 20);
        });

        // Instrucciones
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('L Volver | K Cambiar', menuX + menuWidth - 10, menuY + menuHeight + 15);
    }

    /**
     * Dibuja el menú de confirmación de huida
     */
    drawFleeMenu() {
        const menuX = this.canvas.width / 2 - 100;
        const menuY = this.canvas.height / 2 - 50;
        const menuWidth = 200;
        const menuHeight = 100;

        // Fondo del menú
        this.ctx.fillStyle = this.colors.panel;
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);

        // Título
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¿Escapar de la batalla?', menuX + menuWidth / 2, menuY + 25);

        // Opciones
        const state = this.battleSystem.getState();
        const options = ['Sí', 'No'];
        
        options.forEach((option, index) => {
            const optionX = menuX + 30 + index * 110;
            const optionY = menuY + 50;

            // Fondo de selección
            if (index === state.selectedMenuIndex) {
                this.ctx.fillStyle = this.colors.selected;
                this.ctx.fillRect(optionX - 10, optionY - 15, 60, 30);
            }

            // Texto
            this.ctx.fillStyle = index === state.selectedMenuIndex ? '#000000' : this.colors.text;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(option, optionX + 20, optionY + 5);
        });

        // Instrucciones
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('↑↓ Navegar | K Confirmar', menuX + menuWidth / 2, menuY + menuHeight + 15);
    }

    /**
     * Dibuja el log interactivo que bloquea el menú
     */
    drawInteractiveLog() {
        const state = this.battleSystem.getState();
        
        // Panel de log
        const logX = this.canvas.width / 2 - 200;
        const logY = this.canvas.height - 155;
        const logWidth = 400;
        const logHeight = 150;

        // Fondo oscuro del panel
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(logX, logY, logWidth, logHeight);

        // Borde del panel
        this.ctx.strokeStyle = this.colors.selected;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(logX, logY, logWidth, logHeight);

        // Mostrar eventos visibles
        const visibleLogs = state.visibleLogs || [];
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';

        if (visibleLogs.length === 0) {
            this.ctx.fillText('...', this.canvas.width / 2, logY + 50);
        } else {
            visibleLogs.forEach((log, index) => {
                const textY = logY + 20 + index * 30;
                
                // Resaltar el evento actual
                if (index === visibleLogs.length - 1) {
                    this.ctx.fillStyle = this.colors.selected;
                    this.ctx.font = 'bold 16px Arial';
                } else {
                    this.ctx.fillStyle = '#888888';
                    this.ctx.font = '12px Arial';
                }

                // Dividir texto largo en múltiples líneas
                const words = log.split(' ');
                let currentLine = '';
                const lines = [];

                words.forEach(word => {
                    if ((currentLine + word).length > 35) {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine += (currentLine ? ' ' : '') + word;
                    }
                });
                if (currentLine) lines.push(currentLine);

                const startY = logY + 20 + index * 35;
                lines.forEach((line, lineIndex) => {
                    this.ctx.fillText(line, this.canvas.width / 2, startY + lineIndex * 15);
                });
            });
        }

        // Indicador de presionar K
        this.ctx.fillStyle = this.colors.selected;
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        
        // Parpadear el texto
        const blinkTime = (Date.now() % 1000) > 500;
        if (blinkTime) {
            this.ctx.fillText('PRESIONA K PARA CONTINUAR ►', this.canvas.width / 2, logY + logHeight - 15);
        }
    }
}
