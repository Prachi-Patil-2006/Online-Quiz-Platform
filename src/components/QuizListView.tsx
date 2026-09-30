import React, { useState, useMemo } from 'react';
import { Quiz, Category } from '../types/quiz';

interface QuizListViewProps {
  quizzes: Quiz[];
  categories: Category[];
  initialCategory?: string;
  onSelectQuiz: (quiz: Quiz) => void;
  onNavigate: (view: string) => void;
}

export const QuizListView: React.FC<QuizListViewProps> = ({
  quizzes,
  categories,
  initialCategory = 'All',
  onSelectQuiz,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'questions' | 'time'>('recent');
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      // Category filter
      if (selectedCategory !== 'All' && quiz.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && quiz.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = quiz.title.toLowerCase().includes(query);
        const matchesDesc = quiz.description.toLowerCase().includes(query);
        const matchesCat = quiz.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'questions') {
        return (b.questions_count || 0) - (a.questions_count || 0);
      }
      if (sortBy === 'time') {
        return a.time_limit - b.time_limit;
      }
      // default: recent
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [quizzes, selectedCategory, selectedDifficulty, searchQuery, sortBy]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Filter Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Browse Available Quizzes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select an assessment to test your knowledge or use filters to find topics.
            </p>
          </div>

          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by quiz title or topic..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Categories ({quizzes.length})
            </button>
            {categories.map(cat => {
              const count = quizzes.filter(q => q.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <i className={`${cat.icon} text-[11px]`}></i>
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Difficulty:
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 text-xs font-semibold">
                {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-white text-slate-900 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="questions">Most Questions</option>
                <option value="time">Time Limit (Lowest first)</option>
              </select>

              {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedDifficulty('All');
                    setSearchQuery('');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-xs"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map(quiz => (
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

              <h3 className="font-bold text-lg text-slate-900 mb-2">
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
                  By {quiz.created_by.full_name || quiz.created_by.username}
                </span>
                <span>
                  <i className="fa-solid fa-users text-slate-400 mr-1"></i>
                  {quiz.attempts_count || 0} attempts
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewQuiz(quiz)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  title="View Instructions"
                >
                  <i className="fa-solid fa-circle-info"></i>
                </button>
                <button
                  onClick={() => onSelectQuiz(quiz)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-play text-xs"></i>
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl mb-4">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Quizzes Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            We couldn't find any quizzes matching your search or filter options.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => onNavigate('creator')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Instructions & Preview Modal */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-900 text-white p-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-800 text-blue-200 mb-2 inline-block">
                    {previewQuiz.category} &bull; {previewQuiz.difficulty}
                  </span>
                  <h3 className="text-xl font-bold">{previewQuiz.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewQuiz(null)}
                  className="text-blue-300 hover:text-white text-lg p-1"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-700">
              <p className="text-sm leading-relaxed">{previewQuiz.description}</p>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">Questions</span>
                  <strong className="text-slate-900 text-sm">{previewQuiz.questions_count || 0}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Time Limit</span>
                  <strong className="text-slate-900 text-sm">{previewQuiz.time_limit} mins</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Marks</span>
                  <strong className="text-slate-900 text-sm">{previewQuiz.total_marks || previewQuiz.questions_count || 0}</strong>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <h4 className="font-bold flex items-center gap-1.5 text-amber-800">
                  <i className="fa-solid fa-circle-exclamation"></i> Assessment Rules:
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-amber-800/90">
                  <li>Timer starts immediately when you click <strong>Begin Assessment</strong>.</li>
                  <li>You can navigate questions freely and review flagged items before submitting.</li>
                  <li>When timer expires, answers are automatically submitted and calculated on backend.</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setPreviewQuiz(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const q = previewQuiz;
                    setPreviewQuiz(null);
                    onSelectQuiz(q);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-play text-xs"></i>
                  <span>Begin Assessment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
