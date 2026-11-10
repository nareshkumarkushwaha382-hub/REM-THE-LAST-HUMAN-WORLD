// --- Game Engine Setup & Variables ---
let scene, camera, renderer;
let clock = new THREE.Clock();

// Player State & Physics Variables
let player, playerMesh;
let isFirstPerson = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isSprinting = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let canJump = false;
let verticalVelocity = 0;

const GRAVITY = 25;
const WALK_SPEED = 12;
const SPRINT_SPEED = 22;
const JUMP_FORCE = 10;
const PLAYER_RADIUS = 0.6;

// Mouse & Camera Controls
let pitchObject, yawObject;
let mouseSensitivity = 0.002;
let thirdPersonDistance = 5;
let thirdPersonHeight = 2.5;

// Survival System Stats (Max = 100)
const stats = {
    health: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100
};

// Colliders List
const colliders = [];

// --- Initialization ---
function init() {
    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);

    // 2. Setup Camera Rigs
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    yawObject = new THREE.Object3D();
    yawObject.position.y = 1.6; // Eye height
    yawObject.add(pitchObject);
    scene.add(yawObject);

    // 3. Create Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 4. Create Lighting
    setupLighting();

    // 5. Build Environment
    createParkEnvironment();

    // 6. Create Player Character Placeholder
    createPlayer();

    // 7. Event Listeners
    setupEvents();

    // 8. Start Animation Loop
    animate();
}

// --- Lighting ---
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.0);
    sunLight.position.set(50, 80, 40);
    sunLight.castShadow = true;
    
    // Shadow Map Tuning
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    const d = 80;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    
    scene.add(sunLight);
}

// --- Environment Generation ---
function createParkEnvironment() {
    // Ground Grass Terrain
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x4e8752, 
        roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Gravel Walking Paths (Cross Roads)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 });
    
    const path1 = new THREE.Mesh(new THREE.PlaneGeometry(12, 180), pathMat);
    path1.rotation.x = -Math.PI / 2;
    path1.position.y = 0.01;
    path1.receiveShadow = true;
    scene.add(path1);

    const path2 = new THREE.Mesh(new THREE.PlaneGeometry(180, 12), pathMat);
    path2.rotation.x = -Math.PI / 2;
    path2.position.y = 0.01;
    path2.receiveShadow = true;
    scene.add(path2);

    // Populate Park Objects
    generateTrees();
    generateBenches();
    generateStreetlamps();
    generateStoneLanterns();
    createParkBoundary();
}

// Sakura & Pine Trees
function generateTrees() {
    const sakuraTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
    const sakuraFoliageMat = new THREE.MeshStandardMaterial({ color: 0xffb7c5, roughness: 0.6 }); // Pink Sakura
    const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x1e4620, roughness: 0.7 });

    for (let i = 0; i < 45; i++) {
        let x = (Math.random() - 0.5) * 160;
        let z = (Math.random() - 0.5) * 160;

        // Keep path center clear
        if (Math.abs(x) < 10 || Math.abs(z) < 10) continue;

        const isSakura = Math.random() > 0.4;
        const treeGroup = new THREE.Group();

        // Trunk
        const trunkHeight = 3 + Math.random() * 2;
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeo, sakuraTrunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage
        if (isSakura) {
            const leavesGeo = new THREE.DodecahedronGeometry(2.5 + Math.random());
            const leaves = new THREE.Mesh(leavesGeo, sakuraFoliageMat);
            leaves.position.y = trunkHeight + 1.5;
            leaves.castShadow = true;
            treeGroup.add(leaves);
        } else {
            const leavesGeo = new THREE.ConeGeometry(2.5, 5, 8);
            const leaves = new THREE.Mesh(leavesGeo, pineFoliageMat);
            leaves.position.y = trunkHeight + 2;
            leaves.castShadow = true;
            treeGroup.add(leaves);
        }

        treeGroup.position.set(x, 0, z);
        scene.add(treeGroup);

        // Add to Physics Colliders
        colliders.push({
            position: new THREE.Vector3(x, 0, z),
            radius: 0.8
        });
    }
}

