// ==================== EJEMPLOS DE USO DEL SISTEMA DE MONSTRUOS ====================

/**
 * Este archivo contiene ejemplos de cómo usar el sistema de monstruos.
 * Para probar, abre la consola del navegador (F12) y ejecuta estos ejemplos.
 */

// ========== EJEMPLO 1: Crear monstruos ==========
function ejemplo1_crearMonstruos() {
    console.log('=== EJEMPLO 1: Crear Monstruos ===');

    // Crear un monstruo de agua
    const squirtle = new Monster('Squirtle', 5, {
        hp: 44,
        attack: 48,
        defense: 65
    }, MONSTER_TYPES.AGUA);

    // Crear un monstruo de fuego
    const charmander = new Monster('Charmander', 5, {
        hp: 39,
        attack: 52,
        defense: 43
    }, MONSTER_TYPES.FUEGO);

    // Crear un monstruo de hierba con dos tipos
    const bulbasaur = new Monster('Bulbasaur', 5, {
        hp: 45,
        attack: 49,
        defense: 49
    }, [MONSTER_TYPES.HIERBA, MONSTER_TYPES.VENENO]);

    console.log(squirtle.toString());
    console.log(charmander.toString());
    console.log(bulbasaur.toString());

    return { squirtle, charmander, bulbasaur };
}

// ========== EJEMPLO 2: Aprender movimientos ==========
function ejemplo2_aprenderMovimientos() {
    console.log('\n=== EJEMPLO 2: Aprender Movimientos ===');

    const pikachu = new Monster('Pikachu', 10, {
        hp: 35,
        attack: 55,
        defense: 40
    }, MONSTER_TYPES.ELECTRICO);

    // Aprender movimientos predefinidos
    pikachu.learnDefaultMoves(4);

    console.log(`\n${pikachu.name} aprendió los siguientes movimientos:`);
    pikachu.moves.forEach((move, index) => {
        console.log(`  ${index + 1}. ${move.name} (Tipo: ${move.type}, Poder: ${move.power}, Precisión: ${move.accuracy}%)`);
    });

    return pikachu;
}

// ========== EJEMPLO 3: Sistema de combate ==========
function ejemplo3_combate() {
    console.log('\n=== EJEMPLO 3: Combate Simple ===');

    // Crear combatientes
    const charizard = new Monster('Charizard', 15, {
        hp: 78,
        attack: 84,
        defense: 78
    }, [MONSTER_TYPES.FUEGO, MONSTER_TYPES.VIENTO]);

    const blastoise = new Monster('Blastoise', 15, {
        hp: 79,
        attack: 83,
        defense: 100
    }, MONSTER_TYPES.AGUA);

    // Enseñar movimientos
    charizard.learnDefaultMoves(4);
    blastoise.learnDefaultMoves(4);

    console.log(`\nCombate entre ${charizard.name} y ${blastoise.name}\n`);

    // Ronda 1: Charizard ataca
    console.log(`--- Turno de ${charizard.name} ---`);
    const ataque1 = charizard.attack(1, blastoise); // Lanza Llamas
    console.log(ataque1.message);
    console.log(`${blastoise.name} ahora tiene ${blastoise.currentHp}/${blastoise.stats.hp} HP\n`);

    // Ronda 2: Blastoise ataca
    console.log(`--- Turno de ${blastoise.name} ---`);
    const ataque2 = blastoise.attack(0, charizard); // Chorro de Agua
    console.log(ataque2.message);
    console.log(`${charizard.name} ahora tiene ${charizard.currentHp}/${charizard.stats.hp} HP\n`);

    // Ronda 3: Charizard ataca con ventaja
    console.log(`--- Turno de ${charizard.name} ---`);
    const ataque3 = charizard.attack(1, blastoise);
    console.log(ataque3.message);
    console.log(`${blastoise.name} ahora tiene ${blastoise.currentHp}/${blastoise.stats.hp} HP\n`);

    return { charizard, blastoise };
}

// ========== EJEMPLO 4: Ventajas de tipos ==========
function ejemplo4_ventajasDetipos() {
    console.log('\n=== EJEMPLO 4: Sistema de Ventajas de Tipos ===');

    // Crear movimientos de diferentes tipos
    const movAgua = new Move('Chorro', MONSTER_TYPES.AGUA, 100, 100);
    const movFuego = new Move('Lanza Llamas', MONSTER_TYPES.FUEGO, 100, 100);
    const movHierba = new Move('Rayo Solar', MONSTER_TYPES.HIERBA, 100, 100);

    // Crear monstruos
    const fuego = new Monster('Vulpix', 10, { hp: 40, attack: 60, defense: 40 }, MONSTER_TYPES.FUEGO);
    const agua = new Monster('Psyduck', 10, { hp: 50, attack: 50, defense: 50 }, MONSTER_TYPES.AGUA);
    const hierba = new Monster('Oddish', 10, { hp: 45, attack: 55, defense: 45 }, MONSTER_TYPES.HIERBA);

    console.log('\nVentajas de tipos:');
    console.log('Agua > Fuego > Hierba > Agua (Ciclo)');

    // Demostrar ventajas
    const ataque1 = agua.attack(0, fuego); // Agua vs Fuego
    console.log(`\nAgua vs Fuego:`);
    console.log(`  Multiplicador: ${ataque1.typeMultiplier}x`);

    const ataque2 = fuego.attack(0, hierba); // Fuego vs Hierba
    console.log(`Fuego vs Hierba:`);
    console.log(`  Multiplicador: ${ataque2.typeMultiplier}x`);

    const ataque3 = hierba.attack(0, agua); // Hierba vs Agua
    console.log(`Hierba vs Agua:`);
    console.log(`  Multiplicador: ${ataque3.typeMultiplier}x`);
}

// ========== EJEMPLO 5: Información detallada ==========
function ejemplo5_informacionDetallada() {
    console.log('\n=== EJEMPLO 5: Información Detallada del Monstruo ===');

    const dragonite = new Monster('Dragonite', 50, {
        hp: 91,
        attack: 134,
        defense: 95
    }, [MONSTER_TYPES.TIERRA, MONSTER_TYPES.VIENTO], 45000);

    dragonite.learnDefaultMoves(4);

    const info = dragonite.getInfo();
    console.log(JSON.stringify(info, null, 2));
}

// ========== FUNCIÓN PARA EJECUTAR TODOS LOS EJEMPLOS ==========
function ejecutarTodosLosEjemplos() {
    ejemplo1_crearMonstruos();
    ejemplo2_aprenderMovimientos();
    ejemplo3_combate();
    ejemplo4_ventajasDetipos();
    ejemplo5_informacionDetallada();
    console.log('\n✅ Todos los ejemplos completados. Abre la consola para ver los resultados.');
}

// Descomenta la siguiente línea para ejecutar automáticamente al cargar la página
// ejecutarTodosLosEjemplos();
