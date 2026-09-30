import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { UserAttempt } from '../types/quiz';

interface ResultViewProps {
  attempt: UserAttempt;
  onRetakeQuiz: (quizId: number) => void;
  onNavigate: (view: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  attempt,
  onRetakeQuiz,
  onNavigate,
}) => {
  const [filterAnswerStatus, setFilterAnswerStatus] = useState<'All' | 'Correct' | 'Wrong' | 'Unanswered'>('All');

  useEffect(() => {
    if (attempt.percentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [attempt.percentage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const filteredAnswers = (attempt.answers || []).filter(ans => {
    if (filterAnswerStatus === 'Correct') return ans.is_correct;
    if (filterAnswerStatus === 'Wrong') return !ans.is_correct && ans.selected_choice_id !== null;
    if (filterAnswerStatus === 'Unanswered') return ans.selected_choice_id === null;
    return true;
  });

  const getPerformanceRemark = (percentage: number) => {
    if (percentage >= 90) return { title: 'Outstanding Mastery!', desc: 'Exceptional grasp of concepts. Top tier performance.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (percentage >= 75) return { title: 'Great Job! Passed', desc: 'Well above the passing threshold. Strong foundational grasp.', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (percentage >= 50) return { title: 'Average Performance', desc: 'You passed the basics, but there are areas for improvement.', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { title: 'Needs More Practice', desc: 'Review the question explanations below and attempt the quiz again.', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const remark = getPerformanceRemark(attempt.percentage);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Completion Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden text-center">
        
        {/* Colorful Gradient Header */}
        <div className={`p-8 sm:p-10 text-white ${
          attempt.percentage >= 70
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : attempt.percentage >= 40
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
            : 'bg-gradient-to-r from-rose-600 to-pink-700'
        }`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3">
            <i className="fa-solid fa-circle-check"></i> Assessment Evaluated
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">Quiz Completed!</h1>
          <p className="text-white/90 text-sm sm:text-base font-medium max-w-md mx-auto">
            {attempt.quiz_title} &bull; <span className="opacity-80">{attempt.quiz_category}</span>
          </p>
        </div>

        {/* Score & Gauge Metrics */}
        <div className="p-6 sm:p-10 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Total Marks */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Final Score
              </span>
              <div className="text-4xl font-extrabold text-slate-900">
                {attempt.score} <span className="text-slate-400 text-2xl font-semibold">/ {attempt.total_marks}</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Marks Obtained</span>
            </div>

            {/* Percentage Circle / Badge */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Percentage
              </span>
              <div className={`text-5xl font-extrabold ${
                attempt.percentage >= 75 ? 'text-emerald-600' : attempt.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {attempt.percentage}%
              </div>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Formula: (Score / Total) &times; 100
              </span>
            </div>

            {/* Time Taken & Date */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Time Taken
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {formatTime(attempt.time_taken)}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {new Date(attempt.completed_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

          </div>

          {/* Performance Remark Card */}
          <div className={`p-4 rounded-2xl border text-sm flex items-center gap-3 text-left ${remark.color}`}>
            <div className="text-2xl shrink-0">
              <i className="fa-solid fa-award"></i>
            </div>
            <div>
              <h4 className="font-bold text-base">{remark.title}</h4>
              <p className="opacity-90 text-xs sm:text-sm">{remark.desc}</p>
            </div>
          </div>

          {/* 3 Pillars: Correct / Wrong / Unanswered */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <i className="fa-solid fa-circle-check text-xl mb-1 text-emerald-600"></i>
              <div className="text-2xl font-extrabold">{attempt.correct_answers}</div>
              <div className="text-xs font-semibold">Correct Answers</div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <i className="fa-solid fa-circle-xmark text-xl mb-1 text-rose-600"></i>
              <div className="text-2xl font-extrabold">{attempt.wrong_answers}</div>
              <div className="text-xs font-semibold">Wrong Answers</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
              <i className="fa-solid fa-circle-minus text-xl mb-1 text-slate-400"></i>
              <div className="text-2xl font-extrabold">{attempt.unanswered}</div>
              <div className="text-xs font-semibold">Unanswered</div>
            </div>
          </div>

          {/* Action Buttons as requested by prompt */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#answerReview"
              className="px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-eye"></i>
              <span>View Answers</span>
            </a>

            <button
              onClick={() => onRetakeQuiz(attempt.quiz_id)}
              className="px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('quizzes')}
              className="px-5 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-compass"></i>
              <span>Try Another Quiz</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Go to Dashboard</span>
            </button>
          </div>

        </div>
      </div>

      {/* Question-by-Question Detailed Review Section */}
      <div id="answerReview" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-list-check text-blue-600"></i>
              <span>Detailed Question Review</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your selected choices, correct answers, and conceptual explanations.
            </p>
          </div>

          {/* Filter answers tabs */}
          <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs font-semibold">
            {(['All', 'Correct', 'Wrong', 'Unanswered'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterAnswerStatus(tab)}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  filterAnswerStatus === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Answers List */}
        <div className="space-y-4">
          {filteredAnswers.map((ans, idx) => {
            const isUnanswered = ans.selected_choice_id === null;

            return (
              <div
                key={ans.id || idx}
                className={`p-5 rounded-2xl border transition-all ${
                  ans.is_correct
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : isUnanswered
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Question {idx + 1}
                  </span>
                  
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    ans.is_correct
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isUnanswered
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {ans.is_correct ? (
                      <><i className="fa-solid fa-check mr-1"></i> Correct (+{ans.marks_obtained} Mark)</>
                    ) : isUnanswered ? (
                      <><i className="fa-solid fa-minus mr-1"></i> Not Answered (0 Marks)</>
                    ) : (
                      <><i className="fa-solid fa-xmark mr-1"></i> Incorrect (0 Marks)</>
                    )}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-3">
                  {ans.question_text}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                  <div className={`p-3 rounded-xl border ${
                    ans.is_correct
                      ? 'bg-emerald-100/60 border-emerald-300 text-emerald-900'
                      : isUnanswered
                      ? 'bg-slate-100 border-slate-200 text-slate-600'
                      : 'bg-rose-100/60 border-rose-300 text-rose-900'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 mb-0.5">
                      Your Selected Answer:
                    </span>
                    <strong className="text-sm font-semibold">{ans.selected_choice_text}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-emerald-300 text-emerald-900 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                      <i className="fa-solid fa-circle-check mr-1"></i> Correct Answer:
                    </span>
                    <strong className="text-sm font-semibold">{ans.correct_choice_text}</strong>
                  </div>
                </div>

                {ans.explanation && (
                  <div className="p-3 bg-white/80 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <strong className="text-blue-700 flex items-center gap-1">
                      <i className="fa-solid fa-lightbulb"></i> Viva Insight / Explanation:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">{ans.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
