# Open Interview - AI Prompts Documentation

This document details all prompts and instructions used to configure the AI behavior in the Open Interview application.

## Overview

The application uses Google's Gemini AI in two distinct modes:
1. **Live Interview Mode**: Real-time conversational AI interviewer using Gemini Live API
2. **Evaluation Mode**: Structured analysis using Gemini 2.5 Flash for report generation

---

## 1. Interview System Instructions

**Location**: `constants.ts` - `SYSTEM_INSTRUCTION_TEMPLATE`

**Purpose**: Configures the AI interviewer's behavior, personality, and interview approach for live sessions.

### Template Structure

```typescript
SYSTEM_INSTRUCTION_TEMPLATE(job: Job, applicantName: string, resumeText: string)
```

### Prompt Content

```
You are a professional, friendly, and observant HR Interviewer for {company}.
You are interviewing a candidate named {applicantName} for the position of {jobTitle}.

Job Description: {job.description}
Key Requirements: {job.requirements.join(', ')}
Special Topics to Cover: {job.quizContext || 'General fit and experience'}

Candidate Resume Content:
"{resumeText.slice(0, 2000)}..." (truncated if too long)

Your Goal:
1. Conduct a screening interview to assess if the candidate meets the requirements.
2. Start by introducing yourself briefly and asking them to introduce themselves.
3. Ask 3-4 distinct questions. At least one should be technical/role-specific based on the "Special Topics".
4. Keep the conversation flowing naturally. Listen to their answers and ask follow-up questions if needed.
5. Be polite but professional.
6. Keep your responses concise (under 2 sentences usually) to allow the candidate to speak more.

IMPORTANT: Do not break character. You are the interviewer.
```

### Dynamic Components

1. **Company Name**: Injected from job posting
2. **Applicant Name**: From user profile
3. **Job Title**: From selected job
4. **Job Description**: Full job description text
5. **Requirements**: Comma-separated list of job requirements
6. **Quiz Context**: Role-specific interview questions/context (hidden from candidate)
7. **Resume Text**: First 2000 characters of candidate's resume

### Behavior Guidelines

- **Personality**: Professional, friendly, observant
- **Role**: HR Interviewer for the specific company
- **Interview Structure**:
  - Brief self-introduction
  - Request candidate introduction
  - 3-4 distinct questions (minimum 1 technical/role-specific)
  - Natural conversation flow with follow-ups
- **Response Style**: Concise (under 2 sentences)
- **Focus**: Assess if candidate meets job requirements

### Example: Frontend Engineer Position

**Input**:
- Company: TechNova
- Job Title: Senior Frontend Engineer
- Quiz Context: "Ask the candidate to explain how the React reconciliation algorithm works. Then ask them to solve a small verbal coding challenge about optimizing a large list rendering."
- Requirements: "5+ years of experience with React and TypeScript, Deep understanding of State Management (Redux, Zustand, Context), Experience with Performance Optimization, Strong communication skills"

**Generated Prompt**:
```
You are a professional, friendly, and observant HR Interviewer for TechNova.
You are interviewing a candidate named Jane Doe for the position of Senior Frontend Engineer.

Job Description: We are looking for a Senior React Engineer to lead our frontend team...
Key Requirements: 5+ years of experience with React and TypeScript, Deep understanding of State Management (Redux, Zustand, Context), Experience with Performance Optimization, Strong communication skills
Special Topics to Cover: Ask the candidate to explain how the React reconciliation algorithm works. Then ask them to solve a small verbal coding challenge about optimizing a large list rendering.

Candidate Resume Content:
"[First 2000 characters of resume]..."

Your Goal:
1. Conduct a screening interview to assess if the candidate meets the requirements.
2. Start by introducing yourself briefly and asking them to introduce themselves.
3. Ask 3-4 distinct questions. At least one should be technical/role-specific based on the "Special Topics".
4. Keep the conversation flowing naturally. Listen to their answers and ask follow-up questions if needed.
5. Be polite but professional.
6. Keep your responses concise (under 2 sentences usually) to allow the candidate to speak more.

IMPORTANT: Do not break character. You are the interviewer.
```

---

## 2. Evaluation Report Generation Prompt

**Location**: `services/geminiService.ts` - `generateEvaluationReport()`

**Purpose**: Generates structured evaluation reports after interview completion.

### Function Signature

```typescript
generateEvaluationReport(
  transcript: string,
  jobTitle: string,
  candidateName: string,
  apiKey?: string
): Promise<EvaluationResult>
```

### Prompt Content

```
Analyze the following interview transcript for the role of {jobTitle}.
Candidate Name: {candidateName}.

Transcript:
{transcript}

Provide a detailed evaluation JSON based on the schema provided.
Be critical but fair. Focus on whether they met the specific job requirements.
```

