# File: `quizzes.html`

## Overview
This is the primary HTML interface for the Adaptive Quizzes feature. It acts as a single-page application containing three distinct views (List, Active Quiz, Results) that are toggled sequentially by the `quizzes.js` script.

## Key Logic & Structure

### Header Section
- **Lines 14-39**: The top navigation header.
  - Contains a "Back" link returning to `dashboard.html`.
  - Houses the standard Accessibility and Account Dropdown menus (dynamically patched).

### Main Container
- **Line 41**: The `<main>` wrapper holding the three conditional views.

#### View 0: List View (`#list-view`)
- **Lines 43-56**: The default view displaying a grid of previously generated quizzes.
  - Contains the `#quizzes-container`. On load, the JS script fetches the user's quizzes from Firestore and injects `.plan-card` elements here.

#### View 2: Active Quiz (`#quiz-view`)
- **Lines 58-79**: Hidden by default. Activated when a user selects a quiz.
  - **Lines 60-65 (`.quiz-progress`)**: Contains the current/total question counter and a visual `#progress-bar`.
  - **Line 67**: `#question-text` placeholder where the current question string is injected.
  - **Lines 69-71 (`#options-grid`)**: An empty container where the JavaScript dynamically injects multiple-choice `<button>` elements.
  - **Lines 73-76 (`#explanation-card`)**: Hidden by default. Revealed via CSS classes when the user selects an answer, providing immediate feedback.
  - **Line 78 (`#next-btn`)**: Proceeds to the next question or the results screen.

#### View 3: Results (`#results-view`)
- **Lines 81-96**: Displayed when the user finishes all questions.
  - Contains a `#final-score` and `#final-total` span updated by the JS.
  - Contains a `#restart-btn` to return to the List view.

### External Scripts
- **Lines 100-102**: Imports dependencies. Note the cache-busting parameter `quizzes.js?v=2`. It also imports `settings.js` for visual preferences.
