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
    console.error(errorMessage);
  } else if (!isValidEmail(email)) {
    isValid = false;
    errorMessage = 'Please enter a valid email address.';
    emailInput.style.borderColor = '#EF4444';
    console.error(errorMessage);
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
    // In a real application, send data to a server here
    window.location.href = 'dashboard.html';
  } else {
    // Show error message
    console.error(errorMessage);
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

  // Set up password rules popup logic
  const passwordInput = document.getElementById('registerPassword');
  const rulesPopup = document.getElementById('password-rules-popup');

  if (passwordInput && rulesPopup) {
    const rules = {
      length: document.getElementById('rule-length'),
      upper: document.getElementById('rule-upper'),
      lower: document.getElementById('rule-lower'),
      number: document.getElementById('rule-number'),
      special: document.getElementById('rule-special')
    };

    // Show popup on focus
    passwordInput.addEventListener('focus', () => {
      rulesPopup.classList.remove('password-rules-hidden');
      rulesPopup.classList.add('password-rules-visible');
    });

    // Hide popup on blur
    passwordInput.addEventListener('blur', () => {
      rulesPopup.classList.remove('password-rules-visible');
      rulesPopup.classList.add('password-rules-hidden');
    });

    // Validate rules dynamically on input
    passwordInput.addEventListener('input', (e) => {
      const p = e.target.value;

      // Rule: Length >= 8
      toggleRuleClass(rules.length, p.length >= 8);
      // Rule: Uppercase
      toggleRuleClass(rules.upper, /[A-Z]/.test(p));
      // Rule: Lowercase
      toggleRuleClass(rules.lower, /[a-z]/.test(p));
      // Rule: Number
      toggleRuleClass(rules.number, /[0-9]/.test(p));
      // Rule: Special char
      toggleRuleClass(rules.special, /[!@#$%^&*(),.?":{}|<>]/.test(p));
    });
  }
}

// Helper to toggle valid/invalid class for rules
window.toggleRuleClass = function(element, isValid) {
  if (!element) return;
  if (isValid) {
    element.classList.remove('rule-invalid');
    element.classList.add('rule-valid');
  } else {
    element.classList.remove('rule-valid');
    element.classList.add('rule-invalid');
  }
}