// Park Benches
function generateBenches() {
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

    const benchPositions = [
        { x: 8, z: 15, rot: Math.PI / 2 },
        { x: -8, z: 25, rot: -Math.PI / 2 },
        { x: 20, z: -8, rot: 0 },
        { x: -30, z: 8, rot: Math.PI }
    ];

    benchPositions.forEach(p => {
        const bench = new THREE.Group();
        
        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.8), benchMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        bench.add(seat);

        // Legs
        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.7), legMat);
        leg1.position.set(-1, 0.25, 0);
        bench.add(leg1);

        const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.7), legMat);
        leg2.position.set(1, 0.25, 0);
        bench.add(leg2);

        bench.position.set(p.x, 0, p.z);
        bench.rotation.y = p.rot;
        scene.add(bench);

        colliders.push({
            position: new THREE.Vector3(p.x, 0, p.z),
            radius: 1.2
        });
    });
}

// Japanese Streetlamps
function generateStreetlamps() {
    const lampPositions = [
        { x: 7, z: 7 }, { x: -7, z: -7 },
        { x: 7, z: -40 }, { x: -40, z: 7 }
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffeaad });

    lampPositions.forEach(p => {
        const lamp = new THREE.Group();

        // Pole
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 4, 8), poleMat);
        pole.position.y = 2;
        pole.castShadow = true;
        lamp.add(pole);

        // Light Fixture
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), lightMat);
        head.position.y = 4;
        lamp.add(head);

        // Point Light Source
        const pointLight = new THREE.PointLight(0xffeaad, 0.8, 15);
        pointLight.position.y = 3.8;
        lamp.add(pointLight);

        lamp.position.set(p.x, 0, p.z);
        scene.add(lamp);

        colliders.push({
            position: new THREE.Vector3(p.x, 0, p.z),
            radius: 0.5
        });
    });
}

// Japanese Stone Lanterns (Tōrō)
function generateStoneLanterns() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });

    const coords = [
        { x: 10, z: -10 },
        { x: -12, z: 12 }
    ];

    coords.forEach(c => {
        const lantern = new THREE.Group();

        // Base & Pillars
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 1), stoneMat);
        base.position.y = 0.15;
        lantern.add(base);

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 6), stoneMat);
        body.position.y = 0.9;
        lantern.add(body);

        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.5, 4), stoneMat);
        roof.position.y = 1.7;
        lantern.add(roof);

        lantern.position.set(c.x, 0, c.z);
        scene.add(lantern);

        colliders.push({
            position: new THREE.Vector3(c.x, 0, c.z),
            radius: 0.8
        });
    });
}

// Outer Boundary Wall
function createParkBoundary() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const size = 190;

    const walls = [
        { x: 0, z: -size/2, w: size, h: 2, d: 1 },
        { x: 0, z: size/2, w: size, h: 2, d: 1 },
        { x: -size/2, z: 0, w: 1, h: 2, d: size },
        { x: size/2, z: 0, w: 1, h: 2, d: size }
    ];

    walls.forEach(w => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
        wall.position.set(w.x, w.h / 2, w.z);
        scene.add(wall);
    });
}

// --- Player Character Creation ---
function createPlayer() {
    player = new THREE.Group();

    // Body Capsule Mesh (Simple Humanoid Placeholder)
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2266cc, roughness: 0.5 });
    playerMesh = new THREE.Mesh(bodyGeo, bodyMat);
    playerMesh.position.y = 0.9;
    playerMesh.castShadow = true;
    player.add(playerMesh);

    // Head
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.8;
    head.castShadow = true;
    player.add(head);

    scene.add(player);
}