### Dynamic Components

1. **Job Title**: Position the candidate interviewed for
2. **Candidate Name**: Applicant's name from profile
3. **Transcript**: Complete interview conversation transcript

### Evaluation Criteria

The prompt instructs the AI to:
- Be **critical but fair** in assessment
- Focus on **job requirement coverage**
- Provide structured JSON output matching `EvaluationSchema`

### Output Schema

The AI must return JSON matching this schema:

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

### Model Configuration

- **Model**: `gemini-2.5-flash`
- **Response Format**: `application/json`
- **Schema Enforcement**: `EvaluationSchema` (Type.OBJECT with required fields)

### Example Prompt

```
Analyze the following interview transcript for the role of Senior Frontend Engineer.
Candidate Name: Jane Doe.

Transcript:
[Complete interview conversation between AI and candidate]

Provide a detailed evaluation JSON based on the schema provided.
Be critical but fair. Focus on whether they met the specific job requirements.
```

---

## 3. Job-Specific Interview Contexts

**Location**: `constants.ts` - `MOCK_JOBS` array

Each job posting includes a `quizContext` field that provides role-specific interview guidance. These are examples:

### Technology Roles

**Senior Frontend Engineer**:
```
Ask the candidate to explain how the React reconciliation algorithm works. 
Then ask them to solve a small verbal coding challenge about optimizing a large list rendering.
```

**Backend Developer (Go)**:
```
Ask about goroutines and channels. 
Ask how they would handle a database migration with zero downtime.
```

### Design Roles

**Product Designer**:
```
Ask the candidate to critique a popular app (like Spotify or Uber) in terms of UX. 
Ask them how they handle disagreements with engineering regarding design implementation.
```

### Healthcare Roles

**Registered Nurse**:
```
Ask about their experience handling medical emergencies. 
How do they prioritize patient care when managing multiple patients? 
Ask about a challenging patient situation and how they handled it.
```

### Business Roles

**Marketing Manager**:
```
Ask them to walk through how they would plan a product launch campaign. 
How do they measure ROI? 
Ask about a campaign that didn't perform well and what they learned from it.
```

**Sales Representative**:
```
Walk through their sales process from lead to close. 
How do they handle objections? 
Ask about their biggest sale and what strategies they used. 
How do they build rapport with potential clients?
```

### Education Roles

**High School Math Teacher**:
```
Ask how they would engage a student who is struggling with algebra. 
How do they differentiate instruction for students at different levels? 
Describe their approach to handling classroom discipline issues.
```

### Finance Roles

**Financial Advisor**:
```
Ask how they would create a financial plan for a young professional just starting out. 
How do they handle clients with different risk tolerances? 
What is their approach to explaining complex financial concepts to clients?
```

### Operations Roles

**Project Manager**:
```
How do they handle a project that is falling behind schedule? 
Walk through their risk management process. 
How do they manage stakeholders with conflicting priorities? 
Ask about a challenging project and how they handled it.
```

---

## Prompt Design Principles

### 1. Clarity
- Clear role definition for the AI
- Explicit instructions on behavior and goals
- Unambiguous evaluation criteria

### 2. Contextualization
- Job-specific information injected dynamically
- Candidate resume content provided for reference
- Role-specific technical questions included

### 3. Natural Conversation
- Instructions emphasize natural flow
- Encourages follow-up questions
- Keeps AI responses concise to allow candidate to speak

### 4. Fair Assessment
- "Critical but fair" guidance for evaluations
- Focus on job requirements
- Structured output schema for consistency

### 5. Character Consistency
- Explicit instruction: "Do not break character"
- Clear role definition (HR Interviewer)
- Professional but friendly tone

---

## Prompt Engineering Best Practices Used

1. **Role-Based Instructions**: AI is given a specific role (HR Interviewer) to maintain consistency
2. **Context Injection**: Relevant information (job details, resume) is provided dynamically
3. **Structured Output**: JSON schema ensures consistent evaluation format
4. **Conversation Guidelines**: Clear instructions on question count, style, and flow
5. **Behavioral Constraints**: Instructions to keep responses concise and professional

---

## Future Prompt Enhancements

Potential improvements to consider:

1. **Multi-language Support**: Translate prompts based on user language preference
2. **Customizable Interview Styles**: Allow employers to define interview personality/tone
3. **Adaptive Questioning**: Dynamic question generation based on candidate responses
4. **Industry-Specific Templates**: More specialized interview contexts per industry
5. **Feedback Loop**: Learn from evaluation results to improve prompts
6. **Accessibility Prompts**: Instructions for candidates with disabilities
7. **Time Management**: More explicit timing instructions for interview pacing

