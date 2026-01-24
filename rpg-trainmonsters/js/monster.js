// ==================== CLASE MONSTER ====================

class Monster {
    /**
     * Crea un monstruo
     * @param {string} name - Nombre del monstruo
     * @param {number} level - Nivel (1-100)
     * @param {object} stats - Stats del monstruo {hp, attack, defense}
     * @param {string|string[]} types - Tipo o tipos del monstruo (máximo 2)
     * @param {number} xp - Experiencia actual (opcional)
     */
    constructor(name, level, stats = {}, types = MONSTER_TYPES.NORMAL, xp = 0) {
        this.name = name;
        this.level = Math.max(1, Math.min(100, level));
        
        // Stats base
        this.stats = {
            hp: stats.hp || 50,
            attack: stats.attack || 50,
            defense: stats.defense || 50
        };

        // HP actual
        this.currentHp = this.stats.hp;

        // Tipos (máximo 2)
        this.types = this.parseTypes(types);

        // Experiencia
        this.xp = Math.max(0, xp);

        // Movimientos (máximo 4)
        this.moves = [];
    }

    /**
     * Getter para HP actual (compatibilidad con batalla)
     */
    get hp() {
        return this.currentHp;
    }

    /**
     * Setter para HP actual
     */
    set hp(value) {
        this.currentHp = value;
    }

    /**
     * Parsea y valida los tipos
     * @private
     */
    parseTypes(types) {
        let typeArray = Array.isArray(types) ? types : [types];
        
        // Limitar a máximo 2 tipos
        typeArray = typeArray.slice(0, 2);

        // Validar y filtrar tipos
        typeArray = typeArray.filter(type => isValidType(type));

        // Si no hay tipos válidos, usar Normal
        if (typeArray.length === 0) {
            typeArray = [MONSTER_TYPES.NORMAL];
        }

        return typeArray;
    }

    /**
     * Aprende un movimiento
     * @param {Move} move - Movimiento a aprender
     * @returns {boolean} - true si aprendió, false si ya sabe 4 movimientos
     */
    learnMove(move) {
        if (this.moves.length >= 4) {
            console.warn(`${this.name} ya sabe 4 movimientos. No puede aprender más.`);
            return false;
        }

        if (!(move instanceof Move)) {
            console.warn('El objeto proporcionado no es una instancia de Move.');
            return false;
        }

        this.moves.push(move);
        return true;
    }

    /**
     * Aprende movimientos predefinidos según su tipo
     * @param {number} count - Cantidad de movimientos a aprender (1-4)
     */
    learnDefaultMoves(count = 4) {
        count = Math.max(1, Math.min(4, count));

        for (let i = 0; i < count; i++) {
            // Intentar aprender un movimiento del primer tipo
            const type = this.types[0];
            const move = getPredefinedMove(type, i);
            
            if (move && !this.learnMove(move)) {
                break; // Si no puede aprender más, salir
            }
        }
    }

    /**
     * Obtiene un movimiento por índice
     * @param {number} index - Índice del movimiento (0-3)
     * @returns {Move|null}
     */
    getMove(index) {
        return this.moves[index] || null;
    }

    /**
     * Calcula el daño infligido a otro monstruo
     * Fórmula: ( (2*Nivel/5 + 2) * Poder * Ataque / Defensa / 50 + 2 ) * Multiplicador
     * 
     * @param {Move} move - Movimiento a usar
     * @param {Monster} defender - Monstruo defensor
     * @returns {object} - {damage, isCritical, isEffective, hits}
     */
    calculateDamage(move, defender) {
        // Verificar si el movimiento acierta
        const hits = move.hits();
        
        if (!hits) {
            return {
                damage: 0,
                hits: false,
                isCritical: false,
                message: `${move.name} de ${this.name} falló.`
            };
        }

        // Obtener multiplicador de tipo
        const typeMultiplier = getTypeMultiplier(move.type, defender.types);

        // Calcular daño base usando la fórmula
        const levelFactor = (2 * this.level / 5 + 2);
        const damageBase = (levelFactor * move.power * this.stats.attack) / 
                           (defender.stats.defense * 50) + 2;

        // Aplicar multiplicador de tipo
        let damage = Math.floor(damageBase * typeMultiplier);

        // Crítico (5% de probabilidad)
        const isCritical = Math.random() < 0.05;
        if (isCritical) {
            damage = Math.floor(damage * 1.5);
        }

        // Mínimo 1 de daño si acierta
        damage = Math.max(1, damage);

        // Determinar mensaje de efectividad
        let effectMessage = '';
        if (typeMultiplier === 2) {
            effectMessage = 'Es muy efectivo!';
        } else if (typeMultiplier === 0.5) {
            effectMessage = 'No es muy efectivo...';
        }

        return {
            damage,
            hits: true,
            isCritical,
            typeMultiplier,
            effectMessage,
            message: `${this.name} usó ${move.name}!`
        };
    }

