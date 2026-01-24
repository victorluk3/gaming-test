// ==================== SISTEMA DE EQUIPO DEL JUGADOR ====================

/**
 * Equipo del jugador - maneja los monstruos que lleva consigo
 */
class PlayerParty {
    /**
     * Crea un equipo del jugador
     * @param {number} maxSize - Número máximo de monstruos (default: 3)
     */
    constructor(maxSize = 3) {
        this.maxSize = maxSize;
        this.monsters = [];
        this.currentIndex = 0; // Índice del monstruo activo en batalla
        
        // Inicializar con Charmander nivel 8 por defecto
        this.addMonster(this.createDefaultCharmander());
    }

    /**
     * Crea el Charmander por defecto
     * @returns {Monster} Instancia de Charmander
     */
    createDefaultCharmander() {

        const charmander = new Monster(
            'Charmander',  // name
            12, // level
            {
                hp: 50,
                attack: 100,
                defense: 53,
                spAtk: 60,
                spDef: 50,
                speed: 65
            }, // stats
            MONSTER_TYPES.FUEGO,
            0 // xp
        );

        // Enseñar movimientos básicos a Charmander
        // name, type, power = 0, accuracy = 100
        charmander.learnDefaultMoves(4)
        // const scratch = new Move('Arañazo', MONSTER_TYPES.NORMAL, 30, 100, 'physical');
        // const ember = new Move('Llamarada', MONSTER_TYPES.FUEGO, 40, 100, 'special');
        
        // charmander.learnMove(scratch);
        // charmander.learnMove(ember);

        return charmander;
    }

    /**
     * Agrega un monstruo al equipo
     * @param {Monster} monster - Monstruo a agregar
     * @returns {boolean} True si se agregó exitosamente
     */
    addMonster(monster) {
        if (this.monsters.length < this.maxSize) {
            this.monsters.push(monster);
            console.log(`${monster.name} agregado al equipo. (${this.monsters.length}/${this.maxSize})`);
            return true;
        } else {
            console.warn(`Equipo lleno. Máximo ${this.maxSize} monstruos.`);
            return false;
        }
    }

    /**
     * Obtiene el monstruo activo (el que está en batalla)
     * @returns {Monster} Monstruo activo
     */
    getActiveMon() {
        return this.monsters[this.currentIndex] || null;
    }

    /**
     * Cambia al siguiente monstruo disponible
     * @returns {boolean} True si hay otro monstruo disponible
     */
    switchToNext() {
        let nextIndex = this.currentIndex + 1;
        
        while (nextIndex < this.monsters.length) {
            if (this.monsters[nextIndex].hp > 0) {
                this.currentIndex = nextIndex;
                console.log(`¡Adelante ${this.getActiveMon().name}!`);
                return true;
            }
            nextIndex++;
        }
        
        return false; // No hay monstruos vivos disponibles
    }

    /**
     * Verifica si el equipo está derrotado (todos fainted)
     * @returns {boolean} True si todos están derrotados
     */
    isDefeated() {
        return this.monsters.every(mon => mon.hp <= 0);
    }

    /**
     * Obtiene la información del equipo
     * @returns {array} Array con información de cada monstruo
     */
    getInfo() {
        return this.monsters.map((mon, index) => ({
            index,
            name: mon.name,
            level: mon.level,
            hp: mon.hp,
            maxHp: mon.stats.hp,
            type: mon.type,
            isActive: index === this.currentIndex,
            isFainted: mon.hp <= 0
        }));
    }

    /**
     * Restaura la salud de todos los monstruos (después de batalla)
     */
    restoreHealth() {
        this.monsters.forEach(mon => {
            mon.hp = mon.stats.hp;
        });
        this.currentIndex = 0;
    }
}
