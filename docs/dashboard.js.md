# File: `dashboard.js`

## Overview
This file handles the logic for the main user dashboard. It fetches and displays the user's daily progress metrics in real-time, and it provides a drag-and-drop document upload area that interacts with Firebase Cloud Functions to automatically generate study plans, lessons, and quizzes from the uploaded text.

## Key Logic & Line-by-Line Explanation

### Imports and Setup
- **Lines 1-4**: Imports Firebase Auth, Firestore, and custom metrics functions.
- **Lines 15-23**: Uses `onAuthStateChanged` to listen for user login. When logged in, it initializes the daily metrics (`initializeDailyMetrics`) and starts listening for real-time updates via `subscribeToMetrics`.

### Real-Time Metric Subscription
- **Lines 25-37 (`subscribeToMetrics`)**: Calculates today's date formatted as `YYYY-MM-DD`. Sets up a Firestore `onSnapshot` listener on `users/{uid}/dailyMetrics/{dateStr}`. Any time the database changes (e.g., user finishes a lesson), it triggers `updateDashboardUI()` with the new data.

### Dashboard UI Updates
- **Lines 39-81 (`updateDashboardUI`)**: Updates the four key metric cards at the top of the dashboard:
  - **Study Plans (Lines 40-45)**: Updates the text for `studyPlansDone` vs `studyPlansGoal`.
  - **Lessons (Lines 47-52)**: Updates `lessonsDone` vs `lessonsGoal`.
  - **Quizzes (Lines 54-67)**: Calculates the average quiz score (`quizQuestionsCorrect` / `quizQuestionsTotal`). Adjusts the insight message based on the score (e.g., "keep it up" if >60%).
  - **Focus (Lines 69-74)**: Updates `focusTimeMinutes` vs `focusTimeGoal`.
  - **Progress Dots (Lines 76-80)**: Calls `updateProgressDots()` for each category.
- **Lines 83-108 (`updateProgressDots`)**: Calculates the completion percentage for a given metric. Finds the corresponding row of 8 dots in the UI and fills them proportionally. E.g., 50% completion adds the `.filled` class to 4 out of 8 dots.

### Cloud Function API URLs
- **Lines 110-114**: Detects if the app is running on `localhost`. If so, routes API calls to the local Firebase emulators (`http://127.0.0.1:5001/...`); otherwise, points to the live Google Cloud Run URLs for `extractText`, `generateStudyPlan`, `generateLesson`, and `generateQuiz`.

### Document Upload & Drag-and-Drop
- **Lines 116-140**: Sets up event listeners for the `#dashboard-dropzone`. Handles `click` to trigger a hidden file input, and `dragover`/`dragleave`/`drop` to visually change the dropzone border and accept dropped files.
- **Lines 142-149**: `getBase64()` converts the uploaded File object into a Base64 string so it can be transmitted in a JSON payload.

### Material Generation Flow (`handleFile`)
- **Lines 151-162**: Verifies the user is logged in, then updates the UI to show a loading status and disable the dropzone.
- **Lines 164-184 (Text Extraction)**: Sends the Base64 file to the `EXTRACT_URL` Cloud Function. The function returns an array of text elements, which are joined. It enforces a minimum word count of 100 words.
- **Lines 188-207 (Parallel Generation)**: Makes three simultaneous `POST` requests (`Promise.allSettled`) to the generative AI Cloud Functions: `GENERATE_PLAN_URL`, `GENERATE_LESSON_URL`, and `GENERATE_QUIZ_URL`.
- **Lines 209-253 (Saving to Firestore)**: Iterates through the results:
  - **Study Plan**: Formats chunks (setting the first to 'active', rest to 'locked') and saves to the `studyPlans` subcollection.
  - **Lesson**: Saves to the `lessons` subcollection.
  - **Quiz**: Saves to the `quizzes` subcollection.
  - All valid documents are saved concurrently using `Promise.all`.
- **Lines 255-261 (Metric Updates)**: Increments the user's daily goals (`studyPlansGoal`, `lessonsGoal`) by 1 for each successfully generated item.
- **Lines 263-279**: On success or error, displays the appropriate status text and resets the dropzone after a brief timeout.
