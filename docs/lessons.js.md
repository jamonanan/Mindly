# File: `lessons.js`

## Overview
This file manages the logic for the AI Lessons feature. It connects to Firestore to retrieve previously generated markdown lessons, displays them in a grid, and allows the user to open and read them using a third-party markdown parsing library. It also updates the user's progress metrics upon completion.

## Key Logic & Line-by-Line Explanation

### Global State & DOM Setup
- **Lines 1-4**: Imports Firebase authentication, Firestore functions, and the local `updateDailyMetric` helper.
- **Lines 7-16**: Grabs references to the list view, detail view, lesson container, markdown content container, and buttons. Initializes `currentUser` and `currentLessonId` variables to track state.

### Authentication & Initialization
- **Lines 18-26**: Hooks into `onAuthStateChanged`.
  - If a user exists, sets `currentUser` and immediately triggers `loadLessons()`.
  - If no user, logs a warning and redirects to `login.html`.

### List View Logic
- **Lines 28-51 (`loadLessons`)**: The primary fetch function.
  - Queries the `users/{uid}/lessons` collection in Firestore.
  - If empty, displays a fallback message encouraging the user to generate a lesson from the dashboard.
  - Iterates through the results and calls `renderLessonCard` for each document.
- **Lines 53-85 (`renderLessonCard`)**: Generates the HTML for individual lesson cards.
  - Formats the date.
  - Adds a "Finished" status badge if the document indicates it was completed.
  - Adds a click listener to the card to trigger `openLesson(lessonId, data)`.
  - Adds a click listener to the delete button, performing an optimistic UI update (removing the card from the DOM) before calling `deleteLesson()`.
- **Lines 87-94 (`deleteLesson`)**: Deletes the specific lesson document from Firestore using `deleteDoc`.

### Detail View Logic
- **Lines 96-113 (`openLesson`)**: Prepares and displays the reading view.
  - Stores the selected `lessonId` in state and updates the header title.
  - **Line 101**: Relies on a global `marked` object (loaded via CDN in the HTML file) to parse the raw markdown `data.content` string into formatted HTML, injecting it into `#lessonContent`. Includes a fallback error message if the library failed to load.
  - Checks if Bionic Reading is enabled and applies it to the parsed HTML.
  - Toggles display classes to hide the list view and show the results section.
- **Lines 115-119**: Back button listener. Returns the user to the list view without marking the lesson as complete.

### Completion Logic
- **Lines 121-136**: Finish button listener.
  - Called when the user clicks "Finish Lesson" at the bottom of the reading view.
  - Calls `updateDailyMetric('lessonsDone', 1)` to increment the total completed lessons counter on the main dashboard.
  - Updates the specific lesson document in Firestore to have `status: 'completed'`.
  - Resets the view back to the list and calls `loadLessons()` to refresh the UI and display the new "Finished" badge on the card.
