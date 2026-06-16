/**
 * Masta Ghimau IR Challenge - Challenges Data Module
 * Author: Hussein Mohamed masta ghimau
 * YouTube: https://www.youtube.com/@mastaghimau
 * GitHub: https://github.com/gh1mau
 */

const CHALLENGES = [
    {
        id: 0,
        title: "Ransomware Detection",
        category: "MALWARE ANALYSIS",
        difficulty: "MEDIUM",
        points: 500,
        timeLimit: 300, // 5 minutes in seconds
        scenario: `A critical server has been infected with ransomware. Files are being encrypted at an alarming rate. 
Your team has detected suspicious network traffic originating from the finance department. 
Analyze the evidence and identify the attack vector before the entire network is compromised.`,
        task: "Identify the 3 key indicators of compromise (IOCs) in the AR scene. Look for: suspicious file extensions, malicious processes, and network connections.",
        hints: [
            "Check for unusual file extensions like .encrypted, .locked, or random extensions",
            "Analyze network traffic patterns - look for connections to suspicious domains",
            "Look for suspicious PowerShell commands or WMI activity in process list"
        ],
        targets: [
            { id: "ioc1", name: "Encrypted Files", type: "file", x: -0.5, y: 0, z: 0 },
            { id: "ioc2", name: "Malicious Process", type: "process", x: 0, y: 0.3, z: 0 },
            { id: "ioc3", name: "C2 Connection", type: "network", x: 0.5, y: 0, z: 0 }
        ],
        correctAnswer: ["ioc1", "ioc2", "ioc3"],
        arScene: "ransomware"
    },
    {
        id: 1,
        title: "Phishing Analysis",
        category: "EMAIL SECURITY",
        difficulty: "EASY",
        points: 300,
        timeLimit: 240, // 4 minutes
        scenario: `Multiple employees have reported receiving suspicious emails claiming to be from the IT department. 
The emails request immediate password resets due to a "security breach". 
Your task is to analyze the phishing email and identify the red flags.`,
        task: "Examine the AR email display and identify 3 phishing indicators. Check the sender address, links, and content for suspicious elements.",
        hints: [
            "Check the sender's email address carefully - look for typos or suspicious domains",
            "Hover over links to see the actual destination URL",
            "Look for urgency tactics and grammatical errors in the message"
        ],
        targets: [
            { id: "flag1", name: "Spoofed Sender", type: "email", x: -0.4, y: 0.2, z: 0 },
            { id: "flag2", name: "Malicious Link", type: "link", x: 0, y: 0, z: 0 },
            { id: "flag3", name: "Urgency Tactic", type: "content", x: 0.4, y: -0.2, z: 0 }
        ],
        correctAnswer: ["flag1", "flag2", "flag3"],
        arScene: "phishing"
    },
    {
        id: 2,
        title: "Network Intrusion",
        category: "NETWORK SECURITY",
        difficulty: "HARD",
        points: 750,
        timeLimit: 420, // 7 minutes
        scenario: `Anomalous traffic has been detected on the corporate network during off-hours. 
Initial analysis suggests an advanced persistent threat (APT) has established a foothold. 
Trace the attacker's movements through the network and identify compromised systems.`,
        task: "Map the network intrusion in AR. Identify the entry point, lateral movement paths, and compromised systems.",
        hints: [
            "Start from the DMZ - look for the initial entry vector",
            "Follow the connection lines to trace lateral movement",
            "Check for privilege escalation indicators on domain controllers"
        ],
        targets: [
            { id: "entry", name: "Entry Point", type: "firewall", x: -0.6, y: 0, z: 0 },
            { id: "lateral", name: "Lateral Movement", type: "connection", x: 0, y: 0.2, z: 0 },
            { id: "compromised", name: "Compromised DC", type: "server", x: 0.6, y: 0, z: 0 }
        ],
        correctAnswer: ["entry", "lateral", "compromised"],
        arScene: "network"
    },
    {
        id: 3,
        title: "Malware Reverse Engineering",
        category: "REVERSE ENGINEERING",
        difficulty: "EXPERT",
        points: 1000,
        timeLimit: 600, // 10 minutes
        scenario: `A suspicious binary was found on an executive's laptop. The malware appears to be custom-built 
and uses advanced evasion techniques. Static analysis has revealed encrypted strings and 
anti-debugging checks. Analyze the code structure and identify key functions.`,
        task: "Examine the AR code visualization. Identify the main functions: payload delivery, persistence mechanism, and C2 communication.",
        hints: [
            "Look for registry modification functions - indicates persistence",
            "Check for network API calls - indicates C2 communication",
            "Find the decryption routine - reveals the actual payload"
        ],
        targets: [
            { id: "persist", name: "Persistence", type: "registry", x: -0.5, y: 0.3, z: 0 },
            { id: "payload", name: "Payload", type: "code", x: 0, y: 0, z: 0 },
            { id: "c2comm", name: "C2 Comm", type: "network", x: 0.5, y: -0.3, z: 0 }
        ],
        correctAnswer: ["persist", "payload", "c2comm"],
        arScene: "malware"
    },
    {
        id: 4,
        title: "Digital Forensics",
        category: "FORENSICS",
        difficulty: "HARD",
        points: 800,
        timeLimit: 480, // 8 minutes
        scenario: `A laptop has been seized as evidence in an insider threat investigation. 
The suspect is believed to have exfiltrated sensitive data. The disk image shows signs of 
data destruction attempts. Recover the evidence and reconstruct the timeline.`,
        task: "Analyze the AR filesystem visualization. Find deleted files, USB device artifacts, and cloud upload evidence.",
        hints: [
            "Check the recycle bin and unallocated space for deleted files",
            "Look for USB device connection logs in the registry",
            "Check browser history and cloud sync logs for data exfiltration"
        ],
        targets: [
            { id: "deleted", name: "Deleted Files", type: "file", x: -0.4, y: 0.2, z: 0 },
            { id: "usb", name: "USB Artifact", type: "device", x: 0, y: 0, z: 0 },
            { id: "exfil", name: "Cloud Upload", type: "cloud", x: 0.4, y: -0.2, z: 0 }
        ],
        correctAnswer: ["deleted", "usb", "exfil"],
        arScene: "forensics"
    },
    {
        id: 5,
        title: "Social Engineering",
        category: "HUMAN FACTORS",
        difficulty: "MEDIUM",
        points: 400,
        timeLimit: 300, // 5 minutes
        scenario: `The security team received a report of a vishing (voice phishing) attack targeting 
the help desk. The attacker impersonated an executive to obtain password resets. 
Review the call transcript and identify social engineering tactics used.`,
        task: "Review the AR call visualization. Identify the pretexting, authority abuse, and urgency tactics used.",
        hints: [
            "Listen for authority-based pressure tactics",
            "Note the urgency created by the caller",
            "Identify the pretext/scenario used to gain trust"
        ],
        targets: [
            { id: "pretext", name: "Pretext", type: "identity", x: -0.4, y: 0.1, z: 0 },
            { id: "authority", name: "Authority", type: "badge", x: 0, y: 0.2, z: 0 },
            { id: "urgency", name: "Urgency", type: "clock", x: 0.4, y: 0, z: 0 }
        ],
        correctAnswer: ["pretext", "authority", "urgency"],
        arScene: "social"
    }
];

