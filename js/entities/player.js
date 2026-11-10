// Player Character (Rem) & Mechanics
let player, playerMesh;
let isFirstPerson = false;
let isAwakened = false;
let oniEnergy = 100;

const playerStats = {
    health: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100
};

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let verticalVelocity = 0;
const GRAVITY = 25;
const WALK_SPEED = 10;
const SPRINT_SPEED = 18;
const JUMP_FORCE = 9;
const PLAYER_RADIUS = 0.5;
let thirdPersonDist = 4.5;
let thirdPersonHeight = 2.2;

function createPlayer() {
    player = new THREE.Group();

    // Rem Maid Outfit / Blue Hair Silhouette
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.6 });
    playerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.4, 12), bodyMat);
    playerMesh.position.y = 0.7;
    playerMesh.castShadow = true;
    player.add(playerMesh);

    // Blue Hair & Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0x55aaff }); // Iconic blue hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), headMat);
    head.position.y = 1.55;
    head.castShadow = true;
    player.add(head);

    scene.add(player);
}

function toggleCamera() {
    isFirstPerson = !isFirstPerson;
    const badge = document.getElementById('camera-mode-badge');
    const crosshair = document.getElementById('crosshair');

    if (isFirstPerson) {
        camera.position.set(0, 0, 0);
        playerMesh.visible = false;
        crosshair.style.display = 'block';
    } else {
        camera.position.set(0, thirdPersonHeight, thirdPersonDist);
        playerMesh.visible = true;
        crosshair.style.display = 'none';
    }
}

function triggerOniPower() {
    if (oniEnergy >= 30 && !isAwakened) {
        isAwakened = true;
        oniEnergy -= 30;
        GameAudio.playOniSound();
        scene.fog.color.setHex(0x330033);
        setTimeout(() => {
            isAwakened = false;
            scene.fog.color.setHex(0x06090f);
        }, 6000);
    }
}

function updatePlayer(delta) {
    let currentSpeed = WALK_SPEED;
    const isMoving = Input.keys['KeyW'] || Input.keys['KeyS'] || Input.keys['KeyA'] || Input.keys['KeyD'];

    if (Input.keys['ShiftLeft'] && isMoving && playerStats.stamina > 0) {
        currentSpeed = SPRINT_SPEED;
        playerStats.stamina = Math.max(0, playerStats.stamina - delta * 18);
    } else {
        playerStats.stamina = Math.min(100, playerStats.stamina + delta * 8);
    }

    // Survival stats gradual depletion
    playerStats.hunger = Math.max(0, playerStats.hunger - delta * 0.2);
    playerStats.thirst = Math.max(0, playerStats.thirst - delta * 0.4);

    // Mouse Look
    const mouse = Input.consumeMouse();
    yawObject.rotation.y -= mouse.x * 0.002;
    pitchObject.rotation.x -= mouse.y * 0.002;
    pitchObject.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchObject.rotation.x));

    // Movement Physics
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(Input.keys['KeyW']) - Number(Input.keys['KeyS']);
    direction.x = Number(Input.keys['KeyD']) - Number(Input.keys['KeyA']);
    direction.normalize();

    if (Input.keys['KeyW'] || Input.keys['KeyS']) velocity.z -= direction.z * currentSpeed * 10.0 * delta;
    if (Input.keys['KeyA'] || Input.keys['KeyD']) velocity.x -= direction.x * currentSpeed * 10.0 * delta;

    const moveVector = new THREE.Vector3(-velocity.x * delta, 0, -velocity.z * delta);
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawObject.rotation.y);

    const targetPos = player.position.clone().add(moveVector);

    // Boundary & Colliders Collision
    targetPos.x = Math.max(-110, Math.min(110, targetPos.x));
    targetPos.z = Math.max(-110, Math.min(110, targetPos.z));

    colliders.forEach(col => {
        const dist = targetPos.distanceTo(col.position);
        if (dist < (PLAYER_RADIUS + col.radius)) {
            const push = new THREE.Vector3().subVectors(targetPos, col.position).normalize();
            targetPos.addScaledVector(push, 0.05);
        }
    });

    player.position.copy(targetPos);

    // Gravity & Jump
    verticalVelocity -= GRAVITY * delta;
    player.position.y += verticalVelocity * delta;
    if (player.position.y <= 0) {
        verticalVelocity = 0;
        player.position.y = 0;
    }

    if (Input.keys['Space'] && player.position.y === 0) {
        verticalVelocity = JUMP_FORCE;
    }

    // Camera Rig Sync
    yawObject.position.copy(player.position);
    yawObject.position.y += 1.5;

    if (isMoving && !isFirstPerson) {
        playerMesh.rotation.y = yawObject.rotation.y;
        if (Math.random() < 0.05) GameAudio.playFootstep();
    }
}
