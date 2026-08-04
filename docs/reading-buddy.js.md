# File: `reading-buddy.js`

## Overview
This script powers the "Reading Buddy" feature, an accessibility tool that uses the browser's native `SpeechSynthesis` API to read text aloud while visually highlighting the spoken words in real-time. It also includes an option to toggle "Bionic Reading" (bolding the first half of words) and supports uploading documents to extract text via a Firebase Cloud Function.

## Key Logic & Line-by-Line Explanation

### State Management & Initialization
- **Lines 5-12**: Defines `readingBuddyState`, storing the current playback status (`isPlaying`), the `currentWordIndex`, the array of `words`, playback `speed`, and an `intervalId` used for a fallback timer.
- **Lines 18-81 (`initReadingBuddy`)**: Selects required DOM elements and attaches event listeners for the Play, Stop, and Reset buttons. 
  - Attaches an `input` listener to the text box to refresh the display as the user types.
  - Attaches a `change` listener to the Bionic Reading toggle.
  - Attaches a delegated `click` listener to the reading display area. If a user clicks a specific word, the script updates `currentWordIndex` and restarts playback from that exact word.

### Speech Synthesis and Highlighting Logic
- **Lines 125-232 (`handlePlay`)**: The core function for text-to-speech.
  - **Lines 134-148**: Cancels any active speech, retrieves the raw text, splits it into an array of words (`readingBuddyState.words`), and resets the boundary flag.
  - **Lines 150-158**: Calculates the start and end character indexes for every word in the text to maintain absolute alignment between the string and the array.
  - **Lines 164-174**: Slices the original text starting from the `currentWordIndex` so it can resume exactly where it left off, then initializes a `SpeechSynthesisUtterance`.
  - **Lines 177-201 (`onboundary`)**: Hooks into the native browser event that fires when speech reaches a new word boundary. It calculates the absolute character index, finds the corresponding word in the `wordRanges` array, updates `currentWordIndex`, and calls `updateReadingDisplay()` to move the visual highlight.
  - **Lines 227-231**: Starts playback and immediately invokes a fallback timer (`scheduleNextWordTimer()`) in case the browser doesn't fully support native boundary events.

- **Lines 90-118 (`scheduleNextWordTimer`)**: A custom fallback loop that approximates speaking speed based on character count. It advances the highlight manually if native `onboundary` events fail to fire.

- **Lines 238-260 (`handleStop`, `handleReset`)**: Helper functions to cancel `window.speechSynthesis`, clear fallback intervals, and reset the state index to `0`.

### Visual Display Update
- **Lines 266-324 (`updateReadingDisplay`)**: Dynamically rebuilds the HTML inside `#readingDisplay`.
  - Iterates through `readingBuddyState.words`. 
  - Checks if Bionic Reading is enabled (`isBionic`). If so, it uses a regex (`/(\W*)(\w+)(\W*)/`) to isolate the alphabetical part of the word and wraps the first half in `<strong>` tags.
  - Wraps the word in a `<span>`. If the word index matches `currentWordIndex` and the audio is playing, it adds the `.word-highlight` class to visually emphasize it.

### Document Upload & Extraction
- **Lines 330-412 (`handleFileUpload`)**: Programmatically triggers a file input click. 
  - Reads the selected document as Base64 (`FileReader.readAsDataURL`).
  - Sends a `POST` request to the `EXTRACT_URL` (Cloud Run function) to parse the document.
  - Filters the JSON response to extract only specific text node types (`"NarrativeText", "Title", "ListItem"`) to skip headers/footers.
  - Injects the extracted text into the `#textInput` box and triggers a display update.
