import React, { useState } from 'react';
import { Quiz, Question, Category, UserProfile } from '../types/quiz';
import { storageService } from '../services/storageService';

interface QuizCreatorViewProps {
  currentUser: UserProfile;
  quizzes: Quiz[];
  categories: Category[];
  onQuizUpdated: () => void;
  onPreviewQuiz: (quiz: Quiz) => void;
}

export const QuizCreatorView: React.FC<QuizCreatorViewProps> = ({
  currentUser,
  quizzes,
  categories,
  onQuizUpdated,
  onPreviewQuiz,
}) => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  // Form states for Quiz
  const [quizFormTitle, setQuizFormTitle] = useState('');
  const [quizFormDesc, setQuizFormDesc] = useState('');
  const [quizFormCategory, setQuizFormCategory] = useState(categories[0]?.name || 'Python');
  const [quizFormDifficulty, setQuizFormDifficulty] = useState<Quiz['difficulty']>('Medium');
  const [quizFormTimeLimit, setQuizFormTimeLimit] = useState(10);
  const [quizFormIsActive, setQuizFormIsActive] = useState(true);

  // Question modal states
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qType, setQType] = useState<'MCQ' | 'True/False'>('MCQ');
  const [qText, setQText] = useState('');
  const [qMarks, setQMarks] = useState(1);
  const [qExplanation, setQExplanation] = useState('');
  
  // MCQ 4 choices
  const [mcqChoices, setMcqChoices] = useState<string[]>(['', '', '', '']);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);
  
  // True/False choice
  const [tfCorrectValue, setTfCorrectValue] = useState<'True' | 'False'>('True');

  const [validationError, setValidationError] = useState<string>('');

  // Questions of currently selected quiz
  const currentQuestions = selectedQuiz ? storageService.getQuestionsByQuizId(selectedQuiz.id) : [];

  const handleOpenCreateQuiz = () => {
    setEditingQuiz(null);
    setQuizFormTitle('');
    setQuizFormDesc('');
    setQuizFormCategory(categories[0]?.name || 'Python');
    setQuizFormDifficulty('Medium');
    setQuizFormTimeLimit(10);
    setQuizFormIsActive(true);
    setValidationError('');
    setShowQuizModal(true);
  };

  const handleOpenEditQuiz = (q: Quiz) => {
    setEditingQuiz(q);
    setQuizFormTitle(q.title);
    setQuizFormDesc(q.description);
    setQuizFormCategory(q.category);
    setQuizFormDifficulty(q.difficulty);
    setQuizFormTimeLimit(q.time_limit);
    setQuizFormIsActive(q.is_active);
    setValidationError('');
    setShowQuizModal(true);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizFormTitle.trim()) {
      setValidationError('Please enter a quiz title.');
      return;
    }

    const saved = storageService.saveQuiz({
      id: editingQuiz ? editingQuiz.id : undefined,
      title: quizFormTitle.trim(),
      description: quizFormDesc.trim(),
      category: quizFormCategory,
      difficulty: quizFormDifficulty,
      time_limit: Number(quizFormTimeLimit) || 10,
      is_active: quizFormIsActive,
    });

    onQuizUpdated();
    setShowQuizModal(false);
    setSelectedQuiz(saved);
  };

  const handleDeleteQuiz = (quizId: number) => {
    if (confirm('Are you sure you want to delete this quiz and all associated questions?')) {
      storageService.deleteQuiz(quizId);
      if (selectedQuiz?.id === quizId) setSelectedQuiz(null);
      onQuizUpdated();
    }
  };

  const handleToggleActive = (quizId: number) => {
    storageService.toggleQuizStatus(quizId);
    onQuizUpdated();
    if (selectedQuiz?.id === quizId) {
      setSelectedQuiz(storageService.getQuizById(quizId) || null);
    }
  };

  // Question Management
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQType('MCQ');
    setQText('');
    setQMarks(1);
    setQExplanation('');
    setMcqChoices(['', '', '', '']);
    setMcqCorrectIndex(0);
    setTfCorrectValue('True');
    setValidationError('');
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (quest: Question) => {
    setEditingQuestion(quest);
    setQType(quest.question_type);
    setQText(quest.question_text);
    setQMarks(quest.marks);
    setQExplanation(quest.explanation || '');
    setValidationError('');

    if (quest.question_type === 'True/False') {
      const correctChoice = quest.choices.find(c => c.is_correct);
      setTfCorrectValue((correctChoice?.choice_text as 'True' | 'False') || 'True');
    } else {
      const texts = quest.choices.map(c => c.choice_text);
      while (texts.length < 4) texts.push('');
      setMcqChoices(texts.slice(0, 4));
      const cIdx = quest.choices.findIndex(c => c.is_correct);
      setMcqCorrectIndex(cIdx >= 0 ? cIdx : 0);
    }
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    if (!qText.trim()) {
      setValidationError('Question statement cannot be empty.');
      return;
    }

    let finalChoices: { id?: number; choice_text: string; is_correct: boolean }[] = [];

    if (qType === 'True/False') {
      finalChoices = [
        { choice_text: 'True', is_correct: tfCorrectValue === 'True' },
        { choice_text: 'False', is_correct: tfCorrectValue === 'False' },
      ];
    } else {
      // Validate 4 MCQ options
      const trimmed = mcqChoices.map(c => c.trim());
      if (trimmed.some(c => !c)) {
        setValidationError('All 4 MCQ answer choices must be filled.');
        return;
      }

      finalChoices = trimmed.map((text, idx) => ({
        choice_text: text,
        is_correct: idx === mcqCorrectIndex,
      }));
    }

    storageService.saveQuestion({
      id: editingQuestion ? editingQuestion.id : undefined,
      quiz_id: selectedQuiz.id,
      question_text: qText.trim(),
      question_type: qType,
      marks: Number(qMarks) || 1,
      explanation: qExplanation.trim(),
      choices: finalChoices,
    });

    onQuizUpdated();
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (confirm('Delete this question permanently?')) {
      storageService.deleteQuestion(questionId);
      onQuizUpdated();
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!selectedQuiz) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentQuestions.length) return;

    const reordered = [...currentQuestions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    storageService.reorderQuestions(selectedQuiz.id, reordered.map(q => q.id));
    onQuizUpdated();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-slate-950 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-xs font-extrabold uppercase tracking-wider mb-2 inline-block">
            <i className="fa-solid fa-chalkboard-user mr-1.5"></i> Academic Instructor & Creator Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">
            Quiz & Assessment Management
          </h1>
          <p className="text-slate-900 text-sm mt-1 max-w-xl font-medium">
            Design assessments, add MCQ and True/False questions, define correct answer keys, and manage student accessibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreateQuiz}
          className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-plus-circle text-amber-400"></i>
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Quizzes List (Master) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <i className="fa-solid fa-folder-tree text-amber-600"></i>
              <span>All Quizzes ({quizzes.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Select to manage</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {quizzes.map(quiz => {
              const isSelected = selectedQuiz?.id === quiz.id;
              return (
                <div
                  key={quiz.id}
                  onClick={() => setSelectedQuiz(quiz)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {quiz.category}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(quiz.id); }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                        quiz.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title="Click to toggle active state"
                    >
                      {quiz.is_active ? '● Active' : '○ Draft'}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
                    {quiz.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100/80 mt-2">
                    <span>
                      <i className="fa-solid fa-circle-question text-slate-400 mr-1"></i>
                      {quiz.questions_count || 0} Questions
                    </span>
                    <span>
                      <i className="fa-solid fa-clock text-slate-400 mr-1"></i>
                      {quiz.time_limit} mins
                    </span>
                    <span>
                      <i className="fa-solid fa-users text-slate-400 mr-1"></i>
                      {quiz.attempts_count || 0} attempts
                    </span>
                  </div>

                  {isSelected && (
                    <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-amber-200/60">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditQuiz(quiz); }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-[10px] mr-1"></i> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-[10px] mr-1"></i> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Questions Manager (Detail) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {selectedQuiz ? (
            <>
              {/* Selected Quiz Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {selectedQuiz.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {selectedQuiz.difficulty}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {selectedQuiz.time_limit} mins
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {selectedQuiz.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentQuestions.length} Questions configured &bull; Total Marks: {selectedQuiz.total_marks || currentQuestions.length}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewQuiz(selectedQuiz)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    title="Preview as student"
                  >
                    <i className="fa-solid fa-play text-xs text-blue-600"></i>
                    <span>Preview Test</span>
                  </button>
                  <button
                    onClick={handleOpenAddQuestion}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-xs"></i>
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {currentQuestions.map((quest, idx) => (
                  <div
                    key={quest.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {quest.question_type}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                          +{quest.marks} Mark{quest.marks > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Reorder and Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 border border-slate-200 cursor-pointer text-xs"
                          title="Move up"
                        >
                          <i className="fa-solid fa-arrow-up"></i>
                        </button>
                        <button
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === currentQuestions.length - 1}
                          className="p-1.5 rounded bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-600 border border-slate-200 cursor-pointer text-xs"
                          title="Move down"
                        >
                          <i className="fa-solid fa-arrow-down"></i>
                        </button>
                        <button
                          onClick={() => handleOpenEditQuestion(quest)}
                          className="p-1.5 rounded bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 cursor-pointer text-xs ml-1"
                          title="Edit question"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(quest.id)}
                          className="p-1.5 rounded bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 cursor-pointer text-xs"
                          title="Delete question"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-relaxed">
                      {quest.question_text}
                    </h4>

                    {/* Choices badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {quest.choices.map((c, cIdx) => (
                        <div
                          key={c.id || cIdx}
                          className={`p-2 px-3 rounded-xl border flex items-center justify-between ${
                            c.is_correct
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="truncate">{c.choice_text}</span>
                          {c.is_correct && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white shrink-0 ml-1">
                              Correct Key
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {quest.explanation && (
                      <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                        <strong className="text-blue-600">Explanation:</strong> {quest.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {currentQuestions.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                    <i className="fa-solid fa-circle-question text-3xl text-slate-300 mb-2 block"></i>
                    <h3 className="font-bold text-slate-800 text-sm">No Questions In This Quiz</h3>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      Add MCQ or True/False questions with correct answer keys.
                    </p>
                    <button
                      onClick={handleOpenAddQuestion}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                    >
                      <i className="fa-solid fa-plus mr-1"></i> Add First Question
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <i className="fa-solid fa-hand-pointer text-4xl text-slate-300 mb-3 block"></i>
              <h3 className="font-bold text-slate-700 text-base">Select a Quiz from the Left</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Or click "Create New Quiz" to author a brand new technical assessment.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Quiz Modal (Create / Edit) */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-500 text-slate-950 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black">
                  {editingQuiz ? 'Edit Quiz Details' : 'Create New Assessment'}
                </h3>
                <p className="text-xs text-slate-900 font-medium">Define metadata, timing, and category</p>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-950/70 hover:text-slate-950 text-lg cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="p-6 space-y-4 text-sm text-slate-700">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {validationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Quiz Title *
                </label>
                <input
                  type="text"
                  value={quizFormTitle}
                  onChange={e => setQuizFormTitle(e.target.value)}
                  placeholder="e.g. Python Core & Data Structures"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={quizFormDesc}
                  onChange={e => setQuizFormDesc(e.target.value)}
                  placeholder="Short syllabus or topics covered..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={quizFormCategory}
                    onChange={e => setQuizFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={quizFormDifficulty}
                    onChange={e => setQuizFormDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={quizFormTimeLimit}
                    onChange={e => setQuizFormTimeLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-amber-500 outline-none text-xs"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quizFormIsActive}
                      onChange={e => setQuizFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Active & Published</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow transition cursor-pointer"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal (Add / Edit) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">
                  {editingQuestion ? 'Edit Question' : 'Add Question'}
                </h3>
                <p className="text-xs text-slate-400">
                  Quiz: {selectedQuiz?.title}
                </p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-sm text-slate-700">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Question Type
                  </label>
                  <select
                    value={qType}
                    onChange={e => setQType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    <option value="MCQ">Multiple Choice (MCQ)</option>
                    <option value="True/False">True / False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={qMarks}
                    onChange={e => setQMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Question Statement *
                </label>
                <textarea
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="Enter the problem or test statement..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* MCQ Options with Radio to mark the correct choice */}
              {qType === 'MCQ' ? (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Choices (Radio marks the correct answer):
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      4 Options
                    </span>
                  </div>

                  {mcqChoices.map((choice, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-slate-200 shrink-0">
                        <input
                          type="radio"
                          name="mcq_correct_radio"
                          checked={mcqCorrectIndex === idx}
                          onChange={() => setMcqCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-600 cursor-pointer"
                          title="Mark this as correct answer"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={choice}
                        onChange={e => {
                          const copy = [...mcqChoices];
                          copy[idx] = e.target.value;
                          setMcqChoices(copy);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              ) : (
                /* True/False Selector */
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                    Correct Truth Value:
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_correct_val"
                        checked={tfCorrectValue === 'True'}
                        onChange={() => setTfCorrectValue('True')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <span className="font-bold text-emerald-700 text-sm">True</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_correct_val"
                        checked={tfCorrectValue === 'False'}
                        onChange={() => setTfCorrectValue('False')}
                        className="w-4 h-4 text-rose-600"
                      />
                      <span className="font-bold text-rose-700 text-sm">False</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Explanation / Viva Solution Note (Optional)
                </label>
                <textarea
                  value={qExplanation}
                  onChange={e => setQExplanation(e.target.value)}
                  placeholder="Shown to learners on result review..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
