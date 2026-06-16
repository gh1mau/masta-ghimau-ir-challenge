/**
 * Masta Ghimau IR Challenge - Mobile AR Challenge Controller
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ChallengeApp();
    app.init();
});

class ChallengeApp {
    constructor() {
        this.challengeId = 0;
        this.sessionId = null;
        this.playerId = null;
        this.playerName = null;
        this.arEngine = null;
        this.challengeManager = new ChallengeManager();
        this.leaderboard = new LeaderboardManager();
        this.timer = null;
        this.isARReady = false;
        this.selectedTargets = new Set();
    }

    async init() {
        // Parse URL parameters
        const params = new URLSearchParams(window.location.search);
        this.challengeId = parseInt(params.get('challenge')) || 0;
        this.sessionId = params.get('session') || 'default';

        // Initialize player
        this.initializePlayer();

        // Load challenge
        const challenge = this.challengeManager.loadChallenge(this.challengeId);
        if (!challenge) {
            alert('Challenge not found!');
            return;
        }

        // Update UI
        this.updateChallengeUI(challenge);

        // Setup event listeners
        this.setupEventListeners();

        // Initialize AR
        await this.initializeAR();

        // Setup timer
        this.setupTimer(challenge.timeLimit);

        // Listen for broadcast messages
        this.setupBroadcastListener();

        // Register participant
        this.leaderboard.addParticipant(this.playerId, this.playerName);

        // Hide loading screen
        this.hideLoadingScreen();
    }

    initializePlayer() {
        // Get or create player ID
        this.playerId = localStorage.getItem('mastaGhimau_playerId');
        if (!this.playerId) {
            this.playerId = LeaderboardManager.generateId();
            localStorage.setItem('mastaGhimau_playerId', this.playerId);
        }

        // Get player name
        this.playerName = localStorage.getItem('mastaGhimau_playerName');
        if (!this.playerName) {
            this.playerName = prompt('Enter your name:') || `Player_${this.playerId.slice(0, 6)}`;
            localStorage.setItem('mastaGhimau_playerName', this.playerName);
        }
    }

    updateChallengeUI(challenge) {
        document.getElementById('mobile-category').textContent = challenge.category;
        document.getElementById('mobile-challenge-title').textContent = challenge.title;
        document.getElementById('mobile-task').textContent = challenge.task;
        document.getElementById('mobile-points').textContent = challenge.points;
        document.getElementById('mobile-attempts').textContent = `0/${this.challengeManager.maxAttempts}`;
    }

    setupEventListeners() {
        // AR Controls
        document.getElementById('btn-capture').addEventListener('click', () => this.captureImage());
        document.getElementById('btn-hint').addEventListener('click', () => this.showHint());
        document.getElementById('btn-menu').addEventListener('click', () => this.showMenu());

        // Challenge Panel
        document.getElementById('btn-close-panel').addEventListener('click', () => this.hideChallengePanel());
        document.getElementById('btn-submit').addEventListener('click', () => this.submitAnswer());

        // Hint Modal
        document.getElementById('btn-close-hint').addEventListener('click', () => this.hideHintModal());

        // Success Modal
        document.getElementById('btn-continue').addEventListener('click', () => this.continueAfterSuccess());

        // Menu Modal
        document.getElementById('btn-close-menu').addEventListener('click', () => this.hideMenuModal());
        document.getElementById('btn-view-leaderboard').addEventListener('click', () => this.viewLeaderboard());
        document.getElementById('btn-view-profile').addEventListener('click', () => this.viewProfile());
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettings());
        document.getElementById('btn-exit').addEventListener('click', () => this.exitChallenge());

        // Touch events for AR objects
        const canvas = document.getElementById('ar-canvas');
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
        canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    async initializeAR() {
        try {
            this.arEngine = new AREngine();
            
            // Set up callbacks
            this.arEngine.onTargetFound = () => {
                console.log('Target found');
                this.showChallengePanel();
            };

            this.arEngine.onTargetLost = () => {
                console.log('Target lost');
                this.hideChallengePanel();
            };

            this.arEngine.onObjectSelected = (id, selected) => {
                this.handleObjectSelection(id, selected);
            };

            // Initialize with target image
            const targetPath = `assets/targets/challenge${this.challengeId}.mind`;
            const success = await this.arEngine.init(targetPath);

            if (success) {
                // Create AR objects for this challenge
                this.createARObjects();
                
                // Start AR
                await this.arEngine.start();
                this.isARReady = true;
            } else {
                console.warn('AR initialization failed, running in demo mode');
                this.showDemoMode();
            }
        } catch (error) {
            console.error('AR initialization error:', error);
            this.showDemoMode();
        }
    }

    createARObjects() {
        const challenge = this.challengeManager.currentChallenge;
        if (!challenge || !challenge.targets) return;

        challenge.targets.forEach(target => {
            this.arEngine.createCyberObject(target.type, {
                x: target.x,
                y: target.y,
                z: target.z
            }, {
                id: target.id,
                label: target.name,
                color: 0x00ff41
            });
        });
    }

    handleObjectSelection(id, selected) {
        const isNowSelected = this.challengeManager.selectTarget(id);
        
        if (isNowSelected) {
            this.selectedTargets.add(id);
            this.playSelectionSound();
        } else {
            this.selectedTargets.delete(id);
        }

        // Update UI
        this.updateProgressDisplay();
    }

    handleTouch(e) {
        e.preventDefault();
        if (!this.arEngine || !this.isARReady) return;

        const touch = e.touches[0];
        const canvas = document.getElementById('ar-canvas');
        const rect = canvas.getBoundingClientRect();

        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

        this.checkIntersection(x, y);
    }

    handleClick(e) {
        if (!this.arEngine || !this.isARReady) return;

        const canvas = document.getElementById('ar-canvas');
        const rect = canvas.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.checkIntersection(x, y);
    }

    checkIntersection(x, y) {
        // Simple distance-based selection for demo
        // In production, use proper raycasting with Three.js
        this.arEngine.objects.forEach((obj, id) => {
            // Toggle selection
            this.arEngine.selectObject(id);
        });
    }

    setupTimer(duration) {
        this.timer = new ChallengeTimer(
            duration,
            (remaining, formatted) => {
                document.getElementById('mobile-timer').textContent = formatted;
                
                // Update warning states
                const timerEl = document.getElementById('mobile-timer');
                if (remaining <= 30) {
                    timerEl.classList.add('danger');
                } else if (remaining <= 60) {
                    timerEl.classList.add('warning');
                }
            },
            () => {
                this.onTimeUp();
            }
        );
    }

    setupBroadcastListener() {
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('mastaGhimauIR_challenge');
            channel.onmessage = (event) => {
                this.handleBroadcastMessage(event.data);
            };
        }

        // Also check localStorage for messages
        window.addEventListener('storage', (e) => {
            if (e.key === 'mastaGhimauIR_lastMessage') {
                const message = JSON.parse(e.newValue);
                this.handleBroadcastMessage(message);
            }
        });
    }

    handleBroadcastMessage(message) {
        if (!message) return;

        switch (message.type) {
            case 'challenge_start':
                if (message.challengeId === this.challengeId) {
                    this.timer.start();
                }
                break;
            case 'timer_update':
                // Sync timer with presenter
                document.getElementById('mobile-timer').textContent = message.formatted;
                break;
            case 'time_up':
                if (message.challengeId === this.challengeId) {
                    this.onTimeUp();
                }
                break;
            case 'hint_revealed':
                // Could auto-show hint or notify user
                console.log('Hint revealed:', message.hint);
                break;
        }
    }

    showChallengePanel() {
        const panel = document.getElementById('challenge-panel');
        panel.classList.add('active');
    }

    hideChallengePanel() {
        const panel = document.getElementById('challenge-panel');
        panel.classList.remove('active');
    }

    updateProgressDisplay() {
        const progress = this.challengeManager.getProgress();
        document.getElementById('mobile-attempts').textContent = 
            `${progress.selected}/${progress.total}`;
    }

    submitAnswer() {
        const result = this.challengeManager.checkAnswer();
        
        if (result.correct) {
            this.onChallengeComplete(result);
        } else {
            this.onWrongAnswer(result);
        }

        // Update attempts display
        document.getElementById('mobile-attempts').textContent = 
            `${result.attempts}/${result.maxAttempts}`;
    }

    onChallengeComplete(result) {
        // Calculate final score
        const score = this.challengeManager.calculateScore();
        
        // Update leaderboard
        this.leaderboard.completeChallenge(this.playerId, this.challengeId, score);

        // Show success modal
        document.getElementById('success-points').textContent = `+${score} PTS`;
        document.getElementById('success-modal').classList.remove('hidden');

        // Play success sound
        this.playSuccessSound();

        // Stop timer
        if (this.timer) {
            this.timer.stop();
        }
    }

    onWrongAnswer(result) {
        const remaining = result.remainingAttempts;
        
        if (remaining <= 0) {
            alert('No more attempts! The correct answer was: ' + result.correctAnswer.join(', '));
            this.exitChallenge();
        } else {
            alert(`Incorrect! ${remaining} attempts remaining.`);
            this.playErrorSound();
        }
    }

    onTimeUp() {
        alert('Time\'s up! Challenge over.');
        this.exitChallenge();
    }

    showHint() {
        const hint = this.challengeManager.getHint();
        if (hint) {
            document.getElementById('hint-text').textContent = hint;
            document.getElementById('hint-modal').classList.remove('hidden');
        } else {
            alert('No more hints available!');
        }
    }

    hideHintModal() {
        document.getElementById('hint-modal').classList.add('hidden');
    }

    showMenu() {
        document.getElementById('menu-modal').classList.remove('hidden');
    }

    hideMenuModal() {
        document.getElementById('menu-modal').classList.add('hidden');
    }

    viewLeaderboard() {
        const leaderboard = this.leaderboard.getLeaderboard(10);
        let message = '🏆 LEADERBOARD 🏆\n\n';
        leaderboard.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
            message += `${medal} #${entry.rank} ${entry.name}: ${entry.score} pts\n`;
        });
        alert(message);
    }

    viewProfile() {
        const progress = this.leaderboard.getProgress(this.playerId);
        if (progress) {
            alert(`👤 YOUR PROFILE\n\n` +
                  `Name: ${progress.participant.name}\n` +
                  `Rank: #${progress.rank} of ${progress.totalParticipants}\n` +
                  `Score: ${progress.participant.score} pts\n` +
                  `Challenges: ${progress.participant.challengesCompleted}\n` +
                  `Percentile: Top ${100 - progress.percentile}%`);
        }
    }

    showSettings() {
        const newName = prompt('Change your name:', this.playerName);
        if (newName && newName.trim()) {
            this.playerName = newName.trim();
            localStorage.setItem('mastaGhimau_playerName', this.playerName);
            this.leaderboard.addParticipant(this.playerId, this.playerName);
            alert('Name updated!');
        }
    }

    exitChallenge() {
        if (confirm('Are you sure you want to exit?')) {
            window.location.href = 'index.html';
        }
    }

    continueAfterSuccess() {
        // Go to next challenge or back to menu
        const nextChallengeId = this.challengeId + 1;
        if (nextChallengeId < CHALLENGES.length) {
            window.location.href = `challenge.html?challenge=${nextChallengeId}&session=${this.sessionId}`;
        } else {
            alert('Congratulations! You\'ve completed all challenges!');
            window.location.href = 'index.html';
        }
    }

    captureImage() {
        // Capture AR scene screenshot
        if (this.arEngine && this.arEngine.renderer) {
            const canvas = this.arEngine.renderer.domElement;
            const dataURL = canvas.toDataURL('image/png');
            
            // Create download link
            const link = document.createElement('a');
            link.download = `masta-ghimau-challenge-${this.challengeId}-${Date.now()}.png`;
            link.href = dataURL;
            link.click();
        }
    }

    showDemoMode() {
        // Show demo UI when AR is not available
        document.getElementById('scan-instructions').innerHTML = `
            <div class="cyber-scan-frame p-8 border-2 border-yellow-500 rounded-lg bg-black/70 backdrop-blur">
                <div class="scan-icon mb-4 text-6xl">⚠️</div>
                <h2 class="text-xl font-bold mb-2 text-yellow-400">AR Not Available</h2>
                <p class="text-sm text-yellow-600 mb-4">Running in demo mode. Tap objects to select them.</p>
                <button id="btn-demo-start" class="cyber-btn py-2 px-4 bg-yellow-600 text-black font-bold rounded">
                    START DEMO
                </button>
            </div>
        `;

        document.getElementById('btn-demo-start').addEventListener('click', () => {
            this.showChallengePanel();
            // Create demo objects
            this.createDemoObjects();
        });
    }

    createDemoObjects() {
        // Create simple clickable demo buttons
        const demoContainer = document.createElement('div');
        demoContainer.id = 'demo-objects';
        demoContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            gap: 20px;
            z-index: 5;
        `;

        const challenge = this.challengeManager.currentChallenge;
        if (challenge && challenge.targets) {
            challenge.targets.forEach(target => {
                const btn = document.createElement('button');
                btn.className = 'cyber-btn p-4 bg-green-600/80 text-black font-bold rounded';
                btn.textContent = target.name;
                btn.addEventListener('click', () => {
                    this.handleObjectSelection(target.id, true);
                    btn.classList.toggle('bg-yellow-600');
                });
                demoContainer.appendChild(btn);
            });
        }

        document.body.appendChild(demoContainer);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    playSelectionSound() {
        this.playTone(600, 0.1);
    }

    playSuccessSound() {
        this.playTone(800, 0.2);
        setTimeout(() => this.playTone(1000, 0.2), 100);
        setTimeout(() => this.playTone(1200, 0.3), 200);
    }

    playErrorSound() {
        this.playTone(300, 0.2);
        setTimeout(() => this.playTone(250, 0.2), 100);
    }

    playTone(frequency, duration) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
}
