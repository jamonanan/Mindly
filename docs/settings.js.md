# File: `settings.js`

## Overview
This file manages the global accessibility settings for the application, specifically the "Dyslexic Font" and "Bionic Reading" toggles. It handles the injection of the settings modal UI across all pages, syncs preferences with `localStorage` for immediate cross-page application, and persists them to the user's Firestore document.

## Key Logic & Line-by-Line Explanation

### Modal Injection & DOM Setup
- **Lines 1-4**: Imports Firebase Auth and Firestore dependencies.
- **Lines 6-28**: Defines a multiline string `modalHtml` containing the structure for the settings bubble, including checkboxes for Dyslexic Font and Bionic Reading.
- **Line 30**: Injects the modal HTML directly into the end of the `<body>`. This guarantees the settings menu is available on any page that includes this script, without needing to copy-paste HTML.
- **Lines 32-37**: Grabs DOM references to the newly injected elements.

### Local Storage & Immediate Application
- **Lines 40-50**: Reads the boolean preferences from the browser's `localStorage`.
  - If Dyslexic Font is true (or default), it adds the `.dyslexic-mode` CSS class to the `document.body` and checks the toggle box. If false, it removes the class.
- **Lines 52-55**: Specifically hides the Bionic Reading option if the user is on `reading-buddy.html`, as that page implements its own specialized version of the feature.
- **Lines 60-70**: If Bionic Reading is stored as true, it waits a brief 100ms (to ensure DOM readiness) and calls `applyBionicReading()` on the body.

### Modal Interaction Logic
- **Lines 73-91**: Listens for clicks on any `.settings-btn` globally.
  - When clicked, it calculates the button's exact bounding box and positions the `#globalSettingsModal` absolutely underneath it, ensuring it doesn't spill off the left side of the viewport. Adds the `.show` class to make it visible.
- **Lines 93-98**: Closes the modal if the close button is clicked, or if the user clicks anywhere outside of the modal itself.

### Firebase Syncing
- **Lines 101-143**: `onAuthStateChanged` observer.
  - When a user logs in, it fetches their custom `users/{uid}` document to check for a `settings` object.
  - **Lines 112-114**: Pulls cloud settings down and overwrites `localStorage`, ensuring settings sync across different devices.
  - Updates the active DOM classes, toggle states, and Bionic formatting to reflect the cloud truth.
- **Lines 145-158 (`updateFirebaseSettings`)**: Async helper function. Whenever a user flips a toggle, this merges the new states into Firestore under the `settings` map.

### Toggle Listeners
- **Lines 161-183**: Event listeners for the two checkboxes.
  - They immediately update `localStorage`, apply/remove the CSS or JS formatting (`applyBionicReading` or `removeBionicReading`), and call `updateFirebaseSettings()` to sync to the cloud.

### Bionic Reading Implementation
- **Lines 185-194 (`removeBionicReading`)**: Reverts Bionic text. It finds all `<b>` elements with the `.bionic-bold` class, extracts their raw text, and replaces the `<b>` node with a standard text node, returning the DOM to normal.
- **Lines 196-236 (`applyBionicReading`)**: A recursive function to parse and modify text nodes for Bionic Reading.
  - **Lines 198-201**: Ignores scripts, styles, the settings modal itself, and most buttons to avoid breaking layout or functionality.
  - **Lines 204-234**: Iterates through child nodes. If it finds a text node with content, it splits it into words.
  - For each word, it calculates the halfway point (`Math.ceil(word.length / 2)`). It creates a `<b class="bionic-bold">` element for the first half, and a regular text node for the second half, appending them to a `DocumentFragment`.
  - Replaces the original text node with the fragment containing the bolded prefixes.
  - If it encounters an element node, it recursively calls `applyBionicReading()` on it.
- **Lines 239-240**: Exposes the `applyBionicReading` function globally on the `window` object so that dynamically generated content (like the text-to-speech in Reading Buddy or AI-generated quizzes) can invoke it after rendering.
