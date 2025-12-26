import { Job } from "./types";

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechNova',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for a Senior React Engineer to lead our frontend team. You will be responsible for architecture, performance optimization, and mentoring junior developers.',
    requirements: [
      '5+ years of experience with React and TypeScript',
      'Deep understanding of State Management (Redux, Zustand, Context)',
      'Experience with Performance Optimization',
      'Strong communication skills'
    ],
    quizContext: 'Ask the candidate to explain how the React reconciliation algorithm works. Then ask them to solve a small verbal coding challenge about optimizing a large list rendering.'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Creative Studio',
    location: 'New York, NY',
    type: 'Contract',
    description: 'Seeking a visionary Product Designer to craft intuitive user experiences. You will work closely with PMs and Engineers.',
    requirements: [
      'Portfolio demonstrating strong UI/UX skills',
      'Proficiency in Figma and prototyping tools',
      'Experience with design systems',
      'Ability to conduct user research'
    ],
    quizContext: 'Ask the candidate to critique a popular app (like Spotify or Uber) in terms of UX. Ask them how they handle disagreements with engineering regarding design implementation.'
  },
  {
    id: '3',
    title: 'Backend Developer (Go)',
    company: 'StreamLine',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Join our backend infrastructure team. You will build high-throughput microservices using Go and gRPC.',
    requirements: [
      'Strong proficiency in Go (Golang)',
      'Experience with distributed systems',
      'Knowledge of Kubernetes and Docker',
      'Database design (Postgres, Redis)'
    ],
    quizContext: 'Ask about goroutines and channels. Ask how they would handle a database migration with zero downtime.'
  }
];

export const SYSTEM_INSTRUCTION_TEMPLATE = (job: Job, applicantName: string, resumeText: string) => `
You are a professional, friendly, and observant HR Interviewer for ${job.company}.
You are interviewing a candidate named ${applicantName} for the position of ${job.title}.

Job Description: ${job.description}
Key Requirements: ${job.requirements.join(', ')}
Special Topics to Cover: ${job.quizContext || 'General fit and experience'}

Candidate Resume Content:
"${resumeText.slice(0, 2000)}..." (truncated if too long)

Your Goal:
1. Conduct a screening interview to assess if the candidate meets the requirements.
2. Start by introducing yourself briefly and asking them to introduce themselves.
3. Ask 3-4 distinct questions. At least one should be technical/role-specific based on the "Special Topics".
4. Keep the conversation flowing naturally. Listen to their answers and ask follow-up questions if needed.
5. Be polite but professional.
6. Keep your responses concise (under 2 sentences usually) to allow the candidate to speak more.

IMPORTANT: Do not break character. You are the interviewer.
`;
