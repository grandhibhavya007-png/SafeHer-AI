import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, AlertTriangle, ShieldCheck, MapPin, Calendar, Clock, ArrowRight, PlusCircle, CheckCircle2, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel, User } from '../types';
import { fetchComplaints } from '../services/api';
import { ComplaintDetailModal } from './ComplaintDetailModal';

interface MyComplaintsViewProps {
  currentUser: User | null;
  onNavigateToReport: () => void;
  onOpenAuth: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  currentUser,
  onNavigateToReport,
  onOpenAuth,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await fetchComplaints({
        userId: currentUser?.role === 'admin' ? undefined : currentUser?.id,
      });

      const localRaw = localStorage.getItem('safeher_complaints');
      const localComplaints: Complaint[] = localRaw ? JSON.parse(localRaw) : [];

      const combined = [...localComplaints, ...(data || [])];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

      const filtered = unique.filter((c) => {
        if (statusFilter !== 'All' && c.status !== statusFilter) return false;
        if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matches = 
            (c.trackingNumber && c.trackingNumber.toLowerCase().includes(query)) ||
            (c.category && c.category.toLowerCase().includes(query)) ||
            (c.summary && c.summary.toLowerCase().includes(query)) ||
            (c.description && c.description.toLowerCase().includes(query)) ||
            (c.addressText && c.addressText.toLowerCase().includes(query));
          if (!matches) return false;
        }
        return true;
      });

      setComplaints(filtered);
    } catch (err) {
      console.warn('Error loading complaints:', err);
      const localRaw = localStorage.getItem('safeher_complaints');
      if (localRaw) {
        setComplaints(JSON.parse(localRaw));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();

    const handleStorageChange = () => {
      loadComplaints();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, statusFilter, priorityFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadComplaints();
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

  const getStatusStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 1;
      case 'Under Review':
        return 2;
      case 'Action Dispatched':
        return 3;
      case 'Resolved':
      case 'Closed':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 bg-[#121217] border border-white/5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">My Incident Reports</h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              {complaints.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
            Track status updates, police dispatches, AI triage analysis, and official response logs in real time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadComplaints}
            className="p-3 bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 rounded-2xl border border-white/10 transition cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="my-complaints-new-report-btn"
            onClick={onNavigateToReport}
            className="flex items-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-900/50 border border-indigo-500/40 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Tracking ID, keywords, address, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-gray-500 shrink-0 font-medium mr-1">Status:</span>
            {['All', 'Submitted', 'Under Review', 'Action Dispatched', 'Resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#1C1C24] text-gray-400 hover:text-gray-200 border border-white/5'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500 text-xs">Loading incident records...</div>
      ) : complaints.length === 0 ? (
        <div className="py-16 text-center bg-[#121217] border border-white/5 rounded-3xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1C1C24] border border-white/5 flex items-center justify-center text-gray-500">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">No Complaints Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {statusFilter !== 'All' || searchQuery
                ? 'Try adjusting your search filters or clear the query.'
                : 'You have not submitted any incident reports yet.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToReport}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/50 inline-flex items-center space-x-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File a New Incident Report</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((c) => {
            const stepIdx = getStatusStepIndex(c.status);
            return (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className="p-5 sm:p-6 bg-[#121217] hover:bg-[#18181F] border border-white/5 hover:border-white/15 rounded-3xl transition-all shadow-xl hover:shadow-2xl cursor-pointer space-y-4 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-[#1C1C24] px-2.5 py-1 rounded-xl border border-white/5">
                      {c.trackingNumber}
                    </span>
                    <span className="text-sm font-bold text-white">{c.category}</span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getPriorityBadgeClass(c.priority)}`}>
                      {c.priority}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{c.incidentDate}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{c.incidentTime}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                  {c.summary}
                </p>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 mb-1.5">
                    <span className={stepIdx >= 1 ? 'text-indigo-400 font-bold' : ''}>1. Submitted</span>
                    <span className={stepIdx >= 2 ? 'text-amber-400 font-bold' : ''}>2. Under Review</span>
                    <span className={stepIdx >= 3 ? 'text-indigo-300 font-bold' : ''}>3. Action Dispatched</span>
                    <span className={stepIdx >= 4 ? 'text-emerald-400 font-bold' : ''}>4. Resolved</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-[#1C1C24]">
                    <div className={`h-full ${stepIdx >= 1 ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                    <div className={`h-full ${stepIdx >= 2 ? 'bg-amber-500' : 'bg-transparent'}`}></div>
                    <div className={`h-full ${stepIdx >= 3 ? 'bg-indigo-400' : 'bg-transparent'}`}></div>
                    <div className={`h-full ${stepIdx >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-2 truncate max-w-[70%]">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">
                      {c.locationShared ? c.addressText : 'Location omitted by user'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-indigo-400 group-hover:translate-x-1 transition font-semibold text-xs">
                    <span>View Case Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          onClose={() => setSelectedComplaint(null)}
          onComplaintUpdated={(updated) => {
            setSelectedComplaint(updated);
            setComplaints((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          }}
        />
      )}
    </div>
  );
};