// ==================== CLASE PLAYER ====================
class Player extends Sprite {
    constructor(x, y, width = 32, height = 32, tileSize = 32) {
        super(x, y, width, height);
        
        // Configuración de tiles
        this.tileSize = tileSize;
        this.gridX = Math.floor(x / tileSize);
        this.gridY = Math.floor(y / tileSize);
        
        // Movimiento por tiles
        this.speed = 1; // Tiles por movimiento
        this.isMoving = false;
        this.moveProgress = 0;
        this.moveSpeed = 8; // Frames para completar un movimiento
        this.nextDirection = null;
        this.direction = 'down'; // down, up, left, right
        
        // Sprites por dirección
        this.spritesByDirection = {
            'up': null,
            'down': null,
            'left': null,
            'right': null
        };
        
        // Crear un sprite simple de color si no hay imagen
        this.createSimpleSprite();
    }

    createSimpleSprite() {
        // Crear sprites para cada dirección
        const directions = ['down', 'up', 'left', 'right'];
        const colors = {
            'down': '#FF6B6B',   // Rojo (mirando abajo)
            'up': '#FFD93D',     // Amarillo (mirando arriba)
            'left': '#6BCB77',   // Verde (mirando izquierda)
            'right': '#4D96FF'   // Azul (mirando derecha)
        };

        directions.forEach(dir => {
            const spriteCanvas = document.createElement('canvas');
            spriteCanvas.width = 32;
            spriteCanvas.height = 32;
            const ctx = spriteCanvas.getContext('2d');

            // Dibujar personaje con color según dirección
            ctx.fillStyle = colors[dir];
            ctx.fillRect(8, 4, 16, 12); // Cuerpo
            ctx.fillRect(8, 16, 16, 8); // Piernas

            ctx.fillStyle = '#FDB4B4';
            ctx.fillRect(10, 0, 12, 4); // Cabeza

            ctx.fillStyle = '#000';
            ctx.fillRect(12, 1, 2, 2); // Ojo izq
            ctx.fillRect(18, 1, 2, 2); // Ojo der
            
            // Agregar indicador de dirección
            ctx.fillStyle = '#FFF';
            switch(dir) {
                case 'up':
                    ctx.fillRect(14, 2, 4, 2); // Marca arriba
                    break;
                case 'down':
                    ctx.fillRect(14, 27, 4, 2); // Marca abajo
                    break;
                case 'left':
                    ctx.fillRect(2, 14, 2, 4); // Marca izquierda
                    break;
                case 'right':
                    ctx.fillRect(28, 14, 2, 4); // Marca derecha
                    break;
            }

            const spriteImg = new Image();
            spriteImg.src = spriteCanvas.toDataURL();
            this.spritesByDirection[dir] = spriteImg;
        });

        // Usar sprite down como sprite por defecto
        this.image = this.spritesByDirection['down'];
        this.isLoaded = true;
    }

    /**
     * Carga sprites personalizados para una dirección
     * @param {string} direction - 'up', 'down', 'left', 'right'
     * @param {string} imageSrc - URL de la imagen
     */
    setDirectionSprite(direction, imageSrc) {
        if (this.spritesByDirection.hasOwnProperty(direction)) {
            const img = new Image();
            img.onload = () => {
                this.spritesByDirection[direction] = img;
                if (this.direction === direction) {
                    this.image = img;
                }
            };
            img.src = imageSrc;
        }
    }

    /**
     * Inicia movimiento en una dirección
     */
    move(direction, tilemap = null) {
        if (direction && this.spritesByDirection.hasOwnProperty(direction)) {
            // Si no se está moviendo
            if (!this.isMoving) {
                // Si es una dirección diferente a la actual, solo cambiar sprite
                if (direction !== this.direction) {
                    this.direction = direction;
                    this.image = this.spritesByDirection[direction];
                    return; // No iniciar movimiento aún
                }

                // Calcular próxima posición (solo si es la misma dirección)
                let nextGridX = this.gridX;
                let nextGridY = this.gridY;

                switch (direction) {
                    case 'up':
                        nextGridY -= this.speed;
                        break;
                    case 'down':
                        nextGridY += this.speed;
                        break;
                    case 'left':
                        nextGridX -= this.speed;
                        break;
                    case 'right':
                        nextGridX += this.speed;
                        break;
                }

                // Verificar si la próxima posición es válida y transitable
                if (tilemap) {
                    // Si el tilemap existe, validar contra él
                    const isValid = tilemap.isValidPosition(nextGridX, nextGridY);
                    const isWalkable = tilemap.isWalkable(nextGridX, nextGridY);
                    
                    if (!isValid || !isWalkable) {
                        // No se puede mover
                        return;
                    }
                }

                // Iniciar movimiento
                this.startMove(direction);
            } else {
                // Si ya se está moviendo, guardar la dirección pendiente
                this.nextDirection = direction;
            }
        }
    }

