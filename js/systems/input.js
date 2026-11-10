// Input Management System (Keyboard & Mouse)
const Input = {
    keys: {},
    mouseMovement: { x: 0, y: 0 },
    isLocked: false,

    init() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyV' && typeof toggleCamera === 'function') {
                toggleCamera();
            }
            if (e.code === 'KeyQ' && typeof triggerOniPower === 'function') {
                triggerOniPower();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isLocked) {
                this.mouseMovement.x = e.movementX || 0;
                this.mouseMovement.y = e.movementY || 0;
            } else {
                this.mouseMovement.x = 0;
                this.mouseMovement.y = 0;
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = (document.pointerLockElement === document.body);
        });
    },

    consumeMouse() {
        const move = { x: this.mouseMovement.x, y: this.mouseMovement.y };
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
        return move;
    }
};
Input.init();
