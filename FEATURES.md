# Open Interview - Features & Design Documentation

## Overview

**Open Interview** is an AI-powered recruitment platform that enables employers to post job openings and allows applicants to undergo real-time video screening interviews with an AI agent. The application uses Google's Gemini AI for live video/audio interviews and automated evaluation reports.

**Package Identifier**: `com.idatagear.open_interview`

## Core Features

### 1. Job Board
- **Browse Available Jobs**: View a curated list of job postings across various industries
- **Job Details**: Detailed view of each job including:
  - Job title, company, location, and type (Full-time/Part-time/Contract)
  - Complete job description
  - Required qualifications and skills
  - Technical interview topics (hidden context for AI interviewer)
- **Diverse Job Categories**: Jobs span multiple industries including:
  - Technology (Frontend, Backend, Full-stack)
  - Design (Product Designer, UX/UI)
  - Healthcare (Registered Nurse)
  - Education (Teacher positions)
  - Finance (Financial Advisor)
  - Marketing (Marketing Manager)
  - Sales (Sales Representative)
  - Human Resources (HR Generalist)
  - Operations (Operations Coordinator, Project Manager)
  - Customer Service (Customer Success Manager)
  - Content Creation (Content Writer)
  - Hospitality (Restaurant Manager)

### 2. User Authentication & Profiles

#### Authentication Methods
- **Anonymous/Guest Sign-In**: Automatic anonymous authentication for quick access
- **Google Sign-In**: Full authentication with Google OAuth for persistent profiles

#### User Profile Management
- **Profile Information**:
  - Full name (required for interviews)
  - Resume text (upload .txt file or paste content)
  - Optional Gemini API Key (BYOK - Bring Your Own Key)
  
- **Saved Jobs**:
  - Save up to 3 jobs of interest
  - Quick access to saved jobs from profile
  - View job details and apply directly from saved jobs
  
- **Interview History**:
  - Stores last 3 interview sessions
  - Each history entry contains:
    - Job title and interview date
    - Complete interview transcript
    - Full evaluation report (score, strengths, weaknesses, recommendations)
  - Expandable cards for easy review
  - Auto-overwrites oldest interview when limit exceeded

### 3. AI-Powered Interview Sessions

#### Session Features
- **Real-Time Video/Audio**: Live video and audio streaming during interviews
- **AI Interviewer**: Google Gemini AI acts as an HR interviewer, asking role-specific questions
- **Transcript Display**: Real-time display of conversation transcript
- **Session Controls**:
  - Microphone toggle (mute/unmute)
  - Camera toggle (video on/off)
  - End call button

#### API Key Management
- **Default API Key**: Uses application's API key (5-minute session limit)
- **BYOK (Bring Your Own Key)**: Option to use personal Gemini API key
  - 15-minute session limit with custom key
  - Key used only for current session (not saved in profile)
  - Modal prompt for key input before interview starts

#### Session Timer
- Visual countdown timer displayed in header
- Timer starts only after successful AI connection
- Automatic session termination when time limit reached
- Different limits based on API key type (5 min default / 15 min custom)

### 4. Evaluation Reports

#### Automated Analysis
After each interview, the system generates a comprehensive evaluation report including:

- **Overall Score**: 0-100 rating based on job requirements
- **Hiring Recommendation**: 
  - Strong Hire
  - Hire
  - No Hire
- **Executive Summary**: Concise overview of candidate performance
- **Strengths**: List of positive attributes and skills demonstrated
- **Weaknesses**: Areas needing improvement
- **Technical Assessment**: Detailed evaluation of technical knowledge
- **Communication Skills**: Assessment of verbal communication and articulation

#### Report Display
- Color-coded score visualization (green/yellow/red)
- Clean, professional layout
- Easy-to-read sections with icons
- Option to restart and take another interview

### 5. Employer Dashboard

- **Post Job Openings**: Employers can create and post new job listings
- **Job Form Fields**:
  - Job title
  - Company name
  - Location
  - Job type (Full-time, Part-time, Contract)
  - Job description
  - Requirements list
  - Technical interview context (for AI interviewer)