    /**
     * Inicia el movimiento efectivo (público)
     */
    startMove(direction) {
        if (direction && this.spritesByDirection.hasOwnProperty(direction)) {
            this.direction = direction;
            this.image = this.spritesByDirection[direction];
            this.isMoving = true;
            this.moveProgress = 0;
        }
    }

    /**
     * Obtiene la siguiente posición basada en dirección
     */
    getNextPosition(direction) {
        let newGridX = this.gridX;
        let newGridY = this.gridY;

        switch (direction) {
            case 'up':
                newGridY -= this.speed;
                break;
            case 'down':
                newGridY += this.speed;
                break;
            case 'left':
                newGridX -= this.speed;
                break;
            case 'right':
                newGridX += this.speed;
                break;
        }

        return { newGridX, newGridY };
    }

    /**
     * Valida si la nueva posición está dentro de los límites
     */
    isValidPosition(gridX, gridY, canvasWidth, canvasHeight) {
        const worldX = gridX * this.tileSize;
        const worldY = gridY * this.tileSize;
        
        return worldX >= 0 &&
               worldY >= 0 &&
               worldX + this.width <= canvasWidth &&
               worldY + this.height <= canvasHeight;
    }

    update(canvasWidth, canvasHeight, tilemap = null) {
        super.update();

        if (this.isMoving) {
            this.moveProgress++;

            // Calcular posición interpolada durante el movimiento
            const progress = this.moveProgress / this.moveSpeed;
            const startX = this.gridX * this.tileSize;
            const startY = this.gridY * this.tileSize;

            let nextGridX = this.gridX;
            let nextGridY = this.gridY;

            switch (this.direction) {
                case 'up':
                    nextGridY = this.gridY - this.speed;
                    break;
                case 'down':
                    nextGridY = this.gridY + this.speed;
                    break;
                case 'left':
                    nextGridX = this.gridX - this.speed;
                    break;
                case 'right':
                    nextGridX = this.gridX + this.speed;
                    break;
            }

            const endX = nextGridX * this.tileSize;
            const endY = nextGridY * this.tileSize;

            // Interpolación suave
            this.x = startX + (endX - startX) * progress;
            this.y = startY + (endY - startY) * progress;

            // Movimiento completado
            if (this.moveProgress >= this.moveSpeed) {
                this.gridX = nextGridX;
                this.gridY = nextGridY;
                this.x = this.gridX * this.tileSize;
                this.y = this.gridY * this.tileSize;
                this.isMoving = false;
                this.moveProgress = 0;

                // Si hay una dirección pendiente, intentar moverse en esa dirección
                if (this.nextDirection) {
                    const nextDir = this.nextDirection;
                    this.nextDirection = null;
                    this.move(nextDir, tilemap);
                }
            }
        } else {
            // Si hay una dirección pendiente y no estamos moviendo
            if (this.nextDirection) {
                const nextDir = this.nextDirection;
                this.nextDirection = null;
                this.move(nextDir, tilemap);
            }
        }

        // Asegurar que el personaje está dentro de límites
        if (tilemap) {
            // Validar contra el mapa
            if (!tilemap.isWalkable(this.gridX, this.gridY)) {
                // Revertir a posición anterior
                this.x = this.gridX * this.tileSize;
                this.y = this.gridY * this.tileSize;
            }
        } else {
            // Validar contra límites del canvas
            if (this.x < 0) {
                this.gridX = 0;
                this.x = 0;
            }
            if (this.y < 0) {
                this.gridY = 0;
                this.y = 0;
            }
            if (this.x + this.width > canvasWidth) {
                this.gridX = Math.floor((canvasWidth - this.width) / this.tileSize);
                this.x = this.gridX * this.tileSize;
            }
            if (this.y + this.height > canvasHeight) {
                this.gridY = Math.floor((canvasHeight - this.height) / this.tileSize);
                this.y = this.gridY * this.tileSize;
            }
        }
    }

    getInfo() {
        return {
            x: this.gridX,
            y: this.gridY,
            worldX: Math.round(this.x),
            worldY: Math.round(this.y),
            direction: this.direction,
            isMoving: this.isMoving
        };
    }
}
