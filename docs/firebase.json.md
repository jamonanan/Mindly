# File: `firebase.json`

## Overview
This file contains the configuration for the Firebase project, specifically telling the Firebase CLI and emulators how to deploy and run the project's backend components. Currently, it is configured primarily for Firebase Functions.

## Key Logic & Line-by-Line Explanation

### Functions Configuration
- **Lines 1-16**: The root object contains a `"functions"` array. This specifies the configuration for Cloud Functions.
- **Line 4 (`"source": "functions"`)**: Tells the Firebase CLI that the source code for the Cloud Functions is located in the `functions` directory.
- **Line 5 (`"codebase": "default"`)**: Assigns a name to this specific group of functions. "default" is the standard naming convention for a single codebase.
- **Line 6 (`"disallowLegacyRuntimeConfig": true`)**: Enforces the use of the newer environment variable configurations (`.env`) instead of the older legacy runtime config, which is considered a best practice for modern Firebase functions.
- **Lines 7-13 (`"ignore": [...]`)**: An array of file patterns that the Firebase CLI should ignore when bundling and deploying the Cloud Functions. 
  - Prevents uploading heavy directories like `node_modules` (since dependencies are installed remotely during deployment).
  - Ignores `.git` folders and local `firebase-debug` logs to keep the deployment package lightweight and prevent local environment files from being pushed to production.
