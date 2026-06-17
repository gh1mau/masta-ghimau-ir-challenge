/**
 * Masta Ghimau IR Challenge - Validator Module
 * Sprint 2: Security Hardening - Input validation and sanitization
 * Author: Hussein Mohamed masta ghimau
 *
 * Security Features:
 * - Whitelist validation for scenarios and object types
 * - HTML escaping to prevent XSS
 * - URL parameter sanitization
 * - Safe text validation
 * - Length and alphanumeric constraints
 *
 * Unit Test Ready: All methods are pure functions with predictable outputs
 */

class Validator {
    constructor() {
        // Whitelist of valid scenarios - ONLY these are allowed
        this.VALID_SCENARIOS = new Set([
            'ransomware',
            'phishing',
            'insider-threat',
            'apt',
            'malware-analysis',
            'supplychain',      // Supply Chain Attack
            'ddos',             // DDoS & Defacement
            'infostealer'       // InfoStealer Outbreak
        ]);

        // Whitelist of valid object types
        this.VALID_OBJECT_TYPES = new Set([
            'file',
            'process',
            'network',
            'server',
            'email',
            'link',
            'firewall',
            'code',
            'registry',
            'device',
            'cloud',
            'identity',
            'badge',
            'clock'
        ]);

        // HTML entities for escaping
        this.HTML_ESCAPE_MAP = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };

        // Dangerous URL schemes to block
        this.DANGEROUS_SCHEMES = new Set([
            'javascript:',
            'data:',
            'vbscript:',
            'file:',
            'about:',
            'blob:',
            'filesystem:'
        ]);

        // Regex patterns
        this.PATTERNS = {
            // Alphanumeric with limited safe special chars
            ALPHANUMERIC: /^[a-zA-Z0-9\s\-_\.]+$/,
            // Safe text (no control chars, scripts)
            SAFE_TEXT: /^[\x20-\x7E\s]*$/,
            // URL parameter safe chars
            URL_PARAM_SAFE: /^[a-zA-Z0-9\-_]+$/,
            // HTML tag detection
            HTML_TAG: /<[^>]*>/g,
            // Event handler detection
            EVENT_HANDLER: /on\w+\s*=/gi,
            // Script detection
            SCRIPT_TAG: /<script[^>]*>[\s\S]*?<\/script>/gi
        };

