# File: `patch-headers.js`

## Overview
This is a Node.js utility script used to programmatically modify the navigation headers across several HTML files in the project. It automates the insertion of an "Account" button and renames a "Settings" button to "Accessibility".

## Key Logic & Line-by-Line Explanation

### Setup
- **Lines 1-5**: Imports `fs` and `path`. Sets the target directory and defines an array of specific HTML files (`dashboard.html`, `study-plan.html`, etc.) that share a common header structure.

### HTML Template
- **Lines 7-11**: Defines `accountBtnHtml`, a snippet containing a styled `<a>` tag pointing to `account.html` and including an empty profile picture `<img>` element.

### Find and Replace Logic
- **Lines 13-18**: Iterates through the files, checks if they exist, reads their content into a string, and initializes a `modified` flag to track if changes were made.
- **Lines 19-24 (Dashboard Logic)**: Specifically targets `dashboard.html`. It looks for the old "→ Logout" link and replaces it with the new `accountBtnHtml` snippet.
- **Lines 25-35 (Other Pages Logic)**: For the other HTML files, it checks if `account.html` is already present. If not, it uses a regex (`/(<button[^>]*>\s* Settings\s*<\/button>)/s`) to locate the existing "Settings" button and injects the new `accountBtnHtml` immediately *after* it.
- **Lines 37-41 (Rename Settings)**: Globally searches the file content for the string `' Settings'` and replaces it with `' Accessibility'`. This updates the button text to better reflect its function.
- **Lines 43-47**: If the `modified` flag was set to true during any of the steps, it writes the updated string back to the filesystem.