- **Job Management**: Posted jobs appear on the main job board

## Technical Architecture

### Frontend Stack
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (utility-first CSS)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useRef)

### Backend Services

#### Firebase Integration
- **Authentication**: 
  - Firebase Auth for user management
  - Anonymous and Google OAuth providers
  - Offline-capable authentication state
  
- **Firestore Database**:
  - User profiles storage
  - Interview history persistence
  - Offline persistence enabled (IndexedDB)
  - Real-time data synchronization

#### AI Services
- **Google Gemini API**:
  - Gemini 2.5 Flash for evaluation reports
  - Google GenAI Live API for real-time interviews
  - Structured JSON schema for report generation

### Data Models

#### Job
```typescript
{
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract'
  description: string
  requirements: string[]
  quizContext?: string // Hidden context for AI interviewer
}
```

#### User Profile
```typescript
{
  name: string
  email?: string
  resumeText?: string
  apiKey?: string
  savedJobs?: Job[] // Max 3
  interviewHistory?: InterviewHistoryItem[] // Max 3
  isAnonymous: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  settings: object
}
```

#### Interview History Item
```typescript
{
  id: string
  jobTitle: string
  jobId?: string
  transcript: string
  evaluation: EvaluationResult
  timestamp: Timestamp
}
```

#### Evaluation Result
```typescript
{
  candidateName: string
  role: string
  score: number // 0-100
  strengths: string[]
  weaknesses: string[]
  technicalAssessment: string
  communicationSkills: string
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'No Hire'
  summary: string
}
```

## User Flow

### Applicant Journey
1. **Browse Jobs**: View job board with available positions
2. **Select Job**: Click on a job card to view details
3. **Create Profile** (if first time):
   - Enter full name
   - Upload/paste resume
   - Optionally add personal API key
4. **Start Interview**: Click "Start Application" to begin
5. **Interview Session**:
   - Allow camera/microphone permissions
   - Engage in real-time conversation with AI interviewer
   - View live transcript
   - Control audio/video settings
6. **Review Report**: After interview, view comprehensive evaluation
7. **Save to History**: Report automatically saved to profile

### Employer Journey
1. **Access Dashboard**: Click "Post a Job (Employer)" from header
2. **Fill Job Details**: Complete job posting form
3. **Submit**: Job appears on main job board for applicants to see

## Design Principles

### User Experience
- **Simple Navigation**: Clear view states and intuitive flow
- **Real-Time Feedback**: Live transcript and visual indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Semantic HTML and clear UI elements
- **Error Handling**: User-friendly error messages and recovery

### UI Components
- **Modern Design**: Clean, professional interface
- **Color Coding**: Visual indicators for scores and recommendations
- **Iconography**: Lucide icons for intuitive understanding
- **Loading States**: Clear feedback during async operations
- **Modal Dialogs**: For API key input and job posting

### Security & Privacy
- **Firebase Security**: Secure authentication and data storage
- **API Key Handling**: User keys stored securely in Firestore
- **Offline Support**: Firestore offline persistence for reliability
- **Session Management**: Secure session handling and cleanup

## Performance Considerations

- **Code Splitting**: Vite handles automatic code splitting
- **Optimized Builds**: Production builds are minified and optimized
- **Lazy Loading**: Components loaded as needed
- **Audio/Video Streaming**: Efficient real-time media handling
- **Caching**: Browser caching and Firestore offline cache

## Browser Compatibility

- Modern browsers with WebRTC support (required for video/audio)
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers with camera/microphone access

## Limitations & Future Enhancements

### Current Limitations
- Client-side API key exposure (see DEPLOYMENT.md for security recommendations)
- 5-minute limit for default API key sessions
- Maximum 3 saved jobs per user
- Maximum 3 interview history entries
- Resume upload limited to .txt format

### Potential Enhancements
- Backend API proxy for secure API key handling
- PDF resume parsing
- Extended session limits
- More interview history entries
- Additional authentication providers
- Email notifications
- Advanced analytics dashboard
- Multi-language support
- Video recording playback

