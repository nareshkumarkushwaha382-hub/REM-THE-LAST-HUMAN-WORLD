// Tokyo Park Environment & Colliders
const colliders = [];
const interactables = [];

function createTokyoPark() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(250, 250, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x18241a, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Walking Paths
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x1f242c, roughness: 0.7 });
    const path1 = new THREE.Mesh(new THREE.PlaneGeometry(12, 220), pathMat);
    path1.rotation.x = -Math.PI / 2;
    path1.position.y = 0.02;
    path1.receiveShare = true;
    scene.add(path1);

    const path2 = new THREE.Mesh(new THREE.PlaneGeometry(220, 12), pathMat);
    path2.rotation.x = -Math.PI / 2;
    path2.position.y = 0.02;
    scene.add(path2);

    // Sakura & Pine Trees
    for (let i = 0; i < 50; i++) {
        let x = (Math.random() - 0.5) * 200;
        let z = (Math.random() - 0.5) * 200;
        if (Math.abs(x) < 12 || Math.abs(z) < 12) continue;

        const isSakura = Math.random() > 0.4;
        const group = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.5, 4, 8),
            new THREE.MeshStandardMaterial({ color: 0x221c18, roughness: 0.9 })
        );
        trunk.position.y = 2;
        trunk.castShadow = true;
        group.add(trunk);

        const leaves = new THREE.Mesh(
            isSakura ? new THREE.DodecahedronGeometry(2.8) : new THREE.ConeGeometry(2.5, 5, 8),
            new THREE.MeshStandardMaterial({ color: isSakura ? 0x4a2e3b : 0x132418, roughness: 0.8 })
        );
        leaves.position.y = 4.5;
        leaves.castShadow = true;
        group.add(leaves);

        group.position.set(x, 0, z);
        scene.add(group);
        colliders.push({ position: new THREE.Vector3(x, 0, z), radius: 0.9 });
    }

    // Streetlamps with Warm Lights
    const lampPositions = [{ x: 8, z: 8 }, { x: -8, z: -8 }, { x: 8, z: -50 }, { x: -50, z: 8 }];
    lampPositions.forEach(p => {
        const lamp = new THREE.Group();
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.15, 4.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x161b22, metalness: 0.8 })
        );
        pole.position.y = 2.25;
        lamp.add(pole);

        const lightBulb = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xffaa44 })
        );
        lightBulb.position.y = 4.5;
        lamp.add(lightBulb);

        const point = new THREE.PointLight(0xffaa44, 2.0, 16);
        point.position.y = 4.3;
        point.castShadow = true;
        lamp.add(point);

        lamp.position.set(p.x, 0, p.z);
        scene.add(lamp);
        colliders.push({ position: new THREE.Vector3(p.x, 0, p.z), radius: 0.5 });
    });

    // Park Boundary Wall
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f141c });
    const size = 230;
    [
        { x: 0, z: -size/2, w: size, d: 1 }, { x: 0, z: size/2, w: size, d: 1 },
        { x: -size/2, z: 0, w: 1, d: size }, { x: size/2, z: 0, w: 1, d: size }
    ].forEach(w => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w.w, 3.5, w.d), wallMat);
        wall.position.set(w.x, 1.75, w.z);
        scene.add(wall);
    });

    // Loot Item (Canned Water on a Bench)
    const benchGroup = new THREE.Group();
    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.1, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x2b221e })
    );
    seat.position.y = 0.5;
    benchGroup.add(seat);
    benchGroup.position.set(10, 0, 15);
    scene.add(benchGroup);
    colliders.push({ position: new THREE.Vector3(10, 0, 15), radius: 1.0 });

    interactables.push({
        position: new THREE.Vector3(10, 0.6, 15),
        name: "Bottled Water (+35 Thirst)",
        action: () => {
            playerStats.thirst = Math.min(100, playerStats.thirst + 35);
            showPrompt("Picked up Bottled Water");
        }
    });
}
