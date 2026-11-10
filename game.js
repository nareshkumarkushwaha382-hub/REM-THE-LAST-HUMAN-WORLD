let scene, camera, renderer, composer;
let clock = new THREE.Clock();

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

let pitchObject, yawObject;
let mouseSensitivity = 0.002;
let thirdPersonDistance = 5;
let thirdPersonHeight = 2.5;

const stats = {
    health: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100
};

const colliders = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090f);
    scene.fog = new THREE.FogExp2(0x06090f, 0.022);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    yawObject = new THREE.Object3D();
    yawObject.position.y = 1.6;
    yawObject.add(pitchObject);
    scene.add(yawObject);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('game-container').appendChild(renderer.domElement);

    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8,  
        0.4,  
        0.85  
    );

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    setupLighting();
    createParkEnvironment();
    createPlayer();
    setupEvents();
    animate();
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x111927, 0.3);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x4a6984, 0.7);
    moonLight.position.set(40, 70, -30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0005;
    
    const d = 70;
    moonLight.shadow.camera.left = -d;
    moonLight.shadow.camera.right = d;
    moonLight.shadow.camera.top = d;
    moonLight.shadow.camera.bottom = -d;
    scene.add(moonLight);
}

function createParkEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(200, 200, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ 
        color: 0x1a241c, 
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pathMat = new THREE.MeshStandardMaterial({ color: 0x1c2128, roughness: 0.6, metalness: 0.2 });
    
    const path1 = new THREE.Mesh(new THREE.PlaneGeometry(10, 180), pathMat);
    path1.rotation.x = -Math.PI / 2;
    path1.position.y = 0.02;
    path1.receiveShadow = true;
    scene.add(path1);

    const path2 = new THREE.Mesh(new THREE.PlaneGeometry(180, 10), pathMat);
    path2.rotation.x = -Math.PI / 2;
    path2.position.y = 0.02;
    path2.receiveShadow = true;
    scene.add(path2);

    generateTrees();
    generateBenches();
    generateStreetlamps();
    generateStoneLanterns();
    createParkBoundary();
}

function generateTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1b1918, roughness: 0.9 });
    const sakuraFoliageMat = new THREE.MeshStandardMaterial({ color: 0x543344, roughness: 0.8 });
    const pineFoliageMat = new THREE.MeshStandardMaterial({ color: 0x132418, roughness: 0.8 });

    for (let i = 0; i < 45; i++) {
        let x = (Math.random() - 0.5) * 160;
        let z = (Math.random() - 0.5) * 160;

        if (Math.abs(x) < 10 || Math.abs(z) < 10) continue;

        const isSakura = Math.random() > 0.4;
        const treeGroup = new THREE.Group();

        const trunkHeight = 3 + Math.random() * 2;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 8), trunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const leaves = new THREE.Mesh(
            isSakura ? new THREE.DodecahedronGeometry(2.5 + Math.random()) : new THREE.ConeGeometry(2.5, 5, 8),
            isSakura ? sakuraFoliageMat : pineFoliageMat
        );
        leaves.position.y = trunkHeight + (isSakura ? 1.5 : 2);
        leaves.castShadow = true;
        treeGroup.add(leaves);

        treeGroup.position.set(x, 0, z);
        scene.add(treeGroup);

        colliders.push({ position: new THREE.Vector3(x, 0, z), radius: 0.8 });
    }
}

function generateBenches() {
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x2b231e, roughness: 0.7 });
    const positions = [{ x: 8, z: 15, rot: Math.PI / 2 }, { x: -8, z: 25, rot: -Math.PI / 2 }, { x: 20, z: -8, rot: 0 }];

    positions.forEach(p => {
        const bench = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.8), benchMat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        bench.add(seat);
        
        bench.position.set(p.x, 0, p.z);
        bench.rotation.y = p.rot;
        scene.add(bench);
        colliders.push({ position: new THREE.Vector3(p.x, 0, p.z), radius: 1.2 });
    });
}

function generateStreetlamps() {
    const lampPositions = [{ x: 7, z: 7 }, { x: -7, z: -7 }, { x: 7, z: -40 }, { x: -40, z: 7 }];
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x161b22, metalness: 0.9, roughness: 0.3 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });

    lampPositions.forEach(p => {
        const lamp = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 4, 8), poleMat);
        pole.position.y = 2;
        pole.castShadow = true;
        lamp.add(pole);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), lightMat);
        head.position.y = 4;
        lamp.add(head);

        const pointLight = new THREE.PointLight(0xff9933, 2.5, 18);
        pointLight.position.y = 3.8;
        pointLight.castShadow = true;
        lamp.add(pointLight);

        lamp.position.set(p.x, 0, p.z);
        scene.add(lamp);
        colliders.push({ position: new THREE.Vector3(p.x, 0, p.z), radius: 0.5 });
    });
}

