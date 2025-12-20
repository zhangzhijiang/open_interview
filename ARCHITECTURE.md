# OpenInterview: Architecture & Implementation Guide

## 1. Project Vision & Core Principles

This document outlines the architecture and development plan for the OpenInterview application. The goal is to create a secure, private, and effective AI-powered interview practice tool.

**Core Principles:**
- **Privacy First:** All user-generated data (resume, video, audio) is processed and stored exclusively on the user's device. Nothing is ever uploaded to a server.
- **Local-Only Storage:** All session data is persisted locally. The architecture is prepared for future cloud sync, but it is not implemented in v1.
- **Clean Architecture:** The codebase is separated into three distinct layers (Data, Domain, Presentation) to ensure maintainability, scalability, and testability.
- **Stateless AI:** All interactions with the AI backend are stateless. Each API call is self-contained and does not rely on server-side session history.

---

## 2. Next Steps: Initial Project Setup

The project has been initialized with key dependencies. Before writing feature code, follow these steps in your IDE (like VS Code):

1.  **Delete Incorrect Files:** The `index.tsx` file is not part of a Flutter project. **Delete it.**
2.  **Create Entry Point:** Create the main application entry file at `lib/main.dart`. This file will initialize services (like Hive) and run the app.
3.  **Install Dependencies:** Open a terminal in the project root and run `flutter pub get`.
4.  **Run Initial Code Generation:** The project uses code generation for models and providers. Run the following command to generate the necessary files (it will show errors initially, which is expected until you create the annotated model files):
    ```sh
    flutter pub run build_runner build --delete-conflicting-outputs
    ```

---

## 3. Directory Structure

To maintain a clean architecture, the `lib` folder should be organized as follows:

```
lib/
├── main.dart                 # App entry point
└── src/
    ├── app.dart              # Root MaterialApp widget
    ├── core/                 # Core utilities, constants, and config
    │   ├── config/           # App configuration (API keys)
    │   ├── constants/        # App-wide constants (prompts, keys)
    │   └── routing/          # Navigation and routing (GoRouter)
    │
    ├── data/                 # Data Layer: Services and repositories
    │   ├── local/            # Local data sources (Hive implementation)
    │   ├── repositories/     # Concrete repository implementations
    │   └── services/         # External services (Gemini AI service)
    │
    ├── domain/               # Domain Layer: Business logic and entities
    │   ├── entities/         # Core data models (InterviewSession, etc.)
    │   └── repositories/     # Abstract repository interfaces
    │
    └── features/             # Presentation Layer: UI and State Management
        ├── interview_setup/
        │   └── presentation/
        │       ├── controllers/ # Riverpod providers/notifiers
        │       ├── screens/     # The main screen widget
        │       └── widgets/     # Reusable widgets for this feature
        │
        ├── live_interview/
        │   └── presentation/
        │       ├── controllers/
        │       ├── screens/
        │       └── widgets/
        │
        └── evaluation_report/
            └── presentation/
                ├── controllers/
                ├── screens/
                └── widgets/
```

---

## 4. State Management (Riverpod)

We will use `riverpod_generator` to create providers. This keeps provider definitions co-located with the logic they provide and reduces boilerplate.

-   **Service Providers:** Use `Provider` for stateless services (e.g., repositories, AI service).
    ```dart
    // lib/src/data/services/gemini_ai_service.dart
    @riverpod
    AIService aiService(AiServiceRef ref) {
      return GeminiAIService(apiKey: AppConfig.geminiApiKey);
    }
    ```
-   **Feature Controllers:** Use `Notifier` or `AsyncNotifier` for managing UI state and business logic within features.
    ```dart
    // lib/src/features/interview_setup/presentation/controllers/interview_setup_controller.dart
    @riverpod
    class InterviewSetupController extends _$InterviewSetupController {
      @override
      FutureOr<void> build() {
        // No initial state to build
      }

      Future<void> createSession({required String jobDescription, String? resumeText}) async {
        // Business logic to create and save a new interview session
      }
    }
    ```

---

## 5. Implementation Plan (Actionable Checklist)

Follow this plan to build the application layer by layer.

### Phase 1: Setup Core & Data Layers

1.  **Create `main.dart` & `app.dart`:** Initialize Hive for local storage in `main` and set up `MaterialApp.router` with GoRouter in `app.dart`.
2.  **Implement Configuration:** Create an `AppConfig` class in `lib/src/core/config` that uses `flutter_dotenv` to load the `GEMINI_API_KEY`.
3.  **Define Entities:** In `lib/src/domain/entities`, create the Dart classes for `InterviewSession`, `InterviewQuestion`, and `EvaluationReport`. Annotate them for `json_serializable` and `hive_generator`.
4.  **Abstract Local Storage:** Create the `LocalStorageService` abstract class in `lib/src/data/local`. Then, create the `HiveStorageService` implementation.
5.  **Abstract AI Service:** Create the `AIService` abstract class in `lib/src/data/services`. Then, create the `GeminiAIService` implementation, which will interact with the `google_generative_ai` package.
6.  **Define & Implement Repositories:** Define the `InterviewRepository` interface in `lib/src/domain/repositories` and its implementation in `lib/src/data/repositories`. The implementation will use the `LocalStorageService` to save and retrieve interview data.

### Phase 2: Implement Features (UI & Logic)

1.  **Feature: Interview Setup**
    -   **UI:** Build the screen (`lib/src/features/interview_setup/presentation/screens/interview_setup_screen.dart`) with a `TextField` for the job description and a `Button` to upload a resume.
    -   **Logic:** Use the `file_picker` package to pick a resume file. Create a `InterviewSetupController` (AsyncNotifier) that:
        -   Reads the text from the uploaded resume file.
        -   Calls the `InterviewRepository` to create and store a new `InterviewSession`.
        -   Navigates to the live interview screen on success.

2.  **Feature: Live Interview**
    -   **UI:** Build the screen to show a camera preview using the `camera` package. Include UI elements to show the AI's question, a recording indicator, and a button to submit an answer.
    -   **Privacy Message:** Prominently display a message on this screen: *"Your camera is on, but your video is NOT being recorded or uploaded. Only your voice is used to answer questions."*
    -   **Logic (Interview Engine):** This is the most complex part. The flow should be:
        1.  Fetch the first question from Gemini 1.5 Flash using the JD and resume context.
        2.  Display the question.
        3.  When the user is ready, start capturing audio (NOT video).
        4.  Implement Speech-to-Text on the captured audio. **Note:** The prompt requires this to be transient. You will need a plugin or service for this. For a fully local solution, investigate packages like `vosk_flutter`.
        5.  Send the transcribed text answer to the Gemini API.
        6.  The Gemini API will respond with the next question.
        7.  Append the question/answer pair to the `InterviewSession` model and save it locally.
        8.  Repeat until the interview is complete (e.g., after 5 questions or a concluding statement from the AI).
        9.  Navigate to the evaluation report screen.

3.  **Feature: Evaluation Report**
    -   **UI:** Design a screen to clearly present the evaluation report: Strengths, Weaknesses, Skill Match, and Advice.
    -   **Logic:** Create an `EvaluationReportController` (FutureProvider or AsyncNotifier) that:
        1.  Retrieves the full interview transcript from the `InterviewSession` saved in local storage.
        2.  Sends the entire transcript, along with the original JD/resume, to the **Gemini 1.5 Pro** model with a structured prompt asking for the evaluation.
        3.  Parses the AI's response into the `EvaluationReport` model.
        4.  Displays the data in the UI. Add a button to "Finish" or "Start New Interview", which should also offer to delete the session data.

