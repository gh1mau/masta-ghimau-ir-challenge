/**
 * Main Application Module
 * Phase 3: ES Module Architecture - BUG FREE VERSION
 * Entry point for the IR Challenge application
 * Author: Hussein Mohamed masta ghimau
 */

import { CONFIG } from './config.js';
import { logger } from './core/logger.js';
import { stateManager } from './core/state-manager.js';
import { uiManager } from './core/ui-manager.js';
import { AREngine } from './core/ar-engine.js';
import { initFirebase, leaderboardManager } from './core/firebase-config.js';
import { isValidScenario, sanitizeInput, requiresHTTPS, hasCameraAPI } from './utils/helpers.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

class IRChallengeApp {
    constructor() {
        this.arEngine = null;
        this.currentChallenge = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.playerName = '';
        this.initialized = false;
        this.challengeId = null;
        this.sessionCode = null;
        this.firebaseInitialized = false;
        this.isProcessingTarget = false;
        this.challengeShown = false;
        this.countdownInterval = null;
        this.challengeInfoInterval = null;
        this.leaderboardUnsubscribe = null; // Store unsubscribe function
    }

    async init() {
        try {
            logger.info('Initializing IR Challenge App v' + CONFIG.app.version);

            // Initialize UI Manager first
            uiManager.init();
            this.initialized = true;

            // Check environment
            if (!this.checkEnvironment()) {
                return;
            }

            // Get challenge from URL
            this.challengeId = this.getChallengeFromURL();
            if (!this.challengeId || !CONFIG.challenges[this.challengeId]) {
                uiManager.showError('Invalid Challenge', 'Please select a valid challenge from the main menu.', [
                    { text: 'Go to Menu', action: () => window.location.href = 'index.html' }
                ]);
                return;
            }

            // Load challenge
            this.loadChallenge(this.challengeId);

            // Initialize Firebase
            this.firebaseInitialized = initFirebase();

            // Show nickname entry modal
            this.showNicknameEntry();

        } catch (error) {
            logger.error('App initialization failed', { error: error.message, stack: error.stack });
            uiManager.showError(
                'Initialization Error',
                'Failed to start: ' + error.message,
                [
                    { text: 'Reload', action: () => location.reload() },
                    { text: 'Go Back', class: 'btn-secondary', action: () => window.location.href = 'index.html' }
                ]
            );
        }
    }

