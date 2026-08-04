# File: `reading-buddy.html`

## Overview
This is the HTML interface for the Reading Buddy feature. It provides a text input area for users to paste or upload text, a large display area for highlighted reading, playback controls, and a toggle for Bionic Reading.

## Key Logic & Structure

### Header Section
- **Lines 15-44**: Top navigation header.
  - Contains a "Back to Dashboard" link.
  - Includes a `#wordCount` span (Line 27) that updates dynamically to show the number of words currently in the text box.
  - Houses the standard Accessibility and Account Dropdown menus (injected/updated by the patching scripts).

### Text Input Section
- **Lines 49-62**: The area where the user provides text to be read.
  - Contains an "Upload File" button (`#uploadBtn`) which triggers the document extraction logic in `reading-buddy.js`.
  - Contains a large `<textarea>` (`#textInput`) with default introductory text. The user can type or paste text here. Changes to this box immediately trigger the `updateReadingDisplay()` function in the JS.

### Controls Bar
- **Lines 65-73**: A fixed bottom bar (styled via CSS) containing the main playback controls:
  - Play (`#playBtn`)
  - Stop (`#stopBtn`)
  - Reset (`#resetBtn`)

### Reading Display Section
- **Lines 76-93**: The visual output area for the text-to-speech engine.
  - Includes a "Bionic" reading toggle switch (`#bionicToggle`).
  - Contains an empty `<div>` (`#readingDisplay`). This div is heavily manipulated by `reading-buddy.js`, which injects `<span>` elements for every word and dynamically adds highlighting classes as the speech API progresses.

### External Scripts & Inline Logic
- **Lines 97-120**: Imports dependencies and manages simple local state.
  - Loads `reading-buddy.js`.
  - **Lines 98-119**: Contains inline JavaScript to handle the live `#wordCount` calculation. It attaches an `input` event listener to `#textInput`, splits the string by spaces `/\s+/`, and updates the DOM element with the count.
  - Imports `settings.js` to ensure the user's visual preferences are applied to the page.
