/**
 * Masta Ghimau IR Challenge - Logger Module
 * Sprint 1: Centralized logging with environment-based filtering
 * Author: Hussein Mohamed masta ghimau
 */

class Logger {
    constructor() {
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        };

        // Set default level based on environment
        this.currentLevel = this.detectEnvironment() === 'development' 
            ? this.levels.DEBUG 
            : this.levels.WARN;

        this.prefix = '[MastaGhimau]';
        this.enabled = true;
        this.logHistory = [];
        this.maxHistory = 100;

        // Colors for console output
        this.colors = {
            DEBUG: '#6b7280', // gray
            INFO: '#3b82f6',  // blue
            WARN: '#f59e0b',  // amber
            ERROR: '#ef4444'  // red
        };

        this.init();
    }

    init() {
        // Check for URL parameter to override log level
        const urlParams = new URLSearchParams(window.location.search);
        const logLevel = urlParams.get('loglevel');
        if (logLevel && this.levels[logLevel.toUpperCase()] !== undefined) {
            this.currentLevel = this.levels[logLevel.toUpperCase()];
        }

        // Log initialization
        this.info('Logger initialized', { level: this.getLevelName(this.currentLevel) });
    }

    detectEnvironment() {
        // Check for development indicators
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'development';
        }
        // Check for debug mode in URL
        if (window.location.search.includes('debug=true')) {
            return 'development';
        }
        return 'production';
    }

    getLevelName(level) {
        return Object.keys(this.levels).find(key => this.levels[key] === level) || 'UNKNOWN';
    }

    /**
     * Set the minimum log level
     * @param {string} level - DEBUG, INFO, WARN, ERROR, or NONE
     */
    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
            this.info('Log level changed', { newLevel: level });
        }
    }

    /**
     * Enable/disable logging
     */
    enable(enabled = true) {
        this.enabled = enabled;
    }

    /**
     * Check if a log level should be output
     */
    shouldLog(level) {
        return this.enabled && level >= this.currentLevel;
    }

    /**
     * Format log message with timestamp and context
     */
    formatMessage(level, message, context = {}) {
        const timestamp = new Date().toISOString();
        const levelName = this.getLevelName(level);

        return {
            timestamp,
            level: levelName,
            message,
            context: Object.keys(context).length > 0 ? context : undefined
        };
    }

    /**
     * Store log in history
     */
    storeLog(logEntry) {
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistory) {
            this.logHistory.shift();
        }
    }

    /**
     * Output to console with styling
     */
    outputToConsole(level, message, context) {
        const levelName = this.getLevelName(level);
        const color = this.colors[levelName];
        const timestamp = new Date().toLocaleTimeString();

        const consoleMethod = level === this.levels.ERROR ? 'error' :
                             level === this.levels.WARN ? 'warn' :
                             level === this.levels.INFO ? 'info' : 'log';

        // Styled output
        const prefix = `%c${this.prefix} %c[${levelName}] %c${timestamp}`;
        const prefixStyles = [
            'color: #00d4ff; font-weight: bold;',
            `color: ${color}; font-weight: 600;`,
            'color: #6b7280; font-size: 11px;'
        ];

        if (Object.keys(context).length > 0) {
            console[consoleMethod](prefix, ...prefixStyles, '\n', message, '\n', context);
        } else {
            console[consoleMethod](prefix, ...prefixStyles, '\n', message);
        }
    }

    /**
     * Core logging method
     */
    log(level, message, context = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = this.formatMessage(level, message, context);
        this.storeLog(logEntry);
        this.outputToConsole(level, message, context);

        // Also send errors to error handler if available
        if (level === this.levels.ERROR && window.errorHandler) {
            window.errorHandler.handle(
                context.error || new Error(message),
                context.context || 'LOGGER'
            );
        }
    }

    // Public API methods
    debug(message, context = {}) {
        this.log(this.levels.DEBUG, message, context);
    }

    info(message, context = {}) {
        this.log(this.levels.INFO, message, context);
    }

    warn(message, context = {}) {
        this.log(this.levels.WARN, message, context);
    }

    error(message, context = {}) {
        this.log(this.levels.ERROR, message, context);
    }

    /**
     * Log AR-specific events
     */
    ar(event, data = {}) {
        this.info(`AR: ${event}`, { category: 'AR', ...data });
    }

    /**
     * Log performance metrics
     */
    perf(label, duration, metadata = {}) {
        this.debug(`Performance: ${label}`, {
            category: 'PERF',
            duration: `${duration}ms`,
            ...metadata
        });
    }

    /**
     * Log user actions
     */
    action(action, data = {}) {
        this.info(`User Action: ${action}`, {
            category: 'ACTION',
            ...data
        });
    }

    /**
     * Create a timer for performance tracking
     */
    timer(label) {
        const start = performance.now();
        return {
            stop: (metadata = {}) => {
                const duration = performance.now() - start;
                this.perf(label, duration.toFixed(2), metadata);
                return duration;
            }
        };
    }

    /**
     * Group related logs
     */
    group(label, collapsed = false) {
        if (collapsed) {
            console.groupCollapsed(`%c${this.prefix} ${label}`, 'color: #00d4ff; font-weight: bold;');
        } else {
            console.group(`%c${this.prefix} ${label}`, 'color: #00d4ff; font-weight: bold;');
        }
    }

    groupEnd() {
        console.groupEnd();
    }

    /**
     * Get log history
     */
    getHistory(filter = {}) {
        let history = [...this.logHistory];

        if (filter.level) {
            history = history.filter(log => log.level === filter.level);
        }
        if (filter.category) {
            history = history.filter(log => log.context?.category === filter.category);
        }
        if (filter.since) {
            history = history.filter(log => new Date(log.timestamp) >= filter.since);
        }

        return history;
    }

    /**
     * Clear log history
     */
    clearHistory() {
        this.logHistory = [];
        this.debug('Log history cleared');
    }

    /**
     * Export logs as JSON
     */
    export() {
        return JSON.stringify(this.logHistory, null, 2);
    }

    /**
     * Assert condition and log error if false
     */
    assert(condition, message, context = {}) {
        if (!condition) {
            this.error(`Assertion failed: ${message}`, context);
        }
        return condition;
    }

    /**
     * Log object state for debugging
     */
    state(label, obj) {
        this.debug(`State: ${label}`, {
            category: 'STATE',
            value: obj
        });
    }
}

// Create singleton instance
const logger = new Logger();

// Make available globally for debugging
window.logger = logger;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Logger, logger };
}