// --- Input & Control Listeners ---
function setupEvents() {
    const instructions = document.getElementById('instructions');
    const startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === document.body) {
            instructions.style.display = 'none';
        } else {
            instructions.style.display = 'flex';
        }
    });

    // Mouse Movement
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== document.body) return;

        const movementX = e.movementX || 0;
        const movementY = e.movementY || 0;

        yawObject.rotation.y -= movementX * mouseSensitivity;
        pitchObject.rotation.x -= movementY * mouseSensitivity;

        // Clamp camera pitch angle (look up/down limits)
        pitchObject.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchObject.rotation.x));
    });

    // Keyboard Inputs
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': isSprinting = true; break;
            case 'Space': 
                if (canJump) {
                    verticalVelocity = JUMP_FORCE;
                    canJump = false;
                }
                break;
            case 'KeyV':
                toggleCameraView();
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = false; break;
            case 'KeyS': moveBackward = false; break;
            case 'KeyA': moveLeft = false; break;
            case 'KeyD': moveRight = false; break;
            case 'ShiftLeft': isSprinting = false; break;
        }
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Toggle Camera (First-Person vs Third-Person)
function toggleCameraView() {
    isFirstPerson = !isFirstPerson;
    const badge = document.getElementById('camera-mode-badge');
    const crosshair = document.getElementById('crosshair');

    if (isFirstPerson) {
        camera.position.set(0, 0, 0);
        playerMesh.visible = false; // Hide body in FP mode
        badge.innerText = 'CAMERA: 1ST PERSON [V]';
        crosshair.style.display = 'block';
    } else {
        camera.position.set(0, thirdPersonHeight, thirdPersonDistance);
        playerMesh.visible = true;
        badge.innerText = 'CAMERA: 3RD PERSON [V]';
        crosshair.style.display = 'none';
    }
}

// --- Physics & Collision Handling ---
function checkCollisions(targetPos) {
    // Outer Park Limits Collision
    const limit = 93;
    targetPos.x = Math.max(-limit, Math.min(limit, targetPos.x));
    targetPos.z = Math.max(-limit, Math.min(limit, targetPos.z));

    // Object Collisions (Trees, Lanterns, Benches)
    for (let col of colliders) {
        const dx = targetPos.x - col.position.x;
        const dz = targetPos.z - col.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        const minDistance = PLAYER_RADIUS + col.radius;

        if (distance < minDistance) {
            const overlap = minDistance - distance;
            targetPos.x += (dx / distance) * overlap;
            targetPos.z += (dz / distance) * overlap;
        }
    }
}

// --- Game Logic Update Loop ---
function update(delta) {
    // 1. Stamina & Speed Logic
    let currentSpeed = WALK_SPEED;
    const isMoving = moveForward || moveBackward || moveLeft || moveRight;

    if (isSprinting && isMoving && stats.stamina > 0) {
        currentSpeed = SPRINT_SPEED;
        stats.stamina = Math.max(0, stats.stamina - delta * 20);
    } else {
        stats.stamina = Math.min(100, stats.stamina + delta * 10);
    }

    // 2. Hunger & Thirst Depletion
    stats.hunger = Math.max(0, stats.hunger - delta * 0.3);
    stats.thirst = Math.max(0, stats.thirst - delta * 0.6);

    // Update UI Elements
    document.getElementById('health-bar').style.width = `${stats.health}%`;
    document.getElementById('hunger-bar').style.width = `${stats.hunger}%`;
    document.getElementById('thirst-bar').style.width = `${stats.thirst}%`;
    document.getElementById('stamina-bar').style.width = `${stats.stamina}%`;

    // 3. Player Movement Physics
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * 10.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * 10.0 * delta;

    // Apply Rotation relative to Camera Yaw
    const moveVector = new THREE.Vector3(-velocity.x * delta, 0, -velocity.z * delta);
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawObject.rotation.y);

    // Target Position Calculation
    const targetPosition = player.position.clone().add(moveVector);

    // Collision Check
    checkCollisions(targetPosition);
    player.position.x = targetPosition.x;
    player.position.z = targetPosition.z;

    // Gravity & Jump Physics
    verticalVelocity -= GRAVITY * delta;
    player.position.y += verticalVelocity * delta;

    if (player.position.y <= 0) {
        verticalVelocity = 0;
        player.position.y = 0;
        canJump = true;
    }

    // Synchronize Camera Rig with Player Position
    yawObject.position.copy(player.position);
    yawObject.position.y += 1.6; // Eye level offset

    // Align player model mesh direction with camera orientation when moving
    if (isMoving && !isFirstPerson) {
        playerMesh.rotation.y = yawObject.rotation.y;
    }
}

// --- Main Render Loop ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    update(delta);

    renderer.render(scene, camera);
}

// Start Game Engine
window.onload = () => {
    init();
    // Default initial camera mode: Third Person
    camera.position.set(0, thirdPersonHeight, thirdPersonDistance);
};
