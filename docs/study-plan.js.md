# File: `study-plan.js`

## Overview
This file manages the logic for the Study Plan feature. It handles fetching AI-generated study plans from Firestore, rendering them in a grid view, and displaying individual plans in a gamified, sequential map view. It also allows users to read chunks of a plan in a modal, mark them as complete, and sync their progress back to the database.

## Key Logic & Line-by-Line Explanation

### Global State & DOM Setup
- **Lines 1-7**: Imports Firebase services and custom metrics functions. Declares constants for Cloud Function URLs (though they appear unused directly in this file, as generation happens in `dashboard.js`).
- **Lines 9-26**: Grabs references to necessary DOM elements (views, containers, modal elements).
- **Lines 28-32**: Declares state variables: `currentUser`, `currentPlanId`, `currentPlan`, and `activeNodeId`.

### Authentication & Initialization
- **Lines 34-44**: Listens for authentication changes. If logged in, sets the `currentUser`, switches to the list view, and fetches the user's plans via `loadAllPlans()`. If not logged in, redirects to `login.html`.

### View Navigation
- **Lines 46-56 (`switchView`)**: A helper function to toggle visibility between the List View (grid of plans) and the Map View (the nodes of a specific plan). The `backFromMapBtn` uses this to return to the list and re-fetches plans to update progress bars.

### List View Logic
- **Lines 58-84 (`loadAllPlans`)**: Queries the `users/{uid}/studyPlans` Firestore collection. 
  - If empty, shows a message.
  - Otherwise, iterates through `querySnapshot` and calls `renderPlanCard()` for each document.
- **Lines 86-132 (`renderPlanCard`)**: Builds the HTML card for a single plan.
  - Calculates progress percentage by checking how many chunks have `status === 'completed'`.
  - Injects a DOM element (`.plan-card`) displaying the title, date, progress bar, and a delete button.
  - Attaches a click listener to the card body to open the map view (`openPlanMap`).
  - Attaches a click listener to the delete button, triggering an optimistic DOM removal and a call to `deletePlan`.
- **Lines 134-143 (`deletePlan`)**: Deletes the specific plan document from Firestore using `deleteDoc`.

### Gamified Map View Logic
- **Lines 147-155 (`openPlanMap`)**: Sets state variables for the selected plan, updates the title, switches to the map view, and calls `renderMap()`.
- **Lines 157-195 (`renderMap`)**: Rebuilds the visual learning path.
  - Iterates through the plan's `chunks` array.
  - Creates a `.node` div for each chunk. The class is appended with its status (`active`, `completed`, `locked`) which affects its CSS styling.
  - If a node is *not* locked, it attaches a click listener to open it in a reading modal.
  - Appends connecting lines (`.path-line`) between nodes.

### Modal Logic
- **Lines 197-218 (`openModal`)**: Opens the reading modal when a valid node is clicked.
  - Populates the title and content.
  - If already completed, disables the "Mark Complete" button. Otherwise, enables it.
  - Displays the modal and conditionally applies Bionic Reading styling if that global feature is active.
- **Lines 220-223**: Closes the modal.
- **Lines 225-262 (Marking Complete)**: When the user finishes reading a chunk:
  - Finds the chunk in the `currentPlan` array and updates its status to `'completed'`.
  - Automatically unlocks the *next* chunk by setting its status to `'active'`.
  - Closes the modal and re-renders the map (`renderMap()`).
  - Asynchronously updates the plan document in Firestore (`updateDoc(planRef, { chunks: chunksArray })`).
  - If all chunks in the plan are now complete, it calls `updateDailyMetric('studyPlansDone', 1)` to increment the user's daily dashboard metrics.
