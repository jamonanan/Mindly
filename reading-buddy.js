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



  // Set up bionic toggle
  if (bionicToggle) {
    bionicToggle.addEventListener('change', function () {
      updateReadingDisplay();
    });
  }

  // Set up word click delegation on reading display
  if (readingDisplay) {
    readingDisplay.addEventListener('click', function (event) {
      const clickedSpan = event.target.closest('.word-clickable');
      if (clickedSpan) {
        const targetIndex = parseInt(clickedSpan.getAttribute('data-index'), 10);
        if (!isNaN(targetIndex)) {
          // Update current index and play from there
          readingBuddyState.currentWordIndex = targetIndex;
          handleStop();
          handlePlay();
        }
      }
    });
  }

  // Initialize reading display with default text
  updateReadingDisplay();
}

// Global variable to store active speech utterance
let activeUtterance = null;

/**
 * Recurse a highly accurate fallback timer loop to move highlighting forward
 * in case the browser does not support or fire native SpeechSynthesis boundary events.
 */
function scheduleNextWordTimer() {
  if (!readingBuddyState.isPlaying || readingBuddyState.onboundarySupported) {
    return;
  }

  const currentIndex = readingBuddyState.currentWordIndex;
  const currentWord = readingBuddyState.words[currentIndex] || "";

  // Average speaking pace constants (adjusts dynamically based on word length!)
  const baseDelay = 200; 
  const charMultiplier = 40; 
  const delay = ((currentWord.length * charMultiplier) + baseDelay) / readingBuddyState.speed;

  readingBuddyState.intervalId = setTimeout(() => {
    if (!readingBuddyState.isPlaying || readingBuddyState.onboundarySupported) return;

    // Advance to the next text-containing element, skipping whitespace blocks
    let nextIndex = readingBuddyState.currentWordIndex + 1;
    while (nextIndex < readingBuddyState.words.length && readingBuddyState.words[nextIndex].trim() === "") {
      nextIndex++;
    }

    if (nextIndex < readingBuddyState.words.length) {
      readingBuddyState.currentWordIndex = nextIndex;
      updateReadingDisplay();
      scheduleNextWordTimer();
    }
  }, delay);
}

/**
 * Handles the play button click
 * Starts reading the text utilizing native browser speech synthesis.
 * Supports pausing and resuming from the active index with correct speed.
 */
function handlePlay() {
  const textInput = document.getElementById('textInput');
  const readingDisplay = document.getElementById('readingDisplay');

  if (!textInput || !readingDisplay) {
    return;
  }

  // 1. Ensure any running speech is cancelled
  window.speechSynthesis.cancel();

  // Get raw text from input (no trim to keep absolute character index alignment!)
  const text = textInput.value;

  // If no text, show alert
  if (text.trim() === '') {
    console.warn('Please enter some text to read.');
    return;
  }

  // 2. Prepare text word arrays for highlighting
  readingBuddyState.words = text.split(/(\s+)/);
  readingBuddyState.isPlaying = true;
  readingBuddyState.onboundarySupported = false; // Reset boundary check flag

  // Calculate starting character indexes for every word block
  let cumulativeLength = 0;
  const wordRanges = readingBuddyState.words.map((word) => {
    const start = cumulativeLength;
    const end = cumulativeLength + word.length;
    cumulativeLength = end;
    return { start, end };
  });

  // Safe checks for the current word index
  if (readingBuddyState.currentWordIndex < 0 || readingBuddyState.currentWordIndex >= readingBuddyState.words.length) {
    readingBuddyState.currentWordIndex = 0;
  }

  // 3. Find the character start index of our current word to resume speaking from
  const startIndex = wordRanges[readingBuddyState.currentWordIndex] 
    ? wordRanges[readingBuddyState.currentWordIndex].start 
    : 0;

  // Squeeze text to speak only from the active word onwards (fully supports real-time speed/volume resumes!)
  const textToSpeak = text.substring(startIndex);
  activeUtterance = new SpeechSynthesisUtterance(textToSpeak);

  // Set speed dynamically based on the slider state
  activeUtterance.rate = readingBuddyState.speed;

  // 4. Synchronize speaking with visual highlighting (native boundary alignment)
  activeUtterance.onboundary = function (event) {
    if (event.name === 'word') {
      // Flag that the browser successfully fired native boundary events
      if (!readingBuddyState.onboundarySupported) {
        readingBuddyState.onboundarySupported = true;
        if (readingBuddyState.intervalId) {
          clearTimeout(readingBuddyState.intervalId);
          readingBuddyState.intervalId = null;
        }
      }

      // Shift character index by the starting index of the text we slice-spoke
      const charIndex = event.charIndex + startIndex;

      // Find which word in our array is being spoken
      const spokenIndex = wordRanges.findIndex(
        (range) => charIndex >= range.start && charIndex < range.end
      );

      if (spokenIndex !== -1) {
        readingBuddyState.currentWordIndex = spokenIndex;
        updateReadingDisplay();
      }
    }
  };

  activeUtterance.onend = function () {
    // Only reset if we naturally finished reading the text
    if (readingBuddyState.isPlaying) {
      readingBuddyState.isPlaying = false;
      readingBuddyState.currentWordIndex = 0;
      if (readingBuddyState.intervalId) {
        clearTimeout(readingBuddyState.intervalId);
        readingBuddyState.intervalId = null;
      }
      updateReadingDisplay();
    }
  };

  activeUtterance.onerror = function (err) {
    // Ignore error caused by standard manual stops
    if (err.error !== 'interrupted') {
      console.error("SpeechSynthesis error:", err);
      handleStop();
    }
  };

  // Start speaking
  window.speechSynthesis.speak(activeUtterance);

  // 5. Fire the recursive fallback timer loop
  if (readingBuddyState.intervalId) {
    clearTimeout(readingBuddyState.intervalId);
  }
  scheduleNextWordTimer();
}

/**
 * Handles the stop button click
 * Stops the speech synthesis process completely
 */
function handleStop() {
  window.speechSynthesis.cancel();
  readingBuddyState.isPlaying = false;

  // Clear any standard timeouts
  if (readingBuddyState.intervalId) {
    clearTimeout(readingBuddyState.intervalId);
    readingBuddyState.intervalId = null;
  }

  // Reset highlight
  updateReadingDisplay();
}

/**
 * Handles the reset button click
 * Resets the reading state to the beginning
 */
function handleReset() {
  handleStop(); // Cancel active speech
  readingBuddyState.currentWordIndex = 0; // Reset index back to start
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

    // Add highlighting class if this is the current word, only make text clickable (not whitespace)
    if (word.trim() === '') {
      html += '<span>' + word + '</span>';
    } else {
      if (isCurrentWord) {
        html += '<span data-index="' + index + '" class="word-highlight word-clickable">' + wordDisplay + '</span>';
      } else {
        html += '<span data-index="' + index + '" class="word-clickable">' + wordDisplay + '</span>';
      }
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
      console.error("Error extracting document: " + error.message);
      textInput.value = "Error extracting text. Check console."; // Revert back
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