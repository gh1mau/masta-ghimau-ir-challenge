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
        targetPath: './assets/targets/targets.mind',
        maxTrack: 1,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no',
        colors: {
            primary: 0x00ff41,
            warning: 0xffff00,
            error: 0xff0040
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
        answerReveal: 1000
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
