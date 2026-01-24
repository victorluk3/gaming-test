// ==================== TILEMAP LOADER ====================

/**
 * Cargador de tilemaps desde archivos JSON
 */
class TileMapLoader {
    /**
     * Carga un tilemap desde un archivo JSON
     * @param {string} path - Ruta del archivo JSON
     * @returns {Promise<TileMap>} Promesa que resuelve con el tilemap cargado
     */
    static async loadFromJson(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Error loading tilemap: ${response.statusText}`);
            }
            
            const data = await response.json();
            return TileMapLoader.createTileMapFromData(data);
        } catch (error) {
            console.error(`Failed to load tilemap from ${path}:`, error);
            return null;
        }
    }

    /**
     * Crea un TileMap desde datos JSON
     * @param {object} data - Datos del tilemap
     * @returns {TileMap} Tilemap creado
     */
    static createTileMapFromData(data) {
        const tilemap = new TileMap(data.width, data.height, data.tileSize || 32);
        
        // Cargar tiles desde el array 2D
        if (data.tiles && Array.isArray(data.tiles)) {
            for (let y = 0; y < data.height; y++) {
                for (let x = 0; x < data.width; x++) {
                    const id = data.tiles[y][x];
                    const terrainType = getTerrainTypeById(id);
                    tilemap.setTile(x, y, terrainType);
                }
            }
        }

        // Cargar portales si existen
        if (data.portals && Array.isArray(data.portals)) {
            tilemap.portals = data.portals;
        } else {
            tilemap.portals = [];
        }

        // Guardar metadatos
        tilemap.name = data.name || 'Untitled Map';

        return tilemap;
    }

    /**
     * Carga la configuración del juego
     * @returns {Promise<object>} Datos de configuración
     */
    static async loadConfig() {
        try {
            const response = await fetch('data/config.json');
            if (!response.ok) {
                throw new Error(`Error loading config: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load config:', error);
            return null;
        }
    }

    /**
     * Obtiene la ruta de un tilemap por su nombre
     * @param {string} tilemapName - Nombre del tilemap en la configuración
     * @returns {Promise<string>} Ruta del tilemap
     */
    static async getTileMapPath(tilemapName) {
        const config = await TileMapLoader.loadConfig();
        if (config && config.tilemaps && config.tilemaps[tilemapName]) {
            return config.tilemaps[tilemapName].path;
        }
        return null;
    }

    /**
     * Obtiene la posición inicial del jugador para un tilemap
     * @param {string} tilemapName - Nombre del tilemap en la configuración
     * @returns {Promise<object>} Objeto con x, y
     */
    static async getPlayerStart(tilemapName) {
        const config = await TileMapLoader.loadConfig();
        if (config && config.tilemaps && config.tilemaps[tilemapName]) {
            return config.tilemaps[tilemapName].playerStart || { x: 0, y: 0 };
        }
        return { x: 0, y: 0 };
    }
}
