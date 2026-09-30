import React, { useState } from 'react';
import { UserProfile } from '../types/quiz';
import { storageService } from '../services/storageService';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'Student' | 'Creator'>('Student');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const users = storageService.getUsers();
    const matched = users.find(u => u.user.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!matched) {
      setErrorMessage('User not found. Use one of the demo accounts or register below.');
      return;
    }
    storageService.setCurrentUser(matched);
    onSuccess(matched);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const newUser = storageService.registerUser({
      username: regUsername.trim(),
      firstName: regFirstName.trim(),
      lastName: regLastName.trim(),
      email: regEmail.trim(),
      role: regRole,
    });

    onSuccess(newUser);
    onClose();
  };

  const handleQuickDemoLogin = (role: 'Student' | 'Creator') => {
    const user = storageService.switchUserRole(role);
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-blue-300 hover:text-white text-lg cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center mx-auto mb-2 text-xl shadow">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h3 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Sign In to QuizMaster' : 'Create New Account'}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {mode === 'login' ? 'Access tests, submissions & statistics' : 'Join as a student or quiz creator'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`py-3 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`py-3 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation shrink-0"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Quick 1-Click Demo Logins:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Student')}
                className="py-1.5 px-2 rounded-xl bg-white border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold transition cursor-pointer text-left"
              >
                <i className="fa-solid fa-user-graduate mr-1"></i> Student (Rahul)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Creator')}
                className="py-1.5 px-2 rounded-xl bg-white border border-amber-300 hover:bg-amber-500 hover:text-slate-950 text-amber-900 text-xs font-bold transition cursor-pointer text-left"
              >
                <i className="fa-solid fa-chalkboard-user mr-1"></i> Creator (Dr. Ananya)
              </button>
            </div>
          </div>

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="e.g. rahul_sharma"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition cursor-pointer"
              >
                Login to Account
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">First Name</label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={e => setRegFirstName(e.target.value)}
                    required
                    placeholder="First"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={e => setRegLastName(e.target.value)}
                    required
                    placeholder="Last"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Username</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  required
                  placeholder="Unique username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Role</label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                >
                  <option value="Student">Student (Attempt Quizzes)</option>
                  <option value="Creator">Quiz Creator / Teacher (Author Quizzes)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-0.5">Confirm</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition cursor-pointer mt-2"
              >
                Create Account
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
