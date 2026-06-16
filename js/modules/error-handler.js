/**
 * Masta Ghimau IR Challenge - Error Handler Module
 * Sprint 1: Centralized error handling with user-friendly messages
 * Author: Hussein Mohamed masta ghimau
 */

class ErrorHandler {
    constructor() {
        this.errorContainer = null;
        this.defaultDuration = 5000;
        this.init();
    }

    init() {
        // Create error container if it doesn't exist
        if (!document.getElementById('error-container')) {
            this.createErrorContainer();
        }
        this.errorContainer = document.getElementById('error-container');

        // Set up global error listeners
        this.setupGlobalListeners();
    }

    createErrorContainer() {
        const container = document.createElement('div');
        container.id = 'error-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            max-width: 90%;
            width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    setupGlobalListeners() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handle(event.error, 'GLOBAL', { 
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            // Prevent default browser error display
            event.preventDefault();
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handle(event.reason, 'PROMISE');
            event.preventDefault();
        });
    }

    /**
     * Main error handling method
     * @param {Error|any} error - The error object or message
     * @param {string} context - Context where error occurred (e.g., 'AR_INIT', 'GLOBAL')
     * @param {Object} metadata - Additional metadata about the error
     */
    handle(error, context = 'GENERAL', metadata = {}) {
        // Log error for debugging
        this.logError(error, context, metadata);

        // Get user-friendly message
        const userMessage = this.getUserMessage(error, context);

        // Display to user
        this.showError(userMessage, this.getErrorType(context));

        // Call custom handler if registered
        if (this.onError) {
            this.onError(error, context, userMessage);
        }
    }

    /**
     * Log error to console with structured format
     */
    logError(error, context, metadata = {}) {
        const timestamp = new Date().toISOString();
        const errorInfo = {
            timestamp,
            context,
            message: error?.message || String(error),
            stack: error?.stack,
            ...metadata
        };

        // Log to console with styling
        console.error(
            `%c[ERROR] ${context} | ${timestamp}`,
            'color: #ef4444; font-weight: bold;',
            '\n',
            errorInfo
        );

        // Store in session for debugging
        this.storeError(errorInfo);
    }

    /**
     * Store error in sessionStorage for debugging
     */
    storeError(errorInfo) {
        try {
            const errors = JSON.parse(sessionStorage.getItem('masta_errors') || '[]');
            errors.push(errorInfo);
            // Keep only last 10 errors
            if (errors.length > 10) errors.shift();
            sessionStorage.setItem('masta_errors', JSON.stringify(errors));
        } catch (e) {
            // Ignore storage errors
        }
    }

    /**
     * Get user-friendly error message based on context
     */
    getUserMessage(error, context) {
        const messages = {
            'AR_INIT': {
                title: 'AR Initialization Failed',
                message: 'Unable to start AR experience. Please ensure camera permissions are granted and try again.',
                action: 'Check Permissions'
            },
            'CAMERA_ACCESS': {
                title: 'Camera Access Denied',
                message: 'Camera access is required for AR features. Please allow camera access in your browser settings.',
                action: 'Learn More'
            },
            'MINDAR_LOAD': {
                title: 'AR Library Error',
                message: 'Failed to load AR tracking library. Please refresh the page and try again.',
                action: 'Refresh'
            },
            'TARGET_LOAD': {
                title: 'Target Image Error',
                message: 'Failed to load AR target image. Please check your connection and try again.',
                action: 'Retry'
            },
            'WEBGL': {
                title: '3D Rendering Error',
                message: 'Your browser or device does not support WebGL, which is required for AR features.',
                action: 'Check Compatibility'
            },
            'MEMORY': {
                title: 'Memory Limit Reached',
                message: 'The application is running low on memory. Please refresh the page to continue.',
                action: 'Refresh'
            },
            'NETWORK': {
                title: 'Connection Error',
                message: 'Unable to connect to the server. Please check your internet connection.',
                action: 'Retry'
            },
            'VALIDATION': {
                title: 'Invalid Input',
                message: 'The provided input is invalid or not allowed. Please check and try again.',
                action: 'OK'
            },
            'PROMISE': {
                title: 'Async Operation Failed',
                message: 'An operation failed to complete. Please refresh and try again.',
                action: 'Refresh'
            },
            'GLOBAL': {
                title: 'Application Error',
                message: 'An unexpected error occurred. Please refresh the page to continue.',
                action: 'Refresh'
            }
        };

        // Check for specific error types
        if (error?.name === 'NotAllowedError') {
            return messages['CAMERA_ACCESS'];
        }
        if (error?.name === 'NotFoundError') {
            return messages['TARGET_LOAD'];
        }
        if (error?.name === 'WebGLRenderingContext') {
            return messages['WEBGL'];
        }

        return messages[context] || messages['GLOBAL'];
    }

