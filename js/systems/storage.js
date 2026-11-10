// LocalStorage Persistence System
const GameStorage = {
    save(playerData, worldData) {
        try {
            const saveState = {
                version: "1.0",
                timestamp: Date.now(),
                player: playerData,
                world: worldData
            };
            localStorage.setItem("rem_save_game", JSON.stringify(saveState));
            console.log("Game saved successfully.");
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    },

    load() {
        try {
            const data = localStorage.getItem("rem_save_game");
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to load game:", e);
            return null;
        }
    },

    clear() {
        localStorage.removeItem("rem_save_game");
    }
};
