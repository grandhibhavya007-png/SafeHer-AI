import React, { useState } from 'react';
import { X, Shield, AlertTriangle, MapPin, Calendar, Clock, Sparkles, User, Phone, CheckCircle2, MessageSquare, Mic, PhoneCall, ShieldAlert, ArrowRight, Save } from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel, User as UserType } from '../types';
import { updateComplaintStatus } from '../services/api';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  currentUser: UserType | null;
  onClose: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  onClose,
  onComplaintUpdated,
}) => {
  if (!complaint) return null;

  const isAdmin = currentUser?.role === 'admin';
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [assignedOfficer, setAssignedOfficer] = useState(complaint.assignedOfficer || '');
  const [adminNotes, setAdminNotes] = useState(complaint.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateComplaintStatus(
        complaint.id,
        {
          status: newStatus,
          assignedOfficer,
          adminNotes,
        },
        currentUser?.name || 'Admin Officer',
        currentUser?.role || 'admin'
      );
      onComplaintUpdated(updated);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityBadgeClass = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getStatusBadgeClass = (s: ComplaintStatus) => {
    switch (s) {
      case 'Submitted':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Under Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Action Dispatched':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Closed':
      default:
        return 'bg-[#1C1C24] text-gray-400 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#121217] border border-white/10 rounded-3xl shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-5 bg-[#121217]/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">Incident Case {complaint.trackingNumber}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(complaint.priority)}`}>
                  {complaint.priority}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">Filed on {complaint.incidentDate} at {complaint.incidentTime}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Executive AI Summary */}
          <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Executive Summary & Categorization</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 bg-[#121217] p-3 rounded-xl border border-white/5 leading-relaxed">
              {complaint.summary}
            </p>
          </div>

          {/* Risk & Suggested Safety Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#1C1C24] border border-white/5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-400 block flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Risk Assessment</span>
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">{complaint.riskAssessment || 'Standard evaluation'}</p>
            </div>

            <div className="p-3.5 bg-[#1C1C24] border border-white/5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-indigo-400 block flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recommended Action</span>
              </span>
              <p className="text-xs text-gray-300 leading-relaxed">{complaint.suggestedAction || 'Preserve evidence'}</p>
            </div>
          </div>

          {/* Raw Incident Narrative */}
          <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span>Reported Narrative / Voice Transcript</span>
              <span className="text-[10px] px-2 py-0.5 bg-[#121217] text-gray-400 rounded-full font-mono">
                {complaint.inputType}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 bg-[#121217] p-3 rounded-xl border border-white/5 leading-relaxed">
              {complaint.rawInput}
            </p>
          </div>

          {/* Call details if phone call */}
          {complaint.inputType === 'phone_call' && complaint.callDetails && (
            <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
                <PhoneCall className="w-4 h-4 text-indigo-400" />
                <span>Phone Call Metadata</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[#121217] rounded-lg">
                  <span className="text-gray-500 block">Caller ID:</span>
                  <span className="text-gray-200 font-mono">{complaint.callDetails.callerNumber || 'Unknown'}</span>
                </div>
                <div className="p-2 bg-[#121217] rounded-lg">
                  <span className="text-gray-500 block">Call Duration:</span>
                  <span className="text-gray-200">{complaint.callDetails.callDuration || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Location & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#1C1C24] border border-white/5 rounded-xl space-y-1">
              <span className="text-gray-400 font-semibold flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Location</span>
              </span>
              <p className="text-gray-200 font-medium">
                {complaint.locationShared ? complaint.addressText : 'Omitted by user consent'}
              </p>
              {complaint.latitude ? (
                <p className="text-[10px] font-mono text-gray-500">
                  Lat: {complaint.latitude?.toFixed(4)}, Lng: {complaint.longitude?.toFixed(4)}
                </p>
              ) : null}
            </div>

            <div className="p-3 bg-[#1C1C24] border border-white/5 rounded-xl space-y-1">
              <span className="text-gray-400 font-semibold flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span>Reporter Identity</span>
              </span>
              <p className="text-gray-200 font-medium">
                {complaint.isAnonymous ? 'Anonymous Citizen' : complaint.userName}
              </p>
              <p className="text-[11px] text-gray-400">
                {complaint.isAnonymous ? 'Contact hidden' : complaint.userEmail}
              </p>
            </div>
          </div>

          {/* Admin Management Section */}
          {isAdmin ? (
            <div className="p-4 bg-[#1C1C24] border border-indigo-500/30 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Admin Triage & Officer Dispatch</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full p-2 bg-[#121217] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Action Dispatched">Action Dispatched</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Assign Officer / Unit</label>
                  <input
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="e.g. PCR Unit 14 / Inspector Meera"
                    className="w-full p-2 bg-[#121217] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Official Response & Action Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record patrol dispatch details, victim contact logs, or resolution notes..."
                  className="w-full p-2.5 bg-[#121217] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-900/50 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isUpdating ? 'Saving...' : 'Save Case Updates'}</span>
              </button>
            </div>
          ) : (
            complaint.adminNotes && (
              <div className="p-4 bg-[#1C1C24] border border-white/5 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-indigo-400 block">Official Police / Support Response Note:</span>
                <p className="text-xs text-gray-200 bg-[#121217] p-2.5 rounded-xl leading-relaxed">
                  {complaint.adminNotes}
                </p>
                {complaint.assignedOfficer && (
                  <p className="text-[11px] text-gray-400 mt-1">Assigned Officer: {complaint.assignedOfficer}</p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
