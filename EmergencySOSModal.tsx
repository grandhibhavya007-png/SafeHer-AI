import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext'; 
import { User } from '../types'; 

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose, currentUser }) => {
  const { t } = useLanguage(); 

  const [stage, setStage] = useState<'idle' | 'calling_p1' | 'calling_p2' | 'police'>('idle');
  const [timeLeft, setTimeLeft] = useState(30);

  // Dashboard settings states
  const [priority1, setPriority1] = useState('');
  const [priority2, setPriority2] = useState('');
  const [customMessage, setCustomMessage] = useState('EMERGENCY! I need immediate help. Please track my location.');
  const [isSaved, setIsSaved] = useState(false);
  const [statusLog, setStatusLog] = useState('');

  // Load numbers & settings on mount / modal open
  useEffect(() => {
    const p1 = localStorage.getItem('priority1') || '';
    const p2 = localStorage.getItem('priority2') || '';
    const msg = localStorage.getItem('customMessage') || 'EMERGENCY! I need immediate help. Please track my location.';
    
    setPriority1(p1);
    setPriority2(p2);
    setCustomMessage(msg);

    if (!isOpen) {
      setStage('idle'); 
    }
  }, [isOpen]);

  // Save emergency contacts and message
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priority1) {
      alert('Please enter at least the Priority 1 number!');
      return;
    }

    localStorage.setItem('priority1', priority1);
    localStorage.setItem('priority2', priority2);
    localStorage.setItem('customMessage', customMessage);
    
    setIsSaved(true);
    setStatusLog('✅ Emergency settings saved successfully!');
    setTimeout(() => setIsSaved(false), 3000);
  };

  // 30-second Timer Logic for Auto SOS Call & Dual Dispatch (WhatsApp + SMS)
  useEffect(() => {
    if (!isOpen) {
      setStage('idle'); 
      return;
    }

    let timer: NodeJS.Timeout;
    
    if ((stage === 'calling_p1' || stage === 'calling_p2') && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (stage === 'calling_p1' && timeLeft === 0) {
      setStage('calling_p2');
      setTimeLeft(30);
      handleTriggerSOS(); 
      if (priority2) {
        window.location.href = `tel:${priority2}`;
      }
    } else if (stage === 'calling_p2' && timeLeft === 0) {
      setStage('police');
      if (priority2) {
        handleTriggerSOS(); 
      }
    }
    
    return () => clearTimeout(timer);
  }, [stage, timeLeft, isOpen, priority1, priority2]);

  if (!isOpen) return null;

  // Auto Call Logic for Priority 1
  const triggerPriority1 = () => {
    const p1 = localStorage.getItem('priority1');
    if (!p1) {
      alert("Please add emergency numbers in your Dashboard first!");
      return;
    }
    setStage('calling_p1');
    setTimeLeft(30);
    handleTriggerSOS(); 
    window.location.href = `tel:${p1}`;
  };

  // Auto Call Logic for Priority 2
  const triggerPriority2 = () => {
    const p2 = localStorage.getItem('priority2');
    if (p2) {
      handleTriggerSOS();
      window.location.href = `tel:${p2}`;
    } else {
      triggerPolice();
    }
  };

  const triggerPolice = () => {
    window.location.href = `tel:100`; 
    setStage('idle');
    onClose();
  };

  // Enhanced SOS Trigger combining SMS and WhatsApp with Geolocation
  const handleTriggerSOS = () => {
    const savedP1 = localStorage.getItem('priority1') || priority1 || '+919876543210';
    const savedP2 = localStorage.getItem('priority2') || priority2 || '';
    const customMsg = localStorage.getItem('customMessage') || customMessage || 'EMERGENCY! I need immediate assistance. Track my location here:';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const locationLink = `https://maps.google.com/?q=${lat},${lon}`;
          const fullMessage = `${customMsg} ${locationLink}`;

          // 1. Trigger SMS Dispatch for Priority 1 & Priority 2
          const smsNumbers = [savedP1, savedP2].filter(Boolean).join(',');
          const smsUrl = `sms:${smsNumbers}?body=${encodeURIComponent(fullMessage)}`;
          
          window.location.href = smsUrl;

          // 2. Trigger WhatsApp Dispatch after a short delay
          setTimeout(() => {
            const whatsappUrl = `https://wa.me/${savedP1.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(fullMessage)}`;
            window.open(whatsappUrl, '_blank');
          }, 1000);
        },
        () => {
          // Fallback if geolocation fails
          const fallbackMsg = `${customMsg} (Location unavailable)`;
          const smsNumbers = [savedP1, savedP2].filter(Boolean).join(',');
          window.location.href = `sms:${smsNumbers}?body=${encodeURIComponent(fallbackMsg)}`;
        },
        { timeout: 5000 }
      );
    } else {
      const fallbackMsg = `${customMsg} (Location unavailable)`;
      const smsNumbers = [savedP1, savedP2].filter(Boolean).join(',');
      window.location.href = `sms:${smsNumbers}?body=${encodeURIComponent(fallbackMsg)}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#121217] border border-red-500/30 rounded-3xl w-full max-w-lg p-6 text-center shadow-2xl relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl cursor-pointer">✕</button>
        
        <h2 className="text-2xl font-bold text-white mb-6">🚨 Emergency SOS & Dashboard</h2>

        {/* --- 1. AUTO SOS TIMER & TRIGGER PANEL --- */}
        <div className="mb-6">
          {stage === 'idle' && (
            <button 
              onClick={triggerPriority1}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-6 rounded-2xl text-xl shadow-[0_0_30px_rgba(220,38,38,0.6)] transition flex flex-col items-center gap-1 cursor-pointer"
            >
              <span className="text-xl font-black uppercase tracking-wider">{t?.sosTitle || "TAP FOR AUTO SOS"}</span>
              <span className="text-xs font-normal text-red-200">{t?.sosSubtitle || "Calls P1 → P2 → Police + Auto WhatsApp & SMS"}</span>
            </button>
          )}

          {stage === 'calling_p1' && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-yellow-500 mb-1">Calling Priority 1...</h3>
              <p className="text-gray-300 text-sm mb-3">If no answer, auto WhatsApp & SMS sends in: <br/><span className="text-3xl font-bold text-white mt-1 block">{timeLeft}s</span></p>
              <button onClick={() => { setStage('idle'); onClose(); }} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm transition cursor-pointer">
                Cancel (They Answered)
              </button>
            </div>
          )}

          {stage === 'calling_p2' && (
            <div className="bg-orange-500/10 border border-orange-500/50 p-5 rounded-xl">
              <h3 className="text-lg font-bold text-orange-500 mb-1">Priority 1 No Answer! (WhatsApp & SMS Sent)</h3>
              <p className="text-gray-300 text-sm mb-3">Calling Priority 2...<br/>Police fallback in: <span className="text-3xl font-bold text-white mt-1 block">{timeLeft}s</span></p>
              <button onClick={triggerPriority2} className="bg-orange-600 hover:bg-orange-700 text-white w-full py-2.5 rounded-lg font-bold mb-2 shadow-lg transition cursor-pointer text-sm">
                📞 Dial Priority 2 Now
              </button>
              <button onClick={() => { setStage('idle'); onClose(); }} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm transition cursor-pointer">
                Cancel (They Answered)
              </button>
            </div>
          )}

          {stage === 'police' && (
            <div className="bg-red-600/10 border border-red-600/50 p-5 rounded-xl">
              <h3 className="text-xl font-bold text-red-500 mb-1">NO ONE ANSWERED! (WhatsApp & SMS Sent)</h3>
              <p className="text-white text-sm mb-4">Redirecting to Police Emergency Services.</p>
              <button onClick={triggerPolice} className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] transition cursor-pointer">
                🚓 CALL POLICE (100)
              </button>
            </div>
          )}
        </div>

        {/* --- 2. CONFIGURATION DASHBOARD (Priority Numbers & Message) --- */}
        <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 shadow-inner mb-6 text-left">
          <h3 className="text-md font-bold text-white mb-3">⚙️ {t?.setupContactsTitle || "Setup Emergency Contacts"}</h3>
          
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div>
              <label className="block text-gray-400 text-xs mb-1">{t?.priority1Label || "Priority 1 Number (With Country Code e.g., +91 9876543210):"}</label>
              <input 
                type="tel" 
                value={priority1} 
                onChange={(e) => setPriority1(e.target.value)} 
                className="w-full bg-black border border-gray-700 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" 
                placeholder="+91 9876543210" 
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">{t?.priority2Label || "Priority 2 Number (With Country Code):"}</label>
              <input 
                type="tel" 
                value={priority2} 
                onChange={(e) => setPriority2(e.target.value)} 
                className="w-full bg-black border border-gray-700 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" 
                placeholder="+91 9898989898" 
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">{t?.customMessageLabel || "Custom Emergency Message:"}</label>
              <textarea 
                value={customMessage} 
                onChange={(e) => setCustomMessage(e.target.value)} 
                rows={2}
                className="w-full bg-black border border-gray-700 p-2.5 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" 
              />
            </div>

            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition cursor-pointer"
            >
              {isSaved ? "Saved Successfully! ✅" : (t?.saveContactsBtn || "Save Emergency Contacts")}
            </button>
            {statusLog && <span className="text-xs text-green-400 font-mono">{statusLog}</span>}
          </form>
        </div>

        {/* --- 3. STATIC HELPLINES --- */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-xs font-bold text-gray-400 mb-3 text-left">{t?.directHelplinesTitle || "Direct Helplines"}</h4>
          <div className="grid grid-cols-2 gap-2 text-left">
            <a href="tel:1091" className="p-2.5 bg-[#1C1C24] hover:bg-[#25252E] border border-white/5 rounded-xl transition group">
              <div className="text-sm font-black text-rose-400">1091</div>
              <div className="text-[11px] font-bold text-gray-200">{t?.womenHelplineDesc || "Women Helpline"}</div>
            </a>
            
            <a href="tel:112" className="p-2.5 bg-[#1C1C24] hover:bg-[#25252E] border border-white/5 rounded-xl transition group">
              <div className="text-sm font-black text-rose-400">112</div>
              <div className="text-[11px] font-bold text-gray-200">{t?.nationalPoliceDesc || "National Police"}</div>
            </a>

            <a href="tel:181" className="p-2.5 bg-[#1C1C24] hover:bg-[#25252E] border border-white/5 rounded-xl transition group">
              <div className="text-sm font-black text-indigo-400">181</div>
              <div className="text-[11px] font-bold text-gray-200">{t?.dishaDistressDesc || "Disha / Distress"}</div>
            </a>

            <a href="tel:1930" className="p-2.5 bg-[#1C1C24] hover:bg-[#25252E] border border-white/5 rounded-xl transition group">
              <div className="text-sm font-black text-indigo-400">1930</div>
              <div className="text-[11px] font-bold text-gray-200">{t?.cyberCrimeDesc || "Cyber Crime"}</div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};