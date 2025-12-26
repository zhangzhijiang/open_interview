import { Type } from "@google/genai";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
  requirements: string[];
  quizContext?: string; // Hidden context for the AI to ask specific technical questions
}

export interface EvaluationResult {
  candidateName: string;
  role: string;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  technicalAssessment: string;
  communicationSkills: string;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'No Hire';
  summary: string;
}

// Schema for the Evaluation JSON generation
export const EvaluationSchema = {
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING },
    role: { type: Type.STRING },
    score: { type: Type.NUMBER, description: "A score from 0 to 100 representing fit." },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    technicalAssessment: { type: Type.STRING, description: "Assessment of technical answers." },
    communicationSkills: { type: Type.STRING, description: "Assessment of communication style." },
    hiringRecommendation: { type: Type.STRING, enum: ['Strong Hire', 'Hire', 'No Hire'] },
    summary: { type: Type.STRING, description: "A concise executive summary." },
  },
  required: ['score', 'strengths', 'weaknesses', 'hiringRecommendation', 'summary', 'technicalAssessment'],
};

export type ViewState = 'HOME' | 'JOB_DETAILS' | 'INTERVIEW_SETUP' | 'INTERVIEW_SESSION' | 'REPORT' | 'EMPLOYER_DASHBOARD' | 'USER_PROFILE';

export interface ApplicantData {
  name: string;
  resumeText: string;
}
