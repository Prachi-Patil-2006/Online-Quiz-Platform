import { Category, Quiz, Question, Choice, UserProfile, UserAttempt, UserAnswer } from '../types/quiz';
import { INITIAL_CATEGORIES, INITIAL_QUIZZES, INITIAL_QUESTIONS, INITIAL_ATTEMPTS, INITIAL_USERS } from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'oqm_current_user_v1',
  USERS: 'oqm_users_v1',
  CATEGORIES: 'oqm_categories_v1',
  QUIZZES: 'oqm_quizzes_v1',
  QUESTIONS: 'oqm_questions_v1',
  ATTEMPTS: 'oqm_attempts_v1',
};

class StorageService {
  // Current user session
  getCurrentUser(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse current user', e);
    }
    // Default to Rahul Sharma (Student)
    const defaultUser = INITIAL_USERS[0];
    this.setCurrentUser(defaultUser);
    return defaultUser;
  }

  setCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  switchUserRole(role: 'Student' | 'Creator' | 'Admin'): UserProfile {
    const allUsers = this.getUsers();
    let target = allUsers.find(u => u.role === role);
    if (!target) {
      if (role === 'Creator' || role === 'Admin') {
        target = INITIAL_USERS[1];
      } else {
        target = INITIAL_USERS[0];
      }
    }
    this.setCurrentUser(target);
    return target;
  }

  getUsers(): UserProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  updateUserProfile(updatedProfile: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedProfile.id);
    if (index !== -1) {
      users[index] = updatedProfile;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    this.setCurrentUser(updatedProfile);
  }

  registerUser(data: { username: string; email: string; firstName: string; lastName: string; role?: 'Student' | 'Creator' }): UserProfile {
    const users = this.getUsers();
    const newId = Date.now();
    const newUser: UserProfile = {
      id: newId,
      user: {
        id: newId,
        username: data.username,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        date_joined: new Date().toISOString(),
        is_staff: data.role === 'Creator',
      },
      profile_image: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: 'Lifelong learner ready to explore new technical domains.',
      role: data.role || 'Student',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  // Categories
  getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }

  addCategory(name: string, description: string): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      id: Date.now(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || `Quizzes on ${name}`,
      icon: 'fa-solid fa-graduation-cap',
      color: '#3B82F6',
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCat;
  }

  // Quizzes
  getQuizzes(): Quiz[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (stored) {
        const quizzes: Quiz[] = JSON.parse(stored);
        const questions = this.getQuestions();
        // Dynamically compute questions_count and total_marks
        return quizzes.map(q => {
          const qQuestions = questions.filter(quest => quest.quiz_id === q.id);
          const totalMarks = qQuestions.reduce((sum, item) => sum + item.marks, 0);
          return {
            ...q,
            questions_count: qQuestions.length,
            total_marks: totalMarks,
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
    return INITIAL_QUIZZES;
  }

  getQuizById(id: number): Quiz | undefined {
    return this.getQuizzes().find(q => q.id === id);
  }

  saveQuiz(quizData: Partial<Quiz> & { title: string; category: string; difficulty: Quiz['difficulty']; time_limit: number; description: string }): Quiz {
    const quizzes = this.getQuizzes();
    const currentUser = this.getCurrentUser();
    
    if (quizData.id) {
      // Update
      const index = quizzes.findIndex(q => q.id === quizData.id);
      if (index !== -1) {
        quizzes[index] = {
          ...quizzes[index],
          ...quizData,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
        return quizzes[index];
      }
    }

    // Create new
    const newQuiz: Quiz = {
      id: Date.now(),
      title: quizData.title,
      description: quizData.description,
      category: quizData.category,
      difficulty: quizData.difficulty,
      time_limit: quizData.time_limit || 10,
      created_by: {
        id: currentUser.user.id,
        username: currentUser.user.username,
        full_name: `${currentUser.user.first_name} ${currentUser.user.last_name}`.trim() || currentUser.user.username,
      },
      is_active: quizData.is_active !== undefined ? quizData.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions_count: 0,
      total_marks: 0,
      attempts_count: 0,
    };

    quizzes.unshift(newQuiz);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    return newQuiz;
  }

  deleteQuiz(id: number): void {
    const quizzes = this.getQuizzes().filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));

    // Also remove associated questions
    const questions = this.getQuestions().filter(q => q.quiz_id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  toggleQuizStatus(id: number): Quiz | undefined {
    const quizzes = this.getQuizzes();
    const quiz = quizzes.find(q => q.id === id);
    if (quiz) {
      quiz.is_active = !quiz.is_active;
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    }
    return quiz;
  }

  // Questions
  getQuestions(): Question[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
    return INITIAL_QUESTIONS;
  }

  getQuestionsByQuizId(quizId: number): Question[] {
    return this.getQuestions()
      .filter(q => q.quiz_id === quizId)
      .sort((a, b) => a.order - b.order);
  }

  saveQuestion(questionData: {
    id?: number;
    quiz_id: number;
    question_text: string;
    question_type: Question['question_type'];
    marks: number;
    order?: number;
    explanation?: string;
    choices: { id?: number; choice_text: string; is_correct: boolean }[];
  }): Question {
    const questions = this.getQuestions();
    
    // Ensure at least one choice is marked correct
    const hasCorrect = questionData.choices.some(c => c.is_correct);
    if (!hasCorrect && questionData.choices.length > 0) {
      questionData.choices[0].is_correct = true;
    }

    if (questionData.id) {
      // Edit
      const index = questions.findIndex(q => q.id === questionData.id);
      if (index !== -1) {
        const updatedChoices: Choice[] = questionData.choices.map((c, i) => ({
          id: c.id || Date.now() + i,
          question_id: questionData.id!,
          choice_text: c.choice_text,
          is_correct: c.is_correct,
        }));

        questions[index] = {
          ...questions[index],
          question_text: questionData.question_text,
          question_type: questionData.question_type,
          marks: questionData.marks,
          order: questionData.order ?? questions[index].order,
          explanation: questionData.explanation,
          choices: updatedChoices,
        };

        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
        return questions[index];
      }
    }

    // Add new
    const newQId = Date.now();
    const quizQuestions = questions.filter(q => q.quiz_id === questionData.quiz_id);
    const nextOrder = questionData.order ?? (quizQuestions.length + 1);

    const newChoices: Choice[] = questionData.choices.map((c, i) => ({
      id: newQId * 10 + i,
      question_id: newQId,
      choice_text: c.choice_text,
      is_correct: c.is_correct,
    }));

    const newQuestion: Question = {
      id: newQId,
      quiz_id: questionData.quiz_id,
      question_text: questionData.question_text,
      question_type: questionData.question_type,
      marks: questionData.marks || 1,
      order: nextOrder,
      explanation: questionData.explanation || '',
      created_at: new Date().toISOString(),
      choices: newChoices,
    };

    questions.push(newQuestion);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return newQuestion;
  }

  deleteQuestion(questionId: number): void {
    const questions = this.getQuestions().filter(q => q.id !== questionId);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  reorderQuestions(quizId: number, orderedIds: number[]): void {
    const questions = this.getQuestions();
    orderedIds.forEach((id, index) => {
      const q = questions.find(item => item.id === id);
      if (q) {
        q.order = index + 1;
      }
    });
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }

  // Attempts & Score Calculation (Server-side equivalent simulation)
  getAttempts(): UserAttempt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(INITIAL_ATTEMPTS));
    return INITIAL_ATTEMPTS;
  }

  getAttemptsByUser(userId: number): UserAttempt[] {
    return this.getAttempts().filter(a => a.user_id === userId);
  }

  getAttemptById(attemptId: number): UserAttempt | undefined {
    return this.getAttempts().find(a => a.id === attemptId);
  }

  /**
   * Submit Quiz and perform secure score calculation on backend.
   * Compares selected answers with stored questions choices.
   */
  calculateAndSaveAttempt(params: {
    quizId: number;
    userAnswersMap: Record<number, number>; // questionId -> selectedChoiceId
    timeTakenSeconds: number;
    startedAt: string;
  }): UserAttempt {
    const currentUser = this.getCurrentUser();
    const quiz = this.getQuizById(params.quizId);
    if (!quiz) throw new Error('Quiz not found');

    const questions = this.getQuestionsByQuizId(params.quizId);
    let totalMarks = 0;
    let marksObtained = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    const answerRecords: UserAnswer[] = [];
    const attemptId = Date.now();

    for (const question of questions) {
      totalMarks += question.marks;
      const selectedChoiceId = params.userAnswersMap[question.id] ?? null;
      const correctChoice = question.choices.find(c => c.is_correct);
      const correctText = correctChoice ? correctChoice.choice_text : 'N/A';

      if (selectedChoiceId === null || selectedChoiceId === undefined) {
        unansweredCount++;
        answerRecords.push({
          id: Date.now() + question.id,
          attempt_id: attemptId,
          question_id: question.id,
          question_text: question.question_text,
          selected_choice_id: null,
          selected_choice_text: 'Unanswered',
          correct_choice_text: correctText,
          is_correct: false,
          marks_obtained: 0,
          max_marks: question.marks,
          explanation: question.explanation,
        });
      } else {
        const userChoice = question.choices.find(c => c.id === selectedChoiceId);
        const isChoiceCorrect = userChoice ? userChoice.is_correct : false;

        if (isChoiceCorrect) {
          correctCount++;
          marksObtained += question.marks;
        } else {
          wrongCount++;
        }

        answerRecords.push({
          id: Date.now() + question.id,
          attempt_id: attemptId,
          question_id: question.id,
          question_text: question.question_text,
          selected_choice_id: selectedChoiceId,
          selected_choice_text: userChoice ? userChoice.choice_text : 'Invalid choice',
          correct_choice_text: correctText,
          is_correct: isChoiceCorrect,
          marks_obtained: isChoiceCorrect ? question.marks : 0,
          max_marks: question.marks,
          explanation: question.explanation,
        });
      }
    }

    const percentage = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;

    const newAttempt: UserAttempt = {
      id: attemptId,
      user_id: currentUser.user.id,
      username: currentUser.user.username,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      quiz_category: quiz.category,
      quiz_difficulty: quiz.difficulty,
      score: marksObtained,
      total_marks: totalMarks,
      percentage,
      correct_answers: correctCount,
      wrong_answers: wrongCount,
      unanswered: unansweredCount,
      started_at: params.startedAt,
      completed_at: new Date().toISOString(),
      time_taken: params.timeTakenSeconds,
      answers: answerRecords,
    };

    // Save attempt
    const allAttempts = this.getAttempts();
    allAttempts.unshift(newAttempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(allAttempts));

    // Increment quiz attempt counter
    const quizzes = this.getQuizzes();
    const quizItem = quizzes.find(q => q.id === quiz.id);
    if (quizItem) {
      quizItem.attempts_count = (quizItem.attempts_count || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    }

    return newAttempt;
  }

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export const storageService = new StorageService();
