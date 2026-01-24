// ==================== CLASE TILEMAP ====================

class TileMap {
    /**
     * Crea un mapa basado en tiles
     * @param {number} width - Ancho en tiles
     * @param {number} height - Alto en tiles
     * @param {number} tileSize - Tamaño de cada tile en píxeles (default: 32)
     */
    constructor(width, height, tileSize = 32) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        
        // Matriz 2D de tiles (almacena IDs de terrenos)
        this.tiles = [];
        
        // Portales del mapa
        this.portals = [];
        
        // Metadatos
        this.name = 'Untitled Map';
        
        // Inicializar mapa vacío (todo pasto por defecto)
        this.initializeEmptyMap();
    }

    /**
     * Inicializa un mapa vacío (todo pasto)
     * @private
     */
    initializeEmptyMap() {
        this.tiles = [];
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.tiles[y][x] = TERRAIN_DATA[TERRAIN_TYPES.GRASS].id;
            }
        }
    }

    /**
     * Establece un tile en una posición específica
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {string} terrainType - Tipo de terreno
     */
    setTile(x, y, terrainType) {
        if (!this.isValidPosition(x, y)) {
            console.warn(`Posición inválida: (${x}, ${y})`);
            return false;
        }

        const data = getTerrainData(terrainType);
        if (!data) {
            console.warn(`Tipo de terreno inválido: ${terrainType}`);
            return false;
        }

        this.tiles[y][x] = data.id;
        return true;
    }

    /**
     * Obtiene el tipo de terreno en una posición
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {string} Tipo de terreno
     */
    getTerrain(x, y) {
        if (!this.isValidPosition(x, y)) {
            return null;
        }
        const id = this.tiles[y][x];
        return getTerrainTypeById(id);
    }

    /**
     * Obtiene los datos del terreno en una posición
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {object} Datos del terreno
     */
    getTerrainData(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain ? TERRAIN_DATA[terrain] : null;
    }

    /**
     * Verifica si una posición es válida
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {boolean}
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Verifica si una posición es transitable
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {boolean}
     */
    isWalkable(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain ? isTerrainWalkable(terrain) : false;
    }

    /**
     * Verifica si una posición está en zona de caza
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @returns {boolean}
     */
    isInHuntingZone(x, y) {
        const terrain = this.getTerrain(x, y);
        return terrain ? isHuntingZone(terrain) : false;
    }

    /**
     * Dibuja el mapa en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} cameraX - Posición X de la cámara (en píxeles)
     * @param {number} cameraY - Posición Y de la cámara (en píxeles)
     * @param {number} canvasWidth - Ancho del canvas
     * @param {number} canvasHeight - Alto del canvas
     */
    draw(ctx, cameraX = 0, cameraY = 0, canvasWidth = 800, canvasHeight = 600) {
        // Calcular rango de tiles visibles
        const startTileX = Math.floor(cameraX / this.tileSize);
        const startTileY = Math.floor(cameraY / this.tileSize);
        const endTileX = Math.ceil((cameraX + canvasWidth) / this.tileSize);
        const endTileY = Math.ceil((cameraY + canvasHeight) / this.tileSize);

        // Dibujar solo tiles visibles
        for (let y = Math.max(0, startTileY); y < Math.min(this.height, endTileY); y++) {
            for (let x = Math.max(0, startTileX); x < Math.min(this.width, endTileX); x++) {
                const terrain = this.getTerrain(x, y);
                const data = TERRAIN_DATA[terrain];

                // Dibujar tile
                ctx.fillStyle = data.color;
                ctx.fillRect(
                    x * this.tileSize - cameraX,
                    y * this.tileSize - cameraY,
                    this.tileSize,
                    this.tileSize
                );

                // Dibujar borde
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(
                    x * this.tileSize - cameraX,
                    y * this.tileSize - cameraY,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }

    /**
     * Obtiene información del mapa
     * @returns {object}
     */
    getInfo() {
        return {
            width: this.width,
            height: this.height,
            tileSize: this.tileSize,
            totalTiles: this.width * this.height,
            worldWidth: this.width * this.tileSize,
            worldHeight: this.height * this.tileSize
        };
    }

    /**
     * Crea un mapa procedural (demo)
     * Genera un mapa de prueba con diferentes terrenos
     */
    generateDemoMap() {
        // Llenar con pasto base
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setTile(x, y, TERRAIN_TYPES.GRASS);
            }
        }

        // Agregar agua (parte superior)
        for (let y = 0; y < 5; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setTile(x, y, TERRAIN_TYPES.WATER);
            }
        }

        // Agregar pasto de caza (lado derecho)
        for (let y = 0; y < this.height; y++) {
            for (let x = this.width - 5; x < this.width; x++) {
                this.setTile(x, y, TERRAIN_TYPES.HUNTING_GRASS);
            }
        }

        // // Agregar bosque (zona de caza central)
        // for (let y = 8; y < 16; y++) {
        //     for (let x = 8; x < 16; x++) {
        //         this.setTile(x, y, TERRAIN_TYPES.FOREST);
        //     }
        // }

        // // Agregar arena (parte inferior izquierda)
        // for (let y = this.height - 6; y < this.height; y++) {
        //     for (let x = 0; x < 6; x++) {
        //         this.setTile(x, y, TERRAIN_TYPES.SAND);
        //     }
        // }

        // // Agregar nieve (zona de caza lateral)
        // for (let y = 5; y < 8; y++) {
        //     for (let x = 0; x < 5; x++) {
        //         this.setTile(x, y, TERRAIN_TYPES.SNOW);
        //     }
        // }

        return this;
    }
}

