import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Mail, User as UserIcon, Phone, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLoggedIn: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserLoggedIn,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { user } = await loginUser(email, password);
        onUserLoggedIn(user);
        onClose();
      } else {
        const { user } = await registerUser({
          name,
          email,
          password,
          phone,
          role,
          emergencyContactName: emergencyName,
          emergencyContactPhone: emergencyPhone,
        });
        onUserLoggedIn(user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'citizen' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      const demoEmail = demoRole === 'admin' ? 'admin@safeher.org' : 'priya@example.com';
      const { user } = await loginUser(demoEmail, 'safeher123');
      onUserLoggedIn(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#121217] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-[#1C1C24] to-transparent border-b border-white/5">
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-900/50">
              S
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">SafeHer AI Access</h2>
              <p className="text-xs text-gray-400">Secure, encrypted women's safety portal</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 mt-5 bg-[#09090B] rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-4 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/80 rounded-xl">
              {error}
            </div>
          )}

          {/* Quick 1-Click Demo Profiles */}
          <div className="p-3.5 bg-[#1C1C24] rounded-2xl border border-white/5 space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Instant 1-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen')}
                disabled={loading}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-200 bg-[#121217] hover:bg-[#25252E] border border-white/5 rounded-xl hover:border-indigo-500/50 transition text-left cursor-pointer"
              >
                <div>
                  <p className="font-bold text-white">Citizen User</p>
                  <p className="text-[10px] text-gray-400">Priya Sharma</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-200 bg-[#121217] hover:bg-[#25252E] border border-white/5 rounded-xl hover:border-indigo-500/50 transition text-left cursor-pointer"
              >
                <div>
                  <p className="font-bold text-indigo-300">Admin Officer</p>
                  <p className="text-[10px] text-gray-400">Inspector Varma</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-white/5"></div>
            <span className="absolute px-2 text-[10px] uppercase font-bold text-gray-500 bg-[#121217]">Or use email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#1C1C24] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Account Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('citizen')}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                        role === 'citizen'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-white/5 bg-[#1C1C24] text-gray-400'
                      }`}
                    >
                      <span>Citizen / Reporter</span>
                      {role === 'citizen' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 text-xs font-medium rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                        role === 'admin'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                          : 'border-white/5 bg-[#1C1C24] text-gray-400'
                      }`}
                    >
                      <span>Admin Officer</span>
                      {role === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1C1C24] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1C1C24] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="tel"
                        placeholder="+1 555-0192"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 bg-[#1C1C24] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">Emergency Contact</label>
                    <div className="relative">
                      <HeartHandshake className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="tel"
                        placeholder="+1 555-9999"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full pl-8 pr-2 py-2 bg-[#1C1C24] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/60 border border-indigo-500/40 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to SafeHer' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
