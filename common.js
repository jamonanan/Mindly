/* ============================================
   COMMON UTILITY FUNCTIONS
   ============================================ */

/**
 * Validates email format using a simple regex
 * @param {string} email - The email address to validate
 * @returns {boolean} - Returns true if email format is valid
 */
function isValidEmail(email) {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
