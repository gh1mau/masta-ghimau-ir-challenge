/**
 * Masta Ghimau IR Challenge - Presenter Screen Controller - BUG FREE VERSION
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

// Import Firebase leaderboard
import { initFirebase, leaderboardManager } from './core/firebase-config.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.presenterApp = new PresenterApp();
    window.presenterApp.init();
});

class PresenterApp {
    constructor() {
        this.currentChallengeId = 0;
        this.timer = null;
        this.leaderboard = leaderboardManager;
        this.firebaseInitialized = initFirebase();
        this.challengeManager = new ChallengeManager();
        this.isRunning = false;
        this.hintsRevealed = 0;
        this.currentSession = null;
        this.leaderboardUnsubscribe = null; // Store unsubscribe function
    }

    init() {
        this.loadChallenge(0);
        this.setupEventListeners();
        this.setupLeaderboard();
        this.generateQRCode();
    }

    setupEventListeners() {
        // Challenge controls
        document.getElementById('btn-start').addEventListener('click', () => this.startChallenge());
        document.getElementById('btn-pause').addEventListener('click', () => this.pauseChallenge());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetChallenge());
        document.getElementById('btn-load').addEventListener('click', () => this.loadSelectedChallenge());

        // Challenge selector
        document.getElementById('challenge-select').addEventListener('change', (e) => {
            this.currentChallengeId = parseInt(e.target.value);
        });

        // Hint items
        document.querySelectorAll('.hint-item').forEach((item, index) => {
            item.addEventListener('click', () => this.revealHint(index));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleTimer();
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.resetChallenge();
                    }
                    break;
            }
        });
    }

    setupLeaderboard() {
        if (!this.firebaseInitialized) {
            console.warn('Firebase not initialized, leaderboard will not update');
            return;
        }

        // Get session code from URL or generate new one
        const urlParams = new URLSearchParams(window.location.search);
        this.currentSession = urlParams.get('session') || this.getSessionId();

        // Store session in localStorage so challenge page can access it
        localStorage.setItem('mastaGhimau_sessionId', this.currentSession);

        console.log('Presenter session:', this.currentSession);

        // Set the session in leaderboard manager
        this.leaderboard.currentSession = this.currentSession;

        // Listen for leaderboard updates (no need to join as presenter)
        this.leaderboardUnsubscribe = this.leaderboard.onLeaderboardUpdate((players) => {
            console.log('Leaderboard updated:', players);
            this.updateLeaderboardDisplay(players);
            this.updateParticipantCount(players);
        });
    }

    loadChallenge(challengeId) {
        const challenge = this.challengeManager.loadChallenge(challengeId);
        if (!challenge) return;

        this.currentChallengeId = challengeId;

        // Update UI
        document.getElementById('challenge-category').textContent = challenge.category;
        document.getElementById('challenge-title').textContent = `Challenge ${challenge.id + 1}: ${challenge.title}`;
        document.getElementById('scenario-text').textContent = challenge.scenario;
        document.getElementById('difficulty-level').textContent = challenge.difficulty;
        document.getElementById('points-value').textContent = challenge.points;

        // Update hints
        const hintContainer = document.getElementById('hints-container');
        hintContainer.innerHTML = '';
        challenge.hints.forEach((hint, index) => {
            const hintEl = document.createElement('div');
            hintEl.className = 'hint-item p-3 bg-gray-800 rounded border-l-4 border-yellow-500 opacity-50';
            hintEl.dataset.hint = index + 1;
            hintEl.innerHTML = `<span class="text-yellow-500 font-bold">Hint ${index + 1}:</span> ${hint}`;
            hintEl.addEventListener('click', () => this.revealHint(index));
            hintContainer.appendChild(hintEl);
        });

        // Reset hints revealed
        this.hintsRevealed = 0;

        // Update timer
        if (this.timer) {
            this.timer.stop();
        }
        this.timer = new ChallengeTimer(
            challenge.timeLimit,
            (remaining, formatted) => this.onTimerTick(remaining, formatted),
            () => this.onTimerComplete()
        );
        document.getElementById('timer').textContent = this.timer.formatTime(challenge.timeLimit);
        document.getElementById('timer').className = 'text-4xl font-bold cyber-timer';

        // Update challenge selector
        document.getElementById('challenge-select').value = challengeId;

        // Reset UI state
        this.isRunning = false;
        this.updateButtonStates();

        // Generate new QR code
        this.generateQRCode();
    }

    loadSelectedChallenge() {
        const select = document.getElementById('challenge-select');
        const challengeId = parseInt(select.value);
        this.loadChallenge(challengeId);
    }

    startChallenge() {
        if (!this.timer) return;

        this.timer.start();
        this.isRunning = true;
        this.updateButtonStates();

        // Broadcast challenge start to all participants
        this.broadcastMessage({
            type: 'challenge_start',
            challengeId: this.currentChallengeId,
            timestamp: Date.now()
        });
    }

    pauseChallenge() {
        if (!this.timer) return;

        this.timer.pause();
        this.isRunning = false;
        this.updateButtonStates();
    }

    resetChallenge() {
        if (!this.timer) return;

        this.timer.reset();
        this.isRunning = false;
        this.updateButtonStates();

        // Reset hints
        this.hintsRevealed = 0;
        document.querySelectorAll('.hint-item').forEach(item => {
            item.classList.remove('revealed');
            item.classList.add('opacity-50');
        });

        // Reset timer display
        const timerEl = document.getElementById('timer');
        timerEl.textContent = this.timer.formatTime(this.challengeManager.currentChallenge.timeLimit);
        timerEl.className = 'text-4xl font-bold cyber-timer';
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseChallenge();
        } else {
            this.startChallenge();
        }
    }

    onTimerTick(remaining, formatted) {
        const timerEl = document.getElementById('timer');
        timerEl.textContent = formatted;

        // Update warning states
        if (remaining <= 30) {
            timerEl.classList.add('danger');
            timerEl.classList.remove('warning');
        } else if (remaining <= 60) {
            timerEl.classList.add('warning');
            timerEl.classList.remove('danger');
        } else {
            timerEl.classList.remove('warning', 'danger');
        }

        // Broadcast time update
        this.broadcastMessage({
            type: 'timer_update',
            remaining,
            formatted
        });
    }

    onTimerComplete() {
        this.isRunning = false;
        this.updateButtonStates();

        // Play alert sound (if available)
        this.playAlertSound();

        // Broadcast time's up
        this.broadcastMessage({
            type: 'time_up',
            challengeId: this.currentChallengeId
        });

        // Show alert
        alert('Time\'s up! Challenge complete.');
    }

    revealHint(index) {
        const challenge = this.challengeManager.currentChallenge;
        if (!challenge || index >= challenge.hints.length) return;

        const hintItems = document.querySelectorAll('.hint-item');
        if (hintItems[index]) {
            hintItems[index].classList.add('revealed');
            hintItems[index].classList.remove('opacity-50');
        }

        this.hintsRevealed = Math.max(this.hintsRevealed, index + 1);

        // Broadcast hint reveal
        this.broadcastMessage({
            type: 'hint_revealed',
            hintIndex: index,
            hint: challenge.hints[index]
        });
    }

    generateQRCode() {
        const container = document.getElementById('qrcode');
        container.innerHTML = '';

        // Get current URL and modify for challenge page
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.replace('presenter.html', 'challenge.html');
        const challengeUrl = `${baseUrl}?challenge=${this.currentChallengeId}&session=${this.getSessionId()}`;

        // Generate QR code
        new QRCode(container, {
            text: challengeUrl,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        // Display URL
        document.getElementById('challenge-url').textContent = challengeUrl;
    }

    getSessionId() {
        // Check URL first
        const urlParams = new URLSearchParams(window.location.search);
        let sessionId = urlParams.get('session');

        if (!sessionId) {
            // Check localStorage (shared with challenge page)
            sessionId = localStorage.getItem('mastaGhimau_sessionId');
        }

        if (!sessionId) {
            // Generate new session ID
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('mastaGhimau_sessionId', sessionId);
        }

        return sessionId;
    }

    updateButtonStates() {
        const startBtn = document.getElementById('btn-start');
        const pauseBtn = document.getElementById('btn-pause');

        if (this.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    }

    updateLeaderboardDisplay(players) {
        const container = document.getElementById('leaderboard');

        if (!players || players.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-500 py-4">No participants yet</div>';
            return;
        }

        // Sort by score (highest first) and add rank
        const sortedPlayers = players
            .sort((a, b) => b.score - a.score)
            .map((player, index) => ({ ...player, rank: index + 1 }));

        container.innerHTML = sortedPlayers.map((entry, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-3' : ''}">
                <div class="flex items-center gap-2">
                    <span class="font-bold ${index < 3 ? 'text-yellow-400' : 'text-green-400'}">#${entry.rank}</span>
                    <span class="truncate max-w-[120px]">${entry.name}</span>
                </div>
                <span class="font-bold text-green-400">${entry.score} pts</span>
            </div>
        `).join('');
    }

    updateParticipantCount(players = null) {
        const count = players ? players.length : 0;
        const countEl = document.getElementById('participant-count');
        if (countEl) {
            countEl.textContent = count;
        }
    }

    broadcastMessage(message) {
        // Use BroadcastChannel for real-time updates
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('mastaGhimauIR_challenge');
            channel.postMessage(message);
        }

        // Also store in localStorage for persistence
        const key = 'mastaGhimauIR_lastMessage';
        localStorage.setItem(key, JSON.stringify({
            ...message,
            timestamp: Date.now()
        }));
    }

    playAlertSound() {
        // Create a simple beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Could not play alert sound:', e);
        }
    }

    dispose() {
        // Unsubscribe from leaderboard updates
        if (this.leaderboardUnsubscribe) {
            this.leaderboardUnsubscribe();
            this.leaderboardUnsubscribe = null;
        }
        console.log('Presenter disposed');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    const app = window.presenterApp;
    if (app && app.dispose) {
        app.dispose();
    }
});
