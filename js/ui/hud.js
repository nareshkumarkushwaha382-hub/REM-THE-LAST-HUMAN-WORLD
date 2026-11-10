// UI & HUD Management System
function updateHUD() {
    document.getElementById('bar-health').style.width = `${playerStats.health}%`;
    document.getElementById('bar-hunger').style.width = `${playerStats.hunger}%`;
    document.getElementById('bar-thirst').style.width = `${playerStats.thirst}%`;
    document.getElementById('bar-stamina').style.width = `${playerStats.stamina}%`;
    document.getElementById('bar-oni').style.width = `${oniEnergy}%`;

    document.getElementById('time-display').innerText = WorldClock.getTimeString();
    
    // Compass
    const deg = Math.round((yawObject.rotation.y * (180 / Math.PI)) % 360);
    document.getElementById('compass').innerText = `DIR: ${Math.abs(deg)}°`;

    // Interaction Prompt Check
    let nearest = null;
    let minDist = 2.5;
    interactables.forEach(item => {
        const d = player.position.distanceTo(item.position);
        if (d < minDist) {
            minDist = d;
            nearest = item;
        }
    });

    const promptEl = document.getElementById('interaction-prompt');
    if (nearest) {
        document.getElementById('prompt-action').innerText = nearest.name;
        promptEl.className = 'prompt-visible';
        if (Input.keys['KeyE']) {
            nearest.action();
            interactables.splice(interactables.indexOf(nearest), 1);
            Input.keys['KeyE'] = false;
        }
    } else {
        promptEl.className = 'prompt-hidden';
    }
}

function showPrompt(text) {
    const p = document.getElementById('interaction-prompt');
    p.innerText = text;
    p.className = 'prompt-visible';
    setTimeout(() => { p.className = 'prompt-hidden'; }, 3000);
}
