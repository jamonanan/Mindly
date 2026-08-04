# File: `focus-timer.html`

## Overview
This is the HTML structure for the Focus Timer (Pomodoro) tool. It provides a visual countdown timer, control buttons (Start/Stop/Reset), preset time options for focus and break sessions, and a daily goal tracker.

## Key Logic & Structure

### Header Section
- **Lines 14-43**: The top navigation bar.
  - Contains a "Back to Dashboard" link with a back arrow SVG.
  - Contains the standard Accessibility and Account Dropdown menus, mirroring the dashboard header structure. (These are updated dynamically by the `patch-` scripts).

### Timer Card Layout
- **Lines 46-117**: The central `.timer-card` which houses the active timer UI.
- **Lines 48-57 (Session Badge)**: Displays `#session-badge` and `#session-label` (e.g., "Focus Session" or "Break Session"). `focus-timer.js` changes its color and text based on the selected mode.
- **Line 60 (Timer Display)**: `#time-display` shows the countdown (e.g., "25:00").
- **Lines 63-65 (Progress Bar)**: `#progress-bar` is a thin visual bar that fills up as the timer counts down.
- **Lines 68-88 (Controls)**: Three primary buttons (`#start-btn`, `#stop-btn`, `#reset-btn`), complete with SVG icons, to control the timer execution.
- **Lines 90-102 (Focus Presets)**: A row of buttons for standard focus times (25m, 20m, 15m) and a "Custom" input field (`#custom-min`) that allows users to type a specific duration.
- **Lines 104-116 (Break Preset)**: A dedicated button for a 5-minute break session.

### Time Tracker and Goal Section
- **Lines 119-133**: The bottom section of the page displaying cumulative metrics.
  - `#total-focus-time`: A text span updated dynamically from Firestore to show total minutes focused today.
  - `#focus-goal-input`: A number input allowing the user to set their daily focus goal (default 30).
  - `#save-goal-btn`: Submits the new goal to Firestore.

### External Scripts
- **Lines 136-137**: Imports:
  - `focus-timer.js` (`type="module"`): The core logic for the timer and Firebase sync.
  - `settings.js` (`type="module"`): Applies user accessibility and visual preferences.
