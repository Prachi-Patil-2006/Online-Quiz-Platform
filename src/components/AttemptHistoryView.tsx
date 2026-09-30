import React, { useState } from 'react';
import { UserAttempt } from '../types/quiz';

interface AttemptHistoryViewProps {
  attempts: UserAttempt[];
  onViewResult: (attempt: UserAttempt) => void;
  onNavigate: (view: string) => void;
}

export const AttemptHistoryView: React.FC<AttemptHistoryViewProps> = ({
  attempts,
  onViewResult,
  onNavigate,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = Array.from(new Set(attempts.map(a => a.quiz_category)));

  const filteredAttempts = attempts.filter(att => {
    if (categoryFilter !== 'All' && att.quiz_category !== categoryFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        att.quiz_title.toLowerCase().includes(q) ||
        att.quiz_category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <i className="fa-solid fa-clock-rotate-left"></i> Assessment History
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Your Quiz Attempts Log
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Audit and inspect all past test sessions, marks obtained, percentage scores, and detailed responses.
            </p>
          </div>

          <button
            onClick={() => onNavigate('quizzes')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Attempt New Quiz</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 mt-6">
          <div className="flex-1 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Search previous attempts..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs bg-white font-medium outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6">Quiz Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Difficulty</th>
                  <th className="py-4 px-4">Score</th>
                  <th className="py-4 px-4">Percentage</th>
                  <th className="py-4 px-4">Time Taken</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAttempts.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{att.quiz_title}</div>
                      <div className="text-xs text-slate-400">
                        {att.correct_answers} correct &bull; {att.wrong_answers} wrong &bull; {att.unanswered} skipped
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        {att.quiz_category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-semibold text-slate-600">
                        {att.quiz_difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {att.score} / {att.total_marks}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        att.percentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.percentage >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {formatTime(att.time_taken)}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(att.completed_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onViewResult(att)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <i className="fa-solid fa-eye text-[11px]"></i>
                        <span>View Result</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <i className="fa-solid fa-clock-rotate-left text-4xl text-slate-300 mb-3 block"></i>
            <h3 className="text-base font-bold text-slate-800">No Attempts Found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
              You haven't attempted any quizzes matching your filters yet. Start a quiz to build your history!
            </p>
            <button
              onClick={() => onNavigate('quizzes')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer"
            >
              Browse All Quizzes
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
