import React, { useState, useEffect } from 'react';
import { ViewState, Job, ApplicantData, EvaluationResult } from './types';
import { MOCK_JOBS } from './constants';
import { JobCard } from './components/JobCard';
import { InterviewSession } from './components/InterviewSession';
import { EvaluationReport } from './components/EvaluationReport';
import { EmployerDashboard } from './components/EmployerDashboard';
import { UserProfilePage } from './components/UserProfile';
import { generateEvaluationReport } from './services/geminiService';
import { signInAsGuest, signInWithGoogle, onAuthChange, getCurrentUser, signOutUser } from './services/authService';
import { getUserProfile, saveUserProfile, InterviewHistoryItem } from './services/userProfileService';
import { Timestamp } from 'firebase/firestore';
import { Sparkles, Briefcase, UserCircle, Upload, ArrowLeft, Loader2, Play, LogIn, LogOut } from 'lucide-react';
import type { User } from 'firebase/auth';
import { AdSenseAd } from './components/AdSenseAd';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [anonymousAuthAvailable, setAnonymousAuthAvailable] = useState(true);
  
  // Applicant State
  const [applicantName, setApplicantName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [userApiKey, setUserApiKey] = useState<string | undefined>(undefined);
  
  // Interview/Report State
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Initialize Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      setAuthLoading(false);
      
      if (authUser) {
        console.log('✅ User authenticated:', authUser.uid, authUser.isAnonymous ? '(Anonymous)' : '(Google)');
        
        // Try to load existing profile
        try {
          const profile = await getUserProfile();
          if (profile) {
            // Load saved profile data
            if (profile.name) setApplicantName(profile.name);
            if (profile.resumeText) setResumeText(profile.resumeText);
            if (profile.apiKey) setUserApiKey(profile.apiKey);
            console.log('✅ Profile loaded from Firestore');
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      } else {
        // No user, try to sign in anonymously
        try {
          await signInAsGuest();
        } catch (error: any) {
          console.error('Failed to sign in anonymously:', error);
          // If anonymous auth is not enabled, app can still work
          // User will need to sign in with Google instead
          if (error.message?.includes('admin-restricted-operation') || error.message?.includes('not enabled')) {
            console.warn('⚠️ Anonymous authentication is not enabled in Firebase Console. Please enable it or sign in with Google.');
            setAnonymousAuthAvailable(false);
          }
        }
      }
    });


    return unsubscribe;
  }, []);

  // Handlers
  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setView('JOB_DETAILS');
  };

  const handleStartApplication = () => {
    setView('INTERVIEW_SETUP');
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          setResumeText(content);
        };
        reader.readAsText(file);
      } else {
        alert('Please upload a .txt file');
      }
    }
  };

  const startInterview = async () => {
    if (!applicantName || !resumeText) {
      alert("Please enter your name and upload a resume/text.");
      return;
    }
    
    // Save profile to Firestore before starting interview
    if (user) {
      try {
        await saveUserProfile({
          name: applicantName,
          resumeText: resumeText,
          apiKey: userApiKey,
          settings: {}
        });
        console.log('✅ Profile saved to Firestore');
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
    
    setView('INTERVIEW_SESSION');
  };
  
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      // Reset view to HOME - auth state change listener will handle profile loading
      setView('HOME');
    } catch (error: any) {
      alert(`Failed to sign in with Google: ${error.message}`);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      // Reset view and state - auth state change listener will handle anonymous sign-in
      setView('HOME');
      setApplicantName('');
      setResumeText('');
      setUserApiKey(undefined);
    } catch (error: any) {
      alert(`Failed to sign out: ${error.message}`);
    }
  };
  
  const handleProfileUpdate = (name: string, resume: string, apiKey?: string) => {
    setApplicantName(name);
    setResumeText(resume);
    setUserApiKey(apiKey);
  };

  const handleEndInterview = async (transcript: string, apiKeyUsed?: string) => {
    setView('HOME'); // Temporary reset UI while loading
    setIsGeneratingReport(true);
    
    // Generate Report
    if (selectedJob) {
      const result = await generateEvaluationReport(transcript, selectedJob.title, applicantName, apiKeyUsed);
      setEvaluation(result);
      
      // Save interview history (keep only 3 most recent)
      if (user) {
        try {
          const currentProfile = await getUserProfile();
          const existingHistory = currentProfile?.interviewHistory || [];
          
          // Create new history item
          const newHistoryItem: InterviewHistoryItem = {
            id: Date.now().toString(),
            jobTitle: selectedJob.title,
            jobId: selectedJob.id,
            transcript: transcript,
            evaluation: result,
            timestamp: Timestamp.now(),
          };
          
          // Add new item and keep only the 3 most recent
          const updatedHistory = [newHistoryItem, ...existingHistory].slice(0, 3);
          
          await saveUserProfile({
            interviewHistory: updatedHistory,
          });
        } catch (error) {
          console.error('Error saving interview history:', error);
          // Don't block the user from seeing the report if history save fails
        }
      }
      
      setIsGeneratingReport(false);
      setView('REPORT');
    }
  };

  const handlePostJob = (job: Job) => {
    setJobs([job, ...jobs]);
    setView('HOME');
  };

  // --- Views ---

  // 1. Home / Job Board
  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Interview for your next role</h1>
          <p className="text-slate-500 mt-2">Job postings with AI-assisted interviewing</p>
        </div>
        <button 
          onClick={() => setView('EMPLOYER_DASHBOARD')}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          Post a Job         </button>
      </div>

      {/* Top Ad Banner */}
      <div className="mb-6">
        <AdSenseAd 
          format="auto"
          className="w-full"
          showPlaceholder={false}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} onSelect={handleJobSelect} />
        ))}
      </div>

      {/* Bottom Ad Banner */}
      <div className="mt-6">
        <AdSenseAd 
          format="auto"
          className="w-full"
          showPlaceholder={false}
        />
      </div>
    </div>
  );

  // 2. Job Details
  const renderJobDetails = () => (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => setView('HOME')} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6">
        <ArrowLeft size={18} /> Back to jobs
      </button>
      
      {selectedJob && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <div className="border-b pb-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedJob.title}</h1>
            <div className="text-lg text-slate-600 flex items-center gap-2">
              <Briefcase size={20} /> {selectedJob.company} • {selectedJob.location}
            </div>
            <div className="mt-4 inline-block bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium border border-primary-100">
              {selectedJob.type}
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
            <p className="text-slate-600 leading-relaxed mb-6">{selectedJob.description}</p>
            
            <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements</h3>
            <ul className="space-y-2 mb-8">
              {selectedJob.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2.5"></div>
                  <span className="text-slate-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mt-8">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-600" /> AI Screening Process
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              To apply, you will undergo a 5-10 minute video screening interview with our AI recruiter. 
              Please be prepared to discuss your experience and answer technical questions.
            </p>
            <button 
              onClick={handleStartApplication}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              Start Application
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 3. Setup (Upload Resume)
  const renderSetup = () => (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
          <UserCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Profile</h2>
        <p className="text-slate-500 mb-8">Before we connect you with the AI interviewer, we need your details.</p>
        {user?.isAnonymous && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Guest Mode:</strong> Sign in with Google to save your profile across devices.
            </p>
          </div>
        )}

        <div className="space-y-6 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Jane Doe"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Upload Resume</label>
              <label className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleResumeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  Upload .txt file
                </button>
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Upload a text file or paste your resume content. This helps the AI interviewer understand your background.
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here, or click 'Upload .txt file' button above..."
              rows={12}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-y"
            />
            {resumeText && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                {resumeText.length} characters loaded
              </p>
            )}
          </div>

          <button 
            onClick={startInterview}
            disabled={!applicantName || !resumeText}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              applicantName && resumeText 
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Play size={18} /> Enter Interview Room
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xl cursor-pointer" onClick={() => setView('HOME')}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            Open Interview
          </div>
          <div className="flex items-center gap-4">
            {view === 'HOME' && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                <a href="#" className="hover:text-primary-600">Jobs</a>
                <a href="#" className="hover:text-primary-600">Companies</a>
                <a href="#" className="hover:text-primary-600">Pricing</a>
              </div>
            )}
            {!authLoading && (
              <div className="flex items-center gap-2">
                {user ? (
                  <>
                    <button
                      onClick={() => setView('USER_PROFILE')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm transition-colors"
                    >
                      <UserCircle size={16} className={user.isAnonymous ? 'text-slate-500' : 'text-green-600'} />
                      <span className="text-slate-700">
                        {user.isAnonymous ? 'Guest' : user.email?.split('@')[0] || 'User'}
                      </span>
                    </button>
                    {user.isAnonymous ? (
                      <button
                        onClick={handleSignInWithGoogle}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <LogIn size={16} />
                        Sign in
                      </button>
                    ) : (
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    )}
                  </>
                ) : !anonymousAuthAvailable ? (
                  <button
                    onClick={handleSignInWithGoogle}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <LogIn size={16} />
                    Sign in with Google
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {authLoading ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
            <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Initializing...</h2>
            <p className="text-slate-500 mt-2 max-w-md">Setting up your session...</p>
          </div>
        ) : isGeneratingReport ? (
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
            <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Analyzing Interview...</h2>
            <p className="text-slate-500 mt-2 max-w-md">Our AI is processing the audio transcript, evaluating your answers against the job requirements, and generating a detailed report.</p>
          </div>
        ) : (
          <>
            {view === 'HOME' && renderHome()}
            {view === 'JOB_DETAILS' && renderJobDetails()}
            {view === 'INTERVIEW_SETUP' && renderSetup()}
            {view === 'INTERVIEW_SESSION' && selectedJob && (
              <div className="h-[calc(100vh-64px)] p-4">
                <InterviewSession 
                  job={selectedJob} 
                  applicant={{ name: applicantName, resumeText }} 
                  onEndInterview={handleEndInterview} 
                />
              </div>
            )}
            {view === 'REPORT' && evaluation && (
              <EvaluationReport data={evaluation} onRestart={() => setView('HOME')} />
            )}
            {view === 'EMPLOYER_DASHBOARD' && (
              <div className="py-12 px-4">
                 <EmployerDashboard onPostJob={handlePostJob} onCancel={() => setView('HOME')} />
              </div>
            )}
            {view === 'USER_PROFILE' && (
              <div className="py-12 px-4">
                <UserProfilePage 
                  onBack={() => setView('HOME')} 
                  onProfileUpdate={handleProfileUpdate}
                  onJobSelect={(job) => {
                    setSelectedJob(job);
                    setView('JOB_DETAILS');
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>
      
      {/* Google AdSense Footer Ad */}
      <footer className="w-full bg-slate-50 border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <AdSenseAd 
            format="auto"
            className="max-w-full"
            showPlaceholder={false}
          />
        </div>
      </footer>
    </div>
  );
}