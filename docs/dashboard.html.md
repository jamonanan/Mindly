# File: `dashboard.html`

## Overview
This file represents the main hub of the Mindly application for logged-in users. It features an overview of daily learning metrics, a central document upload zone for AI generation, navigation to various learning activities, and a visual progress tracker.

## Key Logic & Structure

### Header Section
- **Lines 15-49**: The top navigation bar.
  - Contains the Mindly logo on the left.
  - Contains an "Accessibility" settings button (likely hooked into `settings.js`).
  - Contains an Account dropdown wrapper. Clicking the Account button reveals a menu with a link to `account.html` and a `#globalLogoutBtn` (which is managed by `firebaseAuth.js`).

### Metrics Section
- **Lines 56-87**: A grid of four `.metric-card` elements displaying high-level stats:
  - **Blue**: Study Plan Done
  - **Green**: Lessons Done
  - **Yellow**: Quiz Score
  - **Purple**: Focus Time
  - The values inside these cards start at "0" and are dynamically updated by `updateDashboardUI()` in `dashboard.js` based on real-time Firestore data.

### Main Content: Learning Activities (Left Column)
- **Lines 94-108 (Document Dropzone)**: The central `#dashboard-dropzone` where users can drag and drop files (PDF, DOCX, TXT) or click to open a file browser (`#dashboard-file-input`). Includes status text (`#dashboard-upload-status`) that changes as the backend processes the file.
- **Lines 110-158 (Activities Grid)**: A CSS grid displaying six colored cards acting as navigation links to the application's core features:
  - Reading Buddy (`reading-buddy.html`)
  - Study Plan (`study-plan.html`)
  - Lessons (`lessons.html`)
  - Quizzes (`quizzes.html`)
  - Mental Health (`mental-health.html`)
  - Focus Timer (`focus-timer.html`)

### Main Content: Progress Tracker (Right Column)
- **Lines 164-258**: A sidebar section displaying a visual representation of the user's progress.
  - Contains four `.progress-row` blocks, corresponding to the four key metrics (Study Plan, Lessons, Quizzes, Focus).
  - Each row contains a percentage label (`.progress-percent`) and a `.progress-bar` consisting of 8 colored `.progress-dot` elements.
  - These dots are dynamically filled by `dashboard.js` using the `.filled` CSS class.

### External Scripts
- **Lines 264-266**: Imports required JavaScript modules:
  - `firebaseAuth.js`: Handles global auth state and logout.
  - `dashboard.js`: Drives the dynamic metrics, progress bars, and document upload logic.
  - `settings.js`: Manages accessibility and theme settings.
