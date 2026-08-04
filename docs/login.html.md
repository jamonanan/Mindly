# File: `login.html`

## Overview
This is the login page for the Mindly application. It provides the user interface for returning users to authenticate themselves via email/password or Google Sign-In. 

## Key Logic & Structure

### Header and Imports
- **Lines 8-9**: Links the required stylesheets: `login.css` and `settings.css`.
- **Lines 16-22**: Defines the header with the Mindly logo. Clicking the logo acts as a link back to `index.html`.

### Form and Authentication Methods
- **Lines 25-28**: A styled card (`auth-card`) acting as a container for the login forms.
- **Line 30-32**: A hidden `<div>` with the ID `loginMessage`. This is targeted by `firebaseAuth.js` to display error messages (like "Invalid email or password").
- **Lines 35-46**: The login form (`#loginForm`). It captures `#email` and `#password` input fields.
- **Lines 48-52**: The primary "Sign In" button.
  - Importantly, it has `type="button"` and `onclick="loginUser()"`. This means clicking the button directly invokes the global `loginUser` function defined in `firebaseAuth.js` which handles the Firebase authentication flow, effectively bypassing the HTML form submission behavior.
- **Lines 60-77**: The "Sign in with Google" button.
  - It triggers `onclick="signInWithGoogle()"`, another function globally exposed by `firebaseAuth.js` that opens a Google authentication popup.

### External Scripts
- **Lines 88-91**: Injects JavaScript functionality.
  - `common.js`: Contains common utility functions.
  - `login.js`: Contains frontend validation (though largely bypassed due to the button types).
  - `firebaseAuth.js` (`type="module"`): The core Firebase logic that handles authentication events.
  - `settings.js` (`type="module"`): Used for applying user-specific settings (like dark mode or font sizes) even on the login screen.
