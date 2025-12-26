import React from 'react';
import { X, KeyRound, ExternalLink, Copy } from 'lucide-react';

interface ApiKeyInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyInstructionsModal: React.FC<ApiKeyInstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <KeyRound size={20} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">How to Get Your Gemini API Key</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Why use your own API key?</strong> Using your own Gemini API key gives you longer interview sessions (15 minutes vs 5 minutes) and ensures you have full control over your API usage.
            </p>
          </div>

          {/* Step-by-step instructions */}
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Go to Google AI Studio</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Visit Google AI Studio to access the Gemini API.
                </p>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <ExternalLink size={16} />
                  Open Google AI Studio
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink('https://makersuite.google.com/app/apikey');
                    }}
                    className="text-blue-400 hover:text-blue-600"
                    title="Copy link"
                  >
                    <Copy size={14} />
                  </button>
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Sign in with Google</h3>
                <p className="text-slate-600 text-sm">
                  Sign in with your Google account. If you don't have one, you'll need to create a Google account first.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Create an API Key</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Click on "Create API Key" button. You may be prompted to:
                </p>
                <ul className="list-disc list-inside text-slate-600 text-sm space-y-1 ml-4">
                  <li>Create a new Google Cloud project (or select an existing one)</li>
                  <li>Accept terms of service</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Copy Your API Key</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Your API key will be displayed (it starts with "AIza..."). Click the copy button or select and copy the key.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-700">
                  AIzaSy... (your key will look like this)
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Paste the Key Here</h3>
                <p className="text-slate-600 text-sm">
                  Paste your copied API key into the input field on this page. The key will be stored securely and used only for your interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-yellow-900 text-sm">Important Notes:</h4>
            <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1 ml-2">
              <li>Keep your API key secure and don't share it with others</li>
              <li>API keys have usage quotas and may incur charges based on Google's pricing</li>
              <li>You can manage and revoke your API key anytime from Google AI Studio</li>
              <li>If using in profile settings, the key is saved for future interviews</li>
              <li>If using during interview setup, the key is only used for that session</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

