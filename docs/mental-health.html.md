# File: `mental-health.html`

## Overview
This is the HTML interface for the Mental Health Support feature. It provides a familiar chat-like UI for users to converse with an AI chatbot, designed to provide emotional support and guidance related to their learning journey.

## Key Logic & Structure

### Header Section
- **Lines 14-48**: Top navigation header.
  - Contains a "Back" link returning to `dashboard.html`.
  - Features a custom bot icon SVG and the title "Mental Health Support".
  - Houses the standard Accessibility and Account Dropdown menus (injected dynamically).

### Main Chat Area
- **Lines 51-70**: The primary container for the conversation (`#chat-container`).
  - Contains `#chat-messages`, a vertical list area where individual chat bubbles are dynamically appended by `mental-health.js`.
  - Includes one hardcoded initial `.ai-message` block containing the bot's avatar and greeting (`#ai-greeting`). This text is replaced with a personalized version on page load if the user is authenticated.

### Chat Input Area
- **Lines 73-83**: A fixed container at the bottom of the screen.
  - Features a text input field (`#chat-input`) where the user types their message.
  - Features a send button (`#send-btn`) styled with a paper airplane SVG icon. Clicking this button or hitting "Enter" inside the input field triggers the backend AI request.

### External Scripts
- **Lines 85-86**: Imports the necessary JavaScript modules.
  - `mental-health.js`: Handles the chat logic and API calls.
  - `settings.js`: Applies the user's visual preferences (like dark mode).
