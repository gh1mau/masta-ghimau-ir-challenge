/**
 * Phishing Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class PhishingScenario extends BaseScenario {
    constructor() {
        super('Phishing Investigation', 'Investigate and respond to a phishing attack');

        this.questions = [
            {
                text: 'You clicked a phishing link. Immediate priority?',
                options: ['Change credentials', 'Ignore it', 'Tell colleagues', 'Buy Bitcoin'],
                correct: 0,
                explanation: 'Change credentials immediately to prevent account takeover'
            },
            {
                text: 'Which email header field is most reliable for tracing origin?',
                options: ['From:', 'Reply-To:', 'Received:', 'Subject:'],
                correct: 2,
                explanation: 'Received headers show the mail server path'
            },
            {
                text: 'A spear-phishing attack targets?',
                options: ['Random users', 'Specific individuals', 'IT admins only', 'Executives only'],
                correct: 1,
                explanation: 'Spear-phishing targets specific individuals with personalized messages'
            }
        ];
    }
}

export default PhishingScenario;
