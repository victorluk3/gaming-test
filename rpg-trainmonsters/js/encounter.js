// ==================== SISTEMA DE ENCUENTROS ALEATORIOS ====================

/**
 * Estados del juego
 */
const GAME_STATES = {
    EXPLORATION: 'exploration',
    BATTLE: 'battle',
    MENU: 'menu',
    CUTSCENE: 'cutscene'
};

/**
 * Gestor de encuentros aleatorios
 */
class EncounterManager {
    /**
     * Crea un gestor de encuentros
     * @param {number} huntingEncounterRate - Probabilidad de encuentro en zona de caza (0-100, default: 10)
     */
    constructor(huntingEncounterRate = 10) {
        this.huntingEncounterRate = Math.max(0, Math.min(100, huntingEncounterRate));
    }

    /**
     * Verifica si ocurre un encuentro aleatorio
     * @param {TileMap} tilemap - Mapa del juego
     * @param {number} playerGridX - Posición X del jugador en grid
     * @param {number} playerGridY - Posición Y del jugador en grid
     * @returns {object} Resultado: {encountered: boolean, terrainType: string}
     */
    checkEncounter(tilemap, playerGridX, playerGridY) {
        const terrain = tilemap.getTerrain(playerGridX, playerGridY);
        const inHuntingZone = isHuntingZone(terrain);

        // Solo verificar encuentros en zonas de caza
        if (!inHuntingZone) {
            return {
                encountered: false,
                terrainType: terrain,
                reason: 'No está en zona de caza'
            };
        }

        // Generar encuentro basado en probabilidad
        const roll = Math.random() * 100;
        const encountered = roll < this.huntingEncounterRate;

        return {
            encountered,
            terrainType: terrain,
            probability: this.huntingEncounterRate,
            roll: roll.toFixed(2)
        };
    }

    /**
     * Obtiene monstruos enemigos basados en el terreno
     * @param {string} terrainType - Tipo de terreno
     * @param {number} playerLevel - Nivel del jugador (para escalar dificultad)
     * @returns {array} Array de instancias de Monster completas
     */
    generateEnemies(terrainType, playerLevel = 1) {
        // Base de datos de monstruos con todas sus propiedades
        const monsterDatabase = {
            [TERRAIN_TYPES.GRASS]: [
                { name: 'Bulbasaur', type: MONSTER_TYPES.HIERBA, moves: ['Vine Whip', 'Tackle'], stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
                { name: 'Oddish', type: MONSTER_TYPES.HIERBA, moves: ['Absorb', 'Acid'], stats: { hp: 45, attack: 50, defense: 55, spAtk: 75, spDef: 65, speed: 30 } }
            ],
            [TERRAIN_TYPES.HUNTING_GRASS]: [
                { name: 'Bulbasaur', type: MONSTER_TYPES.HIERBA, moves: ['Vine Whip', 'Tackle'], stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 } },
                { name: 'Oddish', type: MONSTER_TYPES.HIERBA, moves: ['Absorb', 'Acid'], stats: { hp: 45, attack: 50, defense: 55, spAtk: 75, spDef: 65, speed: 30 } }
            ],
            [TERRAIN_TYPES.FOREST]: [
                { name: 'Caterpie', type: MONSTER_TYPES.BUG, moves: ['Tackle', 'String Shot'], stats: { hp: 45, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 35 } },
                { name: 'Weedle', type: MONSTER_TYPES.BUG, moves: ['Poison Powder', 'Tackle'], stats: { hp: 40, attack: 35, defense: 30, spAtk: 20, spDef: 20, speed: 50 } },
                { name: 'Bellsprout', type: MONSTER_TYPES.HIERBA, moves: ['Vine Whip', 'Absorb'], stats: { hp: 50, attack: 75, defense: 35, spAtk: 70, spDef: 30, speed: 40 } }
            ],
            [TERRAIN_TYPES.SAND]: [
                { name: 'Sandshrew', type: MONSTER_TYPES.TIERRA, moves: ['Scratch', 'Sand Attack'], stats: { hp: 50, attack: 75, defense: 85, spAtk: 20, spDef: 30, speed: 40 } },
                { name: 'Diglett', type: MONSTER_TYPES.TIERRA, moves: ['Scratch', 'Growl'], stats: { hp: 10, attack: 55, defense: 25, spAtk: 35, spDef: 45, speed: 95 } }
            ],
            [TERRAIN_TYPES.SNOW]: [
                { name: 'Seel', type: MONSTER_TYPES.AGUA, moves: ['Headbutt', 'Body Slam'], stats: { hp: 65, attack: 45, defense: 55, spAtk: 45, spDef: 70, speed: 45 } },
                { name: 'Shellder', type: MONSTER_TYPES.AGUA, moves: ['Protect', 'Brine'], stats: { hp: 30, attack: 65, defense: 100, spAtk: 45, spDef: 25, speed: 40 } }
            ],
            [TERRAIN_TYPES.WATER]: [
                { name: 'Squirtle', type: MONSTER_TYPES.AGUA, moves: ['Tackle', 'Water Gun'], stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 } },
                { name: 'Psyduck', type: MONSTER_TYPES.AGUA, moves: ['Scratch', 'Confusion'], stats: { hp: 50, attack: 52, defense: 48, spAtk: 66, spDef: 48, speed: 55 } }
            ]
        };