function generateStoneLanterns() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x3d444b, roughness: 0.9 });
    [{ x: 10, z: -10 }, { x: -12, z: 12 }].forEach(c => {
        const lantern = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 1), stoneMat);
        base.position.y = 0.15;
        lantern.add(base);

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 6), stoneMat);
        body.position.y = 0.9;
        lantern.add(body);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.5, 4), stoneMat);
        roof.position.y = 1.7;
        lantern.add(roof);

        lantern.position.set(c.x, 0, c.z);
        scene.add(lantern);
        colliders.push({ position: new THREE.Vector3(c.x, 0, c.z), radius: 0.8 });
    });
}

function createParkBoundary() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.9 });
    const size = 190;
    [
        { x: 0, z: -size/2, w: size, d: 1 }, { x: 0, z: size/2, w: size, d: 1 },
        { x: -size/2, z: 0, w: 1, d: size }, { x: size/2, z: 0, w: 1, d: size }
    ].forEach(w => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w.w, 3, w.d), wallMat);
        wall.position.set(w.x, 1.5, w.z);
        scene.add(wall);
    });
}

function createPlayer() {
    player = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f242c, roughness: 0.5 });
    playerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 16), bodyMat);
    playerMesh.position.y = 0.9;
    playerMesh.castShadow = true;
    player.add(playerMesh);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xd8a373 }));
    head.position.y = 1.8;
    head.castShadow = true;
    player.add(head);

    scene.add(player);
}

function setupEvents() {
    const instructions = document.getElementById('instructions');
    document.getElementById('start-btn').addEventListener('click', () => document.body.requestPointerLock());

    document.addEventListener('pointerlockchange', () => {
        instructions.style.display = (document.pointerLockElement === document.body) ? 'none' : 'flex';
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement !== document.body) return;
        yawObject.rotation.y -= (e.movementX || 0) * mouseSensitivity;
        pitchObject.rotation.x -= (e.movementY || 0) * mouseSensitivity;
        pitchObject.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchObject.rotation.x));
    });

    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW': moveForward = true; break;
            case 'KeyS': moveBackward = true; break;
            case 'KeyA': moveLeft = true; break;
            case 'KeyD': moveRight = true; break;
            case 'ShiftLeft': isSprinting = true; break;
            case 'Space': if (canJump) { verticalVelocity = JUMP_FORCE; canJump = false; } break;
            case 'KeyV': toggleCameraView(); break;
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

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    });
}

function toggleCameraView() {
    isFirstPerson = !isFirstPerson;
    const badge = document.getElementById('camera-mode-badge');
    const crosshair = document.getElementById('crosshair');

    if (isFirstPerson) {
        camera.position.set(0, 0, 0);
        playerMesh.visible = false;
        badge.innerText = 'CAMERA: 1ST PERSON [V]';
        crosshair.style.display = 'block';
    } else {
        camera.position.set(0, thirdPersonHeight, thirdPersonDistance);
        playerMesh.visible = true;
        badge.innerText = 'CAMERA: 3RD PERSON [V]';
        crosshair.style.display = 'none';
    }
}

function checkCollisions(targetPos) {
    const limit = 93;
    targetPos.x = Math.max(-limit, Math.min(limit, targetPos.x));
    targetPos.z = Math.max(-limit, Math.min(limit, targetPos.z));

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

function update(delta) {
    let currentSpeed = WALK_SPEED;
    const isMoving = moveForward || moveBackward || moveLeft || moveRight;

    if (isSprinting && isMoving && stats.stamina > 0) {
        currentSpeed = SPRINT_SPEED;
        stats.stamina = Math.max(0, stats.stamina - delta * 20);
    } else {
        stats.stamina = Math.min(100, stats.stamina + delta * 10);
    }

    stats.hunger = Math.max(0, stats.hunger - delta * 0.3);
    stats.thirst = Math.max(0, stats.thirst - delta * 0.6);

    document.getElementById('health-bar').style.width = `${stats.health}%`;
    document.getElementById('hunger-bar').style.width = `${stats.hunger}%`;
    document.getElementById('thirst-bar').style.width = `${stats.thirst}%`;
    document.getElementById('stamina-bar').style.width = `${stats.stamina}%`;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * 10.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * 10.0 * delta;

    const moveVector = new THREE.Vector3(-velocity.x * delta, 0, -velocity.z * delta);
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawObject.rotation.y);

    const targetPosition = player.position.clone().add(moveVector);
    checkCollisions(targetPosition);
    player.position.x = targetPosition.x;
    player.position.z = targetPosition.z;

    verticalVelocity -= GRAVITY * delta;
    player.position.y += verticalVelocity * delta;

    if (player.position.y <= 0) {
        verticalVelocity = 0;
        player.position.y = 0;
        canJump = true;
    }

    yawObject.position.copy(player.position);
    yawObject.position.y += 1.6;

    if (isMoving && !isFirstPerson) {
        playerMesh.rotation.y = yawObject.rotation.y;
    }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    update(delta);
    composer.render();
}

window.onload = () => {
    init();
    camera.position.set(0, thirdPersonHeight, thirdPersonDistance);
};