    /**
     * Get error type for styling
     */
    getErrorType(context) {
        const types = {
            'AR_INIT': 'error',
            'CAMERA_ACCESS': 'warning',
            'MINDAR_LOAD': 'error',
            'TARGET_LOAD': 'warning',
            'WEBGL': 'error',
            'MEMORY': 'warning',
            'NETWORK': 'warning',
            'VALIDATION': 'info',
            'PROMISE': 'error',
            'GLOBAL': 'error'
        };
        return types[context] || 'error';
    }

    /**
     * Display error message to user
     */
    showError(errorData, type = 'error') {
        if (!this.errorContainer) return;

        const { title, message, action } = errorData;

        // Create error element
        const errorEl = document.createElement('div');
        errorEl.className = `error-toast error-${type}`;
        errorEl.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            border-left: 4px solid ${this.getBorderColor(type)};
            color: #ffffff;
            padding: 16px 20px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            pointer-events: auto;
            animation: slideIn 0.3s ease-out;
            font-family: 'Inter', sans-serif;
        `;

        errorEl.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 20px;">${this.getIcon(type)}</span>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">${title}</div>
                    <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">${message}</div>
                </div>
                <button class="error-close" style="
                    background: none;
                    border: none;
                    color: #ffffff;
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                ">&times;</button>
            </div>
        `;

        // Add close handler
        const closeBtn = errorEl.querySelector('.error-close');
        closeBtn.addEventListener('click', () => this.dismissError(errorEl));
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');

        // Add to container
        this.errorContainer.appendChild(errorEl);

        // Auto-dismiss after duration
        setTimeout(() => this.dismissError(errorEl), this.defaultDuration);
    }

    dismissError(errorEl) {
        if (!errorEl || errorEl.classList.contains('dismissing')) return;

        errorEl.classList.add('dismissing');
        errorEl.style.animation = 'slideOut 0.3s ease-in forwards';

        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.parentNode.removeChild(errorEl);
            }
        }, 300);
    }

    getBackgroundColor(type) {
        const colors = {
            error: 'rgba(239, 68, 68, 0.95)',
            warning: 'rgba(245, 158, 11, 0.95)',
            info: 'rgba(59, 130, 246, 0.95)'
        };
        return colors[type] || colors.error;
    }

    getBorderColor(type) {
        const colors = {
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.error;
    }

    getIcon(type) {
        const icons = {
            error: '⚠️',
            warning: '⚡',
            info: 'ℹ️'
        };
        return icons[type] || icons.error;
    }

    /**
     * Clear all displayed errors
     */
    clearAll() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = '';
        }
    }

    /**
     * Get stored errors for debugging
     */
    getStoredErrors() {
        try {
            return JSON.parse(sessionStorage.getItem('masta_errors') || '[]');
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear stored errors
     */
    clearStoredErrors() {
        sessionStorage.removeItem('masta_errors');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Create singleton instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ErrorHandler, errorHandler };
}
