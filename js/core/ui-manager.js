/**
 * Core UI Manager Module
 * Phase 3: ES Module Architecture
 * Centralized UI management and updates
 */

import { logger } from './logger.js';

class UIManager {
    constructor() {
        this.elements = {};
        this.initialized = false;
    }

    init() {
        // Cache DOM elements
        this.elements = {
            arContainer: document.getElementById('ar-container'),
            statusPanel: document.getElementById('status-panel'),
            statusIcon: document.getElementById('status-icon'),
            statusTitle: document.getElementById('status-title'),
            statusMessage: document.getElementById('status-message'),
            actionButtons: document.getElementById('action-buttons'),
            questionPanel: document.getElementById('question-panel'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            trackingBadge: document.getElementById('tracking-badge'),
            scenarioTitle: document.getElementById('scenario-title'),
            debugConsole: document.getElementById('debug-console')
        };

        this.initialized = true;
        logger.info('UIManager initialized');
    }

    updateStatus(icon, title, message, buttons = []) {
        this.elements.statusIcon.textContent = icon;
        this.elements.statusTitle.textContent = title;
        this.elements.statusMessage.textContent = message;

        this.elements.actionButtons.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'btn ' + (btn.class || '');
            button.textContent = btn.text;
            button.onclick = btn.action;
            this.elements.actionButtons.appendChild(button);
        });
    }

    hideStatus() {
        this.elements.statusPanel.style.display = 'none';
        this.elements.trackingBadge.style.display = 'block';
    }

    showStatus() {
        this.elements.statusPanel.style.display = 'block';
        this.elements.trackingBadge.style.display = 'none';
    }

    setTrackingStatus(status) {
        const badge = this.elements.trackingBadge;
        switch (status) {
            case 'locked':
                badge.textContent = '● Target Locked';
                badge.style.color = '#0f0';
                badge.style.borderColor = '#0f0';
                break;
            case 'scanning':
                badge.textContent = '○ Scanning...';
                badge.style.color = '#fa0';
                badge.style.borderColor = '#fa0';
                break;
            case 'lost':
                badge.textContent = '○ Target Lost';
                badge.style.color = '#f44';
                badge.style.borderColor = '#f44';
                break;
            default:
                badge.style.display = 'none';
        }
    }

    showFullscreenAR(countdown) {
        // Create fullscreen AR overlay
        let overlay = document.getElementById('fullscreen-ar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'fullscreen-ar-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                z-index: 1500;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                align-items: center;
                padding-bottom: 100px;
                pointer-events: none;
            `;
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div style="
                background: rgba(0, 20, 40, 0.9);
                border: 2px solid #00ffff;
                border-radius: 20px;
                padding: 20px 40px;
                text-align: center;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
            ">
                <div style="color: #00ffff; font-size: 14px; margin-bottom: 10px;">AR Model Display</div>
                <div id="ar-countdown" style="
                    color: #00ff41;
                    font-size: 48px;
                    font-weight: bold;
                    font-family: 'Orbitron', sans-serif;
                    text-shadow: 0 0 20px rgba(0, 255, 65, 0.8);
                ">${countdown}</div>
            </div>
        `;

        overlay.style.display = 'flex';
    }

    updateFullscreenARCountdown(countdown) {
        const el = document.getElementById('ar-countdown');
        if (el) {
            el.textContent = countdown;
            if (countdown <= 2) {
                el.style.color = '#ff0040';
            }
        }
    }

    hideFullscreenAR() {
        const overlay = document.getElementById('fullscreen-ar-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showQuestion(question, options, onAnswer) {
        // Ensure question panel is visible with proper styling
        const panel = this.elements.questionPanel;
        if (panel) {
            panel.style.display = 'block';
            panel.style.position = 'fixed';
            panel.style.top = '0';
            panel.style.left = '0';
            panel.style.width = '100%';
            panel.style.height = '100%';
            panel.style.zIndex = '2000';
            panel.style.background = 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3f 100%)';
            panel.style.padding = '20px';
            panel.style.overflowY = 'auto';
            panel.style.boxSizing = 'border-box';
        }

        // Clear panel and create new layout
        panel.innerHTML = `
            <div style="
                max-width: 600px;
                margin: 0 auto;
                padding: 20px 0;
            ">
                <!-- Progress Bar -->
                <div style="
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid #00ffff;
                    border-radius: 10px;
                    padding: 15px;
                    margin-bottom: 30px;
                    text-align: center;
                ">
                    <div style="color: #00ffff; font-size: 14px; margin-bottom: 5px;">QUESTION</div>
                    <div style="color: #00ff41; font-size: 24px; font-weight: bold;">${this.currentQuestionIndex + 1} / ${this.totalQuestions || options.length}</div>
                </div>

                <!-- Question Text -->
                <div style="
                    background: rgba(0, 20, 40, 0.8);
                    border: 2px solid #00ffff;
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 25px;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
                ">
                    <div id="quiz-question-text" style="
                        color: #ffffff;
                        font-size: 20px;
                        line-height: 1.6;
                        font-family: 'Inter', sans-serif;
                    ">${question}</div>
                </div>

                <!-- Options Container -->
                <div id="quiz-options-container" style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                "></div>
            </div>
        `;

        // Populate options
        const optionsContainer = document.getElementById('quiz-options-container');
        if (optionsContainer) {
            options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.style.cssText = `
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 20px;
                    background: rgba(0, 255, 255, 0.05);
                    border: 2px solid rgba(0, 255, 255, 0.3);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: left;
                `;

                // Hover effect via JS since we're setting inline styles
                btn.onmouseenter = () => {
                    btn.style.background = 'rgba(0, 255, 255, 0.15)';
                    btn.style.borderColor = '#00ffff';
                    btn.style.transform = 'translateX(5px)';
                };
                btn.onmouseleave = () => {
                    btn.style.background = 'rgba(0, 255, 255, 0.05)';
                    btn.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                    btn.style.transform = 'translateX(0)';
                };

                btn.innerHTML = `
                    <span style="
                        width: 36px;
                        height: 36px;
                        background: rgba(0, 255, 255, 0.2);
                        border: 2px solid #00ffff;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #00ffff;
                        font-weight: bold;
                        font-size: 16px;
                        margin-right: 15px;
                        flex-shrink: 0;
                    ">${String.fromCharCode(65 + idx)}</span>
                    <span style="
                        color: #ffffff;
                        font-size: 16px;
                        line-height: 1.4;
                        font-family: 'Inter', sans-serif;
                    ">${opt}</span>
                `;

                btn.onclick = () => onAnswer(idx, btn);
                optionsContainer.appendChild(btn);
            });
        }
    }

    hideQuestion() {
        this.elements.questionPanel.style.display = 'none';
    }

    markAnswer(selectedBtn, correctIndex, selectedIndex, explanation) {
        const allBtns = this.elements.optionsContainer.querySelectorAll('.option-btn');

        if (selectedIndex === correctIndex) {
            selectedBtn.classList.add('correct');
        } else {
            selectedBtn.classList.add('wrong');
            allBtns[correctIndex].classList.add('correct');
        }

        if (explanation) {
            setTimeout(() => alert(explanation), 100);
        }
    }

    showCompletion(score, rank = null) {
        let rankDisplay = '';
        if (rank) {
            const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
            rankDisplay = `
                <div style="font-size: 36px; margin: 15px 0;">
                    ${rankEmoji} Rank #${rank}
                </div>
            `;
        }

        this.elements.questionPanel.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px;">🏆</div>
                <h2 style="color: #00ffff; margin-bottom: 20px; font-size: 32px;">Challenge Complete!</h2>
                ${rankDisplay}
                <p style="color: #00ff41; font-size: 24px; margin-bottom: 10px; font-weight: bold;">
                    ${score} points
                </p>
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                    Developed by Hussein Mohamed masta ghimau<br>
                    YT: @mastaghimau | GH: gh1mau
                </p>
                <button class="btn" onclick="location.reload()" style="margin-top: 30px; padding: 15px 40px; font-size: 18px;">
                    Play Again
                </button>
            </div>
        `;
    }

    setScenarioTitle(title) {
        this.elements.scenarioTitle.textContent = title;
    }

    showDebugConsole() {
        if (this.elements.debugConsole) {
            this.elements.debugConsole.style.display = 'block';
        }
    }

    setFallbackMode() {
        this.elements.arContainer.innerHTML = '';
        this.elements.arContainer.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    }

    showError(title, message, actions = []) {
        this.updateStatus('❌', title, message, actions);
    }

    showWarning(title, message, actions = []) {
        this.updateStatus('⚠️', title, message, actions);
    }

    showInfo(title, message, actions = []) {
        this.updateStatus('ℹ️', title, message, actions);
    }

    showChallengeInfo(info) {
        // Create challenge info overlay if not exists
        let overlay = document.getElementById('challenge-info-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'challenge-info-overlay';
            overlay.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                width: 90%;
                max-width: 400px;
                background: rgba(0, 20, 40, 0.95);
                border: 2px solid #00ffff;
                border-radius: 15px;
                padding: 20px;
                z-index: 1000;
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
                font-family: 'Courier New', monospace;
            `;
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div style="text-align: center;">
                <!-- Author Box -->
                <div style="
                    background: linear-gradient(135deg, #00ffff 0%, #0088ff 100%);
                    color: #000;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 15px;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(0, 255, 255, 0.4);
                ">
                    👻 ${info.author}
                </div>

                <!-- Challenge Title -->
                <h2 style="
                    color: #00ffff;
                    margin: 15px 0 10px 0;
                    font-size: 22px;
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
                ">${info.title}</h2>

                <!-- Description -->
                <p style="
                    color: #ccc;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 15px;
                    padding: 0 10px;
                ">${info.description}</p>

                <!-- Countdown -->
                <div id="challenge-countdown" style="
                    background: rgba(0, 255, 255, 0.1);
                    border: 1px solid #00ffff;
                    border-radius: 10px;
                    padding: 10px;
                    margin-top: 10px;
                ">
                    <span style="color: #00ffff; font-size: 14px;">Quiz starts in </span>
                    <span id="countdown-number" style="
                        color: #00ff41;
                        font-size: 24px;
                        font-weight: bold;
                    ">15</span>
                    <span style="color: #00ffff; font-size: 14px;"> seconds</span>
                </div>
            </div>
        `;

        overlay.style.display = 'block';
    }

    updateChallengeCountdown(seconds) {
        const countdownEl = document.getElementById('countdown-number');
        if (countdownEl) {
            countdownEl.textContent = seconds;
            // Pulse animation on last 5 seconds
            if (seconds <= 5) {
                countdownEl.style.color = '#ff0040';
                countdownEl.style.textShadow = '0 0 20px rgba(255, 0, 64, 0.8)';
            }
        }
    }

    hideChallengeInfo() {
        const overlay = document.getElementById('challenge-info-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // Nickname Entry
    showNicknameModal(onSubmit) {
        const modal = document.getElementById('nickname-modal');
        const input = document.getElementById('nickname-input');
        const submitBtn = document.getElementById('nickname-submit');

        if (!modal || !input || !submitBtn) {
            console.error('Nickname modal elements not found:', {
                modal: !!modal,
                input: !!input,
                submitBtn: !!submitBtn
            });
            return;
        }

        modal.style.display = 'flex';
        input.focus();

        const handleSubmit = () => {
            const nickname = input.value.trim();
            console.log('Nickname submitted:', nickname);
            if (nickname.length >= 2 && nickname.length <= 20) {
                console.log('Hiding modal and calling onSubmit');
                modal.style.display = 'none';
                onSubmit(nickname);
            } else {
                console.log('Nickname too short or too long');
                input.style.borderColor = '#ff0040';
                setTimeout(() => {
                    input.style.borderColor = '#00ffff';
                }, 500);
            }
        };

        // Remove any existing listeners first
        submitBtn.onclick = null;
        input.onkeypress = null;

        // Add new listeners
        submitBtn.onclick = handleSubmit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleSubmit();
        };

        console.log('Nickname modal shown, listeners attached');
    }

    hideNicknameModal() {
        const modal = document.getElementById('nickname-modal');
        if (modal) modal.style.display = 'none';
    }

    // Leaderboard
    showLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (panel) panel.style.display = 'block';
    }

    hideLeaderboard() {
        const panel = document.getElementById('leaderboard-panel');
        if (panel) panel.style.display = 'none';
    }

    updateLeaderboard(players, currentPlayerId) {
        // Store leaderboard data for access by app.js
        this.leaderboardData = players;
        this.currentPlayerId = currentPlayerId;

        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        list.innerHTML = '';

        players.slice(0, 10).forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            // Highlight current player
            if (player.id === currentPlayerId) {
                item.classList.add('current-player');
            }

            // Highlight top 3
            if (index < 3) {
                item.classList.add('top-3');
            }

            const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

            item.innerHTML = `
                <span class="leaderboard-rank">${rankEmoji}</span>
                <span class="leaderboard-name">${this.escapeHtml(player.name)}</span>
                <span class="leaderboard-score">${player.score}</span>
            `;

            list.appendChild(item);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Singleton instance
const uiManager = new UIManager();

export { UIManager, uiManager };
export default uiManager;
