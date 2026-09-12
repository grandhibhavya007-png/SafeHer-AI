import React, { useState, useEffect } from 'react';

export const EmergencySettings = () => {
  const [priority1, setPriority1] = useState('');
  const [priority2, setPriority2] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Load numbers if already saved
  useEffect(() => {
    setPriority1(localStorage.getItem('priority1') || '');
    setPriority2(localStorage.getItem('priority2') || '');
  }, []);

  // Save numbers dynamically
  const handleSave = () => {
    localStorage.setItem('priority1', priority1);
    localStorage.setItem('priority2', priority2);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-[#18181B] border border-white/10 rounded-xl p-6 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-white mb-4">⚙️ Setup Emergency Contacts</h2>
      
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-gray-400 text-sm">Priority 1 Number (e.g., Father):</label>
          <input 
            type="tel" 
            value={priority1} 
            onChange={(e) => setPriority1(e.target.value)} 
            className="w-full bg-black border border-gray-700 p-3 rounded-lg mt-1 text-white focus:outline-none focus:border-indigo-500" 
            placeholder="Enter Number" 
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm">Priority 2 Number (e.g., Mother):</label>
          <input 
            type="tel" 
            value={priority2} 
            onChange={(e) => setPriority2(e.target.value)} 
            className="w-full bg-black border border-gray-700 p-3 rounded-lg mt-1 text-white focus:outline-none focus:border-indigo-500" 
            placeholder="Enter Number" 
          />
        </div>

        <button 
          onClick={handleSave} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition"
        >
          {isSaved ? "Contacts Saved Successfully! ✅" : "Save Emergency Contacts"}
        </button>
      </div>
    </div>
  );
};