    /**
     * Recibe daño de otro monstruo
     * @param {number} damage - Cantidad de daño a recibir
     */
    takeDamage(damage) {
        this.currentHp = Math.max(0, this.currentHp - damage);
    }

    /**
     * Ataca a otro monstruo con un movimiento
     * @param {number} moveIndex - Índice del movimiento a usar (0-3)
     * @param {Monster} defender - Monstruo a atacar
     * @returns {object} - Resultado del ataque
     */
    attack(moveIndex, defender) {
        const move = this.getMove(moveIndex);
        
        if (!move) {
            return {
                success: false,
                message: `${this.name} no tiene movimiento en la posición ${moveIndex}`
            };
        }

        if (!(defender instanceof Monster)) {
            return {
                success: false,
                message: 'El defensor no es un monstruo válido'
            };
        }

        // Calcular daño
        const damageResult = this.calculateDamage(move, defender);

        if (!damageResult.hits) {
            return {
                success: true,
                damage: 0,
                message: damageResult.message
            };
        }

        // Aplicar daño al defensor
        defender.currentHp = Math.max(0, defender.currentHp - damageResult.damage);

        // Construir mensaje de resultado
        let resultMessage = damageResult.message + '\n';
        resultMessage += `Daño infligido: ${damageResult.damage}`;
        
        if (damageResult.isCritical) {
            resultMessage += ' (¡Golpe crítico!)';
        }
        
        if (damageResult.effectMessage) {
            resultMessage += '\n' + damageResult.effectMessage;
        }

        return {
            success: true,
            damage: damageResult.damage,
            isCritical: damageResult.isCritical,
            typeMultiplier: damageResult.typeMultiplier,
            defenderHpRemaining: defender.currentHp,
            message: resultMessage
        };
    }

    /**
     * Cura al monstruo
     * @param {number} amount - Cantidad de HP a restaurar
     */
    heal(amount) {
        this.currentHp = Math.min(this.stats.hp, this.currentHp + amount);
    }

    /**
     * Gana experiencia y verifica si sube de nivel
     * @param {number} amount - Cantidad de XP a ganar
     * @returns {array} Array con los niveles alcanzados (vacío si no sube)
     */
    gainXp(amount) {
        this.xp += Math.max(0, amount);
        const levelsUp = [];

        // Verificar si alcanza 100 XP para subir de nivel
        while (this.xp >= 100 && this.level < 100) {
            this.xp -= 100;
            levelsUp.push(this.levelUp());
        }

        return levelsUp;
    }

    /**
     * Sube de nivel al monstruo
     * @returns {number} El nuevo nivel alcanzado
     */
    levelUp() {
        if (this.level >= 100) return this.level;

        this.level++;

        // Aumentar stats proporcionalmente
        const increment = 1.1; // 10% de aumento por nivel
        this.stats.hp = Math.floor(this.stats.hp * increment);
        this.stats.attack = Math.floor(this.stats.attack * increment);
        this.stats.defense = Math.floor(this.stats.defense * increment);

        // Restaurar HP al subir de nivel
        this.currentHp = this.stats.hp;

        console.log(`${this.name} subió a nivel ${this.level}!`);
        return this.level;
    }

    /**
     * Verifica si el monstruo está derrotado
     * @returns {boolean}
     */
    isFainted() {
        return this.currentHp <= 0;
    }

    /**
     * Obtiene información del monstruo
     * @returns {object}
     */
    getInfo() {
        return {
            name: this.name,
            level: this.level,
            types: this.types,
            xp: this.xp,
            stats: { ...this.stats },
            currentHp: this.currentHp,
            moves: this.moves.map(move => move.getInfo())
        };
    }

    /**
     * Obtiene una representación en string
     * @returns {string}
     */
    toString() {
        const hpPercent = Math.round((this.currentHp / this.stats.hp) * 100);
        const types = this.types.join('/');
        return `${this.name} (Nivel ${this.level}) [${types}] - HP: ${this.currentHp}/${this.stats.hp} (${hpPercent}%)`;
    }
}
