/**
 * Supply Chain Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class SupplyChainScenario extends BaseScenario {
    constructor() {
        super('Supply Chain Attack', 'Respond to a compromised software supply chain');

        this.questions = [
            {
                text: 'A trusted vendor update contains malware. This is?',
                options: ['Insider threat', 'Supply chain attack', 'Zero-day', 'Social engineering'],
                correct: 1,
                explanation: 'Supply chain attacks compromise trusted software vendors'
            },
            {
                text: 'Best defense against supply chain attacks?',
                options: ['Code signing', 'SBOM monitoring', 'Vendor assessment', 'All of the above'],
                correct: 3,
                explanation: 'Multiple layers of defense are required'
            },
            {
                text: 'SBOM stands for?',
                options: ['Security Base Object Model', 'Software Bill of Materials', 'System Backup Management', 'Secure Build Operation Module'],
                correct: 1,
                explanation: 'SBOM lists all components in software'
            }
        ];
    }
}

export default SupplyChainScenario;
