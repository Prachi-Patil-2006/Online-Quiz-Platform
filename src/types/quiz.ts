/**
 * TypeScript Data Models mirroring Django Models
 * 
 * Django Models mapped:
 * 1. User & UserProfile (accounts app)
 * 2. Category, Quiz, Question, Choice (quizzes app)
 * 3. UserAttempt, UserAnswer (attempts app)
 */

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'True/False';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export interface UserProfile {
  id: number;
  user: User;
  profile_image: string;
  bio: string;
  role: 'Student' | 'Creator' | 'Admin';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: QuestionType;
  marks: number;
  order: number;
  explanation?: string;
  created_at: string;
  choices: Choice[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: DifficultyLevel;
  time_limit: number; // in minutes
  created_by: {
    id: number;
    username: string;
    full_name: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questions_count?: number;
  total_marks?: number;
  attempts_count?: number;
}

export interface UserAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  question_text: string;
  selected_choice_id: number | null;
  selected_choice_text: string;
  correct_choice_text: string;
  is_correct: boolean;
  marks_obtained: number;
  max_marks: number;
  explanation?: string;
}

export interface UserAttempt {
  id: number;
  user_id: number;
  username: string;
  quiz_id: number;
  quiz_title: string;
  quiz_category: string;
  quiz_difficulty: DifficultyLevel;
  score: number;
  total_marks: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  started_at: string;
  completed_at: string;
  time_taken: number; // in seconds
  answers: UserAnswer[];
}

export interface DashboardStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  totalQuestionsAnswered: number;
  categoryStats: { category: string; count: number; avgScore: number }[];
  recentScores: { quizTitle: string; date: string; score: number; percentage: number }[];
}
