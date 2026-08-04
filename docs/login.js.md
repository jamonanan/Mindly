# File: `login.js`

## Overview
This file contains frontend form validation logic for the login page. However, based on the current implementation in `login.html`, this script is largely bypassed because the login button relies on an inline `onclick` handler invoking `loginUser()` directly from `firebaseAuth.js` rather than triggering a traditional form submission.

## Key Logic & Line-by-Line Explanation

### Form Validation (`validateLoginForm`)
- **Lines 11-22**: Defines the `validateLoginForm` function that takes an `event`. It calls `event.preventDefault()` to stop the page from reloading. It fetches the `#email` and `#password` input elements.
- **Lines 24-27**: Retrieves the values from the inputs and trims whitespace.
- **Lines 28-48**: Checks if the email or password fields are empty. If either is empty, it sets the `isValid` flag to false, sets an error message, and applies a red border (`#EF4444`) to the invalid input.
- **Lines 50-55**: (Note: Calls `isValidEmail(email)` which must be defined elsewhere, likely in `common.js`, though this will fail if not defined). If invalid, it highlights the email field red.
- **Lines 57-65**: If validation passes (`isValid == true`), it simulates a successful login by manually redirecting to `dashboard.html`. **Note:** This does not perform any actual Firebase authentication. That is handled by `loginUser()` in `firebaseAuth.js`.

### Initialization
- **Lines 74-88**: Ensures the DOM is fully loaded before executing `initLogin()`.
- **`initLogin()`**: Selects `#loginForm` and attaches the `validateLoginForm` function to its `submit` event. Because the sign-in button in `login.html` has `type="button"` instead of `type="submit"`, this validation flow isn't naturally triggered by clicking the button.
