# File: `patch-account-dropdown.js`

## Overview
This is a Node.js utility script used as a build step or one-off script to programmatically update multiple HTML files in the project. Specifically, it replaces a static "Account" link with a new, dynamic Account dropdown menu structure.

## Key Logic & Line-by-Line Explanation

### Setup
- **Lines 1-5**: Imports the Node.js `fs` (File System) and `path` modules. Defines the target directory as the current script directory (`__dirname`). Defines an array of specific HTML files to be modified (`dashboard.html`, `study-plan.html`, etc.).

### HTML Template
- **Lines 7-17**: Defines a multi-line template literal string `newHtml`. This contains the new HTML structure for the account dropdown, which includes an `.account-dropdown-wrapper`, a toggle button with a profile picture (`.user-profile-pic`), and a hidden dropdown menu containing the "Account Settings" link and a "Logout" button (`#globalLogoutBtn`).

### Find and Replace Logic
- **Lines 19-35**: Iterates over the array of target files.
  - Checks if the file exists using `fs.existsSync`.
  - Reads the file contents using `fs.readFileSync(..., 'utf8')`.
  - **Line 26**: Defines a regular expression (`regex`) designed to match the old, static `<a href="account.html"...>...</a>` block that contained the "Account" button.
  - **Lines 28-34**: Tests if the old block exists in the file. If it does, it uses `content.replace()` to swap the old block with the `newHtml` snippet, writes the updated content back to the file with `fs.writeFileSync()`, and logs a success message to the console.
