/**
 * Core State Manager Module
 * Phase 3: ES Module Architecture
 * Centralized application state management
 */

import { logger } from './logger.js';

class StateManager {
    constructor() {
        this.state = {
            scenario: 'ransomware',
            currentQuestion: 0,
            score: 0,
            arInitialized: false,
            fallbackMode: false,
            playerName: null,
            isRunning: false,
            targetFound: false
        };

        this.listeners = new Map();
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        this.parseURLParams();
        this.initialized = true;
        logger.info('StateManager initialized');
    }

    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);

        // Scenario parameter
        const rawScenario = urlParams.get('scenario') || 'ransomware';
        const sanitizedScenario = this.sanitizeInput(rawScenario);

        if (this.isValidScenario(sanitizedScenario)) {
            this.state.scenario = sanitizedScenario;
        } else {
            logger.warn(`Invalid scenario rejected: ${rawScenario}`);
            this.state.scenario = 'ransomware';
        }

        // Player name parameter
        const playerName = urlParams.get('player');
        if (playerName) {
            const sanitizedName = this.sanitizeInput(playerName);
            if (this.isSafeText(sanitizedName)) {
                this.state.playerName = sanitizedName;
            } else {
                logger.warn('Invalid player name rejected');
            }
        }

        logger.info(`State loaded: scenario=${this.state.scenario}`);
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>\"']/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim()
            .substring(0, 100);
    }

    isSafeText(text) {
        if (!text || typeof text !== 'string') return false;
        const dangerous = /<script|javascript:|on\w+=|data:/i;
        return !dangerous.test(text);
    }

    isValidScenario(scenario) {
        const validScenarios = [
            'ransomware',
            'phishing',
            'apt',
            'insider-threat',
            'malware-analysis',
            'ddos',
            'supplychain',
            'infostealer'
        ];
        return validScenarios.includes(scenario);
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        // Notify listeners
        this.notify(key, value, oldValue);

        logger.debug(`State updated: ${key} = ${value}`);
    }

    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    getAll() {
        return { ...this.state };
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(key)?.delete(callback);
        };
    }

    notify(key, newValue, oldValue) {
        const callbacks = this.listeners.get(key);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(newValue, oldValue, key);
                } catch (error) {
                    logger.error(`State listener error: ${error.message}`);
                }
            });
        }
    }

    incrementScore(points) {
        this.state.score += points;
        this.notify('score', this.state.score, this.state.score - points);
        logger.info(`Score updated: ${this.state.score}`);
    }

    nextQuestion() {
        this.state.currentQuestion++;
        this.notify('currentQuestion', this.state.currentQuestion, this.state.currentQuestion - 1);
    }

    reset() {
        this.state.currentQuestion = 0;
        this.state.score = 0;
        this.state.arInitialized = false;
        this.state.targetFound = false;
        logger.info('State reset');
    }
}

// Singleton instance
const stateManager = new StateManager();

export { StateManager, stateManager };
export default stateManager;
