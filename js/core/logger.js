/**
 * Core Logger Module
 * Phase 3: ES Module Architecture
 * Centralized logging with UI console support
 */

class Logger {
    constructor() {
        this.logs = [];
        this.consoleElement = null;
        this.maxLogs = 100;
    }

    init(consoleElementId = 'debug-console') {
        this.consoleElement = document.getElementById(consoleElementId);
    }

    log(msg, type = 'info') {
        const entry = {
            time: new Date().toLocaleTimeString(),
            msg,
            type
        };

        this.logs.push(entry);

        // Keep only last N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output
        const prefix = `[${type.toUpperCase()}]`;
        switch (type) {
            case 'error':
                console.error(prefix, msg);
                break;
            case 'warn':
                console.warn(prefix, msg);
                break;
            case 'ar':
                console.log('%c[AR]', 'color: #00ff41', msg);
                break;
            default:
                console.log(prefix, msg);
        }

        // UI output
        this.updateUI(entry);
    }

    updateUI(entry) {
        if (!this.consoleElement || this.consoleElement.style.display === 'none') {
            return;
        }

        const div = document.createElement('div');
        div.className = `log-entry log-${entry.type}`;
        div.textContent = `[${entry.time}] ${entry.msg}`;
        this.consoleElement.appendChild(div);
        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
    }

    error(msg) { this.log(msg, 'error'); }
    warn(msg) { this.log(msg, 'warn'); }
    info(msg) { this.log(msg, 'info'); }
    debug(msg) { this.log(msg, 'debug'); }
    ar(msg) { this.log(msg, 'ar'); }

    timer(label) {
        const start = performance.now();
        return {
            stop: (data = {}) => {
                const duration = Math.round(performance.now() - start);
                this.log(`${label}: ${duration}ms`, 'info');
                if (data.error) {
                    this.error(`${label} failed: ${data.error}`);
                }
            }
        };
    }

    show() {
        if (this.consoleElement) {
            this.consoleElement.style.display = 'block';
        }
    }

    hide() {
        if (this.consoleElement) {
            this.consoleElement.style.display = 'none';
        }
    }

    clear() {
        this.logs = [];
        if (this.consoleElement) {
            this.consoleElement.innerHTML = '';
        }
    }

    getLogs() {
        return [...this.logs];
    }
}

// Singleton instance
const logger = new Logger();

export { Logger, logger };
export default logger;
