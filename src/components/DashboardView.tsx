import React from 'react';
import { UserProfile, UserAttempt, Quiz } from '../types/quiz';

interface DashboardViewProps {
  currentUser: UserProfile;
  attempts: UserAttempt[];
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onViewResult: (attempt: UserAttempt) => void;
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  attempts,
  quizzes,
  onSelectQuiz,
  onViewResult,
  onNavigate,
}) => {
  const userAttempts = attempts.filter(a => a.user_id === currentUser.user.id);
  const totalAttempts = userAttempts.length;

  const totalScoreSum = userAttempts.reduce((sum, a) => sum + a.percentage, 0);
  const avgScore = totalAttempts > 0 ? Math.round(totalScoreSum / totalAttempts) : 0;
  const highestScore = userAttempts.length > 0 ? Math.max(...userAttempts.map(a => a.percentage)) : 0;
  const totalQuestionsAnswered = userAttempts.reduce(
    (sum, a) => sum + (a.correct_answers + a.wrong_answers),
    0
  );

  const attemptedQuizIds = new Set(userAttempts.map(a => a.quiz_id));
  const recommendedQuizzes = quizzes.filter(q => q.is_active && !attemptedQuizIds.has(q.id)).slice(0, 3);
  const recentAttempts = userAttempts.slice(0, 5);

  // Category breakdown stats for visual chart
  const categoryMap: Record<string, { total: number; scoreSum: number }> = {};
  userAttempts.forEach(att => {
    if (!categoryMap[att.quiz_category]) {
      categoryMap[att.quiz_category] = { total: 0, scoreSum: 0 };
    }
    categoryMap[att.quiz_category].total += 1;
    categoryMap[att.quiz_category].scoreSum += att.percentage;
  });

  const categoryEntries = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    count: data.total,
    avg: Math.round(data.scoreSum / data.total),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Student Profile Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <img
            src={currentUser.profile_image}
            alt={currentUser.user.username}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-400/50 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentUser.user.first_name} {currentUser.user.last_name || currentUser.user.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-bold text-xs">
                {currentUser.role}
              </span>
            </div>
            <p className="text-blue-200 text-sm">{currentUser.bio || 'Continuous learner preparing for academic evaluations.'}</p>
            <p className="text-blue-300/80 text-xs">
              <i className="fa-solid fa-envelope mr-1.5"></i> {currentUser.user.email} &bull; Member since{' '}
              {new Date(currentUser.user.date_joined).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition cursor-pointer"
          >
            <i className="fa-solid fa-user-pen mr-1.5"></i> Edit Profile
          </button>
          <button
            onClick={() => onNavigate('quizzes')}
            className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            <i className="fa-solid fa-play mr-1.5"></i> Attempt New Quiz
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-list-check"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quizzes Taken</span>
            <div className="text-3xl font-extrabold text-slate-900">{totalAttempts}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <div className="text-3xl font-extrabold text-emerald-600">{avgScore}%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-trophy"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Highest Score</span>
            <div className="text-3xl font-extrabold text-amber-600">{highestScore}%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <i className="fa-solid fa-circle-question"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Questions Answered</span>
            <div className="text-3xl font-extrabold text-slate-900">{totalQuestionsAnswered}</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Attempts & Performance Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Recent Attempts Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-blue-600"></i>
                <span>Recent Quiz Attempts</span>
              </h2>
              <p className="text-xs text-slate-500">Your most recently completed examinations</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
            >
              View Full History &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentAttempts.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">Quiz Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Percentage</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {recentAttempts.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {att.quiz_title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          {att.quiz_category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {att.score} / {att.total_marks}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          att.percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : att.percentage >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(att.completed_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onViewResult(att)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition cursor-pointer"
                        >
                          View Result
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <i className="fa-solid fa-clipboard-question text-4xl text-slate-300 mb-3 block"></i>
                <p className="text-sm font-semibold text-slate-700">No attempts recorded yet</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Select a quiz from the catalog to take your first assessment.
                </p>
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Browse Quizzes Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Performance Chart & Recommended */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Domain Breakdown Chart Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-emerald-600"></i>
              <span>Domain Proficiency</span>
            </h3>

            {categoryEntries.length > 0 ? (
              <div className="space-y-3 pt-2">
                {categoryEntries.map(cat => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{cat.category} ({cat.count} tests)</span>
                      <span className="font-bold text-slate-900">{cat.avg}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat.avg >= 75 ? 'bg-emerald-500' : cat.avg >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.avg}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-3">
                Complete assessments to generate domain proficiency metrics.
              </p>
            )}
          </div>

          {/* Recommended Quizzes */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-fire text-amber-500"></i>
              <span>Recommended For You</span>
            </h3>

            <div className="space-y-3">
              {recommendedQuizzes.map(quiz => (
                <div
                  key={quiz.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>{quiz.category}</span>
                    <span className="text-slate-600">{quiz.difficulty}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {quiz.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>{quiz.time_limit} mins &bull; {quiz.questions_count} Qs</span>
                    <button
                      onClick={() => onSelectQuiz(quiz)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                    >
                      Attempt &rarr;
                    </button>
                  </div>
                </div>
              ))}

              {recommendedQuizzes.length === 0 && (
                <p className="text-xs text-slate-500">
                  You've attempted all recommended tests! Check the full catalogue for more.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
