/* ============================================
   READING BUDDY FUNCTIONALITY
   ============================================ */

// Variables to store Reading Buddy state
let readingBuddyState = {
  isPlaying: false,
  currentWordIndex: 0,
  words: [],
  speed: 1.0, // Reading speed multiplier
  intervalId: null
};

/**
 * Initializes the Reading Buddy functionality
 * Sets up event listeners for play, stop, reset buttons and sliders
 */
function initReadingBuddy() {
  // Get all the necessary elements
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');
  const textInput = document.getElementById('textInput');
  const readingDisplay = document.getElementById('readingDisplay');
  const speedSlider = document.getElementById('speedSlider');
  const volumeSlider = document.getElementById('volumeSlider');
  const bionicToggle = document.getElementById('bionicToggle');

  // Check if we're on the Reading Buddy page
  if (!playBtn || !textInput || !readingDisplay) {
    return; // Not on Reading Buddy page, exit early
  }

  // Set up play button
  if (playBtn) {
    playBtn.addEventListener('click', handlePlay);
  }

  // Set up stop button
  if (stopBtn) {
    stopBtn.addEventListener('click', handleStop);
  }

  // Set up reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }

  // Set up text input - update reading display when text changes
  if (textInput) {
    textInput.addEventListener('input', function () {
      updateReadingDisplay();
    });
  }

  // Set up speed slider
  if (speedSlider) {
    speedSlider.addEventListener('input', function () {
      // Update speed (0.5x to 2x, slider value is 0-100)
      const sliderValue = speedSlider.value;
      readingBuddyState.speed = 0.5 + (sliderValue / 100) * 1.5;

      // If currently playing, restart with new speed
      if (readingBuddyState.isPlaying) {
        handleStop();
        handlePlay();
      }
    });
  }

  // Set up bionic toggle
  if (bionicToggle) {
    bionicToggle.addEventListener('change', function () {
      updateReadingDisplay();
    });
  }

  // Initialize reading display with default text
  updateReadingDisplay();
}

/**
 * Handles the play button click
 * Starts reading the text word by word with highlighting
 */
function handlePlay() {
  const textInput = document.getElementById('textInput');
  const readingDisplay = document.getElementById('readingDisplay');

  if (!textInput || !readingDisplay) {
    return;
  }

  // Get text from input
  const text = textInput.value.trim();

  // If no text, show alert
  if (text === '') {
    alert('Please enter some text to read.');
    return;
  }

  // Split text into words (including punctuation)
  readingBuddyState.words = text.split(/(\s+)/);
  readingBuddyState.isPlaying = true;
  readingBuddyState.currentWordIndex = 0;

  // Calculate delay based on speed (faster speed = shorter delay)
  // Base delay is 500ms, adjusted by speed
  const baseDelay = 500;
  const delay = baseDelay / readingBuddyState.speed;

  // Start highlighting words
  highlightNextWord(delay);
}

/**
 * Highlights the next word in the reading display
 * @param {number} delay - Delay in milliseconds before highlighting next word
 */
function highlightNextWord(delay) {
  if (!readingBuddyState.isPlaying || readingBuddyState.currentWordIndex >= readingBuddyState.words.length) {
    // Finished reading
    readingBuddyState.isPlaying = false;
    return;
  }

  // Update the display to highlight current word
  updateReadingDisplay();

  // Move to next word after delay
  readingBuddyState.intervalId = setTimeout(function () {
    readingBuddyState.currentWordIndex++;
    highlightNextWord(delay);
  }, delay);
}

/**
 * Handles the stop button click
 * Stops the reading process
 */
function handleStop() {
  readingBuddyState.isPlaying = false;

  // Clear any pending intervals
  if (readingBuddyState.intervalId) {
    clearTimeout(readingBuddyState.intervalId);
    readingBuddyState.intervalId = null;
  }

  // Update display to remove highlighting
  updateReadingDisplay();
}

/**
 * Handles the reset button click
 * Resets the reading to the beginning
 */
function handleReset() {
  handleStop(); // Stop any current reading
  readingBuddyState.currentWordIndex = 0;
  updateReadingDisplay();
}

/**
 * Updates the reading display with current text and highlighting
 * Also applies bionic reading if enabled
 */
