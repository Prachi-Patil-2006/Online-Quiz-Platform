import React, { useState } from 'react';
import { Quiz, Question, Category, UserAttempt, UserProfile } from '../types/quiz';

interface DjangoAdminViewProps {
  quizzes: Quiz[];
  questions: Question[];
  categories: Category[];
  attempts: UserAttempt[];
  users: UserProfile[];
  onNavigate: (view: string) => void;
}

export const DjangoAdminView: React.FC<DjangoAdminViewProps> = ({
  quizzes,
  questions,
  categories,
  attempts,
  users,
  onNavigate,
}) => {
  const [activeModel, setActiveModel] = useState<
    'Quizzes' | 'Questions' | 'Categories' | 'UserAttempts' | 'Users' | 'UserProfiles'
  >('Quizzes');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      
      {/* Django Admin Top Header */}
      <header className="bg-emerald-950 text-white px-6 py-3 border-b border-emerald-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-wider text-emerald-400 font-mono">
            DJANGO ADMINISTRATION
          </span>
          <span className="text-xs bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono">
            v5.0.7
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span>Welcome, <strong>admin (Superuser)</strong></span>
          <a
            href="#site"
            onClick={(e) => { e.preventDefault(); onNavigate('home'); }}
            className="text-emerald-300 hover:text-white underline"
          >
            View site
          </a>
          <button
            onClick={() => onNavigate('home')}
            className="text-rose-300 hover:text-rose-100 underline cursor-pointer"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="bg-emerald-900 text-white px-6 py-1.5 text-xs flex items-center gap-2">
        <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
        <span>&rsaquo;</span>
        <span className="text-emerald-200">Online Quiz Administration</span>
        <span>&rsaquo;</span>
        <span className="font-bold text-white">{activeModel}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Registered Apps & Models */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* ACCOUNTS APP */}
          <div className="border-b border-slate-100">
            <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5">
              Authentication and Authorization
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <button
                onClick={() => { setActiveModel('Users'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'Users' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Users</span>
                <span className="text-slate-400 font-mono">({users.length})</span>
              </button>
              <button
                onClick={() => { setActiveModel('UserProfiles'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'UserProfiles' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>User Profiles</span>
                <span className="text-slate-400 font-mono">({users.length})</span>
              </button>
            </div>
          </div>

          {/* QUIZZES APP */}
          <div className="border-b border-slate-100">
            <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5">
              Quizzes Application
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <button
                onClick={() => { setActiveModel('Quizzes'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'Quizzes' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Quizzes</span>
                <span className="text-slate-400 font-mono">({quizzes.length})</span>
              </button>
              <button
                onClick={() => { setActiveModel('Questions'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'Questions' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Questions</span>
                <span className="text-slate-400 font-mono">({questions.length})</span>
              </button>
              <button
                onClick={() => { setActiveModel('Categories'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'Categories' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Categories</span>
                <span className="text-slate-400 font-mono">({categories.length})</span>
              </button>
            </div>
          </div>

          {/* ATTEMPTS APP */}
          <div>
            <div className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5">
              Attempts & Grading Application
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <button
                onClick={() => { setActiveModel('UserAttempts'); setSearchTerm(''); }}
                className={`w-full px-4 py-2.5 text-left font-semibold flex items-center justify-between transition cursor-pointer ${
                  activeModel === 'UserAttempts' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>User Attempts</span>
                <span className="text-slate-400 font-mono">({attempts.length})</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Main Table: Django Change List */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Select {activeModel} to change
              </h2>
              <p className="text-xs text-slate-400">
                Managed via Django ORM ModelAdmin with list_display and list_filter
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-slate-300 text-xs outline-none focus:border-emerald-600"
              />
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded font-mono">
                Action: ---
              </span>
            </div>
          </div>

          {/* TABLE DISPLAY ACCORDING TO MODEL */}
          {activeModel === 'Quizzes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">ID</th>
                    <th className="p-2.5 border-r border-slate-200">Title</th>
                    <th className="p-2.5 border-r border-slate-200">Category</th>
                    <th className="p-2.5 border-r border-slate-200">Difficulty</th>
                    <th className="p-2.5 border-r border-slate-200">Time Limit</th>
                    <th className="p-2.5 border-r border-slate-200">Created By</th>
                    <th className="p-2.5">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {quizzes.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{q.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-800 font-sans">{q.title}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{q.category}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{q.difficulty}</td>
                      <td className="p-2.5 border-r border-slate-200">{q.time_limit} min</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{q.created_by.username}</td>
                      <td className="p-2.5 text-center font-bold">
                        {q.is_active ? <span className="text-emerald-600">✓</span> : <span className="text-rose-600">✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeModel === 'Questions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">ID</th>
                    <th className="p-2.5 border-r border-slate-200">Question Text</th>
                    <th className="p-2.5 border-r border-slate-200">Quiz ID</th>
                    <th className="p-2.5 border-r border-slate-200">Type</th>
                    <th className="p-2.5 border-r border-slate-200">Marks</th>
                    <th className="p-2.5">Choices Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {questions.map(quest => (
                    <tr key={quest.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{quest.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans text-slate-800 max-w-xs truncate">{quest.question_text}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold">{quest.quiz_id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{quest.question_type}</td>
                      <td className="p-2.5 border-r border-slate-200">{quest.marks}</td>
                      <td className="p-2.5">{quest.choices.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeModel === 'Categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">ID</th>
                    <th className="p-2.5 border-r border-slate-200">Category Name</th>
                    <th className="p-2.5 border-r border-slate-200">Slug</th>
                    <th className="p-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{c.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-emerald-800">{c.name}</td>
                      <td className="p-2.5 border-r border-slate-200">{c.slug}</td>
                      <td className="p-2.5 font-sans text-slate-600">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeModel === 'UserAttempts' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">ID</th>
                    <th className="p-2.5 border-r border-slate-200">Username</th>
                    <th className="p-2.5 border-r border-slate-200">Quiz Title</th>
                    <th className="p-2.5 border-r border-slate-200">Score</th>
                    <th className="p-2.5 border-r border-slate-200">%</th>
                    <th className="p-2.5 border-r border-slate-200">Correct/Wrong</th>
                    <th className="p-2.5">Completed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {attempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{att.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold font-sans text-slate-900">{att.username}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{att.quiz_title}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold">{att.score} / {att.total_marks}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold text-emerald-700">{att.percentage}%</td>
                      <td className="p-2.5 border-r border-slate-200">{att.correct_answers}C / {att.wrong_answers}W</td>
                      <td className="p-2.5">{new Date(att.completed_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeModel === 'Users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">ID</th>
                    <th className="p-2.5 border-r border-slate-200">Username</th>
                    <th className="p-2.5 border-r border-slate-200">Email</th>
                    <th className="p-2.5 border-r border-slate-200">First Name</th>
                    <th className="p-2.5 border-r border-slate-200">Role</th>
                    <th className="p-2.5">Staff Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{u.user.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold font-sans text-emerald-800">{u.user.username}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{u.user.email}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{u.user.first_name} {u.user.last_name}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans font-bold">{u.role}</td>
                      <td className="p-2.5 text-center font-bold">
                        {u.user.is_staff ? <span className="text-emerald-600">✓ Staff</span> : <span className="text-slate-400">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeModel === 'UserProfiles' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">Profile ID</th>
                    <th className="p-2.5 border-r border-slate-200">User (FK)</th>
                    <th className="p-2.5 border-r border-slate-200">Role</th>
                    <th className="p-2.5 border-r border-slate-200">Bio</th>
                    <th className="p-2.5">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-r border-slate-200 text-slate-400 font-bold">{u.id}</td>
                      <td className="p-2.5 border-r border-slate-200 font-bold font-sans text-emerald-800">{u.user.username}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans">{u.role}</td>
                      <td className="p-2.5 border-r border-slate-200 font-sans max-w-xs truncate">{u.bio || 'None'}</td>
                      <td className="p-2.5">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Showing all objects in database table</span>
            <span className="font-mono">SQLite (online_quiz.db)</span>
          </div>

        </div>

      </div>

    </div>
  );
};