    showNicknameEntry() {
        uiManager.showNicknameModal(async (nickname) => {
            this.playerName = nickname;

            // Get session code from URL - MUST match presenter session
            const urlParams = new URLSearchParams(window.location.search);
            this.sessionCode = urlParams.get('session');

            // If no session in URL, try to get from localStorage (set by presenter QR)
            if (!this.sessionCode) {
                this.sessionCode = localStorage.getItem('mastaGhimau_sessionId') || this.challengeId;
            }

            // DEBUG: Show visible debug info on page
            const debugDiv = document.createElement('div');
            debugDiv.id = 'firebase-debug';
            debugDiv.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0,0,0,0.9);
                color: #00ff00;
                padding: 15px;
                border-radius: 8px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                max-width: 400px;
                border: 2px solid #00ff00;
            `;
            debugDiv.innerHTML = `
                <div style="color: #00ffff; font-weight: bold; margin-bottom: 10px;">🔥 Firebase Debug</div>
                <div>Session: ${this.sessionCode}</div>
                <div>Player: ${nickname}</div>
                <div>Firebase: ${this.firebaseInitialized ? '✓ Ready' : '✗ Not Ready'}</div>
                <div id="firebase-status">Status: Initializing...</div>
            `;
            document.body.appendChild(debugDiv);

            console.log('========================================');
            console.log('CHALLENGE PAGE JOINING SESSION');
            console.log('Session Code:', this.sessionCode);
            console.log('Player Name:', nickname);
            console.log('Challenge ID:', this.challengeId);
            console.log('Firebase Initialized:', this.firebaseInitialized);
            console.log('========================================');

            // Join leaderboard session
            if (this.firebaseInitialized) {
                console.log('Attempting to join leaderboard session...');
                const joined = await leaderboardManager.joinSession(this.sessionCode, nickname);
                if (joined) {
                    logger.info('Joined leaderboard session', { session: this.sessionCode, player: nickname });
                    console.log('✓ Successfully joined leaderboard session:', this.sessionCode);
                    
                    // Update debug display
                    const statusDiv = document.getElementById('firebase-status');
                    if (statusDiv) statusDiv.textContent = 'Status: ✓ Joined session';

                    // Start listening for leaderboard updates
                    console.log('Starting leaderboard listener...');
                    this.startLeaderboardListener();
                } else {
                    console.error('✗ Failed to join leaderboard session');
                    const statusDiv = document.getElementById('firebase-status');
                    if (statusDiv) statusDiv.textContent = 'Status: ✗ Failed to join';
                }
            } else {
                console.warn('Firebase not initialized, skipping leaderboard join');
                const statusDiv = document.getElementById('firebase-status');
                if (statusDiv) statusDiv.textContent = 'Status: ✗ Firebase not ready';
            }

            // Initialize AR after nickname entry
            await this.initAR();
        });
    }

    startLeaderboardListener() {
        if (!this.firebaseInitialized) {
            console.warn('Cannot start leaderboard listener: Firebase not initialized');
            return;
        }

        console.log('Starting leaderboard listener in challenge page...');
        console.log('Current session:', leaderboardManager.currentSession);
        console.log('Player ID:', leaderboardManager.playerId);

        // Store unsubscribe function so we can clean up later
        this.leaderboardUnsubscribe = leaderboardManager.onLeaderboardUpdate((players) => {
            console.log('Challenge page received leaderboard update:', players.length, 'players');
            
            // Store data for completion screen
            uiManager.leaderboardData = players;
            uiManager.currentPlayerId = leaderboardManager.playerId;
            
            console.log('Leaderboard data stored in uiManager:', uiManager.leaderboardData);
        });
        
        console.log('Leaderboard listener started successfully');
    }

    async updateLeaderboardScore(points) {
        console.log('updateLeaderboardScore called:', { points, firebaseInitialized: this.firebaseInitialized, currentSession: leaderboardManager.currentSession });
        
        if (this.firebaseInitialized && leaderboardManager.currentSession) {
            console.log('Updating score in Firebase:', points);
            const success = await leaderboardManager.updateScore(points);
            
            // Update debug display
            const statusDiv = document.getElementById('firebase-status');
            if (statusDiv) {
                statusDiv.textContent = `Status: Score updated to ${this.score}`;
            }
            
            return success;
        } else {
            console.warn('Cannot update score - Firebase not ready or no session');
            return false;
        }
    }

    checkEnvironment() {
        // Check HTTPS
        if (requiresHTTPS()) {
            uiManager.showWarning(
                'HTTPS Required',
                'Camera access requires HTTPS. Please use the HTTPS server.',
                [{ text: 'Go Back', action: () => window.location.href = 'index.html' }]
            );
            return false;
        }

        // Check Camera API
        if (!hasCameraAPI()) {
            uiManager.showError(
                'Camera Not Available',
                'Your browser does not support camera access.',
                [{ text: 'Go Back', action: () => window.location.href = 'index.html' }]
            );
            return false;
        }

        return true;
    }

    getPlayerName() {
        const urlParams = new URLSearchParams(window.location.search);
        const name = urlParams.get('name') || urlParams.get('player');
        return name ? sanitizeInput(name) : 'Player';
    }

    getChallengeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const scenario = urlParams.get('challenge') || urlParams.get('scenario');

        // Map scenario names to challenge IDs
        const scenarioToChallengeMap = {
            'ransomware': 'chal_1',
            'phishing': 'chal_2',
            'apt': 'chal_3',
            'ddos': 'chal_4',
            'supplychain': 'chal_5',
            'infostealer': 'chal_6'
        };

        // Return mapped challenge ID or the original value
        return scenarioToChallengeMap[scenario] || scenario;
    }

    loadChallenge(challengeId) {
        this.currentChallenge = CONFIG.challenges[challengeId];
        if (!this.currentChallenge) {
            logger.error('Unknown challenge', { challenge: challengeId });
            uiManager.showError('Error', 'Unknown challenge: ' + challengeId);
            return;
        }

        this.currentQuestionIndex = 0;
        this.score = 0;

        stateManager.set('challenge', challengeId);
        stateManager.set('totalQuestions', this.currentChallenge.questions.length);

        uiManager.setScenarioTitle(this.currentChallenge.name);
        logger.info('Challenge loaded', { name: this.currentChallenge.name, id: challengeId });
    }

    async initAR() {
        uiManager.updateStatus('📷', 'Initializing Camera', 'Please allow camera access when prompted...');

        try {
            this.arEngine = new AREngine();

            // Initialize AR with support for 5 targets
            const success = await this.arEngine.init(CONFIG.ar.targetPath, CONFIG.ar.maxTrack);
            if (!success) {
                throw new Error('AR Engine initialization failed');
            }

            // Set up AR event handlers with target index
            this.arEngine.onTargetFound = (targetIndex) => {
                logger.ar('Target found', { index: targetIndex });
                this.onTargetFound(targetIndex);
            };

            this.arEngine.onTargetLost = (targetIndex) => {
                logger.ar('Target lost', { index: targetIndex });
                this.onTargetLost(targetIndex);
            };

            // Start AR
            await this.arEngine.start();

            uiManager.hideStatus();
            uiManager.setTrackingStatus('scanning');

        } catch (error) {
            logger.error('AR initialization failed', { error: error.message });
            uiManager.showError(
                'AR Initialization Failed',
                error.message + '\n\nYou can still play in Quiz Mode without AR.',
                [
                    { text: 'Start Quiz Mode', action: () => this.startQuizMode() },
                    { text: 'Retry', class: 'btn-secondary', action: () => this.initAR() }
                ]
            );
        }
    }

    startQuizMode() {
        logger.info('Starting Quiz Mode (No AR)');

        // Clear AR container
        const container = document.getElementById('ar-container');
        if (container) {
            container.innerHTML = '';
            container.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        }

        uiManager.hideStatus();
        uiManager.setTrackingStatus('scanning');

        // Show challenge info first
        this.showChallengeInfo();
    }

    async onTargetFound(targetIndex) {
        // Prevent multiple triggers - only process if not already processing
        if (this.isProcessingTarget) {
            console.log('Already processing target, ignoring duplicate trigger');
            return;
        }

        // Check if we've already shown this challenge
        if (this.challengeShown) {
            console.log('Challenge already shown, ignoring target');
            return;
        }

        this.isProcessingTarget = true;
        uiManager.setTrackingStatus('locked');

        try {
            // Map target index to challenge ID
            const challengeId = this.getChallengeIdFromTargetIndex(targetIndex);

            if (challengeId && challengeId !== this.challengeId) {
                this.loadChallenge(challengeId);
                this.challengeId = challengeId;
            }

            // Add AR content for current challenge
            if (this.arEngine && this.currentChallenge) {
                try {
                    const modelPath = this.currentChallenge.modelPath;
                    const anchor = this.arEngine.anchors[targetIndex];
                    if (!anchor) {
                        console.warn('No anchor found for target index:', targetIndex);
                        this.isProcessingTarget = false;
                        return;
                    }

                    // Ensure anchor.group exists (create if not)
                    if (!anchor.group) {
                        console.log('Creating new group for anchor');
                        anchor.group = new THREE.Group();
                        // Position the group at center of screen
                        anchor.group.position.set(0, 0, 0);
                    }

                    // Clear previous content
                    while(anchor.group.children.length > 0) {
                        anchor.group.remove(anchor.group.children[0]);
                    }

                    // Create and add new content
                    const content = await this.arEngine.createARContent(null, modelPath);
                    if (content) {
                        // Center the content in the group
                        content.position.set(0, 0, 0);
                        anchor.group.add(content);
                        console.log('AR content added to anchor group');
                    }
                } catch (error) {
                    logger.error('Failed to create AR content', { error: error.message });
                }
            }

            // NEW FLOW: Show fullscreen AR model for 5 seconds, then show challenge info
            this.showFullscreenARModel();
        } catch (error) {
            console.error('Error in onTargetFound:', error);
            this.isProcessingTarget = false;
        }
    }

    showFullscreenARModel() {
        // Clear any existing intervals first
        this.clearAllIntervals();

        // Play sound
        if (this.arEngine) {
            this.arEngine.playSound('ghostAppear');
        }

        // Wait 5 seconds then show challenge info (no countdown display)
        setTimeout(() => {
            this.showChallengeInfoBox();
        }, 5000);
    }

    showChallengeInfoBox() {
        // Clear any existing intervals first
        this.clearAllIntervals();

        // Show challenge info overlay with description
        const challengeInfo = {
            title: this.currentChallenge.name,
            description: this.currentChallenge.description,
            author: 'masta ghimau'
        };

        uiManager.showChallengeInfo(challengeInfo);

        // Start 10 second countdown for challenge info
        let countdown = 10;
        uiManager.updateChallengeCountdown(countdown);

        this.challengeInfoInterval = setInterval(() => {
            countdown--;

            if (countdown > 0) {
                uiManager.updateChallengeCountdown(countdown);
                if (this.arEngine) {
                    this.arEngine.playSound('countdown');
                }
            } else {
                this.clearAllIntervals();
                if (this.arEngine) {
                    this.arEngine.playSound('quizStart');
                }
                uiManager.hideChallengeInfo();
                // Hide AR and show full-screen quiz
                this.hideARAndShowQuiz();
            }
        }, 1000);
    }

    clearAllIntervals() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        if (this.challengeInfoInterval) {
            clearInterval(this.challengeInfoInterval);
            this.challengeInfoInterval = null;
        }
    }

    getChallengeIdFromTargetIndex(targetIndex) {
        // Find challenge ID from target index mapping
        const map = CONFIG.challengeTargetMap;
        for (const [challengeId, index] of Object.entries(map)) {
            if (index === targetIndex) {
                return challengeId;
            }
        }
        return null;
    }

    showChallengeInfo() {
        // Clear any existing intervals first
        this.clearAllIntervals();

        // Play sound
        if (this.arEngine) {
            this.arEngine.playSound('ghostAppear');
        }

        // Show challenge info overlay
        const challengeInfo = {
            title: this.currentChallenge.name,
            description: this.currentChallenge.description,
            author: 'masta ghimau'
        };

        uiManager.showChallengeInfo(challengeInfo);

        // Start 15 second countdown - AR model keeps playing during this time
        let countdown = 15;
        uiManager.updateChallengeCountdown(countdown);

        this.challengeInfoInterval = setInterval(() => {
            countdown--;

            if (countdown > 0) {
                uiManager.updateChallengeCountdown(countdown);
                // Play tick sound
                if (this.arEngine) {
                    this.arEngine.playSound('countdown');
                }
            } else {
                this.clearAllIntervals();
                // Play quiz start sound
                if (this.arEngine) {
                    this.arEngine.playSound('quizStart');
                }
                uiManager.hideChallengeInfo();
                // Hide AR and show full-screen quiz
                this.hideARAndShowQuiz();
            }
        }, 1000);
    }

    hideARAndShowQuiz() {
        console.log('Hiding AR and showing quiz...');

        // Mark challenge as shown to prevent re-triggering
        this.challengeShown = true;
        this.isProcessingTarget = false;

        // Hide AR container to make quiz full screen
        const arContainer = document.getElementById('ar-container');
        if (arContainer) {
            arContainer.style.display = 'none';
            console.log('AR container hidden');
        }

        // Hide tracking badge
        const trackingBadge = document.getElementById('tracking-badge');
        if (trackingBadge) {
            trackingBadge.style.display = 'none';
        }

        // Show quiz in full screen
        const questionPanel = document.getElementById('question-panel');
        if (questionPanel) {
            questionPanel.style.display = 'block';
            questionPanel.style.position = 'fixed';
            questionPanel.style.top = '0';
            questionPanel.style.left = '0';
            questionPanel.style.width = '100%';
            questionPanel.style.height = '100%';
            questionPanel.style.zIndex = '2000';
            questionPanel.style.background = 'rgba(10, 10, 20, 0.98)';
            questionPanel.style.padding = '20px';
            questionPanel.style.overflowY = 'auto';
            console.log('Question panel shown');
        }

        this.showCurrentQuestion();
    }

    onTargetLost(targetIndex) {
        uiManager.setTrackingStatus('lost');
        // Only hide question if this is the current target
        if (this.arEngine && this.arEngine.currentTargetIndex === targetIndex) {
            uiManager.hideQuestion();
        }
    }

    showCurrentQuestion() {
        if (!this.currentChallenge) {
            logger.error('No challenge loaded');
            return;
        }

        const question = this.currentChallenge.questions[this.currentQuestionIndex];
        if (!question) {
            this.showCompletion();
            return;
        }

        const totalQuestions = this.currentChallenge.questions.length;

        uiManager.showQuestion(
            question.text,
            question.options,
            (selectedIndex, btn) => this.handleAnswer(selectedIndex, btn),
            this.currentQuestionIndex,
            totalQuestions
        );
    }

    async handleAnswer(selectedIndex, btn) {
        const question = this.currentChallenge.questions[this.currentQuestionIndex];
        if (!question) return;

        const isCorrect = selectedIndex === question.correct;

        uiManager.markAnswer(btn, question.correct, selectedIndex, question.explanation);

        if (isCorrect) {
            this.score += CONFIG.scoring.correctAnswer;
            stateManager.set('score', this.score);
            logger.info('Correct answer', { score: this.score });

            // Update leaderboard score in real-time
            await this.updateLeaderboardScore(CONFIG.scoring.correctAnswer);

            if (this.arEngine) {
                this.arEngine.playSound('correct');
            }
        } else {
            logger.warn('Wrong answer');
            if (this.arEngine) {
                this.arEngine.playSound('wrong');
            }
        }

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestionIndex++;
            this.showCurrentQuestion();
        }, CONFIG.timing.questionDelay);
    }

    showCompletion() {
        // Get final ranking from leaderboard
        let finalRank = null;
        if (this.firebaseInitialized && leaderboardManager.playerId) {
            const players = uiManager.leaderboardData || [];
            const playerIndex = players.findIndex(p => p.id === leaderboardManager.playerId);
            finalRank = playerIndex >= 0 ? playerIndex + 1 : null;
        }

        uiManager.showCompletion(this.score, finalRank);
        logger.info('Challenge completed', { score: this.score, rank: finalRank });
    }

    dispose() {
        this.clearAllIntervals();

        // Unsubscribe from leaderboard updates
        if (this.leaderboardUnsubscribe) {
            this.leaderboardUnsubscribe();
            this.leaderboardUnsubscribe = null;
        }

        if (this.arEngine) {
            this.arEngine.dispose();
            this.arEngine = null;
        }
        logger.info('App disposed');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new IRChallengeApp();
        app.init();

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            app.dispose();
        });
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Show error on page
        const statusPanel = document.getElementById('status-panel');
        if (statusPanel) {
            const title = document.getElementById('status-title');
            const message = document.getElementById('status-message');
            if (title) title.textContent = 'Error';
            if (message) message.textContent = 'Failed to load application. Please check console for details.';
        }
    }
});

export { IRChallengeApp };
export default IRChallengeApp;
