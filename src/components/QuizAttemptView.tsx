import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Question, UserAttempt } from '../types/quiz';
import { storageService } from '../services/storageService';

interface QuizAttemptViewProps {
  quiz: Quiz;
  onFinishQuiz: (attempt: UserAttempt) => void;
  onCancel: () => void;
}

export const QuizAttemptView: React.FC<QuizAttemptViewProps> = ({
  quiz,
  onFinishQuiz,
  onCancel,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}); // questionId -> choiceId
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  
  // Timer state
  const totalSeconds = (quiz.time_limit || 10) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const startTimeRef = useRef<string>(new Date().toISOString());
  const timerRef = useRef<any>(null);

  // Load questions for this quiz
  useEffect(() => {
    const qList = storageService.getQuestionsByQuizId(quiz.id);
    setQuestions(qList);
  }, [quiz.id]);

  // Countdown timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeTakenSeconds(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz.id]);

  const handleAutoSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Timeout alert
    const attempt = storageService.calculateAndSaveAttempt({
      quizId: quiz.id,
      userAnswersMap: selectedAnswers,
      timeTakenSeconds: totalSeconds,
      startedAt: startTimeRef.current,
    });
    onFinishQuiz(attempt);
  };

  const handleManualSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const attempt = storageService.calculateAndSaveAttempt({
      quizId: quiz.id,
      userAnswersMap: selectedAnswers,
      timeTakenSeconds,
      startedAt: startTimeRef.current,
    });
    onFinishQuiz(attempt);
  };

  const formatTimer = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <i className="fa-solid fa-triangle-exclamation text-amber-500 text-4xl mb-3"></i>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Questions Found</h3>
        <p className="text-slate-600 text-sm mb-6">
          This quiz doesn't have any questions configured yet.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm"
        >
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const isTimeCritical = secondsRemaining < 60;

  const handleSelectChoice = (choiceId: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: choiceId,
    }));
  };

  const handleClearChoice = () => {
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Sticky Header: Timer & Progress Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Quiz Title & Badges */}
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                {quiz.category}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {quiz.difficulty}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 truncate max-w-md">
              {quiz.title}
            </h2>
          </div>

          {/* Countdown Timer Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-mono shadow-xs transition-colors ${
                isTimeCritical
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <i className={`fa-solid fa-stopwatch ${isTimeCritical ? 'text-rose-600' : 'text-blue-600'}`}></i>
              <div className="text-xs">
                <span className="text-[10px] text-slate-400 block -mb-1 font-sans">TIME REMAINING</span>
                <span className="text-lg font-extrabold tracking-wider">{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-paper-plane text-xs"></i>
              <span className="hidden sm:inline">Finish &</span> Submit
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>
              Question <strong className="text-slate-900">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <span>
              Answered <strong className="text-emerald-600 font-bold">{answeredCount}</strong> of {questions.length} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Assessment Body: Left Question Card, Right Question Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Current Question Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                {currentQuestion.question_type}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                +{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
              </span>
              <button
                onClick={handleToggleFlag}
                className={`p-2 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                  flaggedQuestions[currentQuestion.id]
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Flag for later review"
              >
                <i className={`fa-solid fa-flag ${flaggedQuestions[currentQuestion.id] ? 'text-amber-600' : 'text-slate-400'}`}></i>
                <span className="hidden sm:inline">Review Later</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-slate-900 font-bold text-xl sm:text-2xl leading-relaxed">
            {currentQuestion.question_text}
          </div>

          {/* Answer Choices Selection */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select One Option:
            </span>

            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === choice.id;
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <label
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {currentQuestion.question_type === 'True/False' ? (
                      choice.choice_text === 'True' ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-xmark"></i>
                    ) : (
                      optionLetter
                    )}
                  </div>

                  <span className={`text-base flex-1 ${isSelected ? 'font-bold text-blue-900' : 'text-slate-700'}`}>
                    {choice.choice_text}
                  </span>

                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Action Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {selectedAnswers[currentQuestion.id] && (
                <button
                  onClick={handleClearChoice}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  <i className="fa-solid fa-eraser mr-1"></i> Clear Choice
                </button>
              )}

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Next</span>
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Review & Submit</span>
                  <i className="fa-solid fa-circle-check text-xs"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Question Navigation Palette */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 sticky top-44">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <i className="fa-solid fa-table-cells text-blue-600"></i>
              <span>Question Palette</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {questions.length} Total
            </span>
          </div>

          {/* Palette Grid */}
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = currentIndex === idx;
              const isFlagged = flaggedQuestions[q.id];

              let btnClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
              if (isCurrent) {
                btnClass = 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300 font-extrabold';
              } else if (isAnswered) {
                btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
              } else if (isFlagged) {
                btnClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full aspect-square rounded-xl text-xs font-bold border transition-all flex items-center justify-center relative cursor-pointer ${btnClass}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-500"></span>
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-600"></span>
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300"></span>
              <span>Flagged for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200"></span>
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-clipboard-check"></i>
              <span>Complete & Submit Quiz</span>
            </button>
          </div>
        </div>

      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-clipboard-question"></i>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Ready to Submit?</h3>
              <p className="text-xs text-slate-500">
                Please review your answer summary before finalizing your attempt.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-center border border-slate-100 text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Answered</span>
                <strong className="text-emerald-600 text-xl font-extrabold">{answeredCount}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Unanswered</span>
                <strong className="text-rose-600 text-xl font-extrabold">
                  {questions.length - answeredCount}
                </strong>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <i className="fa-solid fa-triangle-exclamation mr-1"></i>
                You have {questions.length - answeredCount} unanswered questions which will be scored as 0 marks.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
