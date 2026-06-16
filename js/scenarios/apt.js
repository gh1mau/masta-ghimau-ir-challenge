/**
 * APT Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class APTScenario extends BaseScenario {
    constructor() {
        super('APT Attack', 'Respond to an Advanced Persistent Threat');

        this.questions = [
            {
                text: 'Unknown actor inside network for months. This is?',
                options: ['APT', 'Script Kiddie', 'Insider Threat', 'Malware'],
                correct: 0,
                explanation: 'APT = Advanced Persistent Threat, characterized by long-term presence'
            },
            {
                text: 'Best approach for APT detection?',
                options: ['Antivirus', 'Behavioral analysis', 'Firewall', 'Password policy'],
                correct: 1,
                explanation: 'Behavioral analysis detects anomalous patterns over time'
            },
            {
                text: 'APT attackers typically prioritize?',
                options: ['Speed', 'Stealth', 'Destruction', 'Publicity'],
                correct: 1,
                explanation: 'APT attackers maintain stealth to avoid detection'
            }
        ];
    }
}

export default APTScenario;
