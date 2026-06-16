/**
 * Ransomware Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class RansomwareScenario extends BaseScenario {
    constructor() {
        super('Ransomware Response', 'Respond to a ransomware attack on corporate systems');

        this.questions = [
            {
                text: 'Critical: Systems encrypted, ransom note displayed. First action?',
                options: ['Pay immediately', 'Isolate network', 'Format drives', 'Call helpdesk'],
                correct: 1,
                explanation: 'Isolation prevents lateral movement (NIST IR Step 3)'
            },
            {
                text: 'Attackers threaten to leak stolen data. This is called?',
                options: ['Single Extortion', 'Double Extortion', 'Ransomware 2.0', 'Data Breach'],
                correct: 1,
                explanation: 'Double extortion = Encryption + Data leak threat'
            },
            {
                text: 'Which backup strategy is most effective against ransomware?',
                options: ['Daily local backup', 'Air-gapped offline backup', 'Cloud sync', 'RAID array'],
                correct: 1,
                explanation: 'Air-gapped backups cannot be reached by ransomware'
            }
        ];
    }
}

export default RansomwareScenario;
