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

    showQuestion(question, options, onAnswer, currentIndex = 0, totalQuestions = 3) {
        // Ensure question panel is visible with proper styling - FULL SCREEN
        const panel = this.elements.questionPanel;
        if (panel) {
            panel.style.cssText = `
                display: block !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 9999 !important;
                background: linear-gradient(135deg, #0a0a1f 0%, #1a1a3f 100%) !important;
                padding: 10px !important;
                margin: 0 !important;
                overflow-y: auto !important;
                box-sizing: border-box !important;
                border: none !important;
            `;
        }

        // Calculate progress percentage
        const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

        // Clear panel and create compact layout - OPTIMIZED FOR MOBILE
        panel.innerHTML = `
            <div style="
                max-width: 900px;
                margin: 0 auto;
                padding: 10px;
                min-height: calc(100vh - 20px);
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                box-sizing: border-box;
            ">
                <!-- Header with Progress - COMPACT -->
                <div style="
                    background: rgba(0, 255, 255, 0.05);
                    border: 1px solid rgba(0, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 15px;
                    flex-shrink: 0;
                ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    ">
                        <span style="color: #00ffff; font-size: 12px; font-weight: 600; letter-spacing: 1px;">QUESTION ${currentIndex + 1} OF ${totalQuestions}</span>
                        <span style="color: #00ff41; font-size: 12px; font-weight: 600;">${Math.round(progressPercent)}%</span>
                    </div>
                    <!-- Progress Bar -->
                    <div style="
                        width: 100%;
                        height: 4px;
                        background: rgba(0, 255, 255, 0.1);
                        border-radius: 2px;
                        overflow: hidden;
                    ">
                        <div style="
                            width: ${progressPercent}%;
                            height: 100%;
                            background: linear-gradient(90deg, #00ffff, #00ff41);
                            border-radius: 2px;
                            transition: width 0.5s ease;
                        "></div>
                    </div>
                </div>

                <!-- Question Card - COMPACT -->
                <div style="
                    background: linear-gradient(135deg, rgba(0, 20, 40, 0.9) 0%, rgba(0, 30, 60, 0.9) 100%);
                    border: 2px solid rgba(0, 255, 255, 0.3);
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 15px;
                    box-shadow: 0 8px 30px rgba(0, 255, 255, 0.1);
                    flex-shrink: 0;
                ">
                    <div id="quiz-question-text" style="
                        color: #ffffff;
                        font-size: 18px;
                        line-height: 1.5;
                        font-family: 'Inter', sans-serif;
                        font-weight: 500;
                    ">${question}</div>
                </div>

                <!-- Options Container - COMPACT -->
                <div id="quiz-options-container" style="
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                "></div>

                <!-- Explanation Container (hidden by default) - COMPACT -->
                <div id="explanation-container" style="
                    display: none;
                    margin-top: 15px;
                    padding: 15px;
                    background: rgba(0, 255, 65, 0.1);
                    border: 1px solid rgba(0, 255, 65, 0.3);
                    border-radius: 10px;
                    flex-shrink: 0;
                ">
                    <div style="color: #00ff41; font-size: 13px; font-weight: 600; margin-bottom: 6px;">✓ Correct Answer</div>
                    <div id="explanation-text" style="color: #ffffff; font-size: 14px; line-height: 1.5;"></div>
                </div>
            </div>
        `;

        // Populate options - COMPACT BUTTONS
        const optionsContainer = document.getElementById('quiz-options-container');
        if (optionsContainer && options && options.length > 0) {
            options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option-btn';
                btn.style.cssText = `
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 2px solid rgba(0, 255, 255, 0.2);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    flex-shrink: 0;
                `;

                // Hover effect via JS since we're setting inline styles
                btn.onmouseenter = () => {
                    if (!btn.disabled) {
                        btn.style.background = 'rgba(0, 255, 255, 0.1)';
                        btn.style.borderColor = 'rgba(0, 255, 255, 0.5)';
                        btn.style.transform = 'translateY(-1px)';
                        btn.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.15)';
                    }
                };
                btn.onmouseleave = () => {
                    if (!btn.disabled) {
                        btn.style.background = 'rgba(255, 255, 255, 0.03)';
                        btn.style.borderColor = 'rgba(0, 255, 255, 0.2)';
                        btn.style.transform = 'translateY(0)';
                        btn.style.boxShadow = 'none';
                    }
                };

                btn.innerHTML = `
                    <span style="
                        width: 36px;
                        height: 36px;
                        background: linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0.1) 100%);
                        border: 2px solid rgba(0, 255, 255, 0.4);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #00ffff;
                        font-weight: 700;
                        font-size: 16px;
                        margin-right: 12px;
                        flex-shrink: 0;
                        transition: all 0.2s ease;
                    ">${String.fromCharCode(65 + idx)}</span>
                    <span style="
                        color: #e0e0e0;
                        font-size: 15px;
                        line-height: 1.4;
                        font-family: 'Inter', sans-serif;
                        flex: 1;
                        font-weight: 400;
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
        // Get all buttons from the quiz options container
        const optionsContainer = document.getElementById('quiz-options-container');
        if (!optionsContainer) {
            console.error('Quiz options container not found');
            return;
        }

        const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');

        // Validate correctIndex is within bounds
        if (correctIndex < 0 || correctIndex >= allBtns.length) {
            console.error('Invalid correctIndex:', correctIndex, 'Total buttons:', allBtns.length);
            return;
        }

        // Get explanation container
        const explanationContainer = document.getElementById('explanation-container');
        const explanationText = document.getElementById('explanation-text');

        if (selectedIndex === correctIndex) {
            // Correct answer styling
            selectedBtn.classList.add('correct');
            selectedBtn.style.background = 'rgba(0, 255, 65, 0.25)';
            selectedBtn.style.borderColor = '#00ff41';
            selectedBtn.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)';
            
            // Update explanation container for correct answer
            if (explanationContainer) {
                explanationContainer.style.display = 'block';
                explanationContainer.style.background = 'rgba(0, 255, 65, 0.1)';
                explanationContainer.style.borderColor = 'rgba(0, 255, 65, 0.4)';
                explanationContainer.innerHTML = `
                    <div style="color: #00ff41; font-size: 16px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">✓</span> Correct Answer!
                    </div>
                    <div style="color: #ffffff; font-size: 15px; line-height: 1.7;">${explanation || 'Well done! You selected the correct answer.'}</div>
                `;
            }
        } else {
            // Wrong answer styling
            selectedBtn.classList.add('wrong');
            selectedBtn.style.background = 'rgba(255, 0, 64, 0.25)';
            selectedBtn.style.borderColor = '#ff0040';
            selectedBtn.style.boxShadow = '0 0 20px rgba(255, 0, 64, 0.3)';
            
            // Highlight correct answer
            const correctBtn = allBtns[correctIndex];
            if (correctBtn) {
                correctBtn.classList.add('correct');
                correctBtn.style.background = 'rgba(0, 255, 65, 0.15)';
                correctBtn.style.borderColor = 'rgba(0, 255, 65, 0.5)';
            }
            
            // Update explanation container for wrong answer
            if (explanationContainer) {
                explanationContainer.style.display = 'block';
                explanationContainer.style.background = 'rgba(255, 0, 64, 0.1)';
                explanationContainer.style.borderColor = 'rgba(255, 0, 64, 0.4)';
                explanationContainer.innerHTML = `
                    <div style="color: #ff0040; font-size: 16px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">✗</span> Incorrect Answer
                    </div>
                    <div style="color: #ffffff; font-size: 15px; line-height: 1.7;">${explanation || 'The correct answer is highlighted in green.'}</div>
                `;
            }
        }

        // Disable all buttons and remove hover effects
        allBtns.forEach((btn, idx) => {
            btn.disabled = true;
            btn.style.cursor = 'not-allowed';
            btn.onmouseenter = null;
            btn.onmouseleave = null;
            
            // Dim other buttons that weren't selected
            if (idx !== selectedIndex && idx !== correctIndex) {
                btn.style.opacity = '0.4';
                btn.style.transform = 'scale(0.98)';
            }
        });
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
