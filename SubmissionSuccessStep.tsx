import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Copy, Check, ArrowRight, RotateCcw, AlertTriangle, PhoneCall, MapPin, Calendar, Clock, FileText } from 'lucide-react';
import { Complaint } from '../../types';

interface SubmissionSuccessStepProps {
  complaint: Complaint;
  onViewMyComplaints: () => void;
  onNewReport: () => void;
}

export const SubmissionSuccessStep: React.FC<SubmissionSuccessStepProps> = ({
  complaint,
  onViewMyComplaints,
  onNewReport,
}) => {
  
  const [copied, setCopied] = useState(false);

  const handleCopyTrackingNumber = () => {
    navigator.clipboard.writeText(complaint.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
      {/* Success Badge */}
      <div className="py-4">
        <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-3xl flex items-center justify-center mx-auto text-emerald-400 mb-3 shadow-xl shadow-emerald-950/60">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Report Submitted Successfully</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
          Your complaint has been securely recorded in the incident database and routed to authorities with AI triage priority.
        </p>
      </div>

      {/* Tracking Number Card */}
      <div className="p-6 bg-[#1C1C24] border border-white/5 rounded-3xl max-w-md mx-auto space-y-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Official Case Tracking Number
        </span>
        <div className="flex items-center justify-center space-x-3">
          <span className="font-mono text-xl sm:text-2xl font-black text-indigo-400 tracking-wider">
            {complaint.trackingNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyTrackingNumber}
            className="p-2 bg-[#121217] hover:bg-[#25252E] border border-white/10 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
            title="Copy Tracking Number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400">
          Keep this tracking reference to monitor resolution status or provide to responding officers.
        </p>
      </div>

      {/* Triage Summary Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto text-left">
        <div className="p-3 bg-[#1C1C24] rounded-2xl border border-white/5">
          <span className="text-[10px] text-gray-400 font-semibold block">Category</span>
          <span className="text-xs font-bold text-white truncate block">{complaint.category}</span>
        </div>

        <div className="p-3 bg-[#1C1C24] rounded-2xl border border-white/5">
          <span className="text-[10px] text-gray-400 font-semibold block">Priority</span>
          <span className={`text-xs font-bold ${
            complaint.priority === 'Critical' ? 'text-red-400' : complaint.priority === 'High' ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {complaint.priority}
          </span>
        </div>

        <div className="p-3 bg-[#1C1C24] rounded-2xl border border-white/5">
          <span className="text-[10px] text-gray-400 font-semibold block">Status</span>
          <span className="text-xs font-bold text-indigo-400">{complaint.status}</span>
        </div>

        <div className="p-3 bg-[#1C1C24] rounded-2xl border border-white/5">
          <span className="text-[10px] text-gray-400 font-semibold block">Location</span>
          <span className="text-xs font-bold text-gray-300 truncate block">
            {complaint.locationShared ? 'GPS Logged' : 'Omitted'}
          </span>
        </div>
      </div>

      {/* Emergency notification dispatched status */}
      {complaint.notifyEmergencyContact && (
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl max-w-md mx-auto text-xs text-indigo-200 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span>Emergency contact notification and tracking broadcast transmitted.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onNewReport}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-200 border border-white/10 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>File Another Report</span>
        </button>

        <button
          type="button"
          id="view-my-complaints-btn"
          onClick={onViewMyComplaints}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/50 border border-indigo-500/40 transition cursor-pointer"
        >
          <span>View My Complaints & Updates</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