        // Default limits
        this.DEFAULT_MAX_LENGTH = 255;
        this.MAX_URL_PARAM_LENGTH = 100;
    }

    // ============================================================================
    // HTML ESCAPING
    // ============================================================================

    /**
     * Escape HTML special characters to prevent XSS attacks
     * @param {string} value - Input string to escape
     * @returns {string} - Escaped string safe for HTML insertion
     *
     * @example
     * Validator.escapeHTML('<script>alert("xss")</script>')
     * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
     */
    escapeHTML(value) {
        if (value === null || value === undefined) {
            return '';
        }

        const str = String(value);

        return str.replace(/[&<>"'`=\/]/g, (char) => {
            return this.HTML_ESCAPE_MAP[char] || char;
        });
    }

    /**
     * Check if string contains HTML tags
     * @param {string} value - Input to check
     * @returns {boolean} - True if HTML tags detected
     */
    containsHTML(value) {
        if (!value) return false;
        return this.PATTERNS.HTML_TAG.test(String(value));
    }

    /**
     * Check if string contains event handlers (onclick, onerror, etc.)
     * @param {string} value - Input to check
     * @returns {boolean} - True if event handlers detected
     */
    containsEventHandlers(value) {
        if (!value) return false;
        return this.PATTERNS.EVENT_HANDLER.test(String(value));
    }

    /**
     * Check if string contains script tags
     * @param {string} value - Input to check
     * @returns {boolean} - True if script tags detected
     */
    containsScript(value) {
        if (!value) return false;
        return this.PATTERNS.SCRIPT_TAG.test(String(value));
    }

    // ============================================================================
    // SCENARIO VALIDATION (WHITELIST)
    // ============================================================================

    /**
     * Validate scenario ID against whitelist
     * ONLY allows: ransomware, phishing, insider-threat, apt, malware-analysis
     * @param {string} id - Scenario ID to validate
     * @returns {boolean} - True if scenario is in whitelist
     *
     * @example
     * Validator.isValidScenario('ransomware') // true
     * Validator.isValidScenario('<script>') // false
     * Validator.isValidScenario('../../../etc/passwd') // false
     */
    isValidScenario(id) {
        if (!id || typeof id !== 'string') {
            return false;
        }

        // Normalize: lowercase, trim
        const normalized = id.toLowerCase().trim();

        // Check whitelist ONLY - reject everything else
        return this.VALID_SCENARIOS.has(normalized);
    }

    /**
     * Get list of valid scenarios (for UI dropdowns, etc.)
     * @returns {string[]} - Array of valid scenario IDs
     */
    getValidScenarios() {
        return Array.from(this.VALID_SCENARIOS);
    }

    /**
     * Sanitize scenario ID - returns valid scenario or null
     * @param {string} id - Scenario ID to sanitize
     * @returns {string|null} - Valid scenario or null
     */
    sanitizeScenario(id) {
        return this.isValidScenario(id) ? id.toLowerCase().trim() : null;
    }

    // ============================================================================
    // OBJECT TYPE VALIDATION (WHITELIST)
    // ============================================================================

    /**
     * Validate object type against whitelist
     * @param {string} type - Object type to validate
     * @returns {boolean} - True if type is in whitelist
     *
     * @example
     * Validator.isValidObjectType('file') // true
     * Validator.isValidObjectType('process') // true
     * Validator.isValidObjectType('hacker-tool') // false
     */
    isValidObjectType(type) {
        if (!type || typeof type !== 'string') {
            return false;
        }

        // Normalize: lowercase, trim
        const normalized = type.toLowerCase().trim();

        // Check whitelist ONLY
        return this.VALID_OBJECT_TYPES.has(normalized);
    }

    /**
     * Get list of valid object types
     * @returns {string[]} - Array of valid object types
     */
    getValidObjectTypes() {
        return Array.from(this.VALID_OBJECT_TYPES);
    }

    // ============================================================================
    // TEXT VALIDATION
    // ============================================================================

    /**
     * Check if text is safe (no control chars, scripts, or dangerous content)
     * @param {string} value - Text to validate
     * @returns {boolean} - True if text is safe
     *
     * Checks:
     * - No HTML tags
     * - No event handlers
     * - No script tags
     * - Only printable ASCII characters
     * - Within length limits
     */
    isSafeText(value) {
        if (value === null || value === undefined) {
            return true; // Empty is safe
        }

        const str = String(value);

        // Check length
        if (str.length > this.DEFAULT_MAX_LENGTH) {
            return false;
        }

        // Check for HTML
        if (this.containsHTML(str)) {
            return false;
        }

        // Check for event handlers
        if (this.containsEventHandlers(str)) {
            return false;
        }

        // Check for scripts
        if (this.containsScript(str)) {
            return false;
        }

        // Check for safe characters only
        if (!this.PATTERNS.SAFE_TEXT.test(str)) {
            return false;
        }

        return true;
    }

    /**
     * Sanitize text to safe version
     * @param {string} value - Text to sanitize
     * @returns {string} - Sanitized text
     */
    sanitizeText(value) {
        if (value === null || value === undefined) {
            return '';
        }

        let str = String(value);

        // Remove script tags
        str = str.replace(this.PATTERNS.SCRIPT_TAG, '');

        // Remove event handlers
        str = str.replace(this.PATTERNS.EVENT_HANDLER, '');

        // Remove HTML tags
        str = str.replace(this.PATTERNS.HTML_TAG, '');

        // Remove control characters
        str = str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        // Trim and limit length
        str = str.trim().substring(0, this.DEFAULT_MAX_LENGTH);

        return str;
    }

    // ============================================================================
    // URL PARAMETER VALIDATION
    // ============================================================================

    /**
     * Sanitize URL parameter value
     * Prevents: path traversal, script injection, dangerous schemes
     * @param {string} value - URL parameter value to sanitize
     * @returns {string} - Sanitized value or empty string if invalid
     *
     * @example
     * Validator.sanitizeURLParam('ransomware') // 'ransomware'
     * Validator.sanitizeURLParam('../../../etc/passwd') // ''
     * Validator.sanitizeURLParam('<script>') // ''
     */
    sanitizeURLParam(value) {
        if (value === null || value === undefined) {
            return '';
        }

        let str = String(value);

        // Check length limit
        if (str.length > this.MAX_URL_PARAM_LENGTH) {
            str = str.substring(0, this.MAX_URL_PARAM_LENGTH);
        }

        // Block path traversal attempts
        if (str.includes('..') || str.includes('//') || str.includes('\\')) {
            return '';
        }

        // Block dangerous URL schemes
        const lowerStr = str.toLowerCase();
        for (const scheme of this.DANGEROUS_SCHEMES) {
            if (lowerStr.includes(scheme)) {
                return '';
            }
        }

        // Block HTML/script content
        if (this.containsHTML(str) || this.containsScript(str)) {
            return '';
        }

        // Only allow safe characters
        if (!this.PATTERNS.URL_PARAM_SAFE.test(str)) {
            return '';
        }

        return str;
    }

    /**
     * Validate URL parameter against whitelist values
     * @param {string} value - Parameter value
     * @param {Set|Array} whitelist - Allowed values
     * @returns {boolean} - True if value is in whitelist
     */
    isValidURLParam(value, whitelist) {
        if (!value || !whitelist) {
            return false;
        }

        const sanitized = this.sanitizeURLParam(value);
        if (!sanitized) {
            return false;
        }

        const whitelistSet = whitelist instanceof Set ? whitelist : new Set(whitelist);
        return whitelistSet.has(sanitized);
    }

    // ============================================================================
    // LENGTH VALIDATION
    // ============================================================================

    /**
     * Check if value is within maximum length
     * @param {string} value - Value to check
     * @param {number} limit - Maximum allowed length
     * @returns {boolean} - True if within limit
     */
    maxLength(value, limit = this.DEFAULT_MAX_LENGTH) {
        if (value === null || value === undefined) {
            return true; // Empty is within limit
        }

        return String(value).length <= limit;
    }

    /**
     * Enforce maximum length by truncation
     * @param {string} value - Value to truncate
     * @param {number} limit - Maximum length
     * @returns {string} - Truncated value
     */
    truncate(value, limit = this.DEFAULT_MAX_LENGTH) {
        if (value === null || value === undefined) {
            return '';
        }

        const str = String(value);
        return str.length > limit ? str.substring(0, limit) : str;
    }

    // ============================================================================
    // ALPHANUMERIC VALIDATION
    // ============================================================================

    /**
     * Check if value is alphanumeric (with safe special chars)
     * Allows: letters, numbers, spaces, hyphens, underscores, periods
     * @param {string} value - Value to check
     * @returns {boolean} - True if alphanumeric
     */
    isAlphanumeric(value) {
        if (value === null || value === undefined) {
            return true; // Empty is valid
        }

        return this.PATTERNS.ALPHANUMERIC.test(String(value));
    }

    /**
     * Sanitize to alphanumeric only
     * @param {string} value - Value to sanitize
     * @param {string} replacement - Replacement for invalid chars
     * @returns {string} - Sanitized alphanumeric string
     */
    toAlphanumeric(value, replacement = '') {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value).replace(/[^a-zA-Z0-9\s\-_\.]/g, replacement);
    }

    // ============================================================================
    // COMPREHENSIVE VALIDATION
    // ============================================================================

    /**
     * Validate and sanitize all inputs for a scenario
     * @param {Object} inputs - Object containing inputs to validate
     * @returns {Object} - Validation result
     */
    validateScenarioInputs(inputs = {}) {
        const result = {
            valid: true,
            errors: [],
            sanitized: {}
        };

        // Validate scenario
        if (inputs.scenario) {
            if (!this.isValidScenario(inputs.scenario)) {
                result.valid = false;
                result.errors.push(`Invalid scenario: ${inputs.scenario}`);
            } else {
                result.sanitized.scenario = this.sanitizeScenario(inputs.scenario);
            }
        }

        // Validate player name
        if (inputs.playerName) {
            if (!this.isSafeText(inputs.playerName)) {
                result.valid = false;
                result.errors.push('Player name contains unsafe characters');
            } else if (!this.maxLength(inputs.playerName, 50)) {
                result.valid = false;
                result.errors.push('Player name too long (max 50 chars)');
            } else {
                result.sanitized.playerName = this.escapeHTML(inputs.playerName.trim());
            }
        }

        // Validate challenge ID
        if (inputs.challengeId !== undefined) {
            const sanitized = this.sanitizeURLParam(String(inputs.challengeId));
            if (!sanitized || !/^\d+$/.test(sanitized)) {
                result.valid = false;
                result.errors.push('Invalid challenge ID');
            } else {
                result.sanitized.challengeId = parseInt(sanitized, 10);
            }
        }

        return result;
    }

    /**
     * Validate DOM element content is safe
     * @param {HTMLElement} element - Element to validate
     * @returns {boolean} - True if element content is safe
     */
    isSafeElement(element) {
        if (!element) return false;

        const html = element.innerHTML || '';

        // Check for dangerous patterns
        if (this.containsScript(html)) return false;
        if (this.containsEventHandlers(html)) return false;

        // Check for dangerous attributes
        const dangerousAttrs = ['onerror', 'onload', 'onclick', 'onmouseover'];
        for (const attr of dangerousAttrs) {
            if (element.hasAttribute(attr)) return false;
        }

        return true;
    }
}

// Create singleton instance
const validator = new Validator();

// Make available globally
window.Validator = Validator;
window.validator = validator;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Validator, validator };
}
