# File: `account.js`

## Overview
This file manages the user's account settings and profile. It handles authentication state, updating profile information (like the full name) in both Firebase Auth and Firestore, sending verification and password reset emails, account deletion, and logging out.

## Key Logic & Line-by-Line Explanation

### Setup & DOM Elements
- **Lines 1-20**: Imports necessary functions from Firebase Authentication, Firestore, and Storage. (Note: Storage functions are imported but not currently utilized in this file).
- **Lines 23-31**: Grabs references to the inputs, buttons, and message display elements in `account.html`.
- **Lines 35-42 (`showMessage`)**: A utility function to display temporary success or error banners to the user. It sets the text and CSS class, displays the element, and uses `setTimeout` to hide it after 5 seconds.

### Authentication & Initialization
- **Lines 44-82**: `onAuthStateChanged` listener.
  - **Line 48**: Calls `await user.reload()` immediately. This ensures that if the user just clicked a verification link in their email, the app pulls the freshest status from Firebase rather than relying on cached auth state.
  - Sets `currentUser` and updates the email display text.
  - Checks `currentUser.emailVerified`. Updates the UI badge to say "Verified" (green) or "Unverified" (yellow), and hides/shows the "Resend Email" button accordingly.
  - **Lines 65-76**: Fetches the user's custom document from Firestore (`users/{uid}`) and populates the "Full Name" input box. If not logged in, redirects to `login.html`.

### Profile Management
- **Lines 85-106 (Update Name)**:
  - Retrieves the text from the name input.
  - Validates it's not empty.
  - Updates the native Firebase Auth profile (`updateProfile(currentUser, { displayName: newName })`).
  - Updates the custom Firestore document (`updateDoc(docRef, { fullName: newName })`).
  - Shows a success or error message.

### Security Actions
- **Lines 109-119 (Password Reset)**:
  - Triggers `sendPasswordResetEmail(auth, currentUser.email)`. Firebase automatically emails the user a secure link to reset their password.
- **Lines 121-131 (Resend Verification)**:
  - Triggers `sendEmailVerification(currentUser)`. Firebase automatically emails a verification link.
- **Lines 133-156 (Delete Account)**:
  - Prompts the user with a standard browser `confirm()` dialog.
  - If confirmed, first deletes the custom Firestore document (`deleteDoc`).
  - Then deletes the user from Firebase Auth (`deleteUser(currentUser)`).
  - Handles the `auth/requires-recent-login` error. Firebase requires sensitive actions like account deletion to happen shortly after login. If this error is thrown, the user is prompted to log out and log back in before trying again.

### Logout
- **Lines 158-167 (Logout)**:
  - Calls `signOut(auth)` and redirects the user to `index.html`.
