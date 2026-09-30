import React from 'react';
import { Quiz, Category } from '../types/quiz';

interface HomeViewProps {
  quizzes: Quiz[];
  categories: Category[];
  totalAttemptsCount: number;
  onNavigate: (view: string, param?: any) => void;
  onSelectQuiz: (quiz: Quiz) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  quizzes,
  categories,
  totalAttemptsCount,
  onNavigate,
  onSelectQuiz,
}) => {
  const activeQuizzes = quizzes.filter(q => q.is_active);
  const featuredQuizzes = activeQuizzes.slice(0, 6);
  const totalQuestions = quizzes.reduce((sum, q) => sum + (q.questions_count || 0), 0);

  const getDifficultyBadge = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Hard':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 lg:py-24 shadow-inner">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-wider">
                <i className="fa-solid fa-bolt"></i> Interactive Assessment Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Test Your Knowledge.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-amber-300">
                  Improve Your Skills.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Create and attempt quizzes, track your performance, and improve your knowledge through interactive assessments with real-time feedback and server-verified score calculations.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('quizzes')}
                  className="px-6 py-3.5 rounded-xl font-bold bg-yellow-400 text-slate-950 hover:bg-yellow-300 shadow-lg hover:shadow-yellow-400/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-compass"></i>
                  <span>Explore Quizzes</span>
                </button>

                <button
                  onClick={() => onNavigate('creator')}
                  className="px-6 py-3.5 rounded-xl font-bold bg-blue-700/80 hover:bg-blue-600 text-white border border-blue-400/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-plus-circle"></i>
                  <span>Create Quiz</span>
                </button>

                <button
                  onClick={() => onNavigate('viva')}
                  className="px-4 py-3.5 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  <i className="fa-solid fa-code text-yellow-300"></i>
                  <span>Inspect Django Code & Viva</span>
                </button>
              </div>

              {/* Verified Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-blue-200/80">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-emerald-400"></i> Server-Side Score Security
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-stopwatch text-amber-400"></i> Timed MCQ & True/False
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-chart-column text-blue-300"></i> Immediate Viva Analytics
                </span>
              </div>
            </div>

            {/* Right Column: Live Stats Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Platform Metrics</span>
                    <h3 className="text-xl font-bold text-slate-900">Live Academic Activity</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-blue-600 text-lg mb-1"><i className="fa-solid fa-book-open"></i></div>
                    <div className="text-3xl font-extrabold text-slate-900">{activeQuizzes.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Available Quizzes</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-emerald-600 text-lg mb-1"><i className="fa-solid fa-circle-question"></i></div>
                    <div className="text-3xl font-extrabold text-slate-900">{totalQuestions}</div>
                    <div className="text-xs text-slate-500 font-medium">Verified Questions</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-amber-600 text-lg mb-1"><i className="fa-solid fa-layer-group"></i></div>
                    <div className="text-3xl font-extrabold text-slate-900">{categories.length}</div>
                    <div className="text-xs text-slate-500 font-medium">Technical Categories</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-purple-600 text-lg mb-1"><i className="fa-solid fa-award"></i></div>
                    <div className="text-3xl font-extrabold text-slate-900">{totalAttemptsCount}</div>
                    <div className="text-xs text-slate-500 font-medium">Assessments Taken</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onNavigate('quizzes')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Browse All Available Quizzes</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            System Highlights
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Engineered for Academic Rigor & College Viva
          </h2>
          <p className="text-slate-600 text-base mt-2">
            Every feature is architected cleanly using Django MVC/MVT patterns, making it easy to explain to examiners and practical for real-world testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-laptop-code"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Interactive Quizzes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time countdown timer, question palette, next/previous buttons, choice highlight, and review modal without unnecessary page reloading.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-shapes"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Multiple Categories</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organized into computer science domains including Python, Java, HTML/CSS, JavaScript, SQL, Electronics, Aptitude, and General Knowledge.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-gauge-high"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Difficulty Levels</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Quizzes are classified into Easy, Medium, and Hard, letting learners progressively test fundamentals before tackling advanced concepts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-server"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Server-Side Calculation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tamper-proof score evaluation: correct answers are checked against backend database models with atomic safety and percentage computation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-chart-line"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Performance Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Comprehensive student dashboard with total quizzes attempted, average score, highest scores, and complete historical log with review breakdowns.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-4">
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-1.5">Quiz Creator Management</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dedicated instructor tools to create quizzes, add MCQ (4 choices with correct flag) or True/False questions, and manage active status.
            </p>
          </div>

        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-sm text-slate-500">Select a technical domain to filter corresponding assessments.</p>
          </div>
          <button
            onClick={() => onNavigate('quizzes')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition mt-2 sm:mt-0 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Quizzes</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => {
            const catQuizzesCount = quizzes.filter(q => q.category === cat.name && q.is_active).length;
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('quizzes', { category: cat.name })}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white shadow-sm group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: cat.color }}
                  >
                    <i className={cat.icon}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      {{ ...cat }.name}
                    </h4>
                    <span className="text-xs text-slate-500">{catQuizzesCount} Quizzes</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Quizzes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Featured Tests</span>
            <h2 className="text-2xl font-bold text-slate-900">Popular Assessments</h2>
          </div>
          <button
            onClick={() => onNavigate('quizzes')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition mt-2 sm:mt-0 cursor-pointer"
          >
            See All {activeQuizzes.length} Quizzes &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {quiz.category}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
                  {quiz.description}
                </p>

                {/* Metrics pill */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center text-xs text-slate-600 mb-4 border border-slate-100">
                  <div>
                    <span className="block text-slate-400 text-[10px]">Questions</span>
                    <strong className="text-slate-900">{quiz.questions_count || 0} Qs</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">Time Limit</span>
                    <strong className="text-slate-900">{quiz.time_limit} mins</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px]">Total Marks</span>
                    <strong className="text-slate-900">{quiz.total_marks || quiz.questions_count || 0}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                  <span className="truncate">
                    <i className="fa-solid fa-user-tie text-slate-400 mr-1"></i>
                    {quiz.created_by.full_name || quiz.created_by.username}
                  </span>
                  <span>
                    <i className="fa-solid fa-users text-slate-400 mr-1"></i>
                    {quiz.attempts_count || 0} attempts
                  </span>
                </div>

                <button
                  onClick={() => onSelectQuiz(quiz)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-play text-xs"></i>
                  <span>Start Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* College Viva & Architecture Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/30">
              For University Viva & Final Year Project
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Complete Django Source Code & Viva Cheat Sheet
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore the entire Python Django codebase, models, views, forms, and templates directly in the browser. Includes answers to the top 20 questions examiners ask in viva!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('viva')}
              className="px-6 py-3 rounded-xl font-bold bg-yellow-400 text-slate-950 hover:bg-yellow-300 shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-code"></i>
              <span>Open Viva & Code Explorer</span>
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="px-5 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-shield-halved text-emerald-400"></i>
              <span>Django Admin View</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
