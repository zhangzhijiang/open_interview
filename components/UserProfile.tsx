import React, { useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile, UserProfile, InterviewHistoryItem } from '../services/userProfileService';
import { getCurrentUser } from '../services/authService';
import { Job } from '../types';
import { JobCard } from './JobCard';
import { EmployerDashboard } from './EmployerDashboard';
import { UserCircle, Upload, Save, KeyRound, FileText, ArrowLeft, AlertCircle, CheckCircle, Briefcase, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface UserProfileProps {
  onBack: () => void;
  onProfileUpdate?: (name: string, resumeText: string, apiKey?: string) => void;
  onJobSelect?: (job: Job) => void;
}

export const UserProfilePage: React.FC<UserProfileProps> = ({ onBack, onProfileUpdate, onJobSelect }) => {
  const [name, setName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setName(profile.name || '');
          setResumeText(profile.resumeText || '');
          setApiKey(profile.apiKey || '');
          setSavedJobs(profile.savedJobs || []);
          setInterviewHistory(profile.interviewHistory || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePostJob = async (job: Job) => {
    if (savedJobs.length >= 3) {
      alert('You can only save up to 3 jobs. Please remove one before adding a new one.');
      return;
    }
    const updatedJobs = [...savedJobs, job];
    setSavedJobs(updatedJobs);
    setShowJobForm(false);
    
    // Auto-save when a job is added
    if (getCurrentUser()) {
      try {
        await saveUserProfile({
          savedJobs: updatedJobs,
        });
      } catch (error) {
        console.error('Error saving jobs:', error);
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const updatedJobs = savedJobs.filter(job => job.id !== jobId);
    setSavedJobs(updatedJobs);
    
    // Auto-save when a job is removed
    if (getCurrentUser()) {
      try {
        await saveUserProfile({
          savedJobs: updatedJobs,
        });
      } catch (error) {
        console.error('Error saving jobs:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage('Name is required');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    if (!getCurrentUser()) {
      setErrorMessage('You must be logged in to save your profile');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSaveStatus('idle');

    try {
      const profileData: Partial<UserProfile> = {
        name: name.trim(),
        resumeText: resumeText.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        savedJobs: savedJobs,
      };

      await saveUserProfile(profileData);
      
      setSaveStatus('success');
      if (onProfileUpdate) {
        onProfileUpdate(name.trim(), resumeText.trim(), apiKey.trim() || undefined);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setErrorMessage(error.message || 'Failed to save profile');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack} 
        className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <UserCircle size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
            <p className="text-slate-500 text-sm">Manage your interview settings and preferences</p>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-green-700 font-medium">Profile saved successfully!</p>
          </div>
        )}

        {saveStatus === 'error' && errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600" />
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">
              This name will be used during interviews and in evaluation reports.
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* API Key Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gemini API Key (Optional)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Bring Your Own Key (BYOK): Use your own Gemini API key for interviews. 
              If not provided, the default system key will be used.
            </p>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Your API key is stored securely and only used for your interviews.
            </p>
          </div>

          {/* Resume Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                My Resume 
              </label>
              <label className="relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
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

          {/* My Saved Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                My Saved Jobs
              </label>
              <button
                type="button"
                onClick={() => setShowJobForm(true)}
                disabled={savedJobs.length >= 3}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                  savedJobs.length >= 3
                    ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                <Briefcase size={16} />
                Add Job {savedJobs.length > 0 && `(${savedJobs.length}/3)`}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Save up to 3 jobs you're interested in. These jobs will be available for you to practice interviews.
            </p>
            
            {savedJobs.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Briefcase size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 text-sm">No saved jobs yet</p>
                <p className="text-slate-400 text-xs mt-1">Click "Add Job" to save a job you're interested in</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedJobs.map((job) => (
                  <div key={job.id} className="relative">
                    <JobCard 
                      job={job} 
                      onSelect={(selectedJob) => {
                        if (onJobSelect) {
                          onJobSelect(selectedJob);
                        }
                      }} 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the card click
                        handleDeleteJob(job.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors z-10"
                      title="Delete job"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview History Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-slate-700">
                Interview History
              </label>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Your last 3 interview sessions with transcripts and evaluation reports.
            </p>
            
            {interviewHistory.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Clock size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-500 text-sm">No interview history yet</p>
                <p className="text-slate-400 text-xs mt-1">Complete an interview to see your history here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviewHistory.map((item) => {
                  const isExpanded = expandedHistoryId === item.id;
                  const date = item.timestamp?.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
                  const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div 
                        className="bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{item.jobTitle}</h4>
                            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formattedDate}
                              </span>
                              <span className="flex items-center gap-1">
                                Score: <span className="font-semibold text-primary-600">{item.evaluation.score}/100</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.evaluation.hiringRecommendation === 'Strong Hire' 
                                  ? 'bg-green-100 text-green-700'
                                  : item.evaluation.hiringRecommendation === 'Hire'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {item.evaluation.hiringRecommendation}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp size={20} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={20} className="text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-slate-200 space-y-4">
                          {/* Evaluation Report */}
                          <div>
                            <h5 className="font-semibold text-slate-700 mb-2 text-sm">Evaluation Report</h5>
                            <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
                              <div>
                                <p className="font-medium text-slate-700 mb-1">Summary</p>
                                <p className="text-slate-600">{item.evaluation.summary}</p>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">Strengths</p>
                                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                                    {item.evaluation.strengths.map((strength, idx) => (
                                      <li key={idx}>{strength}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="font-medium text-slate-700 mb-1">Weaknesses</p>
                                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                                    {item.evaluation.weaknesses.map((weakness, idx) => (
                                      <li key={idx}>{weakness}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium text-slate-700 mb-1">Technical Assessment</p>
                                <p className="text-slate-600">{item.evaluation.technicalAssessment}</p>
                              </div>
                              
                              <div>
                                <p className="font-medium text-slate-700 mb-1">Communication Skills</p>
                                <p className="text-slate-600">{item.evaluation.communicationSkills}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Transcript */}
                          <div>
                            <h5 className="font-semibold text-slate-700 mb-2 text-sm">Interview Transcript</h5>
                            <textarea
                              value={item.transcript}
                              readOnly
                              rows={10}
                              className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50 font-mono text-xs resize-y text-slate-700"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={onBack}
              className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                saving || !name.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Saved Job</h2>
              <button
                onClick={() => setShowJobForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <EmployerDashboard 
                onPostJob={handlePostJob} 
                onCancel={() => setShowJobForm(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

