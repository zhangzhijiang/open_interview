# OpenInterview AI

A production-ready Flutter project for an AI-powered interview practice application.

## Project Overview

OpenInterview is designed to help users practice for job interviews using AI. It provides a simulated interview experience, followed by detailed feedback on performance. The app is built with privacy as a priority, processing all video and audio data locally and using a stateless AI backend.

### Core Features (v1)
- **Mock Interview Mode:** AI-led interview sessions based on user-provided context.
- **Resume Upload:** Users can upload their resume (processed locally) to tailor the interview.
- **Job Description Input:** Users can provide a job description via text or URL.
- **Post-Interview Evaluation:** A detailed report including strengths, weaknesses, skill match, and improvement advice.

### Architecture
- **Platform:** Flutter (Android, iOS, Web)
- **State Management:** Riverpod
- **Architecture:** Clean Architecture (Presentation / Domain / Data layers)
- **AI Integration:** Gemini 1.5 Flash (live conversation) & Gemini 1.5 Pro (evaluation)
- **Storage:** Local-only using Hive, with an abstraction layer for future cloud sync.
- **Privacy:** No user accounts. All personal data (resume, video recordings) is stored and processed on the device and deleted after the session.

## Getting Started

### Prerequisites
- Flutter SDK (3.x or newer)
- An editor like VS Code or Android Studio

### Setup
1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd OpenInterview
   ```
2. **Install dependencies:**
   ```sh
   flutter pub get
   ```
3. **Configure API Keys:**
   - Rename `.env.example` to `.env`.
   - Add your Gemini API key to the `.env` file:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```
4. **Run the app:**
   ```sh
   flutter run
   ```
