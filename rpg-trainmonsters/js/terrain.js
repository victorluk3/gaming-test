// ==================== SISTEMA DE TERRENOS ====================

/**
 * Tipos de terreno disponibles
 */
const TERRAIN_TYPES = {
    GRASS: 'grass',
    HUNTING_GRASS: 'hunting_grass',
    WATER: 'water',
    MOUNTAIN: 'mountain',
    SAND: 'sand',
    FOREST: 'forest',
    STONE: 'stone',
    SNOW: 'snow',
    LAVA: 'lava',
    PORTAL: 'portal'
};

/**
 * Propiedades de cada tipo de terreno
 */
const TERRAIN_DATA = {
    [TERRAIN_TYPES.GRASS]: {
        id: 0,
        name: 'Pasto',
        walkable: true,
        huntingZone: false,
        color: '#2d8659',
        symbol: '🌱'
    },
    [TERRAIN_TYPES.WATER]: {
        id: 1,
        name: 'Agua',
        walkable: false,
        huntingZone: false,
        color: '#3a7fd9',
        symbol: '💧'
    },
    [TERRAIN_TYPES.MOUNTAIN]: {
        id: 2,
        name: 'Montaña',
        walkable: false,
        huntingZone: false,
        color: '#8b7355',
        symbol: '⛰️'
    },
    [TERRAIN_TYPES.SAND]: {
        id: 3,
        name: 'Arena',
        walkable: true,
        huntingZone: true,
        color: '#f4d03f',
        symbol: '🏜️'
    },
    [TERRAIN_TYPES.FOREST]: {
        id: 4,
        name: 'Bosque',
        walkable: true,
        huntingZone: true,
        color: '#1b4d2e',
        symbol: '🌲'
    },
    [TERRAIN_TYPES.STONE]: {
        id: 5,
        name: 'Piedra',
        walkable: true,
        huntingZone: false,
        color: '#696969',
        symbol: '🔨'
    },
    [TERRAIN_TYPES.SNOW]: {
        id: 6,
        name: 'Nieve',
        walkable: true,
        huntingZone: true,
        color: '#e8f4f8',
        symbol: '❄️'
    },
    [TERRAIN_TYPES.LAVA]: {
        id: 7,
        name: 'Lava',
        walkable: false,
        huntingZone: false,
        color: '#ff4500',
        symbol: '🔥'
    },
    [TERRAIN_TYPES.HUNTING_GRASS]: {
        id: 8,
        name: 'Pasto de Caza',
        walkable: true,
        huntingZone: true,
        color: '#185e3b',
        symbol: '🌱'
    },
    [TERRAIN_TYPES.PORTAL]: {
        id: 9,
        name: 'Portal',
        walkable: true,
        huntingZone: false,
        color: '#9d4edd',
        symbol: '🌀'
    },
};

/**
 * Obtiene datos de un terreno por tipo
 * @param {string} terrainType - Tipo de terreno
 * @returns {object} Datos del terreno
 */
function getTerrainData(terrainType) {
    return TERRAIN_DATA[terrainType] || null;
}

/**
 * Obtiene tipo de terreno por ID
 * @param {number} id - ID del terreno
 * @returns {string} Tipo de terreno
 */
function getTerrainTypeById(id) {
    for (let [type, data] of Object.entries(TERRAIN_DATA)) {
        if (data.id === id) {
            return type;
        }
    }
    return TERRAIN_TYPES.GRASS; // Default
}

/**
 * Verifica si un terreno es transitable
 * @param {string} terrainType - Tipo de terreno
 * @returns {boolean}
 */
function isTerrainWalkable(terrainType) {
    const data = getTerrainData(terrainType);
    return data ? data.walkable : false;
}

/**
 * Verifica si un terreno es zona de caza
 * @param {string} terrainType - Tipo de terreno
 * @returns {boolean}
 */
function isHuntingZone(terrainType) {
    const data = getTerrainData(terrainType);
    return data ? data.huntingZone : false;
}
