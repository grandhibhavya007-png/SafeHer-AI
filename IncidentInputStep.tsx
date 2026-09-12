import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, PhoneCall, AlertCircle, Play, Square, Sparkles, Phone, Clock, FileText, CheckCircle2, RotateCcw } from 'lucide-react';
import { CallDetails, InputType } from '../../types';

interface IncidentInputStepProps {
  inputType: InputType;
  setInputType: (type: InputType) => void;
  rawInput: string;
  setRawInput: (val: string) => void;
  callDetails: CallDetails;
  setCallDetails: (details: CallDetails) => void;
  audioDurationSec: number;
  setAudioDurationSec: (dur: number) => void;
  onProceedToAI: () => void;
}

export const IncidentInputStep: React.FC<IncidentInputStepProps> = ({
  inputType,
  setInputType,
  rawInput,
  setRawInput,
  callDetails,
  setCallDetails,
  audioDurationSec,
  setAudioDurationSec,
  onProceedToAI,
}) => {
    

  // Voice Recording simulator states
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setRawInput(transcript);
        }
      };

      recognitionRef.current = recog;
    }
  }, [setRawInput]);

  // Voice timer effect
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setAudioDurationSec(recordTimer);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (!rawInput.trim()) {
        setRawInput(
          'I was walking near the metro station exit around 8:30 PM when a suspicious individual on a black bike started following me and shouting intimidating remarks. I felt unsafe and hurried inside a nearby store.'
        );
      }
    } else {
      setIsRecording(true);
      setRecordTimer(0);
      setRawInput('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition start failed, using fallback transcript');
        }
      }
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setRawInput(presetText);
  };

  const handlePhoneFieldChange = (field: keyof CallDetails, val: string) => {
    const updated = { ...callDetails, [field]: val };
    setCallDetails(updated);
    setRawInput(
      `Threatening incoming phone call from ${updated.callerNumber || 'Unknown Number'}. Call Duration: ${
        updated.callDuration || 'N/A'
      }. Nature of Threat: ${updated.threatType}. Voice/threat notes: ${updated.suspiciousVoiceDetails || 'None recorded'}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Step 1: Provide Incident Information</h2>
          <p className="text-xs text-gray-400">Select your preferred input format to report the threat</p>
        </div>

        <span className="text-[11px] font-mono px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full self-start sm:self-auto">
          AI Auto-Ingestion
        </span>
      </div>

      {/* 3 Input Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#09090B] rounded-2xl border border-white/5">
        <button
          type="button"
          onClick={() => setInputType('text')}
          className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            inputType === 'text'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1C1C24]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Text Message</span>
        </button>

        <button
          type="button"
          onClick={() => setInputType('voice')}
          className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            inputType === 'voice'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1C1C24]'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice Audio</span>
        </button>

        <button
          type="button"
          onClick={() => setInputType('phone_call')}
          className={`py-3 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            inputType === 'phone_call'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1C1C24]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Phone Call Log</span>
        </button>
      </div>

      {/* 1. TEXT INPUT FORM */}
      {inputType === 'text' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">
              Describe what happened in your own words:
            </label>
            <textarea
              id="incident-text-input"
              rows={5}
              required
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. A man was aggressively following me on 5th Avenue and making threatening remarks. He was wearing a grey hoodie and continued following for 3 blocks..."
              className="w-full p-4 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
            />
          </div>

          {/* Quick presets for swift demo */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-gray-400">Quick Test Scenarios (Click to populate):</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'I am being stalked by a coworker outside my office building. He has sent 15 threatening text messages today demanding to meet me alone, and is currently waiting in the parking lot.'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 border border-white/5 transition cursor-pointer"
              >
                🚨 Workplace Stalking
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'While riding the subway on Line 2 around 9 PM, a group of three men blocked the train doors, started catcalling, and tried to snatch my handbag when I attempted to exit.'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 border border-white/5 transition cursor-pointer"
              >
                🚇 Public Transit Assault
              </button>

              <button
                type="button"
                onClick={() =>
                  handleApplyPreset(
                    'An anonymous caller has been blackmailing me over Instagram and WhatsApp, threatening to leak edited private photographs unless I transfer money to a crypto account.'
                  )
                }
                className="text-[11px] px-3 py-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 border border-white/5 transition cursor-pointer"
              >
                💻 Cyber Extortion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. VOICE INPUT FORM */}
      {inputType === 'voice' && (
        <div className="space-y-5">
          <div className="p-6 bg-[#1C1C24] border border-white/5 rounded-2xl text-center space-y-4">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105'
                }`}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-white">
                {isRecording ? 'Listening & Transcribing Voice Memo...' : 'Tap Microphone to Record Incident'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isRecording
                  ? `Recording: ${recordTimer}s • Speak clearly about what happened`
                  : 'Hands-free voice recording with live NLP transcript analysis'}
              </p>
            </div>

            {isRecording && (
              <div className="flex items-center justify-center space-x-1.5 py-2">
                <span className="w-2 h-6 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-10 bg-indigo-400 rounded animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-8 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-2 h-12 bg-indigo-300 rounded animate-bounce" style={{ animationDelay: '450ms' }} />
                <span className="w-2 h-7 bg-indigo-500 rounded animate-bounce" style={{ animationDelay: '200ms' }} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300">Live Speech Transcript:</label>
              <span className="text-[10px] text-gray-500 font-mono">
                {recognitionSupported ? 'Speech Recognition Online' : 'Fallback Transcriber Active'}
              </span>
            </div>
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Voice transcript will appear here. You can also edit it manually before submitting."
              className="w-full p-4 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 3. PHONE CALL DETAILS FORM */}
      {inputType === 'phone_call' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Caller Phone Number / Caller ID
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  placeholder="+1 (555) 902-1849 or Private Number"
                  value={callDetails.callerNumber}
                  onChange={(e) => handlePhoneFieldChange('callerNumber', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C24] border border-white/5 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Call Duration & Frequency
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="e.g. 4 mins 30 sec (Repeated 6 times)"
                  value={callDetails.callDuration}
                  onChange={(e) => handlePhoneFieldChange('callDuration', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#1C1C24] border border-white/5 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Nature of Call Threat / Harassment
            </label>
            <select
              value={callDetails.threatType}
              onChange={(e) => handlePhoneFieldChange('threatType', e.target.value)}
              className="w-full p-2.5 bg-[#1C1C24] border border-white/5 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Verbal Harassment">Verbal Harassment & Intimidation</option>
              <option value="Extortion & Ransom">Financial Extortion / Blackmail Demand</option>
              <option value="Physical Harm Threat">Threat of Physical Violence / Assault</option>
              <option value="Repeated Stalking Calls">Continuous Silent / Heavy Breathing Calls</option>
              <option value="Identity Impersonation">Fake Officer / Impersonation Scam</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Caller Voice Characteristics & Conversation Transcript Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Deep male voice with regional accent, claimed to know my home address and demanded money..."
              value={callDetails.suspiciousVoiceDetails}
              onChange={(e) => handlePhoneFieldChange('suspiciousVoiceDetails', e.target.value)}
              className="w-full p-3 bg-[#1C1C24] border border-white/5 rounded-xl text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Action button to proceed to Step 2 */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {rawInput.trim().length > 0 ? (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Information provided ({rawInput.trim().length} characters)
            </span>
          ) : (
            'Provide details to activate AI NLP Engine'
          )}
        </span>

        <button
          id="proceed-to-ai-btn"
          type="button"
          onClick={onProceedToAI}
          disabled={!rawInput.trim()}
          className="flex items-center space-x-2 py-3 px-7 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-900/50 border border-indigo-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span>Run AI Analysis & NLP</span>
        </button>
      </div>
    </div>
  );
};
