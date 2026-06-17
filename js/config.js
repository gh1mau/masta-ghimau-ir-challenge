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
        maxTrack: 6,  // Support up to 6 targets (one for each challenge)
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
        'chal_6': 5   // InfoStealer -> Target 5
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
                },
                {
                    text: 'Should you pay the ransom to get files back?',
                    options: ['Yes, always pay', 'No, no guarantee', 'Pay half amount'],
                    correct: 1,
                    explanation: 'Paying ransom does not guarantee file recovery and encourages more attacks.'
                },
                {
                    text: 'What is the purpose of ransomware?',
                    options: ['Steal data', 'Encrypt files for ransom', 'Delete files'],
                    correct: 1,
                    explanation: 'Ransomware encrypts files and demands payment for decryption key.'
                },
                {
                    text: 'How do ransomware typically spread?',
                    options: ['Email attachments', 'Physical mail', 'Phone calls'],
                    correct: 0,
                    explanation: 'Ransomware often spreads through malicious email attachments and links.'
                },
                {
                    text: 'What is a ransomware "kill switch"?',
                    options: ['Payment method', 'Domain that stops encryption', 'Antivirus software'],
                    correct: 1,
                    explanation: 'Some ransomware check for specific domains to stop encryption if found.'
                },
                {
                    text: 'After ransomware attack, what should you NOT do?',
                    options: ['Report to authorities', 'Pay the ransom', 'Restore from backup'],
                    correct: 1,
                    explanation: 'Paying ransom is discouraged as it funds criminals and may not recover files.'
                },
                {
                    text: 'What is "double extortion" ransomware?',
                    options: ['Encrypt twice', 'Encrypt and threaten to leak data', 'Two ransom payments'],
                    correct: 1,
                    explanation: 'Attackers encrypt data and threaten to publish it if ransom is not paid.'
                },
                {
                    text: 'Best backup strategy against ransomware?',
                    options: ['Cloud only', '3-2-1 rule (3 copies, 2 media, 1 offsite)', 'USB drive only'],
                    correct: 1,
                    explanation: '3-2-1 backup rule ensures multiple copies with offline protection.'
                },
                {
                    text: 'What is a "ransomware-as-a-service"?',
                    options: ['Cloud backup', 'Ransomware tools for rent', 'Antivirus service'],
                    correct: 1,
                    explanation: 'RaaS allows criminals to rent ransomware tools and infrastructure.'
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
                },
                {
                    text: 'What is "spear phishing"?',
                    options: ['Mass email spam', 'Targeted phishing attack', 'Fishing with spears'],
                    correct: 1,
                    explanation: 'Spear phishing targets specific individuals with personalized messages.'
                },
                {
                    text: 'What should you check in a suspicious email link?',
                    options: ['Color of link', 'Actual URL destination', 'Font size'],
                    correct: 1,
                    explanation: 'Hover over links to see the actual destination URL before clicking.'
                },
                {
                    text: 'What is "whaling" in phishing?',
                    options: ['Phishing for whales', 'Targeting high-level executives', 'Ocean-themed scam'],
                    correct: 1,
                    explanation: 'Whaling targets C-level executives and high-value targets.'
                },
                {
                    text: 'Best defense against phishing?',
                    options: ['User awareness training', 'Better firewalls', 'More RAM'],
                    correct: 0,
                    explanation: 'User awareness training is the most effective defense against phishing.'
                },
                {
                    text: 'What is a "phishing kit"?',
                    options: ['Fishing equipment', 'Pre-made phishing tools', 'Antivirus software'],
                    correct: 1,
                    explanation: 'Phishing kits are pre-made tools that make it easy to create phishing sites.'
                },
                {
                    text: 'What should you do if you clicked a phishing link?',
                    options: ['Ignore it', 'Report immediately and change passwords', 'Tell friends'],
                    correct: 1,
                    explanation: 'Report the incident and change passwords immediately to minimize damage.'
                },
                {
                    text: 'What is "vishing"?',
                    options: ['Video phishing', 'Voice phishing (phone calls)', 'Virus phishing'],
                    correct: 1,
                    explanation: 'Vishing uses phone calls to trick victims into revealing information.'
                },
                {
                    text: 'What is "smishing"?',
                    options: ['SMS phishing', 'Smart phishing', 'Small phishing'],
                    correct: 0,
                    explanation: 'Smishing uses SMS/text messages to deliver phishing attacks.'
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
                },
                {
                    text: 'What does APT stand for?',
                    options: ['Advanced Persistent Threat', 'Automatic Protection Tool', 'Advanced Password Technology'],
                    correct: 0,
                    explanation: 'APT stands for Advanced Persistent Threat - sophisticated, long-term attacks.'
                },
                {
                    text: 'Typical APT dwell time in network?',
                    options: ['Hours', 'Days to months', 'Minutes'],
                    correct: 1,
                    explanation: 'APTs often remain undetected for months or even years.'
                },
                {
                    text: 'What is "lateral movement" in APT?',
                    options: ['Physical movement', 'Spreading through network', 'Moving servers'],
                    correct: 1,
                    explanation: 'Lateral movement is when attackers spread from initial entry to other systems.'
                },
                {
                    text: 'What is the APT kill chain?',
                    options: ['Physical weapon', 'Attack progression stages', 'Network cable'],
                    correct: 1,
                    explanation: 'The kill chain describes stages from reconnaissance to data exfiltration.'
                },
                {
                    text: 'Best tool for APT detection?',
                    options: ['EDR (Endpoint Detection and Response)', 'Basic antivirus', 'Firewall only'],
                    correct: 0,
                    explanation: 'EDR provides advanced monitoring and behavioral analysis for APT detection.'
                },
                {
                    text: 'What is "persistence" in APT?',
                    options: ['Continuous access', 'Patience', 'Network speed'],
                    correct: 0,
                    explanation: 'Persistence mechanisms ensure attackers maintain access over time.'
                },
                {
                    text: 'What is "C2" in APT context?',
                    options: ['Command and Control', 'Computer to Computer', 'Cloud Computing'],
                    correct: 0,
                    explanation: 'C2 (Command and Control) is infrastructure used to control compromised systems.'
                },
                {
                    text: 'What is threat hunting?',
                    options: ['Proactive search for threats', 'Playing games', 'Physical hunting'],
                    correct: 0,
                    explanation: 'Threat hunting proactively searches for threats that evade automated detection.'
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
                },
                {
                    text: 'What does DDoS stand for?',
                    options: ['Distributed Denial of Service', 'Data Destruction on Server', 'Direct Denial of Security'],
                    correct: 0,
                    explanation: 'DDoS stands for Distributed Denial of Service - overwhelming targets with traffic.'
                },
                {
                    text: 'Common DDoS attack type?',
                    options: ['Volume-based', 'Password guessing', 'SQL injection'],
                    correct: 0,
                    explanation: 'Volume-based attacks flood networks with massive amounts of traffic.'
                },
                {
                    text: 'What is a botnet?',
                    options: ['Network of compromised devices', 'Fast internet', 'Security tool'],
                    correct: 0,
                    explanation: 'Botnets are networks of compromised devices used to launch DDoS attacks.'
                },
                {
                    text: 'Best DDoS protection strategy?',
                    options: ['Over-provision bandwidth', 'Hide the server', 'Turn off internet'],
                    correct: 0,
                    explanation: 'Over-provisioning bandwidth helps absorb attack traffic.'
                },
                {
                    text: 'What is "blackholing" in DDoS?',
                    options: ['Dropping all traffic to target', 'Physical hole', 'Network upgrade'],
                    correct: 0,
                    explanation: 'Blackholing routes all traffic to a null route, dropping both good and bad traffic.'
                },
                {
                    text: 'Layer 7 DDoS attack targets?',
                    options: ['Application layer', 'Physical cables', 'Power supply'],
                    correct: 0,
                    explanation: 'Layer 7 attacks target the application layer (HTTP floods, etc.).'
                },
                {
                    text: 'What is rate limiting?',
                    options: ['Controlling request frequency', 'Internet speed', 'Data storage'],
                    correct: 0,
                    explanation: 'Rate limiting controls how many requests a user/IP can make in a time period.'
                },
                {
                    text: 'Sign of ongoing DDoS attack?',
                    options: ['Slow network performance', 'Fast internet', 'More sales'],
                    correct: 0,
                    explanation: 'Slow network performance and service unavailability are common DDoS signs.'
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
                },
                {
                    text: 'What is a software bill of materials (SBOM)?',
                    options: ['List of all components', 'Shopping list', 'Hardware inventory'],
                    correct: 0,
                    explanation: 'SBOM lists all software components and dependencies for vulnerability tracking.'
                },
                {
                    text: 'Famous supply chain attack example?',
                    options: ['SolarWinds', 'DDoS attack', 'Phishing email'],
                    correct: 0,
                    explanation: 'SolarWinds was a major supply chain attack compromising software updates.'
                },
                {
                    text: 'How to secure third-party libraries?',
                    options: ['Regular vulnerability scanning', 'Trust all libraries', 'Never update'],
                    correct: 0,
                    explanation: 'Regular scanning identifies vulnerabilities in third-party components.'
                },
                {
                    text: 'What is code signing?',
                    options: ['Digital signature for code', 'Writing code', 'Code review'],
                    correct: 0,
                    explanation: 'Code signing uses digital signatures to verify code authenticity.'
                },
                {
                    text: 'Supply chain risk management includes?',
                    options: ['Vendor assessment', 'Ignoring vendors', 'Free software only'],
                    correct: 0,
                    explanation: 'Vendor security assessments help identify supply chain risks.'
                },
                {
                    text: 'What is dependency confusion?',
                    options: ['Private vs public package conflict', 'Confused developer', 'Version mismatch'],
                    correct: 0,
                    explanation: 'Attackers upload malicious packages with names of private dependencies.'
                },
                {
                    text: 'Best practice for open source software?',
                    options: ['Verify sources and checksums', 'Download from anywhere', 'Use latest always'],
                    correct: 0,
                    explanation: 'Always verify open source software sources and checksums.'
                },
                {
                    text: 'What is typosquatting in supply chain?',
                    options: ['Misspelled package names', 'Typing errors', 'Code typos'],
                    correct: 0,
                    explanation: 'Attackers create packages with names similar to popular ones (typosquatting).'
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
                },
                {
                    text: 'What is a common info stealer target file?',
                    options: ['Password databases', 'Desktop wallpaper', 'Recycle bin'],
                    correct: 0,
                    explanation: 'Info stealers target password databases and credential stores.'
                },
                {
                    text: 'How do info stealers usually spread?',
                    options: ['Malicious downloads', 'Air', 'Clean USB drives'],
                    correct: 0,
                    explanation: 'Info stealers often spread through malicious downloads and email attachments.'
                },
                {
                    text: 'What is "credential stuffing"?',
                    options: ['Using stolen credentials', 'Making passwords', 'Filling forms'],
                    correct: 0,
                    explanation: 'Credential stuffing uses stolen credentials to access other accounts.'
                },
                {
                    text: 'Best practice to prevent credential theft?',
                    options: ['Unique passwords per site', 'Same password everywhere', 'Short passwords'],
                    correct: 0,
                    explanation: 'Unique passwords prevent credential stuffing attacks across multiple sites.'
                },
                {
                    text: 'What should you do if credentials are stolen?',
                    options: ['Change passwords immediately', 'Wait and see', 'Tell friends'],
                    correct: 0,
                    explanation: 'Change passwords immediately and enable MFA on affected accounts.'
                },
                {
                    text: 'What is a "stealer log"?',
                    options: ['Stolen data dump', 'Log file', 'System log'],
                    correct: 0,
                    explanation: 'Stealer logs are dumps of stolen credentials sold on dark web markets.'
                },
                {
                    text: 'How to detect info stealer infection?',
                    options: ['Unexpected browser extensions', 'Faster computer', 'More storage'],
                    correct: 0,
                    explanation: 'Unexpected browser extensions and slow performance may indicate infection.'
                },
                {
                    text: 'What is session hijacking?',
                    options: ['Stealing session cookies', 'Breaking sessions', 'Long sessions'],
                    correct: 0,
                    explanation: 'Session hijacking steals session cookies to impersonate logged-in users.'
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