        // Obtener monstruos disponibles para este terreno
        const availableMonsters = monsterDatabase[terrainType] || monsterDatabase[TERRAIN_TYPES.GRASS];

        // Seleccionar 1 monstruo aleatorio
        const monsterData = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];

        // Calcular nivel del enemigo (con variación)
        const enemyLevel = Math.max(5, playerLevel + Math.floor(Math.random() * 3) - 1);

        // Crear instancia de Monster
        const enemy = new Monster(
            monsterData.name,
            enemyLevel,
            {
                hp: monsterData.stats.hp,
                attack: monsterData.stats.attack,
                defense: monsterData.stats.defense,
                spAtk: monsterData.stats.spAtk,
                spDef: monsterData.stats.spDef,
                speed: monsterData.stats.speed
            },
            monsterData.type
        );

        // Enseñar movimientos
        const moveTypeMap = {
            'Vine Whip': { type: MONSTER_TYPES.HIERBA, power: 45, category: 'physical' },
            'Tackle': { type: MONSTER_TYPES.NORMAL, power: 40, category: 'physical' },
            'Absorb': { type: MONSTER_TYPES.HIERBA, power: 20, category: 'special' },
            'Acid': { type: MONSTER_TYPES.VENENO, power: 40, category: 'special' },
            'String Shot': { type: MONSTER_TYPES.BUG, power: 0, category: 'status' },
            'Poison Powder': { type: MONSTER_TYPES.VENENO, power: 0, category: 'status' },
            'Scratch': { type: MONSTER_TYPES.NORMAL, power: 40, category: 'physical' },
            'Sand Attack': { type: MONSTER_TYPES.TIERRA, power: 0, category: 'status' },
            'Growl': { type: MONSTER_TYPES.NORMAL, power: 0, category: 'status' },
            'Headbutt': { type: MONSTER_TYPES.NORMAL, power: 70, category: 'physical' },
            'Body Slam': { type: MONSTER_TYPES.NORMAL, power: 85, category: 'physical' },
            'Protect': { type: MONSTER_TYPES.NORMAL, power: 0, category: 'status' },
            'Brine': { type: MONSTER_TYPES.AGUA, power: 65, category: 'special' },
            'Water Gun': { type: MONSTER_TYPES.AGUA, power: 40, category: 'special' },
            'Confusion': { type: MONSTER_TYPES.PSIQUICO, power: 50, category: 'special' }
        };

        monsterData.moves.forEach(moveName => {
            const moveProps = moveTypeMap[moveName] || { type: MONSTER_TYPES.NORMAL, power: 40, category: 'physical' };
            const move = new Move(moveName, moveProps.type, moveProps.power, 100, moveProps.category);
            enemy.learnMove(move);
        });

        return [enemy];
    }

    /**
     * Obtiene información del encuentro
     * @returns {object}
     */
    getInfo() {
        return {
            huntingEncounterRate: this.huntingEncounterRate
        };
    }
}
