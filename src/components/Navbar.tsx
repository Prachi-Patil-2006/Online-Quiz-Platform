import React, { useState } from 'react';
import { UserProfile } from '../types/quiz';
import { storageService } from '../services/storageService';

interface NavbarProps {
  currentUser: UserProfile;
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onUserChange: (user: UserProfile) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onOpenAuth,
  onUserChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoleSwitch = (role: 'Student' | 'Creator') => {
    const updated = storageService.switchUserRole(role);
    onUserChange(updated);
    setUserDropdownOpen(false);
  };

  const navItemClass = (viewName: string) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
      currentView === viewName
        ? 'bg-blue-700 text-white shadow-sm'
        : 'text-blue-100 hover:bg-blue-600/60 hover:text-white'
    }`;

  return (
    <nav className="bg-blue-900 border-b border-blue-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                <i className="fa-solid fa-graduation-cap text-xl"></i>
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  QuizMaster <span className="text-yellow-400 text-xs px-1.5 py-0.5 rounded bg-yellow-400/20 font-mono">PRO</span>
                </span>
                <span className="text-xs text-blue-200 block -mt-1 hidden sm:block">Online Quiz & Assessment System</span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <button onClick={() => onNavigate('home')} className={navItemClass('home')}>
                <i className="fa-solid fa-house text-xs"></i> Home
              </button>
              <button onClick={() => onNavigate('quizzes')} className={navItemClass('quizzes')}>
                <i className="fa-solid fa-list-check text-xs"></i> Browse Quizzes
              </button>
              <button onClick={() => onNavigate('dashboard')} className={navItemClass('dashboard')}>
                <i className="fa-solid fa-chart-line text-xs"></i> Dashboard
              </button>
              <button onClick={() => onNavigate('history')} className={navItemClass('history')}>
                <i className="fa-solid fa-clock-rotate-left text-xs"></i> Attempt History
              </button>
              
              {/* Creator Studio Link */}
              <button
                onClick={() => onNavigate('creator')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'creator'
                    ? 'bg-amber-500 text-slate-900 shadow-sm font-bold'
                    : 'text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <i className="fa-solid fa-plus-circle text-xs"></i> Quiz Creator
              </button>

              {/* Django Admin Link */}
              <button
                onClick={() => onNavigate('admin')}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  currentView === 'admin'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-300 hover:bg-emerald-700/30'
                }`}
                title="Django Admin Panel simulation"
              >
                <i className="fa-solid fa-shield-halved text-xs"></i> Django Admin
              </button>
            </div>
          </div>

          {/* Right Action: Code Inspector / Viva + User Menu */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('viva')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                currentView === 'viva'
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300'
                  : 'bg-blue-800/80 hover:bg-yellow-400 hover:text-slate-950 text-yellow-300 border-yellow-400/40'
              }`}
            >
              <i className="fa-solid fa-code text-xs"></i>
              <span>Django Code & Viva</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {/* User Profile / Quick Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-blue-800/70 hover:bg-blue-800 border border-blue-700 transition cursor-pointer"
              >
                <img
                  src={currentUser.profile_image}
                  alt={currentUser.user.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-400"
                />
                <div className="text-left text-xs leading-tight">
                  <span className="font-bold text-white block">
                    {currentUser.user.first_name || currentUser.user.username}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    currentUser.role === 'Creator' ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-400/20 text-blue-200'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <i className="fa-solid fa-chevron-down text-[10px] text-blue-300 ml-1"></i>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{currentUser.user.username}</p>
                    <span className="inline-block mt-1 text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                      {currentUser.role} Role
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-user-pen text-blue-600"></i> My Profile
                    </button>
                    <button
                      onClick={() => { onNavigate('dashboard'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-chart-pie text-emerald-600"></i> Performance Dashboard
                    </button>
                    <button
                      onClick={() => { onNavigate('creator'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-folder-plus text-amber-600"></i> Quiz Creator Studio
                    </button>
                  </div>

                  {/* Switch Demo Role */}
                  <div className="px-4 py-2 bg-slate-50 border-t border-b border-slate-100">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Switch Role (Demo Mode)
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleRoleSwitch('Student')}
                        className={`text-[11px] py-1 px-2 rounded font-semibold border ${
                          currentUser.role === 'Student'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Student (Rahul)
                      </button>
                      <button
                        onClick={() => handleRoleSwitch('Creator')}
                        className={`text-[11px] py-1 px-2 rounded font-semibold border ${
                          currentUser.role === 'Creator'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Creator (Prof. Kapoor)
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => { onOpenAuth('login'); setUserDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-right-from-bracket"></i> Switch / Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('viva')}
              className="px-2.5 py-1 text-xs font-bold bg-yellow-400 text-slate-900 rounded-lg flex items-center gap-1"
            >
              <i className="fa-solid fa-code"></i> Viva
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-950 border-t border-blue-800 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-100 hover:bg-blue-800"
          >
            <i className="fa-solid fa-house mr-2"></i> Home
          </button>
          <button
            onClick={() => { onNavigate('quizzes'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-100 hover:bg-blue-800"
          >
            <i className="fa-solid fa-list-check mr-2"></i> Browse Quizzes
          </button>
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-100 hover:bg-blue-800"
          >
            <i className="fa-solid fa-chart-line mr-2"></i> Dashboard
          </button>
          <button
            onClick={() => { onNavigate('history'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-100 hover:bg-blue-800"
          >
            <i className="fa-solid fa-clock-rotate-left mr-2"></i> Attempt History
          </button>
          <button
            onClick={() => { onNavigate('creator'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-amber-300 hover:bg-blue-800"
          >
            <i className="fa-solid fa-plus-circle mr-2"></i> Quiz Creator Studio
          </button>
          <button
            onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-emerald-300 hover:bg-blue-800"
          >
            <i className="fa-solid fa-shield-halved mr-2"></i> Django Admin View
          </button>
          <button
            onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-blue-100 hover:bg-blue-800"
          >
            <i className="fa-solid fa-user mr-2"></i> My Profile ({currentUser.user.username})
          </button>
        </div>
      )}
    </nav>
  );
};
