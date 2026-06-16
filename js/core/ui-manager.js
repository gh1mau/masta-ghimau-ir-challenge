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

    showQuestion(question, options, onAnswer) {
        this.elements.questionText.textContent = question;
        this.elements.optionsContainer.innerHTML = '';

        options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => onAnswer(idx, btn);
            this.elements.optionsContainer.appendChild(btn);
        });

        this.elements.questionPanel.style.display = 'block';
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

        if (!modal || !input || !submitBtn) return;

        modal.style.display = 'flex';
        input.focus();

        const handleSubmit = () => {
            const nickname = input.value.trim();
            if (nickname.length >= 2 && nickname.length <= 20) {
                modal.style.display = 'none';
                onSubmit(nickname);
            } else {
                input.style.borderColor = '#ff0040';
                setTimeout(() => {
                    input.style.borderColor = '#00ffff';
                }, 500);
            }
        };

        submitBtn.onclick = handleSubmit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') handleSubmit();
        };
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
