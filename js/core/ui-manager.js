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

    showCompletion(score) {
        this.elements.questionPanel.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
                <h2 style="color: #00ffff; margin-bottom: 10px;">Challenge Complete!</h2>
                <p style="color: #fff; font-size: 18px; margin-bottom: 20px;">
                    Score: ${score} points
                </p>
                <p style="color: #888; font-size: 14px;">
                    Developed by Hussein Mohamed masta ghimau<br>
                    YT: @mastaghimau | GH: gh1mau
                </p>
                <button class="btn" onclick="location.reload()" style="margin-top: 20px;">
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
}

// Singleton instance
const uiManager = new UIManager();

export { UIManager, uiManager };
export default uiManager;
