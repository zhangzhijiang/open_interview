<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Open Interview

An AI-powered recruitment platform where employers post jobs and applicants undergo real-time video screening interviews with an AI agent.

**Package Identifier**: `com.idatagear.open_interview`

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)
- Google Gemini API key
- Firebase project (for authentication and database)

### Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000/interview/`

## Documentation

- **[FEATURES.md](./FEATURES.md)**: Complete feature documentation and design overview
- **[PROMPTS.md](./PROMPTS.md)**: All AI prompts and instructions used in the application
- **[BUILD_AND_DEPLOYMENT.md](./BUILD_AND_DEPLOYMENT.md)**: Comprehensive build, deployment, and release instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Deployment-specific guide (legacy, see BUILD_AND_DEPLOYMENT.md for latest)

## Key Features

- 🤖 **AI-Powered Interviews**: Real-time video interviews with Google Gemini AI
- 👤 **User Profiles**: Save resume, manage profile, store interview history
- 💼 **Job Board**: Browse diverse job postings across multiple industries
- 📊 **Evaluation Reports**: Automated assessment with scores and recommendations
- 🔐 **Firebase Integration**: Secure authentication and data persistence
- ⏱️ **Session Management**: Timed interview sessions with BYOK support

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini API (Live API & 2.5 Flash)
- **Backend**: Firebase (Auth & Firestore)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Project Structure

```
open_interview/
├── components/          # React components
│   ├── InterviewSession.tsx
│   ├── EvaluationReport.tsx
│   ├── UserProfile.tsx
│   ├── JobCard.tsx
│   └── EmployerDashboard.tsx
├── services/           # Service layer
│   ├── geminiService.ts
│   ├── authService.ts
│   ├── userProfileService.ts
│   └── firebase/
│       └── config.ts
├── constants.ts        # Mock data and prompts
├── types.ts           # TypeScript interfaces
├── App.tsx            # Main application component
└── vite.config.ts     # Vite configuration
```

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## License

[Add your license information here]

## Support

For detailed documentation, see the documentation files listed above.