function updateReadingDisplay() {
  const textInput = document.getElementById('textInput');
  const readingDisplay = document.getElementById('readingDisplay');
  const bionicToggle = document.getElementById('bionicToggle');

  if (!textInput || !readingDisplay) {
    return;
  }

  // Get text from input
  let text = textInput.value;

  // If text is empty, use default text
  if (text.trim() === '') {
    text = 'Welcome to Reading Buddy! This AI-powered tool helps you read with text-to-speech, word highlighting, and dyslexia-friendly customization. You can paste any text here, or upload a document to get started.';
  }

  // Split text into words
  const words = text.split(/(\s+)/);
  const isBionic = bionicToggle && bionicToggle.checked;

  // Build HTML for reading display
  let html = '';

  words.forEach((word, index) => {
    // Check if this is the current word being read
    const isCurrentWord = readingBuddyState.isPlaying &&
      index === readingBuddyState.currentWordIndex;

    // Apply bionic reading if enabled (bold first half of word)
    let wordDisplay = word;
    if (isBionic && word.trim().length > 2) {
      const wordMatch = word.match(/(\W*)(\w+)(\W*)/);
      if (wordMatch) {
        const prefix = wordMatch[1];
        const actualWord = wordMatch[2];
        const suffix = wordMatch[3];
        const boldLength = Math.ceil(actualWord.length / 2);
        const boldPart = actualWord.substring(0, boldLength);
        const normalPart = actualWord.substring(boldLength);
        wordDisplay = prefix + '<strong>' + boldPart + '</strong>' + normalPart + suffix;
      }
    }

    // Add highlighting class if this is the current word
    if (isCurrentWord) {
      html += '<span class="word-highlight">' + wordDisplay + '</span>';
    } else {
      html += '<span>' + wordDisplay + '</span>';
    }
  });

  // Update the display
  readingDisplay.innerHTML = html;
}

/**
 * Handles file upload, converts it to base64, and sends it to our secure Firebase Cloud Function.
 * Bypasses CORS and keeps our API key hidden.
 */
function handleFileUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.txt,.doc,.docx,.pdf,.ppt,.pptx';

  fileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const textInput = document.getElementById('textInput');
    if (!textInput) return;

    // Show loading state in text box and disable it
    const originalText = textInput.value;
    textInput.value = "Extracting text from document... Please wait.";
    textInput.disabled = true;

    try {
      // 1. Convert file to Base64
      const fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      // 2. Determine endpoint (Local Emulator vs Production)
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const functionUrl = isLocal
        ? "http://127.0.0.1:5001/mindly-7f7c4/us-central1/extractText"
        : "https://extracttext-7f7c4-uc.a.run.app"; // Firebase Functions v2 standard URL format

      // 3. Make POST request to our Cloud Function
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileBase64: fileBase64,
          fileName: file.name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to parse document");
      }

      const elements = await response.json();

      // 4. Filter strictly for Body text ("NarrativeText", "Title", "ListItem")
      // Discards captions, figures, and headers
      const allowedTypes = ["NarrativeText", "Title", "ListItem"];
      const readableText = elements
        .filter(el => allowedTypes.includes(el.type))
        .map(el => el.text)
        .join("\n\n");

      if (!readableText || readableText.trim() === "") {
        textInput.value = "We couldn't extract any readable body text from this file.";
      } else {
        textInput.value = readableText;
      }

    } catch (error) {
      console.error("Extraction error:", error);
      alert("Error extracting document. Make sure your Firebase Emulators are running locally! \n\nDetails: " + error.message);
      textInput.value = originalText; // Revert back
    } finally {
      textInput.disabled = false;
      
      // Trigger update word count and update reading display
      if (typeof updateReadingDisplay === "function") {
        updateReadingDisplay();
      }
      // Trigger the input event to update counts
      const inputEvent = new Event('input', { bubbles: true });
      textInput.dispatchEvent(inputEvent);
    }
  });

  fileInput.click();
}

/* ============================================
   INITIALIZATION
   ============================================ */

// Run initialization when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReadingBuddyPage);
} else {
  // DOM is already loaded
  initReadingBuddyPage();
}

function initReadingBuddyPage() {
  // Initialize Reading Buddy if on that page
  initReadingBuddy();

  // Set up file upload button if it exists
  const uploadBtn = document.getElementById('uploadBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', handleFileUpload);
  }
}