// Challenge Manager Class
class ChallengeManager {
    constructor() {
        this.currentChallenge = null;
        this.selectedTargets = new Set();
        this.attempts = 0;
        this.maxAttempts = 3;
        this.hintsRevealed = 0;
        this.score = 0;
        this.completed = false;
    }

    loadChallenge(challengeId) {
        const challenge = CHALLENGES.find(c => c.id === challengeId);
        if (!challenge) {
            console.error(`Challenge ${challengeId} not found`);
            return null;
        }
        
        this.currentChallenge = challenge;
        this.selectedTargets.clear();
        this.attempts = 0;
        this.hintsRevealed = 0;
        this.completed = false;
        
        return challenge;
    }

    selectTarget(targetId) {
        if (this.completed) return false;
        
        if (this.selectedTargets.has(targetId)) {
            this.selectedTargets.delete(targetId);
            return false;
        } else {
            this.selectedTargets.add(targetId);
            return true;
        }
    }

    checkAnswer() {
        if (!this.currentChallenge) return null;
        
        const selected = Array.from(this.selectedTargets).sort();
        const correct = [...this.currentChallenge.correctAnswer].sort();
        
        const isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
        this.attempts++;
        
        if (isCorrect) {
            this.completed = true;
            this.calculateScore();
        }
        
        return {
            correct: isCorrect,
            attempts: this.attempts,
            maxAttempts: this.maxAttempts,
            selected: selected,
            correctAnswer: correct,
            remainingAttempts: this.maxAttempts - this.attempts
        };
    }

    calculateScore() {
        if (!this.currentChallenge) return 0;
        
        let baseScore = this.currentChallenge.points;
        
        // Deduct points for attempts
        const attemptPenalty = (this.attempts - 1) * 50;
        baseScore -= attemptPenalty;
        
        // Deduct points for hints
        const hintPenalty = this.hintsRevealed * 100;
        baseScore -= hintPenalty;
        
        this.score = Math.max(0, baseScore);
        return this.score;
    }

    getHint() {
        if (!this.currentChallenge) return null;
        if (this.hintsRevealed >= this.currentChallenge.hints.length) return null;
        
        const hint = this.currentChallenge.hints[this.hintsRevealed];
        this.hintsRevealed++;
        return hint;
    }

    getProgress() {
        if (!this.currentChallenge) return null;
        
        return {
            selected: this.selectedTargets.size,
            total: this.currentChallenge.correctAnswer.length,
            attempts: this.attempts,
            maxAttempts: this.maxAttempts,
            hintsUsed: this.hintsRevealed,
            completed: this.completed,
            score: this.score
        };
    }

    reset() {
        this.selectedTargets.clear();
        this.attempts = 0;
        this.hintsRevealed = 0;
        this.score = 0;
        this.completed = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CHALLENGES, ChallengeManager };
}
