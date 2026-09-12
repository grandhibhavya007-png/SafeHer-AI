// @ts-nocheck
import React from 'react';
import { Shield, AlertTriangle, FileText, LayoutDashboard, UserCheck, LogOut, PhoneCall, User as UserIcon, Lock } from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../LanguageContext';

interface NavbarProps {
  currentView: 'dashboard' | 'report' | 'my-complaints' | 'admin';
  setCurrentView: (view: 'dashboard' | 'report' | 'my-complaints' | 'admin') => void;
  currentUser: User | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onUserChanged: (user: User | null) => void;
  onOpenSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onUserChanged,
  onOpenSOS,
}) => {
  const { lang, setLang, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('safeher_current_user');
    onUserChanged(null);
  };

  const handleSwitchUserRole = (newRole: 'citizen' | 'admin') => {
    if (currentUser) {
      const updated: User = { ...currentUser, role: newRole };
      localStorage.setItem('safeher_current_user', JSON.stringify(updated));
      onUserChanged(updated);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0D0D10]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="https://i.ibb.co/cSFqKZW6/Screenshot-2026-09-04-160553.png"
                alt="SafeHer AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">
                SafeHer <span className="text-indigo-400 font-extrabold">AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-400">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'dashboard' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => setCurrentView('report')}
              className={`transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'report' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-indigo-400" />
              <span>{t.reportProblem}</span>
            </button>

            <button
              onClick={() => setCurrentView('my-complaints')}
              className={`transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'my-complaints' ? 'text-white border-b-2 border-indigo-500 font-semibold' : 'hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t.myComplaints}</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`transition-colors pb-1 flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-indigo-400 border-b-2 border-indigo-500 font-semibold' : 'hover:text-indigo-300'
              }`}
            >
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>{t.adminPortal}</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3">
            {/* Language Selector Dropdown */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as 'en' | 'te' | 'hi')}
              className="bg-[#1C1C24] text-white text-xs px-2.5 py-1.5 rounded-xl border border-white/10 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिंदी</option>
            </select>

            {/* SOS Trigger */}
            <button
              onClick={onOpenSOS}
              className="flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="font-extrabold">SOS</span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-white/10">
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center font-bold text-sm text-white shadow-md cursor-pointer">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </button>
                  <div className="absolute right-0 mt-2 w-56 py-2 bg-[#121217] border border-white/10 rounded-2xl shadow-2xl invisible group-hover:visible transition-all duration-150 z-50">
                    <div className="px-4 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="pt-1 border-t border-white/5">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#1C1C24] hover:bg-[#25252E] text-gray-200 border border-white/10 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};