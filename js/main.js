// Main Game Engine Loop & Bootstrap
let clock = new THREE.Clock();

function initGame() {
    initScene();
    initRenderer(scene, camera);
    createTokyoPark();
    createPlayer();
    spawnInitialZombies();

    // Start Button Listener
    document.getElementById('start-btn').addEventListener('click', () => {
        document.body.requestPointerLock();
        GameAudio.init();
        document.getElementById('instructions').style.display = 'none';
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (document.pointerLockElement === document.body) {
        WorldClock.update(delta);
        updatePlayer(delta);
        updateZombies(delta, player.position);
        updateHUD();
    }

    composer.render();
}

window.onload = initGame;
