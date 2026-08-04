# File: `firebaseAuth.js`

## Overview
This file serves as the core Firebase integration and authentication module for the application. It initializes Firebase services (Auth, Firestore, Storage) and provides global window functions for user registration, login, Google authentication, and logout. It also includes an authentication state listener that globally handles user sessions.

## Key Logic & Line-by-Line Explanation

### Firebase Initialization
- **Lines 1-7**: Imports necessary functions from Firebase version `10.12.2` via CDN. Includes Auth (`initializeApp`, `getAuth`, `createUserWithEmailAndPassword`, etc.), Firestore (`getFirestore`, `setDoc`, `getDoc`), and Storage.
- **Lines 11-19**: `firebaseConfig` object containing the API keys and project identifiers required to connect to the Firebase project (`mindly-7f7c4`).
- **Lines 21-26**: Initializes the Firebase app and exports the instances (`app`, `auth`, `db`, `storage`, `provider`) so other modules can reuse the initialized connections. The `provider` is initialized as a `GoogleAuthProvider` for Google Sign-In.

### UI Utility
- **Lines 28-36**: `showMessage(message, divId)` is a helper function to display error/success messages in the UI. It sets the element's display and opacity, and uses `setTimeout` to hide the message after 3 seconds.

### User Registration (`window.registerUser`)
- **Lines 38-44**: Retrieves input values from the registration form (`registerEmail`, `registerPassword`, `confirmPassword`, `fullName`).
- **Lines 45-60**: Validates that passwords match and enforces strict password rules (minimum 8 characters, at least one uppercase, lowercase, number, and special character). If any fail, it calls `showMessage`.
- **Lines 62-89**: Calls `createUserWithEmailAndPassword(auth, email, password)` to create the user account in Firebase Auth.
  - Upon success, it creates a custom user document in Firestore (`users/{uid}`) containing the email and full name using `setDoc`.
  - It then calls `sendEmailVerification(user)` to send a verification link to the newly registered email.
  - Finally, it redirects the user to `login.html` after a 3-second delay.
- **Lines 90-99**: Catches and handles registration errors. Specifically checks for the `auth/email-already-in-use` error code to provide a user-friendly message.

### User Login (`window.loginUser`)
- **Lines 102-116**: Extracts email and password from the login form and calls `signInWithEmailAndPassword(auth, email, password)`. On successful sign-in, it redirects the user directly to `dashboard.html`. Any errors display an "Invalid email or password" message.

### Authentication State Monitoring (`onAuthStateChanged`)
- **Lines 118-143**: This listener triggers whenever the user's sign-in state changes (e.g., across page loads). 
  - If a user is logged in, it fetches their custom user document from Firestore (`users/{uid}`).
  - If the user document exists, it dynamically updates the UI by looking for `userGreeting` to display "Welcome back, {fullName}!!".
  - It also searches for all elements with the class `.user-profile-pic` and updates their `src` to the user's `profilePicUrl` (or a default DiceBear avatar if none is set).

### Global Dropdown and Logout Logic
- **Lines 145-167**: Attaches a global click event listener to the `document`.
  - Toggles the display of the account dropdown menu when `.account-dropdown-btn` is clicked.
  - If the user clicks outside the dropdown wrapper, it closes the menu.
  - Listens for a click on `#globalLogoutBtn`. When clicked, it awaits `signOut(auth)` to terminate the Firebase session, then redirects the user back to the landing page (`index.html`).

### Google Sign-In (`window.signInWithGoogle`)
- **Lines 169-207**: Handles authentication using a Google popup via `signInWithPopup(auth, provider)`.
  - On successful sign-in, retrieves the `user` object.
  - Prepares `userData` using `user.email` and `user.displayName`.
  - Uses `setDoc(docRef, userData, { merge: true })` to create or update the user's Firestore record without overwriting existing fields (crucial for returning users).
  - Redirects to `dashboard.html`. If errors occur, it displays them using `loginMessage` or `signUpMessage` elements.
