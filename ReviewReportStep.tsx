import React, { useState } from 'react';
import { FileCheck, Shield, AlertTriangle, MapPin, Calendar, Clock, Edit3, Send, CheckCircle2, User, Phone, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { AIAnalysisResult, CallDetails, IncidentCategory, InputType, PriorityLevel, User as UserType } from '../../types';

interface ReviewReportStepProps {
  currentUser: UserType | null;
  inputType: InputType;
  rawInput: string;
  setRawInput: (text: string) => void;
  callDetails: CallDetails;
  audioDurationSec: number;
  category: IncidentCategory;
  setCategory: (cat: IncidentCategory) => void;
  priority: PriorityLevel;
  setPriority: (pri: PriorityLevel) => void;
  summary: string;
  setSummary: (sum: string) => void;
  riskAssessment?: string;
  suggestedAction?: string;
  extractedEntities?: any;
  locationShared: boolean;
  latitude: number | undefined;
  longitude: number | undefined;
  addressText: string;
  setAddressText: (addr: string) => void;
  incidentDate: string;
  setIncidentDate: (d: string) => void;
  incidentTime: string;
  setIncidentTime: (t: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (anon: boolean) => void;
  notifyEmergencyContact: boolean;
  setNotifyEmergencyContact: (notify: boolean) => void;
  onSubmit: () => void;
  onBackToLocation: () => void;
  isSubmitting: boolean;
}

export const ReviewReportStep: React.FC<ReviewReportStepProps> = ({
  currentUser,
  inputType,
  rawInput,
  setRawInput,
  callDetails,
  audioDurationSec,
  category,
  setCategory,
  priority,
  setPriority,
  summary,
  setSummary,
  riskAssessment,
  suggestedAction,
  extractedEntities,
  locationShared,
  latitude,
  longitude,
  addressText,
  setAddressText,
  incidentDate,
  setIncidentDate,
  incidentTime,
  setIncidentTime,
  isAnonymous,
  setIsAnonymous,
  notifyEmergencyContact,
  setNotifyEmergencyContact,
  onSubmit,
  onBackToLocation,
  isSubmitting,
}) => {
  
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);

  const categories: IncidentCategory[] = [
    'Harassment',
    'Stalking',
    'Domestic Violence',
    'Workplace Misconduct',
    'Public Transit Safety',
    'Cyber Threat & Blackmail',
    'Physical Assault',
    'Suspicious Activity',
    'Emergency Distress',
    'Other',
  ];

  const priorities: PriorityLevel[] = ['Critical', 'High', 'Medium', 'Low'];

  const getPriorityBadgeClass = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/60';
      case 'High':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/60';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/60';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Instructions */}
      <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Review & Finalize Report</h3>
            <p className="text-xs text-gray-400">
              Verify all AI-generated fields, location, and timestamps. Make any necessary edits before submission.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#121217] border border-white/10 text-gray-300 font-mono">
            Input: {inputType === 'voice' ? 'Voice Recording' : inputType === 'phone_call' ? 'Phone Call Log' : 'Text'}
          </span>
        </div>
      </div>

      {/* Editable Triage Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Selector */}
        <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
          <label className="block text-xs font-bold text-gray-300 flex items-center justify-between">
            <span>Incident Category (AI Classified)</span>
            <span className="text-[10px] text-gray-500 font-normal">Click to modify</span>
          </label>
          <select
            id="review-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as IncidentCategory)}
            className="w-full p-2.5 bg-[#121217] border border-white/10 rounded-xl text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-indigo-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selector */}
        <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
          <label className="block text-xs font-bold text-gray-300 flex items-center justify-between">
            <span>Priority & Urgency Level</span>
            <span className="text-[10px] text-gray-500 font-normal">Triage level</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                  priority === p
                    ? getPriorityBadgeClass(p) + ' ring-1 ring-white/20'
                    : 'bg-[#121217] border-white/5 text-gray-400 hover:text-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Summary Editor */}
      <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Generated Executive Summary</span>
          </label>
          <span className="text-[10px] text-gray-500">Editable summary</span>
        </div>
        <textarea
          id="review-summary-input"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 bg-[#121217] border border-white/10 rounded-xl text-xs sm:text-sm text-gray-200 leading-relaxed focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Incident Narrative / Transcript */}
      <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 flex items-center space-x-1.5">
            <Edit3 className="w-3.5 h-3.5 text-gray-400" />
            <span>Full Incident Narrative / Transcript</span>
          </label>
          <button
            type="button"
            onClick={() => setIsEditingNarrative(!isEditingNarrative)}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            {isEditingNarrative ? 'Done Editing' : 'Edit Text'}
          </button>
        </div>

        {isEditingNarrative ? (
          <textarea
            rows={4}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full p-3 bg-[#121217] border border-white/10 rounded-xl text-xs sm:text-sm text-gray-200 leading-relaxed focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <p className="p-3 bg-[#121217] border border-white/5 rounded-xl text-xs sm:text-sm text-gray-300 leading-relaxed">
            {rawInput}
          </p>
        )}
      </div>

      {/* Location, Date & Time Verification */}
      <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location & Timestamp Verification</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Location field */}
          <div className="p-3 bg-[#121217] rounded-xl border border-white/5">
            <div className="flex items-center space-x-1.5 text-gray-400 text-xs mb-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Location Status</span>
            </div>
            {locationShared ? (
              <div>
                <p className="text-xs font-medium text-emerald-400">GPS Verified</p>
                <input
                  type="text"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="mt-1 w-full bg-[#09090B] border border-white/10 rounded p-1.5 text-[11px] text-gray-200 focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-xs font-medium text-gray-400">Omitted by user consent</p>
            )}
          </div>

          {/* Date */}
          <div className="p-3 bg-[#121217] rounded-xl border border-white/5">
            <div className="flex items-center space-x-1.5 text-gray-400 text-xs mb-1 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Incident Date</span>
            </div>
            <input
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full bg-[#09090B] border border-white/10 rounded p-1.5 text-xs text-gray-200 focus:outline-none"
            />
          </div>

          {/* Time */}
          <div className="p-3 bg-[#121217] rounded-xl border border-white/5">
            <div className="flex items-center space-x-1.5 text-gray-400 text-xs mb-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Incident Time</span>
            </div>
            <input
              type="time"
              value={incidentTime}
              onChange={(e) => setIncidentTime(e.target.value)}
              className="w-full bg-[#09090B] border border-white/10 rounded p-1.5 text-xs text-gray-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Safety Toggles */}
      <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-bold text-white">Alert Emergency Contact Upon Submission</p>
              <p className="text-[11px] text-gray-400">
                {currentUser?.emergencyContactPhone
                  ? `Automated SMS summary will be dispatched to ${currentUser.emergencyContactPhone}`
                  : 'Sends an instant alert notification with tracking ID to emergency contact'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifyEmergencyContact}
            onChange={(e) => setNotifyEmergencyContact(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 bg-[#09090B] border-white/20 focus:ring-indigo-500 cursor-pointer"
          />
        </label>

        <div className="border-t border-white/5 pt-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-3">
              <EyeOff className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-white">Submit Anonymously</p>
                <p className="text-[11px] text-gray-400">Mask your personal name and contact details on public logs</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-[#09090B] border-white/20 focus:ring-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Submission Footer */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLocation}
          className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 border border-white/10 transition cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          id="final-submit-report-btn"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center space-x-2 py-3 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-900/60 border border-indigo-500/40 transition disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Storing in Database...' : 'Submit Report'}</span>
        </button>
      </div>
    </div>
  );
};
