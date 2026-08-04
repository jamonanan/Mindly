# File: `signup.js`

## Overview
This file manages the frontend interactions for the signup page. It handles form validation, ensuring fields are populated and match requirements, and dynamically updates a password rules checklist in the UI as the user types. Note that the actual submission logic is intercepted by an inline `onclick` handler on the signup button (which points to `registerUser()` in `firebaseAuth.js`), so this form's native submit validation is essentially bypassed in the current implementation.

## Key Logic & Line-by-Line Explanation

### Form Validation (`validateSignupForm`)
- **Lines 12-25**: Prevents default form submission. Checks for the existence of four input fields (`fullName`, `email`, `password`, `confirmPassword`).
- **Lines 28-31**: Retrieves and trims the input values.
- **Lines 37-89**: Validates each field sequentially:
  - Validates `fullName` is not empty.
  - Validates `email` is not empty and conforms to `isValidEmail()` format.
  - Validates `password` is not empty and has a minimum length of 6 characters.
  - Validates `confirmPassword` is not empty.
  - Confirms that `password` and `confirmPassword` match.
  - If any validation fails, it applies a red border (`#EF4444`) to the corresponding input and updates an error message.
- **Lines 92-101**: If validation passes (`isValid == true`), it simulates a redirect to `dashboard.html`. **Note:** Just like `login.js`, this logic does not perform real Firebase registration because the `onclick="registerUser()"` button overrides this flow.

### Initialization & Dynamic Password Rules (`initSignup`)
- **Lines 108-113**: Ensures the DOM is fully loaded before executing `initSignup()`.
- **Lines 116-120**: Attaches the validation function to the `#signupForm` `submit` event (which is currently bypassed due to the `type="button"` in HTML).
- **Lines 123-145**: Selects the password input field (`#registerPassword`) and the rules popup (`#password-rules-popup`).
  - Attaches `focus` and `blur` event listeners to the password input. When the user clicks into the password field, the popup becomes visible. When they click away, it hides.
- **Lines 148-161**: Adds an `input` event listener to `#registerPassword`. As the user types, it evaluates the password against a set of regex patterns and length checks:
  - `length >= 8`
  - `/[A-Z]/` (Uppercase)
  - `/[a-z]/` (Lowercase)
  - `/[0-9]/` (Number)
  - `/[!@#$%^&*(),.?":{}|<>]/` (Special character)
  - It then calls `toggleRuleClass` for each rule.

### Helper Function (`toggleRuleClass`)
- **Lines 166-175**: Dynamically changes the CSS class of the rule list items between `rule-valid` (usually green) and `rule-invalid` (usually red) based on whether the password currently meets the specific rule condition.
