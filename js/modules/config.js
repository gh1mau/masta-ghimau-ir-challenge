/**
 * Masta Ghimau IR Challenge - Configuration Module
 * Sprint 1: Centralized configuration management
 * Author: Hussein Mohamed masta ghimau
 */

const CONFIG = {
    // Application metadata
    app: {
        name: 'Masta Ghimau IR Challenge',
        version: '1.0.0',
        author: 'Hussein Mohamed masta ghimau',
        repository: 'https://github.com/gh1mau/masta-ghimau-ir-challenge'
    },

    // Environment detection
    environment: (function() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        }
        if (hostname.includes('github.io') || hostname.includes('netlify.app')) {
            return 'production';
        }
        return 'production';
    })(),

    // Feature flags
    features: {
        enableAR: true,
        enableQuizMode: true,
        enableHints: true,
        enableLeaderboard: true,
        enableAnalytics: false,
        enableDebugMode: false
    },

    // Challenge settings
    challenges: {
        maxAttempts: 3,
        hintPenalty: 100,
        attemptPenalty: 50,
        defaultTimeLimit: 300, // 5 minutes in seconds
        minTimeLimit: 60,      // 1 minute
        maxTimeLimit: 600      // 10 minutes
    },

    // Timer settings
    timer: {
        updateInterval: 1000,  // 1 second
        warningThreshold: 60,  // Show warning at 60 seconds
        dangerThreshold: 30,   // Show danger at 30 seconds
        flashThreshold: 10     // Flash at 10 seconds
    },

    // AR settings
    ar: {
        cameraWidth: 640,
        cameraHeight: 480,
        maxObjects: 20,
        objectScale: 1.0,
        selectionRingSize: 0.35,
        labelOffset: 0.5,
        colors: {
            primary: 0x00ff41,    // Cyber green
            secondary: 0x00d4ff,  // Cyan
            warning: 0xffff00,    // Yellow
            danger: 0xff4444,     // Red
            neutral: 0xffffff    // White
        },
        emissive: {
            default: 0x002200,
            selected: 0x444400
        }
    },

    // Leaderboard settings
    leaderboard: {
        maxEntries: 100,
        cleanupHours: 24,
        storageKey: 'mastaGhimauIR_leaderboard',
        syncInterval: 5000,    // 5 seconds for real-time sync
        showTopCount: 10
    },

    // Error handling settings
    errors: {
        showUserMessages: true,
        autoDismissDelay: 5000,  // 5 seconds
        maxStoredErrors: 10,
        logToConsole: true
    },

    // Logging settings
    logging: {
        defaultLevel: 'WARN',   // DEBUG, INFO, WARN, ERROR, NONE
        maxHistory: 100,
        enableColors: true,
        prefix: '[MastaGhimau]'
    },

    // UI settings
    ui: {
        animations: {
            enabled: true,
            duration: 300,      // ms
            easing: 'ease-out'
        },
        scanInstructions: {
            showInitially: true,
            autoHideDelay: 3000  // Hide after 3 seconds when target found
        },
        selection: {
            showRing: true,
            pulseAnimation: true
        }
    },

    // Performance settings
    performance: {
        targetFPS: 60,
        enableProfiling: false,
        maxTextureSize: 1024,
        antialias: true
    },

    // Network settings
    network: {
        timeout: 10000,         // 10 seconds
        retryAttempts: 3,
        retryDelay: 1000      // 1 second
    },

    // Storage settings
    storage: {
        prefix: 'mastaGhimau_',
        version: 1,
        encryption: false
    },

    // Valid scenarios for validation (whitelist)
    // ONLY these scenarios are allowed - reject everything else
    validScenarios: [
        'ransomware',
        'phishing',
        'insider-threat',
        'apt',
        'malware-analysis'
    ],

    // Valid challenge IDs
    validChallengeIds: [0, 1, 2, 3, 4, 5],

    // Object type definitions
    objectTypes: [
        'file',
        'process',
        'network',
        'server',
        'email',
        'link',
        'firewall',
        'code',
        'registry',
        'device',
        'cloud',
        'identity',
        'badge',
        'clock'
    ],

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return this.environment === 'development';
    },

    /**
     * Check if running in production mode
     */
    isProduction() {
        return this.environment === 'production';
    },

    /**
     * Get a configuration value with optional default
     */
    get(path, defaultValue = undefined) {
        const keys = path.split('.');
        let value = this;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    },

    /**
     * Set a configuration value (only for mutable configs)
     */
    set(path, value) {
        const keys = path.split('.');
        let target = this;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in target)) {
                target[key] = {};
            }
            target = target[key];
        }

        target[keys[keys.length - 1]] = value;

        // Log configuration change
        if (window.logger) {
            window.logger.info('Configuration updated', { path, value });
        }
    },

    /**
     * Validate a scenario ID
     */
    isValidScenario(scenario) {
        return this.validScenarios.includes(scenario);
    },

    /**
     * Validate a challenge ID
     */
    isValidChallengeId(id) {
        const numId = parseInt(id, 10);
        return this.validChallengeIds.includes(numId);
    },

    /**
     * Validate an object type
     */
    isValidObjectType(type) {
        return this.objectTypes.includes(type);
    },

    /**
     * Get AR color by name
     */
    getARColor(name) {
        return this.ar.colors[name] || this.ar.colors.primary;
    },

    /**
     * Get feature flag status
     */
    isEnabled(feature) {
        return this.features[feature] === true;
    },

    /**
     * Enable/disable a feature
     */
    toggleFeature(feature, enabled) {
        if (feature in this.features) {
            this.features[feature] = enabled;

            if (window.logger) {
                window.logger.info(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
            }
        }
    },

    /**
     * Export configuration (excluding sensitive data)
     */
    export() {
        return {
            app: this.app,
            environment: this.environment,
            features: this.features,
            challenges: this.challenges,
            timer: this.timer,
            ar: {
                cameraWidth: this.ar.cameraWidth,
                cameraHeight: this.ar.cameraHeight,
                maxObjects: this.ar.maxObjects
            },
            leaderboard: {
                maxEntries: this.leaderboard.maxEntries,
                showTopCount: this.leaderboard.showTopCount
            }
        };
    },

    /**
     * Initialize configuration from URL parameters
     */
    initFromURL() {
        const params = new URLSearchParams(window.location.search);

        // Check for debug mode
        if (params.has('debug')) {
            this.features.enableDebugMode = true;
            this.logging.defaultLevel = 'DEBUG';
        }

        // Check for log level override
        const logLevel = params.get('loglevel');
        if (logLevel && ['DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE'].includes(logLevel.toUpperCase())) {
            this.logging.defaultLevel = logLevel.toUpperCase();
        }

        // Check for feature flags
        params.forEach((value, key) => {
            if (key.startsWith('feature.')) {
                const feature = key.replace('feature.', '');
                if (feature in this.features) {
                    this.features[feature] = value === 'true' || value === '1';
                }
            }
        });

        if (window.logger) {
            window.logger.info('Configuration initialized from URL');
        }
    }
};

// Auto-initialize from URL on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        CONFIG.initFromURL();
    });
}

// Make available globally
window.CONFIG = CONFIG;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG };
}
