/**
 * Masta Ghimau IR Challenge - Timer Module
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

class ChallengeTimer {
    constructor(duration, onTick, onComplete) {
        this.duration = duration; // in seconds
        this.remaining = duration;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.onTick = onTick || (() => {});
        this.onComplete = onComplete || (() => {});
        this.warningThreshold = 60; // 1 minute
        this.dangerThreshold = 30; // 30 seconds
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.remaining--;
                this.onTick(this.remaining, this.formatTime(this.remaining));
                
                // Check thresholds
                if (this.remaining === this.warningThreshold) {
                    this.onWarning();
                }
                if (this.remaining === this.dangerThreshold) {
                    this.onDanger();
                }
                
                if (this.remaining <= 0) {
                    this.complete();
                }
            }
        }, 1000);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.remaining = this.duration;
    }

    complete() {
        this.stop();
        this.onComplete();
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getProgress() {
        return {
            total: this.duration,
            remaining: this.remaining,
            elapsed: this.duration - this.remaining,
            percentage: ((this.duration - this.remaining) / this.duration) * 100
        };
    }

    onWarning() {
        // Override in implementation
        console.warn('Timer warning: 1 minute remaining');
    }

    onDanger() {
        // Override in implementation
        console.warn('Timer danger: 30 seconds remaining');
    }
}

// Countdown Timer for specific events
class CountdownTimer {
    constructor(targetDate, onTick, onComplete) {
        this.targetDate = targetDate;
        this.onTick = onTick || (() => {});
        this.onComplete = onComplete || (() => {});
        this.intervalId = null;
    }

    start() {
        this.intervalId = setInterval(() => {
            const now = new Date().getTime();
            const distance = this.targetDate - now;

            if (distance < 0) {
                this.complete();
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            this.onTick({ days, hours, minutes, seconds });
        }, 1000);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    complete() {
        this.stop();
        this.onComplete();
    }
}

// Session Timer for tracking total session time
class SessionTimer {
    constructor() {
        this.startTime = null;
        this.elapsed = 0;
        this.isRunning = false;
        this.intervalId = null;
    }

    start() {
        if (this.isRunning) return;
        
        this.startTime = Date.now() - this.elapsed;
        this.isRunning = true;
        
        this.intervalId = setInterval(() => {
            this.elapsed = Date.now() - this.startTime;
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.stop();
        this.elapsed = 0;
        this.startTime = null;
    }

    getElapsed() {
        return this.elapsed;
    }

    formatElapsed() {
        const totalSeconds = Math.floor(this.elapsed / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChallengeTimer, CountdownTimer, SessionTimer };
}
