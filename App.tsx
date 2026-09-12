// @ts-nocheck
import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { DashboardView } from './components/DashboardView';
import { ReportProblemWizard } from './components/ReportProblem/ReportProblemWizard';
import { MyComplaintsView } from './components/MyComplaintsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import Resources from './components/Resources';
import { Complaint, InputType, User } from './types';
import { getCurrentUser } from './services/api';

// మెయిన్ యాప్ కంటెంట్ (ఇక్కడ అన్ని హుక్స్ కాంపోనెంట్ లోపల ఉంటాయి)
function MainContent() {
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<'dashboard' | 'report' | 'my-complaints' | 'admin' | 'resources' | 'quick-grid'>('dashboard');
  const [preferredInputType, setPreferredInputType] = useState<InputType>('text');

  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [lastSubmittedComplaint, setLastSubmittedComplaint] = useState<Complaint | null>(null);

  const handleUserChanged = (user: User | null) => {
    setCurrentUser(user);
  };

  const handleOpenLogin = () => {
    setAuthInitialMode('login');
    setIsAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthInitialMode('register');
    setIsAuthOpen(true);
  };

  const handleNavigateToReport = (type: InputType = 'text') => {
    setPreferredInputType(type);
    setCurrentView('report');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-gray-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onUserChanged={handleUserChanged}
        onOpenSOS={() => setIsSOSOpen(true)}
      />

      {/* Quick Testing Bar */}
      <div className="bg-indigo-950/40 border-b border-indigo-900/50 py-2 px-4 text-center">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 text-xs font-medium">
          <span className="text-gray-400">{t.quickSwitch}</span>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1 rounded transition ${currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {t.dashboard}
          </button>
          <button 
            onClick={() => setCurrentView('resources')}
            className={`px-3 py-1 rounded transition ${currentView === 'resources' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            🧑‍✈️ {t.projectHub}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'quick-grid' && (
          <DashboardView
            currentUser={currentUser}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToComplaints={() => setCurrentView('my-complaints')}
            onNavigateToAdmin={() => setCurrentView('admin')}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenAuth={handleOpenLogin}
          />
        )}
        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            onNavigateToReport={handleNavigateToReport}
            onNavigateToComplaints={() => setCurrentView('my-complaints')}
            onNavigateToAdmin={() => setCurrentView('admin')}
            onOpenSOS={() => setIsSOSOpen(true)}
            onOpenAuth={handleOpenLogin}
          />
        )}

        {currentView === 'report' && (
          <ReportProblemWizard
            currentUser={currentUser}
            onComplaintSubmitted={(complaint) => {
              setLastSubmittedComplaint(complaint);
            }}
            onViewMyComplaints={() => setCurrentView('my-complaints')}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'my-complaints' && (
          <MyComplaintsView
            currentUser={currentUser}
            onNavigateToReport={() => handleNavigateToReport('text')}
            onOpenAuth={handleOpenLogin}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            currentUser={currentUser}
            onOpenAuth={handleOpenLogin}
          />
        )}

        {currentView === 'resources' && (
          <Resources />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-white/5 bg-[#09090B] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t.footerText}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="hover:text-gray-300 transition cursor-pointer"
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setCurrentView('resources')}
              className="hover:text-gray-300 transition text-indigo-400 font-semibold cursor-pointer"
            >
              {t.projectHub}
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className="hover:text-gray-300 transition cursor-pointer"
            >
              {t.adminConsole}
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserLoggedIn={handleUserChanged}
        initialMode={authInitialMode}
      />

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

// మెయిన్ ఎక్స్పోర్ట్
export default function App() {
  return (
    <LanguageProvider>
      <MainContent />
    </LanguageProvider>
  );
}