# File: `quizzes.js`

## Overview
This file manages the logic for the Adaptive Quizzes feature. It fetches AI-generated quizzes from Firestore, handles the interactive test-taking flow (displaying questions, shuffling options, validating answers, showing explanations), and records final scores to the user's daily metrics.

## Key Logic & Line-by-Line Explanation

### Global State & DOM Setup
- **Lines 1-4**: Imports Firebase services and custom metrics functions.
- **Lines 7-28**: Retrieves references to the three main UI views (`list-view`, `quiz-view`, `results-view`) and various elements within them (progress bars, question text, options grid, next buttons, etc.).
- **Lines 31-36**: Initializes state variables: `currentUser`, `quizData` (holds the current questions), `currentQuestionIndex`, `score`, and `currentQuizId`.

### Authentication & Initialization
- **Lines 38-47**: Uses `onAuthStateChanged`. If a user is logged in, it calls `loadQuizzes()`. If not, it redirects to the login page.

### List View Logic
- **Lines 49-72 (`loadQuizzes`)**: Connects to the `users/{uid}/quizzes` Firestore collection. Iterates through the results and calls `renderQuizCard()`. Shows a fallback message if empty.
- **Lines 74-114 (`renderQuizCard`)**: Creates the HTML for a single quiz card in the dashboard list.
  - Formats the date and question count.
  - Adds a "Finished" badge if the `status` is completed.
  - Attaches a click listener to the card body. Clicking it saves the `quizData` array to state and triggers `startQuiz()`.
  - Attaches a click listener to the delete button, performing an optimistic UI delete before calling `deleteQuiz()`.
- **Lines 116-124 (`deleteQuiz`)**: Deletes the specific quiz document from Firestore.

### View Navigation
- **Lines 126-131 (`switchView`)**: Helper function to toggle between the list, quiz, and results views by changing `display` styles.

### Quiz Execution Logic
- **Lines 133-140 (`startQuiz`)**: Resets the score and index to 0. Switches to `quiz-view` and triggers `renderQuestion()`.
- **Lines 142-178 (`renderQuestion`)**: Sets up the UI for the current question.
  - Updates the progress bar and current question number.
  - Hides the explanation card and "Next" button.
  - **Line 156**: Creates a shallow copy of the options array and shuffles it randomly (`sort(() => Math.random() - 0.5)`).
  - Iterates through the shuffled options, creating a button for each and attaching a click listener (`handleAnswer`).
  - Checks if Bionic Reading is globally active and applies it to the question text and options if so.
- **Lines 180-210 (`handleAnswer`)**: Triggered when the user clicks an option.
  - Sets `hasAnsweredCurrent = true` and disables all buttons to prevent multiple guesses.
  - Checks if `selectedOpt === correctOpt`. If true, increments the `score` and adds a `.correct` CSS class (green highlight). If false, adds `.incorrect` (red highlight) and highlights the correct button green.
  - Reveals the `explanationText` and the "Next" button.
- **Lines 212-219**: "Next" button listener. Increments the index and either renders the next question or finishes the quiz by calling `showResults()`.

### Results Logic
- **Lines 221-237 (`showResults`)**: Transitions to the results view.
  - Sets the progress bar to 100% and displays the final score.
  - Makes two asynchronous calls to `updateDailyMetric`: one to add the total number of questions to `quizQuestionsTotal`, and one to add the correct answers to `quizQuestionsCorrect`. This aggregates the user's overall quiz average for the main dashboard.
  - Updates the specific quiz document's status to `completed` in Firestore.
- **Lines 239-243**: "Create Another Quiz" button (currently mislabeled; acts as a back button). Returns to the list view and reloads the quizzes.
