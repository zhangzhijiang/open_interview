import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Job, ApplicantData } from '../types';
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { createBlob, decodeAudioData } from '../services/geminiService';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Bot, Loader2, AlertCircle, Play, KeyRound, X, Clock } from 'lucide-react';

interface InterviewSessionProps {
  job: Job;
  applicant: ApplicantData;
  onEndInterview: (transcript: string, apiKeyUsed?: string) => void;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ job, applicant, onEndInterview }) => {
  // State for connection logic
  const [hasStarted, setHasStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Audio/Video State
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  
  // API Key State
  const [defaultApiKey] = useState(process.env.GEMINI_API_KEY || "");
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [usingCustomKey, setUsingCustomKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get the active API key
  const apiKey = usingCustomKey ? customApiKey : defaultApiKey;
  
  // Session time limits (in milliseconds)
  const APP_KEY_LIMIT = 5 * 60 * 1000; // 5 minutes
  const CUSTOM_KEY_LIMIT = 15 * 60 * 1000; // 15 minutes

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const transcriptRef = useRef<string>("");
  const currentInputTransRef = useRef<string>("");
  const currentOutputTransRef = useRef<string>("");

  const sessionRef = useRef<Promise<any> | null>(null); 
  const disconnectCallbackRef = useRef<(() => void) | null>(null);

  const [displayTranscript, setDisplayTranscript] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (disconnectCallbackRef.current) {
      disconnectCallbackRef.current();
      disconnectCallbackRef.current = null;
    }
    
    if (sessionRef.current) {
      const currentSessionPromise = sessionRef.current;
      sessionRef.current = null;
      try {
        const session = await currentSessionPromise;
        session.close();
      } catch (e) {
        console.warn("Error closing session:", e);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }
    
    setIsConnected(false);
  }, []);

  // Timer effect - only runs when actually connected
  useEffect(() => {
    // Only start timer if we're connected AND have a start time
    if (isConnected && sessionStartTime && timeRemaining !== null) {
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - sessionStartTime;
        const limit = usingCustomKey ? CUSTOM_KEY_LIMIT : APP_KEY_LIMIT;
        const remaining = Math.max(0, limit - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          // Time limit reached, end the session
          handleEndCall();
        }
      }, 100); // Update every 100ms for smooth countdown
    } else {
      // Clear timer if not connected
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isConnected, sessionStartTime, timeRemaining, usingCustomKey]);

  // Format time for display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUseCustomKey = () => {
    setShowApiKeyModal(true);
  };

  const handleSubmitCustomKey = () => {
    if (!apiKeyInput.trim()) {
      setError("Please enter a valid API key.");
      return;
    }
    setCustomApiKey(apiKeyInput.trim());
    setUsingCustomKey(true);
    setShowApiKeyModal(false);
    setApiKeyInput('');
  };

  const handleUseDefaultKey = () => {
    setUsingCustomKey(false);
    setCustomApiKey('');
  };

  const handleStartSession = async () => {
    console.log('[InterviewSession] Starting session...');
    console.log('[InterviewSession] API Key present:', !!apiKey, 'Using custom key:', usingCustomKey);
    
    if (!apiKey) {
      console.error('[InterviewSession] ERROR: API Key is missing');
      setError("API Key is missing.");
      return;
    }

    setError(null);
    setHasStarted(true);
    // Don't start timer yet - wait for successful connection
    setSessionStartTime(null);
    setTimeRemaining(null);

    let isMounted = true;
    let connectionTimeout: NodeJS.Timeout;

    try {
      console.log('[InterviewSession] Step 1: Setting up Audio Contexts...');
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      console.log('[InterviewSession] Audio Contexts created:', {
        inputState: inputCtx.state,
        outputState: outputCtx.state
      });
      
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      // Ensure they are running (browser autoplay policy)
      if (inputCtx.state === 'suspended') {
        console.log('[InterviewSession] Resuming input audio context...');
        await inputCtx.resume();
      }
      if (outputCtx.state === 'suspended') {
        console.log('[InterviewSession] Resuming output audio context...');
        await outputCtx.resume();
      }
      
      console.log('[InterviewSession] Audio Contexts ready:', {
        inputState: inputCtx.state,
        outputState: outputCtx.state
      });

      console.log('[InterviewSession] Step 2: Requesting media stream...');
      // 2. Get Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('[InterviewSession] Media stream obtained:', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
        audioTrackEnabled: stream.getAudioTracks()[0]?.enabled,
        videoTrackEnabled: stream.getVideoTracks()[0]?.enabled
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('[InterviewSession] Video element playing');
      }

      console.log('[InterviewSession] Step 3: Initializing GoogleGenAI...');
      // 3. Connect to Live API
      const ai = new GoogleGenAI({ apiKey: apiKey });
      console.log('[InterviewSession] GoogleGenAI instance created');
      
      console.log('[InterviewSession] Step 4: Connecting to Live API...');
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: SYSTEM_INSTRUCTION_TEMPLATE(job, applicant.name, applicant.resumeText),
          // Transcription configs should be empty objects to enable them. 
          // Do not pass the model name here.
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            console.log('[InterviewSession] ✅ Connection opened successfully!');
            if (!isMounted) {
              console.warn('[InterviewSession] Connection opened but component unmounted');
              return;
            }
            setIsConnected(true);
            clearTimeout(connectionTimeout);
            
            // Start the timer now that connection is established
            const startTime = Date.now();
            setSessionStartTime(startTime);
            setTimeRemaining(usingCustomKey ? CUSTOM_KEY_LIMIT : APP_KEY_LIMIT);
            console.log('[InterviewSession] Timer started -', usingCustomKey ? '15 min limit (custom key)' : '5 min limit (app key)');
            
            console.log('[InterviewSession] Setting up audio/video processing...');

            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (!isMounted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            // Video Frames
            const intervalId = setInterval(async () => {
               if (!isMounted || !videoRef.current || !canvasRef.current) return;
               
               const ctx = canvasRef.current.getContext('2d');
               if (!ctx) return;

               canvasRef.current.width = videoRef.current.videoWidth * 0.25; 
               canvasRef.current.height = videoRef.current.videoHeight * 0.25;
               ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
               
               const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
               sessionPromise.then(session => session.sendRealtimeInput({ 
                 media: { mimeType: 'image/jpeg', data: base64Data } 
               }));
            }, 1000); 

            disconnectCallbackRef.current = () => {
              clearInterval(intervalId);
              source.disconnect();
              processor.disconnect();
            };
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (!isMounted) return;

            // Log message type for debugging
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              console.log('[InterviewSession] Received audio response');
            }
            if (msg.serverContent?.interrupted) {
              console.log('[InterviewSession] Received interruption signal');
            }
            if (msg.serverContent?.turnComplete) {
              console.log('[InterviewSession] Turn completed');
            }

            // Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }

            // Interruptions
            if (msg.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcript
            if (msg.serverContent?.outputTranscription) {
              currentOutputTransRef.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.inputTranscription) {
              currentInputTransRef.current += msg.serverContent.inputTranscription.text;
            }
            if (msg.serverContent?.turnComplete) {
              const userText = currentInputTransRef.current.trim();
              const aiText = currentOutputTransRef.current.trim();
              if (userText) {
                transcriptRef.current += `Candidate: ${userText}\n`;
                setDisplayTranscript(prev => [...prev, { role: 'user', text: userText }]);
              }
              if (aiText) {
                transcriptRef.current += `Interviewer (AI): ${aiText}\n`;
                setDisplayTranscript(prev => [...prev, { role: 'ai', text: aiText }]);
              }
              currentInputTransRef.current = "";
              currentOutputTransRef.current = "";
            }
          },
          onclose: () => {
            console.log('[InterviewSession] ⚠️ Connection closed');
            if (isMounted) {
              // Stop timer when connection closes
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
              setSessionStartTime(null);
              setTimeRemaining(null);
              setIsConnected(false);
            }
          },
          onerror: (err) => {
            console.error('[InterviewSession] ❌ Session Error:', err);
            console.error('[InterviewSession] Error details:', {
              message: err instanceof Error ? err.message : String(err),
              stack: err instanceof Error ? err.stack : undefined,
              fullError: err
            });
            if (isMounted) {
               clearTimeout(connectionTimeout);
               // Clear timer if connection fails
               if (timerIntervalRef.current) {
                 clearInterval(timerIntervalRef.current);
                 timerIntervalRef.current = null;
               }
               setSessionStartTime(null);
               setTimeRemaining(null);
               setIsConnected(false);
               const errorMessage = err instanceof Error ? err.message : "Connection failed. The API rejected the request.";
               setError(`Connection failed: ${errorMessage}`);
               setHasStarted(false);
            }
          }
        }
      });
      
      sessionRef.current = sessionPromise;
      console.log('[InterviewSession] Session promise created, waiting for connection...');

      connectionTimeout = setTimeout(() => {
        if (isMounted && !isConnected) {
          console.error('[InterviewSession] ⏱️ Connection timeout (15s) - connection not established');
          // Clear timer state if timeout occurs
          setSessionStartTime(null);
          setTimeRemaining(null);
          setError("Connection timed out after 15 seconds. Please check your API key and network connection.");
          setHasStarted(false);
          cleanup();
        }
      }, 15000);
      console.log('[InterviewSession] Connection timeout timer set (15 seconds)');

    } catch (e: any) {
      console.error('[InterviewSession] ❌ Exception during session setup:', e);
      console.error('[InterviewSession] Exception details:', {
        name: e?.name,
        message: e?.message,
        stack: e?.stack,
        fullError: e
      });
      if (isMounted) {
        const errorMsg = e?.message || "Failed to initialize. Please check the browser console for details.";
        setError(errorMsg);
        setHasStarted(false);
      }
      cleanup();
    }
  };

  const handleEndCall = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeRemaining(null);
    setSessionStartTime(null);
    cleanup();
    onEndInterview(transcriptRef.current, apiKey);
  };

  // Mute Toggles
  useEffect(() => {
    if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(t => t.enabled = micOn);
    }
  }, [micOn]);

  // Pre-Start Screen
  if (!hasStarted) {
    return (
      <>
        <div className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl items-center justify-center p-8 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
          </div>
          
          <div className="relative z-10 max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Ready for your interview?</h2>
            <p className="text-slate-400">Position: <span className="text-white font-medium">{job.title}</span></p>
          </div>

          {/* API Key Status */}
          {!apiKey && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-200 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} /> <span className="font-semibold">API Key Missing</span>
              </div>
              <p className="text-xs text-yellow-300/80">
                Please create a <code className="bg-slate-800/50 px-1 rounded">.env.local</code> file in the project root with:<br/>
                <code className="bg-slate-800/50 px-1 rounded">GEMINI_API_KEY=your_api_key_here</code>
              </p>
            </div>
          )}
          {apiKey && (
            <div className="space-y-3">
              <div className="opacity-50 hover:opacity-100 transition-opacity">
                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 backdrop-blur-sm flex items-center gap-2">
                  <KeyRound size={14} className={usingCustomKey ? 'text-blue-400' : 'text-green-500'} />
                  <input 
                    type="password" 
                    className="bg-transparent border-none text-xs w-full focus:ring-0"
                    value={usingCustomKey ? "✓ Using Your API Key" : "✓ Using App API Key"}
                    disabled
                    title={usingCustomKey ? "Using Your Custom API Key" : "Using App Default API Key"}
                    style={{ color: usingCustomKey ? '#60a5fa' : '#10b981' }}
                  />
                </div>
              </div>
              {!usingCustomKey && (
                <button
                  onClick={handleUseCustomKey}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound size={14} />
                  Use My Own API Key
                </button>
              )}
              {usingCustomKey && (
                <button
                  onClick={handleUseDefaultKey}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-all"
                >
                  Use App API Key Instead
                </button>
              )}
            </div>
          )}

          {error && (
             <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm flex items-center gap-2">
               <AlertCircle size={16} /> {error}
             </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleStartSession}
              disabled={!apiKey}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                apiKey 
                ? 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] text-white' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play fill="currentColor" size={20} />
              Start Interview {usingCustomKey ? '(15 min max)' : '(5 min max)'}
            </button>
            <button onClick={() => onEndInterview("")} className="text-slate-500 hover:text-slate-300 text-sm">Cancel</button>
          </div>
        </div>
      </div>
      
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <KeyRound size={20} className="text-blue-400" />
                Use Your Own API Key
              </h3>
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  setApiKeyInput('');
                  setError(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300 leading-relaxed">
                  <strong className="font-semibold">Important:</strong> Your API key will only be used for this interview session and will <strong>not be saved</strong> to your profile.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gemini API Key
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIza..."
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitCustomKey();
                      }
                    }}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Session limit: <strong className="text-white">15 minutes</strong> (vs 5 minutes with app key)
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 p-2.5 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setApiKeyInput('');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCustomKey}
                  disabled={!apiKeyInput.trim()}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    apiKeyInput.trim()
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Use This Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  // Active Session UI
  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="font-semibold text-sm tracking-wide">
            {isConnected ? 'LIVE INTERVIEW' : 'CONNECTING...'}
          </span>
          {timeRemaining !== null && timeRemaining > 0 && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-700 rounded-lg">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs font-mono font-medium text-white">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        <div className="text-slate-400 text-sm font-medium truncate max-w-[200px]">{job.title}</div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Video Feed */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video 
            ref={videoRef} 
            muted 
            playsInline 
            className={`w-full h-full object-cover ${cameraOn ? 'opacity-100' : 'opacity-0'}`} 
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2">
              <VideoOff size={48} />
              <span className="text-sm">Camera Off</span>
            </div>
          )}
          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* AI Avatar Overlay */}
          <div className="absolute bottom-6 right-6 w-32 h-40 bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-600 flex flex-col items-center justify-center gap-2 overflow-hidden z-10 transition-transform hover:scale-105">
             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-inner">
               <Bot size={24} className="text-white" />
             </div>
             <span className="text-xs text-slate-300 font-medium">AI Recruiter</span>
             {isConnected ? (
               <div className="flex gap-1 items-center h-4">
                 <div className="w-1 h-3 bg-blue-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                 <div className="w-1 h-3 bg-blue-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                 <div className="w-1 h-3 bg-blue-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
               </div>
             ) : (
                <Loader2 size={16} className="text-slate-400 animate-spin" />
             )}
          </div>
        </div>

        {/* Live Transcript */}
        <div className="hidden md:flex w-80 bg-slate-900 border-l border-slate-700 flex-col">
          <div className="p-3 bg-slate-800 border-b border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-400 flex justify-between items-center">
            <span>Live Transcript</span>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Recording"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scroll-smooth">
             {displayTranscript.length === 0 && (
               <div className="text-slate-500 text-center mt-10 italic px-4">
                 Say "Hello" to start the conversation...
               </div>
             )}
             {displayTranscript.map((msg, idx) => (
               <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                 <span className={`text-[10px] mb-1 uppercase ${msg.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                   {msg.role === 'user' ? 'You' : 'AI Recruiter'}
                 </span>
                 <div className={`p-2.5 rounded-lg max-w-[90%] text-xs leading-relaxed ${
                   msg.role === 'user' ? 'bg-blue-900/40 text-blue-100 rounded-tr-none border border-blue-800/50' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                 }`}>
                   {msg.text}
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-6 flex justify-center items-center gap-6 border-t border-slate-700">
        <button 
          onClick={() => setMicOn(!micOn)}
          className={`p-4 rounded-full transition-all duration-200 ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
        >
          {micOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button 
          onClick={handleEndCall}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group"
        >
          <PhoneOff size={24} className="group-hover:animate-pulse" />
          End Interview
        </button>

        <button 
          onClick={() => setCameraOn(!cameraOn)}
          className={`p-4 rounded-full transition-all duration-200 ${cameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-lg' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
        >
          {cameraOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>
    </div>
  );
};

// Utils for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}