import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">QuizMaster Pro</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Full-stack Online Quiz Management and Assessment System designed for colleges, universities, and academic viva evaluations. Features timed assessments, server-side score calculation, and role-based management.
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs font-mono text-slate-400">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Python Django</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">SQLite / Postgres</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Bootstrap 5</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Vanilla JS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('quizzes')} className="hover:text-white transition">
                  Browse All Quizzes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition">
                  Learner Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-white transition">
                  Attempt History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('creator')} className="hover:text-white transition text-amber-400">
                  Quiz Creator Studio
                </button>
              </li>
            </ul>
          </div>

          {/* College Viva & Resources */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Viva & Academic</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => onNavigate('viva')} className="text-yellow-400 hover:text-yellow-300 font-semibold transition flex items-center gap-1.5">
                  <i className="fa-solid fa-code"></i> Django Source & Viva Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white transition flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved"></i> Django Admin Simulation
                </button>
              </li>
              <li className="pt-2">
                <span className="text-xs text-slate-500 block">Server status:</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ready for Exam / Viva Evaluation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} Online Quiz Management and Assessment System. All rights reserved.</span>
          <span>Designed for university undergraduate final year project & viva presentation.</span>
        </div>
      </div>
    </footer>
  );
};
