# File: `account.html`

## Overview
This is the HTML interface for the Account Settings page. It provides sections for the user to manage their personal information, handle security actions (password reset, email verification), and permanently delete their account.

## Key Logic & Structure

### Header Section
- **Lines 12-24**: Top navigation header.
  - Contains a "Back to Dashboard" link.
  - Houses the `#logoutBtn`, prominently placed for easy access.

### Main Container
- **Line 26**: The `<main>` wrapper for the settings form.
- **Line 28**: A hidden `#accountMessage` div used by the JavaScript to display temporary success/error banners (e.g., "Name updated successfully!").

### Personal Info Section
- **Lines 31-39**: The first settings block.
  - Contains an input field (`#fullNameInput`) and a submit button (`#saveNameBtn`). The input is automatically populated on load if a name exists in Firestore.

### Security Section
- **Lines 41-65**: The security block.
  - **Email Status**: Displays the user's email (`#emailDisplay`) and a dynamic badge (`#emailStatusBadge`) indicating if the email is Verified or Unverified. If unverified, the `#resendVerificationBtn` is visible.
  - **Password**: Contains a brief explanation and the `#resetPasswordBtn` which triggers a password reset email.

### Danger Zone Section
- **Lines 67-77**: The final, visually distinct section (styled with `.danger-zone` and `.btn-danger`).
  - Contains the `#deleteAccountBtn` which initiates the permanent account deletion workflow.

### External Scripts
- **Lines 80-81**: Imports `account.js` for the core functionality and `settings.js` to ensure the page obeys the user's visual preferences (like dark mode).
