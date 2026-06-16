/**
 * Utility Helpers Module
 * Phase 3: ES Module Architecture
 * Common utility functions
 */

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>\"']/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim()
        .substring(0, 100);
}

/**
 * Check if text contains dangerous patterns
 * @param {string} text - Text to check
 * @returns {boolean} True if safe
 */
export function isSafeText(text) {
    if (!text || typeof text !== 'string') return false;
    const dangerous = /<script|javascript:|on\w+=|data:/i;
    return !dangerous.test(text);
}

/**
 * Validate scenario name against whitelist
 * @param {string} scenario - Scenario identifier
 * @returns {boolean} True if valid
 */
export function isValidScenario(scenario) {
    const validScenarios = [
        'ransomware',
        'phishing',
        'apt',
        'insider-threat',
        'malware-analysis',
        'ddos',
        'supplychain',
        'infostealer'
    ];
    return validScenarios.includes(scenario);
}

/**
 * Debounce function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds between calls
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if running on mobile device
 * @returns {boolean} True if mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if HTTPS is required for camera
 * @returns {boolean} True if HTTPS needed
 */
export function requiresHTTPS() {
    return window.location.protocol !== 'https:' &&
           window.location.hostname !== 'localhost' &&
           !window.location.hostname.includes('ngrok');
}

/**
 * Check camera API availability
 * @returns {boolean} True if camera available
 */
export function hasCameraAPI() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Format score with commas
 * @param {number} score - Raw score
 * @returns {string} Formatted score
 */
export function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Generate unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Wait for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    sanitizeInput,
    isSafeText,
    isValidScenario,
    debounce,
    throttle,
    isMobile,
    requiresHTTPS,
    hasCameraAPI,
    formatScore,
    generateId,
    deepClone,
    sleep
};
