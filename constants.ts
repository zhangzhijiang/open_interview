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
  },
  {
    id: '4',
    title: 'Registered Nurse',
    company: 'City Medical Center',
    location: 'Chicago, IL',
    type: 'Full-time',
    description: 'Seeking a compassionate Registered Nurse to join our medical-surgical unit. You will provide direct patient care, administer medications, and collaborate with healthcare teams.',
    requirements: [
      'Active RN license in Illinois',
      '2+ years of medical-surgical nursing experience',
      'BLS and ACLS certifications',
      'Strong critical thinking and communication skills'
    ],
    quizContext: 'Ask about their experience handling medical emergencies. How do they prioritize patient care when managing multiple patients? Ask about a challenging patient situation and how they handled it.'
  },
  {
    id: '5',
    title: 'Marketing Manager',
    company: 'BrandVision Agency',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    description: 'Lead marketing campaigns for high-profile clients. Develop strategies, manage budgets, and analyze campaign performance across digital and traditional channels.',
    requirements: [
      '5+ years of marketing experience',
      'Proficiency in Google Analytics and social media platforms',
      'Experience with marketing automation tools',
      'Strong analytical and creative skills'
    ],
    quizContext: 'Ask them to walk through how they would plan a product launch campaign. How do they measure ROI? Ask about a campaign that didn\'t perform well and what they learned from it.'
  },
  {
    id: '6',
    title: 'High School Math Teacher',
    company: 'Metro Public Schools',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Teach Algebra and Geometry to high school students. Develop lesson plans, assess student progress, and create an engaging learning environment.',
    requirements: [
      'Bachelor\'s degree in Mathematics or Education',
      'Teaching certification (Texas preferred)',
      'Experience working with high school students',
      'Strong classroom management skills'
    ],
    quizContext: 'Ask how they would engage a student who is struggling with algebra. How do they differentiate instruction for students at different levels? Describe their approach to handling classroom discipline issues.'
  },
  {
    id: '7',
    title: 'Financial Advisor',
    company: 'Wealth Management Partners',
    location: 'Boston, MA',
    type: 'Full-time',
    description: 'Help clients achieve their financial goals through investment planning, retirement strategies, and wealth management services.',
    requirements: [
      'Series 7 and Series 66 licenses',
      '3+ years of financial advising experience',
      'Strong knowledge of investment products',
      'Excellent client relationship skills'
    ],
    quizContext: 'Ask how they would create a financial plan for a young professional just starting out. How do they handle clients with different risk tolerances? What is their approach to explaining complex financial concepts to clients?'
  },
  {
    id: '8',
    title: 'Restaurant Manager',
    company: 'Coastal Bistro',
    location: 'Miami, FL',
    type: 'Full-time',
    description: 'Oversee daily restaurant operations including staff management, customer service, inventory, and ensuring high-quality dining experiences.',
    requirements: [
      '3+ years of restaurant management experience',
      'Knowledge of food safety regulations',
      'Strong leadership and problem-solving skills',
      'Availability for evenings and weekends'
    ],
    quizContext: 'How do they handle a customer complaint about food quality? Describe their approach to managing a busy dinner service. How do they motivate staff during stressful periods?'
  },
  {
    id: '9',
    title: 'Sales Representative',
    company: 'Innovate Solutions Inc.',
    location: 'Remote',
    type: 'Full-time',
    description: 'Sell software solutions to enterprise clients. Build relationships, conduct product demonstrations, and close deals in the B2B technology sector.',
    requirements: [
      '2+ years of B2B sales experience',
      'Proven track record of meeting sales quotas',
      'Strong presentation and negotiation skills',
      'CRM software proficiency (Salesforce preferred)'
    ],
    quizContext: 'Walk through their sales process from lead to close. How do they handle objections? Ask about their biggest sale and what strategies they used. How do they build rapport with potential clients?'
  },
  {
    id: '10',
    title: 'Human Resources Generalist',
    company: 'Global Tech Corp',
    location: 'Seattle, WA',
    type: 'Full-time',
    description: 'Manage HR functions including recruitment, employee relations, benefits administration, and policy implementation for a growing tech company.',
    requirements: [
      'Bachelor\'s degree in HR or related field',
      '3+ years of HR experience',
      'Knowledge of employment law',
      'Strong interpersonal and conflict resolution skills'
    ],
    quizContext: 'How do they handle a sensitive employee relations issue? Walk through their recruitment process. How do they ensure fair hiring practices? Ask about a time they had to mediate a workplace conflict.'
  },
  {
    id: '11',
    title: 'Content Writer',
    company: 'Digital Media Hub',
    location: 'Remote',
    type: 'Contract',
    description: 'Create engaging blog posts, articles, and marketing copy for various clients. Research topics, optimize for SEO, and collaborate with marketing teams.',
    requirements: [
      'Excellent writing and editing skills',
      'Experience with SEO best practices',
      'Ability to write for different audiences',
      'Portfolio of published work'
    ],
    quizContext: 'Ask them to describe their writing process. How do they adapt their writing style for different audiences? How do they ensure content is SEO-friendly without sacrificing quality? Ask about their research process for complex topics.'
  },
  {
    id: '12',
    title: 'Operations Coordinator',
    company: 'LogiFlow Systems',
    location: 'Dallas, TX',
    type: 'Full-time',
    description: 'Coordinate logistics, manage vendor relationships, and optimize operational processes to ensure efficient supply chain operations.',
    requirements: [
      '2+ years of operations or logistics experience',
      'Strong organizational and problem-solving skills',
      'Proficiency with ERP systems',
      'Excellent communication skills'
    ],
    quizContext: 'How do they prioritize tasks when dealing with multiple urgent requests? Describe a time they improved an operational process. How do they handle vendor relationship management?'
  },
  {
    id: '13',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Denver, CO',
    type: 'Full-time',
    description: 'Analyze large datasets to provide business insights. Create reports, build dashboards, and help stakeholders make data-driven decisions.',
    requirements: [
      'Strong proficiency in SQL and Excel',
      'Experience with data visualization tools (Tableau, Power BI)',
      'Understanding of statistical analysis',
      'Experience with Python or R'
    ],
    quizContext: 'Walk through how they would analyze a dataset to answer a business question. How do they ensure data quality? Ask about a time they found an unexpected insight in data. How do they present complex data to non-technical stakeholders?'
  },
  {
    id: '14',
    title: 'Customer Success Manager',
    company: 'SaaS Solutions',
    location: 'Portland, OR',
    type: 'Full-time',
    description: 'Ensure client satisfaction and success with our software platform. Onboard new clients, provide training, and identify upsell opportunities.',
    requirements: [
      '2+ years in customer success or account management',
      'Experience with SaaS platforms',
      'Strong relationship-building skills',
      'Problem-solving and communication abilities'
    ],
    quizContext: 'How do they handle a client who is considering canceling their subscription? Walk through their onboarding process. How do they identify opportunities to help clients get more value from the product?'
  },
  {
    id: '15',
    title: 'Project Manager',
    company: 'Enterprise Builders',
    location: 'Atlanta, GA',
    type: 'Full-time',
    description: 'Lead cross-functional project teams to deliver projects on time and within budget. Manage timelines, resources, and stakeholder communication.',
    requirements: [
      'PMP certification preferred',
      '5+ years of project management experience',
      'Proficiency with project management tools (Jira, Asana, MS Project)',
      'Strong leadership and communication skills'
    ],
    quizContext: 'How do they handle a project that is falling behind schedule? Walk through their risk management process. How do they manage stakeholders with conflicting priorities? Ask about a challenging project and how they handled it.'
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
