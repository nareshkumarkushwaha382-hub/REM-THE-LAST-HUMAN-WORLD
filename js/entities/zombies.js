// Zombie AI & Spawning System
const zombies = [];

class Zombie {
    constructor(x, z) {
        this.group = new THREE.Group();
        
        // Body
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x243022, roughness: 0.9 });
        this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8), bodyMat);
        this.mesh.position.y = 0.75;
        this.mesh.castShadow = true;
        this.group.add(this.mesh);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x6e826b })
        );
        head.position.y = 1.6;
        head.castShadow = true;
        this.group.add(head);

        this.group.position.set(x, 0, z);
        scene.add(this.group);

        this.speed = 3.5;
        this.detectionRange = 25;
    }

    update(delta, playerPos) {
        const dist = this.group.position.distanceTo(playerPos);
        if (dist < this.detectionRange && dist > 1.2) {
            const dir = new THREE.Vector3().subVectors(playerPos, this.group.position).normalize();
            this.group.position.addScaledVector(dir, this.speed * delta);
            this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
        }
    }
}

function spawnInitialZombies() {
    const coords = [{ x: 25, z: 25 }, { x: -30, z: 40 }, { x: 45, z: -35 }, { x: -20, z: -40 }];
    coords.forEach(c => zombies.push(new Zombie(c.x, c.z)));
}

function updateZombies(delta, playerPos) {
    zombies.forEach(z => z.update(delta, playerPos));
}
