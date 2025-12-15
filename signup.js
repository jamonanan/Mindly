/* ============================================
   SIGNUP PAGE FUNCTIONALITY
   ============================================ */

/**
 * Validates the signup form
 * Checks if all fields are filled and passwords match
 * @param {Event} event - The form submit event
 * @returns {boolean} - Returns true if form is valid, false otherwise
 */
function validateSignupForm(event) {
  // Prevent form from submitting by default
  event.preventDefault();

  // Get form elements
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  // Check if elements exist
  if (!fullNameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    return false;
  }

  // Get values and trim whitespace
  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Validation flags
  let isValid = true;
  let errorMessage = '';

  // Check if full name is empty
  if (fullName === '') {
    isValid = false;
    errorMessage = 'Please enter your full name.';
    fullNameInput.style.borderColor = '#EF4444';
  } else {
    fullNameInput.style.borderColor = '';
  }

  // Check if email is empty
  if (email === '') {
    isValid = false;
    errorMessage = 'Please enter your email address.';
    emailInput.style.borderColor = '#EF4444';
  } else if (!isValidEmail(email)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address.';
    emailInput.style.borderColor = '#EF4444';
  } else {
    emailInput.style.borderColor = '';
  }

  // Check if password is empty
  if (password === '') {
    isValid = false;
    errorMessage = 'Please enter a password.';
    passwordInput.style.borderColor = '#EF4444';
  } else if (password.length < 6) {
    isValid = false;
    errorMessage = 'Password must be at least 6 characters long.';
    passwordInput.style.borderColor = '#EF4444';
  } else {
    passwordInput.style.borderColor = '';
  }

  // Check if confirm password is empty
  if (confirmPassword === '') {
    isValid = false;
    errorMessage = 'Please confirm your password.';
    confirmPasswordInput.style.borderColor = '#EF4444';
  } else {
    confirmPasswordInput.style.borderColor = '';
  }

  // Check if passwords match
  if (password !== '' && confirmPassword !== '' && password !== confirmPassword) {
    isValid = false;
    errorMessage = 'Passwords do not match. Please try again.';
    passwordInput.style.borderColor = '#EF4444';
    confirmPasswordInput.style.borderColor = '#EF4444';
  }

  // If form is valid, redirect to dashboard
  if (isValid) {
    // In a real application, you would send data to a server here
    window.location.href = 'dashboard.html';
  } else {
    // Show error message
    alert(errorMessage);
  }

  return isValid;
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Run initialization when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSignup);
} else {
  // DOM is already loaded
  initSignup();
}

function initSignup() {
  // Set up form validation
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', validateSignupForm);
  }
}
