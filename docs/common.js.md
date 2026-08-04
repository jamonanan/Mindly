# File: `common.js`

## Overview
This is a small utility file intended to store globally accessible, generic helper functions used across various frontend scripts (like `login.js` and `signup.js`).

## Key Logic & Line-by-Line Explanation

### Email Validation (`isValidEmail`)
- **Lines 10-14**: Defines `isValidEmail(email)`, a simple function to verify that a string conforms to a standard email format.
- **Line 12**: Defines a standard regular expression `^[^\s@]+@[^\s@]+\.[^\s@]+$`. This checks for three parts separated by `@` and `.`, ensuring there are no whitespaces inside them.
- **Line 13**: Uses the `.test()` method on the regex to return `true` if the email matches the pattern, or `false` otherwise. This is used by the frontend validation logic in `login.js` and `signup.js` to ensure the user has entered a properly formatted email before attempting to register or log in.
