/**
 * Main Application Module
 * Phase 3: ES Module Architecture
 * Entry point for the IR Challenge application
 * Author: Hussein Mohamed masta ghimau
 */

import { CONFIG } from './config.js';
import { logger } from './core/logger.js';
import { stateManager } from './core/state-manager.js';
import { uiManager } from './core/ui-manager.js';
import { AREngine } from './core/ar-engine.js';
import { isValidScenario, sanitizeInput, requiresHTTPS, hasCameraAPI } from './utils/helpers.js';

// Import scenarios
import { RansomwareScenario } from './scenarios/ransomware.js';
import { PhishingScenario } from './scenarios/phishing.js';
import { APTScenario } from './scenarios/apt.js';
import { DDoSScenario } from './scenarios/ddos.js';
import { SupplyChainScenario } from './scenarios/supplychain.js';
import { InfoStealerScenario } from './scenarios/infostealer.js';

class IRChallengeApp {
    constructor() {
        this.arEngine = null;
        this.currentScenario = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.playerName = '';

        // Scenario registry
        this.scenarios = {
            'ransomware': RansomwareScenario,
            'phishing': PhishingScenario,
            'apt': APTScenario,
            'ddos': DDoSScenario,
            'supplychain': SupplyChainScenario,
            'infostealer': InfoStealerScenario
        };
    }

    async init() {
        logger.info('Initializing IR Challenge App v' + CONFIG.app.version);

        // Initialize UI Manager
        uiManager.init();

        // Check environment
        this.checkEnvironment();

        // Get player name
        this.playerName = this.getPlayerName();
        if (!this.playerName) {
            uiManager.showError('Name Required', 'Please enter your name to continue.');
            return;
        }

        // Get scenario from URL
        const scenarioType = this.getScenarioFromURL();
        if (!scenarioType || !isValidScenario(scenarioType)) {
            uiManager.showError('Invalid Scenario', 'Please select a valid scenario from the main menu.');
            return;
        }

        // Load scenario
        this.loadScenario(scenarioType);

        // Initialize AR
        await this.initAR();
    }

    checkEnvironment() {
        if (requiresHTTPS()) {
            uiManager.showWarning(
                'HTTPS Required',
                'Camera access requires HTTPS. Please use the HTTPS server.',
                [{ text: 'Go Back', action: () => window.location.href = 'index.html' }]
            );
            return false;
        }

        if (!hasCameraAPI()) {
            uiManager.showError(
                'Camera Not Available',
                'Your browser does not support camera access.'
            );
            return false;
        }

        return true;
    }

    getPlayerName() {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name');
        return name ? sanitizeInput(name) : 'Player';
    }

    getScenarioFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('scenario');
    }

    loadScenario(scenarioType) {
        const ScenarioClass = this.scenarios[scenarioType];
        if (!ScenarioClass) {
            logger.error('Unknown scenario type', { scenario: scenarioType });
            return;
        }

        this.currentScenario = new ScenarioClass();
        this.currentQuestionIndex = 0;
        this.score = 0;

        stateManager.set('scenario', scenarioType);
        stateManager.set('totalQuestions', this.currentScenario.getTotalQuestions());

        uiManager.setScenarioTitle(this.currentScenario.name);
        logger.info('Scenario loaded', { name: this.currentScenario.name });
    }

    async initAR() {
        uiManager.updateStatus('📷', 'Initializing Camera', 'Please allow camera access...');

        this.arEngine = new AREngine();

        const success = await this.arEngine.init(CONFIG.ar.targetPath);
        if (!success) {
            uiManager.showError(
                'AR Initialization Failed',
                'Could not initialize AR. Please check camera permissions.',
                [{ text: 'Retry', action: () => this.initAR() }]
            );
            return;
        }

        // Set up AR event handlers
        this.arEngine.onTargetFound = () => {
            logger.ar('Target found');
            this.onTargetFound();
        };

        this.arEngine.onTargetLost = () => {
            logger.ar('Target lost');
            this.onTargetLost();
        };

        // Start AR
        await this.arEngine.start();

        uiManager.hideStatus();
        uiManager.setTrackingStatus('scanning');
    }

    onTargetFound() {
        uiManager.setTrackingStatus('locked');

        // Add AR content for current scenario
        if (this.arEngine && this.currentScenario) {
            const scenarioType = stateManager.get('scenario');
            const content = this.arEngine.createARContent(scenarioType);
            if (this.arEngine.anchor) {
                this.arEngine.anchor.group.add(content);
            }
        }

        // Show first question
        this.showCurrentQuestion();
    }

    onTargetLost() {
        uiManager.setTrackingStatus('lost');
        uiManager.hideQuestion();
    }

    showCurrentQuestion() {
        if (!this.currentScenario) return;

        const question = this.currentScenario.getQuestion(this.currentQuestionIndex);
        if (!question) {
            this.showCompletion();
            return;
        }

        uiManager.showQuestion(
            question.text,
            question.options,
            (selectedIndex, btn) => this.handleAnswer(selectedIndex, btn)
        );
    }

    handleAnswer(selectedIndex, btn) {
        const question = this.currentScenario.getQuestion(this.currentQuestionIndex);
        if (!question) return;

        const result = this.currentScenario.validateAnswer(this.currentQuestionIndex, selectedIndex);

        uiManager.markAnswer(btn, question.correct, selectedIndex, result.explanation);

        if (result.correct) {
            this.score += CONFIG.scoring.correctAnswer;
            stateManager.set('score', this.score);
        }

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showCurrentQuestion();
        }, CONFIG.timing.questionDelay);
    }

    showCompletion() {
        uiManager.showCompletion(this.score);
        logger.info('Challenge completed', { score: this.score });
    }

    dispose() {
        if (this.arEngine) {
            this.arEngine.dispose();
            this.arEngine = null;
        }
        logger.info('App disposed');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new IRChallengeApp();
    app.init();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.dispose();
    });
});

export { IRChallengeApp };
export default IRChallengeApp;
