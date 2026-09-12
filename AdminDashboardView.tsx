import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, Users, Search, Filter, RefreshCw, Eye, Edit3, Trash2, Download, Send, PhoneCall, MapPin, User, ChevronRight, FileSpreadsheet, Lock } from 'lucide-react';
import { Complaint, ComplaintStatus, PriorityLevel, User as UserType } from '../types';
import { deleteComplaint, fetchComplaints, fetchStats, updateComplaintStatus } from '../services/api';
import { ComplaintDetailModal } from './ComplaintDetailModal';

// --- 1. ADMIN CREDENTIALS (Your Passwords are safe here) ---
const ADMIN_CREDENTIALS = [
  { phone: "9494624073", password: "Bhavya@2007" }, // Admin 1
  { phone: "9014197019", password: "Bhavana@2007" }, // Admin 2
  { phone: "8985189891", password: "Sravya@2007" }, // Admin 3
  { phone: "7095364496", password: "Hashini@2007" }  // Admin 4
];

interface AdminDashboardViewProps {
  currentUser: UserType | null;
  onOpenAuth: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onOpenAuth,
}) => {
  
  // --- ADMIN SECURITY STATE ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- DASHBOARD STATE ---
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    critical: number;
    high: number;
    underReview: number;
    actionDispatched: number;
    resolved: number;
    byCategory: Record<string, number>;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, analytics] = await Promise.all([
        fetchComplaints({
          category: categoryFilter,
          priority: priorityFilter,
          status: statusFilter,
          search,
        }),
        fetchStats(),
      ]);
      setComplaints(list);
      setStats(analytics);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only load data if the portal is unlocked
  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [categoryFilter, priorityFilter, statusFilter, isUnlocked]);

  const handleQuickStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    try {
      const updated = await updateComplaintStatus(
        id,
        { status: newStatus },
        currentUser?.name || 'Admin Lead',
        'admin'
      );
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
      loadData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incident complaint record?')) return;
    try {
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const exportToCSV = () => {
    if (complaints.length === 0) return;
    const headers = ['Tracking Number', 'Date', 'Time', 'Category', 'Priority', 'Status', 'Location', 'Reporter', 'Summary'];
    const rows = complaints.map((c) => [
      c.trackingNumber,
      c.incidentDate,
      c.incidentTime,
      c.category,
      c.priority,
      c.status,
      c.locationShared ? `"${c.addressText.replace(/"/g, '""')}"` : 'Omitted',
      c.isAnonymous ? 'Anonymous' : `"${c.userName}"`,
      `"${c.summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SafeHer_Complaints_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadgeClass = (p: PriorityLevel) => {
    switch (p) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Low':
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  const getStatusBadgeClass = (s: ComplaintStatus) => {
    switch (s) {
      case 'Submitted': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'Under Review': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Action Dispatched': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Closed':
      default: return 'bg-[#1C1C24] text-gray-400 border-white/10';
    }
  };

  // --- 2. ADMIN LOGIN LOGIC ---
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if entered phone and password match any of the 4 admins
    const match = ADMIN_CREDENTIALS.find(admin => admin.phone === adminPhone && admin.password === adminPassword);
    
    if (match) {
      setIsUnlocked(true);
      setLoginError('');
    } else {
      setLoginError('Access Denied: Invalid Phone Number or Password');
    }
  };

  // --- 3. THE LOCK SCREEN UI (Shows if not unlocked) ---
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-[75vh] animate-in fade-in duration-300 px-4">
        <div className="bg-[#121217] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"></div>
          
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-white text-center mb-2">Admin Command Center</h2>
          <p className="text-sm text-gray-400 text-center mb-8">Strictly restricted to authorized personnel.</p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone Number</label>
              <input 
                type="tel" 
                required
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full bg-[#1C1C24] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="Enter authorized number"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Secure Password</label>
              <input 
                type="password" 
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-[#1C1C24] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {loginError}
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-900/50 mt-4 cursor-pointer">
              Authenticate & Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 4. THE ACTUAL DASHBOARD UI (Shows only after successful login) ---
  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-200">
      {/* Admin Header Bento Block */}
      <div className="p-6 sm:p-8 bg-[#121217] border border-white/5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-900/50">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">SafeHer Admin Command</h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  SQLite Database Master
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Official Incident Triage, Police Patrol Dispatch, and Case Resolution Management.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={exportToCSV}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#1C1C24] hover:bg-[#25252E] text-gray-200 rounded-2xl border border-white/10 text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            className="p-2.5 bg-[#1C1C24] hover:bg-[#25252E] text-gray-200 rounded-2xl border border-white/10 transition cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards - Bento Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl">
            <span className="text-[11px] font-semibold text-gray-400 block mb-1">Total Complaints</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</p>
            <span className="text-[10px] text-gray-500 font-mono">SQLite Stored</span>
          </div>

          <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl">
            <span className="text-[11px] font-semibold text-red-400 block mb-1 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Critical Urgency</span>
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-red-400">{stats.critical}</p>
            <span className="text-[10px] text-gray-500 font-mono">Immediate dispatch</span>
          </div>

          <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl">
            <span className="text-[11px] font-semibold text-amber-400 block mb-1">Under Review</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stats.underReview}</p>
            <span className="text-[10px] text-gray-500 font-mono">Pending assignment</span>
          </div>

          <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl">
            <span className="text-[11px] font-semibold text-indigo-400 block mb-1">Action Dispatched</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{stats.actionDispatched}</p>
            <span className="text-[10px] text-gray-500 font-mono">Patrol unit en route</span>
          </div>

          <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-emerald-400 block mb-1">Resolved Cases</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolved}</p>
            <span className="text-[10px] text-gray-500 font-mono">
              {stats.total > 0 ? `${((stats.resolved / stats.total) * 100).toFixed(0)}% resolution` : '0%'}
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#121217] border border-white/5 rounded-3xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search keyword / tracking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="w-full pl-9 pr-3 py-2 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Harassment">Harassment</option>
              <option value="Stalking">Stalking</option>
              <option value="Domestic Violence">Domestic Violence</option>
              <option value="Workplace Misconduct">Workplace Misconduct</option>
              <option value="Public Transit Safety">Public Transit Safety</option>
              <option value="Cyber Threat & Blackmail">Cyber Threat & Blackmail</option>
              <option value="Physical Assault">Physical Assault</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-[#1C1C24] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Action Dispatched">Action Dispatched</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Management Table Bento Card */}
      <div className="bg-[#121217] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Incident Queue & Database Records ({complaints.length})</h3>
          <span className="text-xs text-gray-500">Click any row to view full AI narrative and responder notes</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">Querying database...</div>
        ) : complaints.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No incident reports found matching current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#09090B] text-gray-400 border-b border-white/5 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Tracking ID</th>
                  <th className="py-3.5 px-4">Category & Priority</th>
                  <th className="py-3.5 px-4">AI Summary / Narrative</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Officer Assigned</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#1C1C24] transition cursor-pointer"
                    onClick={() => setSelectedComplaint(c)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {c.trackingNumber}
                      <span className="block text-[10px] font-sans text-gray-500 font-normal">
                        {c.incidentDate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{c.category}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.2 text-[10px] font-bold rounded-md border ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-gray-300 leading-relaxed">{c.summary}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-[180px]">
                      <div className="flex items-center space-x-1 text-gray-300">
                        <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{c.locationShared ? c.addressText : 'Omitted'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={c.status}
                        onChange={(e) => handleQuickStatusChange(c.id, e.target.value as ComplaintStatus)}
                        className={`text-[11px] font-bold p-1.5 rounded-xl border focus:outline-none cursor-pointer ${getStatusBadgeClass(c.status)}`}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Action Dispatched">Action Dispatched</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400">
                      {c.assignedOfficer ? (
                        <span className="text-gray-200 font-medium">{c.assignedOfficer}</span>
                      ) : (
                        <span className="text-gray-600 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(c)}
                          className="p-1.5 bg-[#1C1C24] hover:bg-[#25252E] text-gray-300 rounded-xl transition cursor-pointer"
                          title="View Case Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-xl transition border border-red-900/60 cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          onClose={() => setSelectedComplaint(null)}
          onComplaintUpdated={(updated) => {
            setSelectedComplaint(updated);
            setComplaints((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            loadData();
          }}
        />
      )}
    </div>
  );
};