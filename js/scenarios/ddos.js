/**
 * DDoS Scenario Module
 * Phase 3: ES Module Architecture
 */

import { BaseScenario } from './base-scenario.js';

export class DDoSScenario extends BaseScenario {
    constructor() {
        super('DDoS Attack', 'Respond to a Distributed Denial of Service attack');

        this.questions = [
            {
                text: 'First priority during a DDoS attack?',
                options: ['Find attacker', 'Maintain availability', 'Collect evidence', 'Shut down servers'],
                correct: 1,
                explanation: 'Maintaining service availability is the primary goal'
            },
            {
                text: 'Best DDoS mitigation strategy?',
                options: ['Rate limiting', 'Traffic scrubbing', 'IP blocking', 'All of the above'],
                correct: 3,
                explanation: 'Defense in depth requires multiple layers of protection'
            },
            {
                text: 'A volumetric DDoS attack targets?',
                options: ['Application layer', 'Network bandwidth', 'Database', 'User credentials'],
                correct: 1,
                explanation: 'Volumetric attacks consume network bandwidth'
            }
        ];
    }
}

export default DDoSScenario;
