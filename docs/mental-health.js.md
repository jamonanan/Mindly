# File: `mental-health.js`

## Overview
This file handles the functionality for the Mental Health Support chatbot. It authenticates the user, retrieves their name from Firestore to personalize the greeting, and manages the chat interface by communicating with a Firebase Cloud Function (`chatWithGemini`) that is integrated with an AI language model.

## Key Logic & Line-by-Line Explanation

### Initialization & State
- **Lines 1-5**: Imports necessary Firebase modules. Defines `FUNCTION_URL`, which points to the backend endpoint handling AI responses. (Currently hardcoded to a local emulator address).
- **Lines 7-12**: Gets references to DOM elements (`chat-messages`, `chat-input`, `send-btn`). Initializes a `chatHistory` array to maintain conversation context and sets a default `userName` ("there").

### Authentication & Personalization
- **Lines 14-43**: Uses `onAuthStateChanged` to verify the user is logged in.
  - If a user is found, it fetches their custom document from the `users/{uid}` collection in Firestore to retrieve their `fullName`.
  - Re-initializes `chatHistory` with a pre-populated exchange. The "user" message introduces them by name, and the "model" message is the initial greeting ("Hello [Name]! I'm your support buddy...").
  - Updates the initial greeting element (`#ai-greeting`) in the DOM directly with the personalized message.

### UI Rendering Functions
- **Lines 45-75 (`createMessageElement`)**: A helper function to build the HTML for a chat bubble.
  - Adds classes (`user-message` or `ai-message`) depending on the `isUser` flag.
  - Gets the current time formatted as `HH:MM`.
  - For AI messages, injects an SVG bot icon.
  - Replaces newline characters in the text with `<br>` tags and returns the fully constructed DOM element.
- **Lines 77-85 (`appendMessage` & `scrollToBottom`)**: Utility functions to add a new message element to the chat container and automatically scroll the view to the newest message at the bottom.

### Message Handling Logic
- **Lines 87-135 (`handleSendMessage`)**: The core function executed when the user sends a message.
  - Retrieves and trims the text. Exits early if empty.
  - Uses `createMessageElement` to render the user's message and clears the input box.
  - Immediately appends a "Typing..." indicator element to show the AI is processing.
  - **Lines 102-118**: Sends a `POST` request to `FUNCTION_URL`. It passes the new user text *and* the entire `chatHistory` array to provide context to the AI model.
  - Parses the response JSON to extract the AI's reply.
  - Pushes both the new user message and the AI's response into the local `chatHistory` array.
  - Removes the "Typing..." indicator and appends the final AI response to the UI.
  - **Lines 129-134**: Catches network/backend errors, removes the typing indicator, and displays a fallback error message in the chat.

### Event Listeners
- **Lines 138-143**: Attaches `handleSendMessage` to the send button's `click` event and the input field's `keypress` event (specifically looking for the "Enter" key).
