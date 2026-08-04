# File: `study-plan.html`

## Overview
This is the HTML interface for the Study Plan feature. It contains two main views controlled by JavaScript: a dashboard listing all generated study plans (List View), and an interactive map showing the individual steps of a selected plan (Map View). It also contains a modal overlay used for reading the contents of a study plan node.

## Key Logic & Structure

### Header Section
- **Lines 14-39**: Top navigation header.
  - Contains a "Back" link returning to `dashboard.html`.
  - Includes the standard Accessibility and Account Dropdown menus (dynamically patched).

### Main Container
- **Line 41**: The `<main>` wrapper holding both conditional views.

#### View 0: List View (`#list-view`)
- **Lines 43-56**: This is the default active view.
  - Contains a header titled "Your Study Plans".
  - Houses the `#plans-container` grid. When the page loads, `study-plan.js` fetches the user's plans from Firestore and injects `.plan-card` elements into this container. It initially displays a "Loading plans..." message.

#### View 2: Gamified Map (`#map-view`)
- **Lines 60-73**: This view is hidden (`display: none`) by default and activated when a user clicks on a specific plan card.
  - Contains a `#back-from-map-btn` to return to the list view.
  - Features a dynamic `#map-plan-title` that updates to match the selected plan.
  - Contains the `#learning-path` container. The JS script iterates through the plan's steps and injects nodes (`.node`) and connecting lines (`.path-line`) here to visually represent a step-by-step journey.

### Reading Modal
- **Lines 77-91**: A hidden `.modal-overlay` (`#reading-modal`).
  - When a user clicks an "active" or "completed" node in the learning path, this modal is displayed.
  - Contains placeholders for the title (`#modal-title`) and the text content (`#modal-text`).
  - Contains a `#mark-complete-btn` which triggers the logic to update progress in Firestore and unlock the next node.

### External Scripts
- **Lines 93-97**: Loads `study-plan.js` for core logic and `settings.js` for visual preferences.
