// Time, Weather & Day/Night Cycle
const WorldClock = {
    hour: 6,
    minute: 30,
    day: 1,
    timeSpeed: 10, // 1 real sec = 10 game sec

    update(delta) {
        // Delta in seconds * timeSpeed
        this.minute += delta * this.timeSpeed;
        if (this.minute >= 60) {
            this.minute = 0;
            this.hour = (this.hour + 1) % 24;
            if (this.hour === 0) this.day++;
        }
    },

    getTimeString() {
        const h = Math.floor(this.hour).toString().padStart(2, '0');
        const m = Math.floor(this.minute).toString().padStart(2, '0');
        const ampm = this.hour >= 12 ? 'PM' : 'AM';
        const displayHour = this.hour % 12 === 0 ? 12 : this.hour % 12;
        return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm} | DAY ${this.day}`;
    }
};
