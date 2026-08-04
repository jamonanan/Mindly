# File: `metrics.js`

## Overview
This is a utility module that centralizes the logic for managing the user's daily progress metrics (used by the dashboard graphs). It handles creating daily metric documents, defining baseline goal structures, and providing a clean API for other feature scripts (like `focus-timer.js` or `quizzes.js`) to increment stats.

## Key Logic & Line-by-Line Explanation

### Document Referencing
- **Lines 1-2**: Imports Firebase Auth and Firestore dependencies.
- **Lines 7-17 (`getTodayMetricRef`)**: 
  - Checks if a user is logged in.
  - Constructs a local, timezone-aware date string in the format `YYYY-MM-DD`.
  - Returns a Firestore DocumentReference pointing to `users/{uid}/dailyMetrics/{YYYY-MM-DD}`. This guarantees that metrics naturally bucket into daily chunks without complex queries.

### Initialization & Goal Syncing
- **Lines 19-70 (`initializeDailyMetrics`)**: 
  - Called primarily when the dashboard loads or when a user first logs in.
  - Attempts to fetch today's metric document.
  - **Lines 26-39 (Defaults)**: If the document doesn't exist (i.e., it's the user's first login of the day), it creates it via `setDoc()` and populates it with default values: `0` for completed tasks, and `30` for the default `focusTimeGoal`.
  - **Lines 43-63 (Goal Synchronization)**: To ensure the progress bars on the dashboard are accurate, it dynamically queries the total size of the `lessons` collection and the `studyPlans` collection. It sets `lessonsGoal` and `studyPlansGoal` to match those total counts. It only executes a database write (`updateDoc`) if the cloud counts differ from the document counts to minimize Firestore reads/writes.

### Incrementing and Updating
- **Lines 78-100 (`updateDailyMetric`)**: A reusable exported function called by various feature modules when the user completes an action.
  - Accepts `field` (the database key to update), `value` (the number), and `operation` (defaults to 'increment').
  - **Lines 84-87**: Checks if today's document exists. If not (perhaps the user left the app open overnight), it calls `initializeDailyMetrics()` to create it safely.
  - **Lines 89-94**: Constructs the update payload. If the operation is `'increment'`, it uses Firestore's atomic `increment()` operator, which prevents race conditions if multiple tabs or requests try to update the metric simultaneously. Otherwise, it uses a hard `'set'` (useful for the custom focus time goal input).
  - Finally, pushes the update to Firestore.
