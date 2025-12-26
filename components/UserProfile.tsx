import React, { useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile, UserProfile } from '../services/userProfileService';
import { getCurrentUser } from '../services/authService';
import { UserCircle, Upload, Save, KeyRound, FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface UserProfileProps {
  onBack: () => void;
  onProfileUpdate?: (name: string, resumeText: string, apiKey?: string) => void;
}

export const UserProfilePage: React.FC<UserProfileProps> = ({ onBack, onProfileUpdate }) => {
  const [name, setName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setName(profile.name || '');
          setResumeText(profile.resumeText || '');
          setApiKey(profile.apiKey || '');
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

          {/* Resume Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Resume / CV
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Upload a text file or paste your resume content. This helps the AI interviewer understand your background.
            </p>
            
            {/* Upload Option */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Upload Resume (TXT file)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Upload size={24} />
                  <span className="text-sm">Click to upload .txt file</span>
                  <span className="text-xs text-slate-400">or paste content below</span>
                </div>
              </div>
            </div>

            {/* Textarea Option */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Or Paste Resume Content
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here, or upload a .txt file above..."
                rows={12}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-y"
              />
              {resumeText && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  {resumeText.length} characters loaded
                </p>
              )}
            </div>
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
    </div>
  );
};

