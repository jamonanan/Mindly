# File: `focus-timer.js`

## Overview
This file contains the logic for the Focus Timer (Pomodoro) feature. It handles the countdown timer, toggling between focus and break sessions, custom time inputs, and synchronizing the user's total focus time and daily goal with Firebase Firestore.

## Key Logic & Line-by-Line Explanation

### Setup and State
- **Lines 1-4**: Imports necessary Firebase and metrics utilities.
- **Lines 28-37**: Initializes the timer's state variables:
  - `initialSeconds` and `remainingSeconds`: Defaulted to 25 minutes (25 * 60 seconds).
  - `timerInterval`: Holds the `setInterval` ID.
  - `isRunning`: Boolean to prevent multiple concurrent intervals.
  - `currentType`: Tracks whether it's a `'focus'` or `'break'` session.
  - `focusSecondsElapsedThisSession`: Accumulates time specifically spent focusing (not breaking) to update metrics.

### Authentication & Metrics Subscription
- **Lines 39-65**: Uses `onAuthStateChanged` to listen for login.
  - Once authenticated, it calculates the current date and sets up an `onSnapshot` listener on the user's `dailyMetrics` document.
  - When the document updates, it refreshes the "Total Focus Time Today" (`totalFocusTimeEl`) and the "Daily Goal" input (`focusGoalInput`), ensuring real-time sync across devices.
- **Lines 67-73**: Attaches a click listener to the `saveGoalBtn`. It reads the custom goal input, converts it to an integer, and updates the `focusTimeGoal` in Firestore via `updateDailyMetric`.

### Core Timer Logic
- **Lines 76-80 (`formatTime`)**: Converts total seconds into a `MM:SS` string format using `Math.floor` and `% 60`.
- **Lines 82-88 (`updateDisplay`)**: Updates the text in the `#time-display` element. It also calculates the remaining percentage and adjusts the width of the `#progress-bar`.
- **Lines 90-107 (`setDuration`)**: Called when the user selects a preset or custom time. It stops any running timer, resets the remaining seconds, sets the `currentType`, and updates the UI badge (color and label) to reflect "Focus Session" or "Break Session".
- **Lines 109-130 (`startTimer`)**: Starts the countdown.
  - Sets `isRunning = true` and dims the Start button.
  - Uses `setInterval` to decrement `remainingSeconds` every 1000ms (1 second).
  - If `currentType === 'focus'`, it increments `focusSecondsElapsedThisSession`.
  - When time hits 0, it calls `completeTimer()`.
- **Lines 132-146 (`stopTimer`)**: Pauses the countdown and clears the interval. Crucially, if there are accumulated focus seconds, it calculates the full minutes, sends them to Firestore (`updateDailyMetric('focusTimeMinutes', minutesToAdd)`), and keeps the remainder in `focusSecondsElapsedThisSession`.
- **Lines 150-161 (`completeTimer` & `resetTimer`)**: Functions to gracefully end or reset the timer, calling `stopTimer()` and resetting the UI state.

### Event Listeners (UI Interaction)
- **Lines 166-168**: Binds `startTimer`, `stopTimer`, and `resetTimer` to their respective buttons.
- **Lines 170-190 (Preset Options)**: Attaches click listeners to all preset buttons (25m, 20m, 15m, Break). It manages the `.active` CSS class to highlight the selected option and calls `setDuration`.
- **Lines 192-213 (Custom Time)**: 
  - Clicking the "Custom" button hides it and shows an input field.
  - Clicking the apply checkmark button reads the custom input, validates it, and calls `setDuration(minVal, 'focus')`. It then updates the button text to show the new custom time.
