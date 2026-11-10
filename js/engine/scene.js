// Core Scene & Lighting Configuration
let scene, camera;
let pitchObject, yawObject;

function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090f);
    scene.fog = new THREE.FogExp2(0x06090f, 0.018);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    yawObject = new THREE.Object3D();
    yawObject.position.y = 1.6;
    yawObject.add(pitchObject);
    scene.add(yawObject);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2436, 0.4);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x5a7c99, 0.8);
    moonLight.position.set(50, 80, -40);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0005;
    
    const d = 80;
    moonLight.shadow.camera.left = -d;
    moonLight.shadow.camera.right = d;
    moonLight.shadow.camera.top = d;
    moonLight.shadow.camera.bottom = -d;
    scene.add(moonLight);
}
