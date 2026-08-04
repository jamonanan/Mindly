# File: `patch-html.js`

## Overview
This is a Node.js utility script used to globally inject the settings-related CSS and JS files into all HTML files in the project. It ensures that user preferences (like dark mode or font sizes managed by `settings.js`) are loaded on every single page.

## Key Logic & Line-by-Line Explanation

### Setup
- **Lines 1-5**: Imports `fs` and `path`. Unlike the other patch scripts, this script uses `fs.readdirSync(dir)` to read the contents of the entire current directory and filters for any file ending in `.html`. This means it operates on *all* HTML pages in the root folder, not just a predefined list.

### Find and Replace Logic
- **Lines 7-11**: Iterates over every HTML file found, reads its contents into a string, and initializes a `modified` flag.
- **Lines 13-17 (Inject CSS)**: Checks if the file already contains `<link rel="stylesheet" href="styles/settings.css">`. If it does not, it finds the closing `</head>` tag and prepends the CSS link to it using `content.replace()`. It sets `modified = true`.
- **Lines 19-23 (Inject JS)**: Checks if the file contains `<script type="module" src="settings.js"></script>`. If it does not, it finds the closing `</body>` tag and prepends the JS link to it.
- **Lines 25-31**: If modifications were made, it writes the updated string back to the filesystem and logs a success message. Otherwise, it logs a "Skipped" message, preventing unnecessary file writes.
