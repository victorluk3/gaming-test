// ==================== SISTEMA DE TIPOS ====================

const MONSTER_TYPES = {
    // Nombres en español
    AGUA: 'Agua',
    TIERRA: 'Tierra',
    FUEGO: 'Fuego',
    HIERBA: 'Hierba',
    ELECTRICO: 'Eléctrico',
    HIELO: 'Hielo',
    VIENTO: 'Viento',
    NORMAL: 'Normal',
    BUG: 'Bicho',
    VENENO: 'Veneno',
    PSIQUICO: 'Psíquico',
};

/**
 * Tabla de ventajas de tipos
 * key: tipo atacante
 * value: array de tipos a los que gana
 */
const TYPE_ADVANTAGES = {
    [MONSTER_TYPES.AGUA]: [MONSTER_TYPES.FUEGO, MONSTER_TYPES.TIERRA],
    [MONSTER_TYPES.FUEGO]: [MONSTER_TYPES.HIERBA, MONSTER_TYPES.BUG],
    [MONSTER_TYPES.HIERBA]: [MONSTER_TYPES.AGUA, MONSTER_TYPES.TIERRA],
    [MONSTER_TYPES.BUG]: [MONSTER_TYPES.HIERBA, MONSTER_TYPES.PSIQUICO],
    [MONSTER_TYPES.TIERRA]: [MONSTER_TYPES.ELECTRICO, MONSTER_TYPES.FUEGO, MONSTER_TYPES.VENENO],
    [MONSTER_TYPES.ELECTRICO]: [MONSTER_TYPES.AGUA, MONSTER_TYPES.VIENTO],
    [MONSTER_TYPES.HIELO]: [MONSTER_TYPES.VIENTO, MONSTER_TYPES.TIERRA],
    [MONSTER_TYPES.VIENTO]: [MONSTER_TYPES.HIERBA, MONSTER_TYPES.BUG],
    [MONSTER_TYPES.PSIQUICO]: [MONSTER_TYPES.VENENO],
    [MONSTER_TYPES.VENENO]: [MONSTER_TYPES.HIERBA, MONSTER_TYPES.BUG],
    [MONSTER_TYPES.NORMAL]: [],
};

/**
 * Obtiene el multiplicador de tipo basado en ventajas
 * @param {string} typeAtack - Tipo del movimiento atacante
 * @param {string[]} typesDefender - Array de tipos del defensor (máximo 2)
 * @returns {number} Multiplicador (0.5, 1, o 2)
 */
function getTypeMultiplier(typeAttack, typesDefender) {
    // Si el tipo de ataque tiene ventaja sobre alguno de los tipos del defensor
    const advantages = TYPE_ADVANTAGES[typeAttack] || [];
    
    for (let typeDefend of typesDefender) {
        if (advantages.includes(typeDefend)) {
            return 2; // Ventaja efectiva
        }
    }

    // Verificar si el defensor tiene ventaja sobre el atacante
    for (let typeDefend of typesDefender) {
        const defenderAdvantages = TYPE_ADVANTAGES[typeDefend] || [];
        if (defenderAdvantages.includes(typeAttack)) {
            return 0.5; // Desventaja
        }
    }

    return 1; // Neutral
}

/**
 * Valida si un tipo es válido
 * @param {string} type - Tipo a validar
 * @returns {boolean}
 */
function isValidType(type) {
    return Object.values(MONSTER_TYPES).includes(type);
}
