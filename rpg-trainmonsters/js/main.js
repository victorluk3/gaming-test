// ==================== INICIAR JUEGO ====================
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
    game.start();

    // Prevenir zoom y comportamientos por defecto en móvil
    document.addEventListener('touchmove', (e) => {
        if (e.target.closest('#controls')) return;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('gesturestart', (e) => e.preventDefault());
});
