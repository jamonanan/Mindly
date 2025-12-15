/* ============================================
   LOGIN PAGE FUNCTIONALITY
   ============================================ */

/**
 * Validates the login form
 * Checks if email and password fields are filled
 * @param {Event} event - The form submit event
 * @returns {boolean} - Returns true if form is valid, false otherwise
 */
function validateLoginForm(event) {
  // Prevent form from submitting by default
  event.preventDefault();

  // Get form elements
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Check if elements exist (for pages that don't have login form)
  if (!emailInput || !passwordInput) {
    return false;
  }

  // Get values and trim whitespace
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation flags
  let isValid = true;
  let errorMessage = '';

  // Check if email is empty
  if (email === '') {
    isValid = false;
    errorMessage = 'Please enter your email address.';
    emailInput.style.borderColor = '#EF4444'; // Red border for error
  } else {
    emailInput.style.borderColor = ''; // Reset border color
  }

  // Check if password is empty
  if (password === '') {
    isValid = false;
    errorMessage = 'Please enter your password.';
    passwordInput.style.borderColor = '#EF4444'; // Red border for error
  } else {
    passwordInput.style.borderColor = ''; // Reset border color
  }

  // Basic email format validation
  if (email !== '' && !isValidEmail(email)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address.';
    emailInput.style.borderColor = '#EF4444';
  }

  // If form is valid, redirect to dashboard
  if (isValid) {
    // In a real application, you would send data to a server here
    // For now, we'll just redirect to the dashboard
    window.location.href = 'dashboard.html';
  } else {
    // Show error message (you could use an alert or a better UI element)
    alert(errorMessage);
  }

  return isValid;
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Run initialization when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLogin);
} else {
  // DOM is already loaded
  initLogin();
}

function initLogin() {
  // Set up form validation
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm);
  }
}
