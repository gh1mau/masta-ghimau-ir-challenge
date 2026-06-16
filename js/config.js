/**
 * Application Configuration
 * Phase 3: ES Module Architecture
 * Centralized configuration settings
 */

export const CONFIG = {
    // App Info
    app: {
        name: 'Masta Ghimau IR Challenge',
        version: '3.0.0',
        author: 'Hussein Mohamed masta ghimau',
        youtube: '@mastaghimau',
        github: 'gh1mau'
    },

    // AR Settings
    ar: {
        targetPath: './targets.mind',
        maxTrack: 5,  // Support up to 5 targets
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        colors: {
            primary: 0x00ff41,
            warning: 0xffff00,
            error: 0xff0040
        }
    },

    // Challenge to Target Index Mapping
    // Each challenge corresponds to a target index in targets.mind
    challengeTargetMap: {
        'chal_1': 0,  // Ransomware -> Target 0
        'chal_2': 1,  // Phishing -> Target 1
        'chal_3': 2,  // APT -> Target 2
        'chal_4': 3,  // DDoS -> Target 3
        'chal_5': 4,  // Supply Chain -> Target 4
        'chal_6': 0   // InfoStealer -> Target 0 (or add more targets)
    },

    // 6 Challenges Configuration
    challenges: {
        chal_1: {
            name: 'Ransomware Response',
            description: 'Learn to handle ransomware attacks effectively. Systems are encrypted and attackers demand payment.',
            difficulty: 'beginner',
            timeLimit: 300,
            modelPath: 'assets/models/chal_1.glb',
            questions: [
                {
                    text: 'Critical: Systems encrypted, ransom note displayed. First action?',
                    options: ['Pay immediately', 'Isolate network', 'Format drives'],
                    correct: 1,
                    explanation: 'Isolating the network prevents spread to other systems.'
                },
                {
                    text: 'Best practice for ransomware prevention?',
                    options: ['Disable antivirus', 'Regular backups', 'Open all emails'],
                    correct: 1,
                    explanation: 'Regular offline backups are the best defense against ransomware.'
                }
            ]
        },
        chal_2: {
            name: 'Phishing Detection',
            description: 'Identify and respond to phishing attempts. Protect users from social engineering attacks.',
            difficulty: 'beginner',
            timeLimit: 300,
            modelPath: 'assets/models/chal_2.glb',
            questions: [
                {
                    text: 'User reports suspicious email asking for password. Action?',
                    options: ['Reply to email', 'Report to security', 'Click links to verify'],
                    correct: 1,
                    explanation: 'Always report suspicious emails to security team.'
                },
                {
                    text: 'Signs of a phishing email?',
                    options: ['Urgent language', 'Known sender', 'Proper grammar'],
                    correct: 0,
                    explanation: 'Urgent language pressuring immediate action is a common phishing tactic.'
                }
            ]
        },
        chal_3: {
            name: 'APT Defense',
            description: 'Advanced Persistent Threat response strategies. Detect and eliminate sophisticated attackers.',
            difficulty: 'advanced',
            timeLimit: 600,
            modelPath: 'assets/models/chal_3.glb',
            questions: [
                {
                    text: 'Signs of APT activity in network?',
                    options: ['Normal traffic', 'Unusual outbound connections', 'Fast internet'],
                    correct: 1,
                    explanation: 'Unusual outbound connections may indicate data exfiltration.'
                },
                {
                    text: 'Best defense against APTs?',
                    options: ['Single firewall', 'Defense in depth', 'Ignore threats'],
                    correct: 1,
                    explanation: 'Defense in depth with multiple security layers is essential.'
                }
            ]
        },
        chal_4: {
            name: 'DDoS Mitigation',
            description: 'Handle distributed denial of service attacks. Keep services available during attacks.',
            difficulty: 'intermediate',
            timeLimit: 300,
            modelPath: 'assets/models/chal_4.glb',
            questions: [
                {
                    text: 'First response to DDoS attack?',
                    options: ['Shut down servers', 'Activate mitigation service', 'Ignore it'],
                    correct: 1,
                    explanation: 'DDoS mitigation services can filter malicious traffic.'
                },
                {
                    text: 'DDoS attack target is typically?',
                    options: ['Availability', 'Confidentiality', 'Integrity'],
                    correct: 0,
                    explanation: 'DDoS attacks target service availability.'
                }
            ]
        },
        chal_5: {
            name: 'Supply Chain Security',
            description: 'Secure your software supply chain. Verify and validate third-party components.',
            difficulty: 'intermediate',
            timeLimit: 400,
            modelPath: 'assets/models/chal_5.glb',
            questions: [
                {
                    text: 'How to verify software integrity?',
                    options: ['Trust vendor', 'Check checksums', 'Install immediately'],
                    correct: 1,
                    explanation: 'Checksums verify the software has not been tampered with.'
                },
                {
                    text: 'Supply chain attack vector?',
                    options: ['Compromised vendor', 'Strong passwords', 'Encryption'],
                    correct: 0,
                    explanation: 'Attackers may compromise trusted vendors to distribute malware.'
                }
            ]
        },
        chal_6: {
            name: 'InfoStealer Defense',
            description: 'Protect against information stealing malware. Safeguard credentials and sensitive data.',
            difficulty: 'intermediate',
            timeLimit: 400,
            modelPath: 'assets/models/chal_6.glb',
            questions: [
                {
                    text: 'Best protection against info stealers?',
                    options: ['Password manager', 'MFA', 'Simple passwords'],
                    correct: 1,
                    explanation: 'Multi-factor authentication protects even if credentials are stolen.'
                },
                {
                    text: 'Info stealers typically target?',
                    options: ['Browser data', 'Screen brightness', 'Volume settings'],
                    correct: 0,
                    explanation: 'Info stealers target saved passwords, cookies, and browser data.'
                }
            ]
        }
    },

    // Scoring
    scoring: {
        correctAnswer: 100,
        timeBonus: 10,
        maxTimeBonus: 50
    },

    // Timing
    timing: {
        questionDelay: 1500,
        answerReveal: 1000,
        modelDisplayDuration: 15000 // 15 seconds to display model
    },

    // CDN Paths
    cdn: {
        three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
        threeAddons: 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/',
        mindar: 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
    },

    // Debug
    debug: {
        enabled: false,
        showConsole: false
    }
};

export default CONFIG;
