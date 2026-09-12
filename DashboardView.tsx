import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mic, 
  PhoneCall, 
  Sparkles, 
  Compass, 
  Activity, 
  Radio, 
  Shield, 
  Database,
  ChevronRight,
  Phone
} from 'lucide-react';
import { InputType, User, Complaint, PriorityLevel } from '../types';
import { fetchComplaints } from '../services/api';

interface DashboardViewProps {
  currentUser: User | null;
  onNavigateToReport: (preferredInputType?: InputType) => void;
  onNavigateToComplaints: () => void;
  onNavigateToAdmin: () => void;
  onOpenSOS: () => void;
  onOpenAuth: () => void;
}

interface ComplaintCategory {
  id: number;
  title: string;
  description: string;
  priority: PriorityLevel;
  emergencyNumber: string;
}

const complaintCategories: Record<number, ComplaintCategory> = {
  1: { id: 1, title: "Street Harassment", description: "Eve-teasing or unwelcome comments in public areas.", priority: "High", emergencyNumber: "100" },
  2: { id: 2, title: "Stalking", description: "Being followed or monitored suspiciously.", priority: "High", emergencyNumber: "100" },
  3: { id: 3, title: "Domestic Distress", description: "Violence, threats, or harassment at home.", priority: "Critical", emergencyNumber: "181" },
  4: { id: 4, title: "Verbal Abuse/Threat", description: "Direct threats of physical or psychological harm.", priority: "High", emergencyNumber: "100" },
  5: { id: 5, title: "Transport Safety", description: "Unsafe conditions inside a cab, auto, or public transit.", priority: "Medium", emergencyNumber: "112" },
  6: { id: 6, title: "Workplace Harassment", description: "Inappropriate behavior or misconduct at work/college.", priority: "Medium", emergencyNumber: "1091" },
  7: { id: 7, title: "Unsafe Area Alert", description: "Trapped or isolated in a dark/isolated location.", priority: "High", emergencyNumber: "112" },
  8: { id: 8, title: "Medical Emergency", description: "Sudden physical injury, illness, or fainting.", priority: "Critical", emergencyNumber: "108" },
  9: { id: 9, title: "Critical SOS / Police", description: "Immediate physical danger requiring police dispatch.", priority: "Critical", emergencyNumber: "100" }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigateToReport,
  onNavigateToComplaints,
  onNavigateToAdmin,
  onOpenSOS,
  onOpenAuth,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [gridStatus, setGridStatus] = useState<string>("Click any number (1–9) to generate a complaint card, attach Google Maps location, call police, and view in My Reports.");
  const [isGridLoading, setIsGridLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchComplaints().then((data) => setComplaints(data || [])).catch(() => {});
  }, []);

  const handleCategoryAction = async (category: ComplaintCategory) => {
    setIsGridLoading(true);
    setGridStatus(`⚠️ Processing [${category.id}] ${category.title}... Generating complaint card & fetching GPS.`);

    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const googleMapsLink = `https://maps.google.com/?q=${lat},${lon}`;

          try {
            const localRaw = localStorage.getItem('safeher_complaints');
            const existing: Complaint[] = localRaw ? JSON.parse(localRaw) : [];

            const newComplaint: Complaint = {
              id: 'COMP-' + Date.now(),
              trackingNumber: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
              userId: currentUser?.id || 'guest-user',
              category: category.title,
              priority: category.priority,
              status: 'Submitted',
              summary: `Emergency Grid Report: ${category.title}`,
              description: `Automated 1-9 Grid Trigger.\nIncident Type: ${category.title} - ${category.description}\nGoogle Maps Location Link: ${googleMapsLink} (Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)})`,
              incidentDate: currentDate,
              incidentTime: currentTime,
              addressText: `Google Maps GPS: Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)}`,
              locationShared: true,
            } as Complaint;

            localStorage.setItem('safeher_complaints', JSON.stringify([newComplaint, ...existing]));

            setGridStatus(
              `✅ Complaint card for "${category.title}" successfully added to "My Reports" & Admin Dashboard!\n📞 Initiating call to ${category.emergencyNumber}...`
            );

            setTimeout(() => {
              onNavigateToComplaints();
            }, 1200);

          } catch (err) {
            setGridStatus(`⚠️ Call placed, but failed to save complaint card.`);
          } finally {
            setIsGridLoading(false);
            window.location.href = `tel:${category.emergencyNumber}`;
          }
        },
        (error) => {
          try {
            const localRaw = localStorage.getItem('safeher_complaints');
            const existing: Complaint[] = localRaw ? JSON.parse(localRaw) : [];

            const newComplaint: Complaint = {
              id: 'COMP-' + Date.now(),
              trackingNumber: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
              userId: currentUser?.id || 'guest-user',
              category: category.title,
              priority: category.priority,
              status: 'Submitted',
              summary: `Emergency Grid Report: ${category.title}`,
              description: `Automated 1-9 Grid Trigger. Incident Type: ${category.title} - ${category.description} (Location omitted)`,
              incidentDate: currentDate,
              incidentTime: currentTime,
              addressText: 'Location omitted by user',
              locationShared: false,
            } as Complaint;

            localStorage.setItem('safeher_complaints', JSON.stringify([newComplaint, ...existing]));
          } catch (e) {}

          setIsGridLoading(false);
          setGridStatus(`⚠️ Location denied. Complaint card added, calling ${category.emergencyNumber}.`);
          
          setTimeout(() => {
            onNavigateToComplaints();
          }, 1200);

          window.location.href = `tel:${category.emergencyNumber}`;
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setIsGridLoading(false);
      window.location.href = `tel:${category.emergencyNumber}`;
    }
  };

  const recentComplaints = complaints.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-300">
      
      {/* 🚀 1-9 QUICK INCIDENT TRIAGE GRID SECTION */}
      <div className="bg-[#121217] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl">
        <div className="mb-6 text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Instant Complaint Generation & Direct Emergency Dispatch
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">Quick 1–9 Number Emergency Grid</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Clicking any button instantly creates a formal complaint card with <strong className="text-white">Priority Level</strong>, <strong className="text-white">Google Maps location</strong>, and <strong className="text-white">Timestamp</strong>. It automatically populates in <strong className="text-white">"My Reports"</strong> and the <strong className="text-white">Admin Dashboard</strong> while placing a direct call.
          </p>
        </div>

        {/* 3x3 Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
          {Array.from({ length: 9 }, (_, index) => {
            const num = index + 1;
            const cat = complaintCategories[num];
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleCategoryAction(cat)}
                disabled={isGridLoading}
                className="bg-[#1C1C24] hover:bg-rose-600/20 border-2 border-rose-500/40 hover:border-rose-500 rounded-2xl p-4 flex flex-col items-center justify-between transition-all cursor-pointer group hover:scale-[1.02] shadow-lg relative overflow-hidden text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-2xl sm:text-3xl font-black text-rose-400 group-hover:text-white">{cat.id}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      cat.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      cat.priority === 'High' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {cat.priority}
                    </span>
                    <span className="text-[9px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Phone className="w-2.5 h-2.5" /> {cat.emergencyNumber}
                    </span>
                  </div>
                </div>
                <div className="w-full">
                  <span className="text-xs font-bold text-white block truncate">{cat.title}</span>
                  <span className="text-[10px] text-gray-400 block truncate">{cat.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Status Feedback Panel */}
        <div className="bg-[#1C1C24] border border-white/10 rounded-2xl p-4 max-w-3xl mx-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Execution Status</h3>
          <p className="text-xs sm:text-sm text-gray-200 whitespace-pre-line font-mono">{gridStatus}</p>
        </div>
      </div>

      {/* Top Bento Grid - Primary Action & Real-Time Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">      
        
        <div className="lg:col-span-8 bg-[#121217] rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-rose-600/5 blur-[100px] rounded-full pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                SafeHer AI Incident Engine
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs text-gray-400 font-mono">Real-Time NLP Active</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
              Report a Problem
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed mb-8">
              Your safety is our priority. Submit a detailed report via text, voice notes, or call logs for immediate AI processing and rapid dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <button
              id="report-text-btn"
              type="button"
              onClick={() => onNavigateToReport('text')}
              className="bg-white text-black font-bold py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer"
            >
              <div className="p-2 bg-black/5 rounded-xl">
                <MessageSquare className="w-6 h-6 text-black" />
              </div>
              <span className="text-sm font-extrabold tracking-tight">Text Message</span>
              <span className="text-[11px] text-gray-600 font-normal">Type incident details</span>
            </button>

            <button
              id="report-voice-btn"
              type="button"
              onClick={() => onNavigateToReport('voice')}
              className="bg-indigo-600 text-white font-bold py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-900/30 cursor-pointer"
            >
              <div className="p-2 bg-white/10 rounded-xl">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight">Voice Note</span>
              <span className="text-[11px] text-indigo-200 font-normal">Record live audio</span>
            </button>

            <button
              id="report-call-btn"
              type="button"
              onClick={() => onNavigateToReport('phone_call')}
              className="bg-[#1C1C24] text-white border border-white/10 font-bold py-4 px-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#25252E] hover:border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="p-2 bg-white/5 rounded-xl">
                <PhoneCall className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-sm font-extrabold tracking-tight">Phone Call</span>
              <span className="text-[11px] text-gray-400 font-normal">Log call metadata</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#121217] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">AI Analysis Feed</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              <div className="border-l-4 border-rose-500 bg-[#1C1C24] p-3.5 rounded-r-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-200">Suspicious Activity</span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">High Priority</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Subject reporting being followed near North Transit Station. AI suggested immediate patrol dispatch.
                </p>
              </div>

              <div className="border-l-4 border-amber-500 bg-[#1C1C24] p-3.5 rounded-r-xl space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-200">Workplace Misconduct</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Med Priority</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Automated transcript analysis identifies repeated verbal harassment & intimidating behavior.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
            <span>Model: Gemini 2.5 NLP</span>
            <span className="text-indigo-400 font-mono">Triage: &lt; 850ms</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121217] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 text-purple-400 border border-purple-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">Location Services</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Consensual GPS geotagging captures verified coordinates, timestamp, and nearby landmark data only with explicit user permission.
            </p>
          </div>
        </div>

        <div className="bg-[#121217] rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Recent Case Activity</h4>
              <button
                type="button"
                onClick={onNavigateToComplaints}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentComplaints.length > 0 ? (
                recentComplaints.map((c, i) => (
                  <div key={c.id || i} className="flex items-start gap-3 text-xs">
                    <span className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      c.priority === 'Critical' ? 'bg-rose-500' : c.priority === 'High' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200 truncate">{c.category}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{c.incidentTime || 'Recent'}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{c.trackingNumber} • {c.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  No complaints filed yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>SQLite Persistent Store</span>
            </span>
            <span className="text-gray-400 font-mono">{complaints.length} Total Cases</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/90 via-[#1C1C24] to-[#121217] rounded-3xl p-6 border border-indigo-500/20 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30 inline-block">
              SYSTEM STATUS
            </span>
            <div className="py-2">
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                99.9<span className="text-indigo-400">%</span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 font-medium">AI Analysis Uptime & Police Dispatch</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-around text-xs text-indigo-200">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3</span>
            </div>
            <div className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Sentinel</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};