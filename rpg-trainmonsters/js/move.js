// ==================== CLASE MOVE ====================

class Move {
    /**
     * Crea un movimiento
     * @param {string} name - Nombre del movimiento
     * @param {string} type - Tipo del movimiento (debe estar en MONSTER_TYPES)
     * @param {number} power - Poder del movimiento (0-150)
     * @param {number} accuracy - Precisión del movimiento (0-100)
     */
    constructor(name, type, power = 0, accuracy = 100) {
        this.name = name;
        this.type = type;
        this.power = Math.max(0, Math.min(150, power)); // Limitar entre 0 y 150
        this.accuracy = Math.max(0, Math.min(100, accuracy)); // Limitar entre 0 y 100

        // Validar tipo
        if (!isValidType(type)) {
            console.warn(`Tipo inválido: ${type}. Usando 'Normal'.`);
            this.type = MONSTER_TYPES.NORMAL;
        }
    }

    /**
     * Verifica si el movimiento acierta basado en su precisión
     * @returns {boolean}
     */
    hits() {
        return Math.random() * 100 < this.accuracy;
    }

    /**
     * Obtiene información del movimiento
     * @returns {object}
     */
    getInfo() {
        return {
            name: this.name,
            type: this.type,
            power: this.power,
            accuracy: this.accuracy
        };
    }
}

/**
 * Movimientos predefinidos por tipo
 */
const PREDEFINED_MOVES = {
    [MONSTER_TYPES.AGUA]: [
        new Move('Chorro de Agua', MONSTER_TYPES.AGUA, 40, 100),
        new Move('Ola Acuosa', MONSTER_TYPES.AGUA, 60, 100),
        new Move('Hidrobomba', MONSTER_TYPES.AGUA, 110, 80),
        new Move('Lluvia', MONSTER_TYPES.AGUA, 0, 100), // Sin poder, es de soporte
    ],
    [MONSTER_TYPES.FUEGO]: [
        new Move('Ascuas', MONSTER_TYPES.FUEGO, 40, 100),
        new Move('Lanza Llamas', MONSTER_TYPES.FUEGO, 90, 100),
        new Move('Explosión', MONSTER_TYPES.FUEGO, 250, 50),
        new Move('Sofocación', MONSTER_TYPES.FUEGO, 75, 100),
    ],
    [MONSTER_TYPES.HIERBA]: [
        new Move('Polvo Veneno', MONSTER_TYPES.HIERBA, 0, 75),
        new Move('Rayo Solar', MONSTER_TYPES.HIERBA, 120, 100),
        new Move('Látigo Cepa', MONSTER_TYPES.HIERBA, 45, 100),
        new Move('Espora', MONSTER_TYPES.HIERBA, 0, 100),
    ],
    [MONSTER_TYPES.TIERRA]: [
        new Move('Terremoto', MONSTER_TYPES.TIERRA, 100, 100),
        new Move('Lanzarroca', MONSTER_TYPES.TIERRA, 50, 90),
        new Move('Follaje', MONSTER_TYPES.TIERRA, 40, 100),
        new Move('Erupción', MONSTER_TYPES.TIERRA, 150, 100),
    ],
    [MONSTER_TYPES.ELECTRICO]: [
        new Move('Rayo', MONSTER_TYPES.ELECTRICO, 90, 100),
        new Move('Voltio Alterno', MONSTER_TYPES.ELECTRICO, 65, 100),
        new Move('Rayo Carga', MONSTER_TYPES.ELECTRICO, 50, 90),
        new Move('Tormenta Eléctrica', MONSTER_TYPES.ELECTRICO, 110, 70),
    ],
    [MONSTER_TYPES.HIELO]: [
        new Move('Rayo de Hielo', MONSTER_TYPES.HIELO, 90, 100),
        new Move('Neblina Congelante', MONSTER_TYPES.HIELO, 40, 100),
        new Move('Alud', MONSTER_TYPES.HIELO, 75, 90),
        new Move('Ventisca', MONSTER_TYPES.HIELO, 110, 70),
    ],
    [MONSTER_TYPES.VIENTO]: [
        new Move('Tajo Aéreo', MONSTER_TYPES.VIENTO, 60, 100),
        new Move('Tornado', MONSTER_TYPES.VIENTO, 110, 70),
        new Move('Ráfaga', MONSTER_TYPES.VIENTO, 40, 100),
        new Move('Huracán', MONSTER_TYPES.VIENTO, 120, 70),
    ],
    [MONSTER_TYPES.NORMAL]: [
        new Move('Placaje', MONSTER_TYPES.NORMAL, 40, 100),
        new Move('Cabezazo', MONSTER_TYPES.NORMAL, 70, 100),
        new Move('Cuerpo a Cuerpo', MONSTER_TYPES.NORMAL, 120, 75),
        new Move('Grito', MONSTER_TYPES.NORMAL, 0, 100),
    ]
};

/**
 * Obtiene un movimiento predefinido por tipo
 * @param {string} type - Tipo del movimiento
 * @param {number} index - Índice del movimiento (0-3)
 * @returns {Move|null}
 */
function getPredefinedMove(type, index = 0) {
    const moves = PREDEFINED_MOVES[type];
    if (!moves) return null;
    const move = moves[index % moves.length];
    return new Move(move.name, move.type, move.power, move.accuracy);
}
