/**
 * InfoStealer Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class InfoStealerScenario extends BaseScenario {
    constructor() {
        super('InfoStealer Malware', 'Respond to data exfiltration by info-stealing malware');

        this.questions = [
            {
                text: 'InfoStealer malware primarily targets?',
                options: ['System files', 'Credentials and data', 'Hardware', 'Network bandwidth'],
                correct: 1,
                explanation: 'InfoStealers target sensitive credentials and personal data'
            },
            {
                text: 'First step after discovering InfoStealer infection?',
                options: ['Format system', 'Isolate and preserve', 'Continue working', 'Download antivirus'],
                correct: 1,
                explanation: 'Isolation preserves evidence for forensic analysis'
            },
            {
                text: 'Common InfoStealer distribution method?',
                options: ['Email attachments', 'USB drives', 'Malicious websites', 'All of the above'],
                correct: 3,
                explanation: 'InfoStealers use multiple vectors for distribution'
            }
        ];
    }
}

export default InfoStealerScenario;
