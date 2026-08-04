# Mindly

**AI-Powered Learning for Students with ADHD and Dyslexia**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/jamonanan/Mindly)

Mindly makes learning more personalized, inclusive, and engaging with adaptive reading support, gamification, and comprehensive progress tracking for students, parents, and teachers.

## Features

- **AI Reading Buddy**: Text-to-speech with word highlighting and dyslexia-friendly customization.
- **Simplified Lessons**: Adaptive content in English and Urdu, tailored to learning needs.
- **Mental Health Support**: AI chatbot for motivation and emotional support during learning.
- **Accessibility Features**: Dedicated settings for dyslexic-friendly fonts and UI adjustments.
- **Focus Timer**: Built-in timer to help students manage their study sessions effectively.
- **Quizzes & Study Plans**: Interactive assessments and personalized study roadmaps.
- **Dashboard**: Track metrics and learning progress seamlessly.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend & Services**: Firebase (Authentication, Database, Functions)

## Prerequisites

> [!WARNING]  
> This project is currently **not deployed**. To run it properly, you must use the **Firebase Local Emulator Suite**.

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (comes with `npm`)
- [Firebase CLI](https://firebase.google.com/docs/cli)

## How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jamonanan/Mindly.git
   cd Mindly
   ```

2. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

3. **Install Functions Dependencies** (if needed):
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Authenticate with Firebase** (first time only):
   ```bash
   firebase login
   ```

5. **Start the Firebase Emulators**:
   To ensure all features (like authentication and database operations) work correctly, you need to run the emulator suite. Run the following command in the root of the project:
   ```bash
   firebase emulators:start
   ```
   *Note: This command starts up local, temporary instances of Firebase services. If you close the terminal, the emulator stops and any mock data might be cleared unless you configure it otherwise.*

6. **Access the Application & Emulator UI**:
   - **Mindly App**: Once the emulators are running, Firebase Hosting will serve the app. Check your terminal output for the local URL (usually `http://localhost:5000` or `http://127.0.0.1:5000`). Open this URL in your browser to interact with Mindly!
   - **Emulator UI**: You can manage fake users and database records by visiting the Emulator UI (usually `http://localhost:4000` or `http://127.0.0.1:4000`).
