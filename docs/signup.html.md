# File: `signup.html`

## Overview
This is the registration page for the Mindly application. It allows new users to create an account using an email, password, and full name, or by signing up with Google. The page is designed with real-time password rule validation feedback.

## Key Logic & Structure

### Header and Imports
- **Lines 8-11**: Links to `signup.css` for page styling, `settings.css` for user theme preferences, and imports the `firebaseAuth.js` module.
- **Lines 18-24**: The header containing the logo which links back to the landing page (`index.html`).

### Form Elements
- **Lines 32-104**: The main signup form (`#signupForm`). 
- **Line 33**: A hidden `div` (`#signUpMessage`) used by `firebaseAuth.js` to display registration errors or success messages.
- **Lines 35-44**: Input fields for Full Name (`#fullName`) and Email (`#registerEmail`).
- **Lines 46-64**: The Password input area (`#registerPassword`).
  - Contains a nested absolute/relative positioned `div` (`#password-rules-popup`). This popup is hidden by default (`password-rules-hidden`).
  - Inside the popup is an unordered list where each `<li>` represents a password rule (length, uppercase, lowercase, number, special character). The `signup.js` script dynamically toggles their classes between `rule-invalid` and `rule-valid` as the user types.
- **Lines 67-71**: The Confirm Password input (`#confirmPassword`).

### Authentication Buttons
- **Lines 75-78**: The "Create Account" button.
  - Has `type="button"` and `onclick="registerUser()"`. Clicking it directly triggers the Firebase Auth registration logic defined in `firebaseAuth.js`, validating the password rules in the backend function rather than relying solely on the HTML form's submit event.
- **Lines 86-103**: The "Sign up with Google" button.
  - Has `onclick="signInWithGoogle()"`, connecting to the global Google Auth flow in `firebaseAuth.js`.

### External Scripts
- **Lines 114-116**: Injects JavaScript functionality.
  - `common.js`: Common utility functions.
  - `signup.js`: Frontend dynamic password validation and popup logic.
  - `settings.js` (`type="module"`): Applies user-specific visual settings.
