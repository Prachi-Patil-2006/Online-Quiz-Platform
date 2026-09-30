/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { QuizListView } from './components/QuizListView';
import { QuizAttemptView } from './components/QuizAttemptView';
import { ResultView } from './components/ResultView';
import { DashboardView } from './components/DashboardView';
import { AttemptHistoryView } from './components/AttemptHistoryView';
import { QuizCreatorView } from './components/QuizCreatorView';
import { UserProfileView } from './components/UserProfileView';
import { DjangoAdminView } from './components/DjangoAdminView';
import { VivaInspectorView } from './components/VivaInspectorView';
import { AuthModal } from './components/AuthModal';

import { Quiz, UserAttempt, UserProfile, Category, Question } from './types/quiz';
import { storageService } from './services/storageService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storageService.getQuizzes());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [attempts, setAttempts] = useState<UserAttempt[]>(() => storageService.getAttempts());
  const [questions, setQuestions] = useState<Question[]>(() => storageService.getQuestions());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => storageService.getUsers());

  // Routing / View state
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<any>(null);

  // Active quiz for taking
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Latest or inspected attempt
  const [inspectedAttempt, setInspectedAttempt] = useState<UserAttempt | null>(null);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const reloadData = () => {
    setQuizzes(storageService.getQuizzes());
    setCategories(storageService.getCategories());
    setAttempts(storageService.getAttempts());
    setQuestions(storageService.getQuestions());
    setAllUsers(storageService.getUsers());
  };

  const handleNavigate = (view: string, param?: any) => {
    setViewParam(param || null);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentView('attempt');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuiz = (attempt: UserAttempt) => {
    reloadData();
    setInspectedAttempt(attempt);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetakeQuiz = (quizId: number) => {
    const q = storageService.getQuizById(quizId);
    if (q) {
      setActiveQuiz(q);
      setCurrentView('attempt');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewResult = (attempt: UserAttempt) => {
    setInspectedAttempt(attempt);
    setCurrentView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    reloadData();
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Universal Responsive Navbar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onUserChange={handleUserChange}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            quizzes={quizzes}
            categories={categories}
            totalAttemptsCount={attempts.length}
            onNavigate={handleNavigate}
            onSelectQuiz={handleSelectQuiz}
          />
        )}

        {currentView === 'quizzes' && (
          <QuizListView
            quizzes={quizzes}
            categories={categories}
            initialCategory={viewParam?.category || 'All'}
            onSelectQuiz={handleSelectQuiz}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'attempt' && activeQuiz && (
          <QuizAttemptView
            quiz={activeQuiz}
            onFinishQuiz={handleFinishQuiz}
            onCancel={() => handleNavigate('quizzes')}
          />
        )}

        {currentView === 'result' && (
          inspectedAttempt ? (
            <ResultView
              attempt={inspectedAttempt}
              onRetakeQuiz={handleRetakeQuiz}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="p-12 text-center">
              <p>No recent attempt found. Please select an attempt from history.</p>
              <button onClick={() => handleNavigate('history')} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">
                View History
              </button>
            </div>
          )
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            attempts={attempts}
            quizzes={quizzes}
            onSelectQuiz={handleSelectQuiz}
            onViewResult={handleViewResult}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'history' && (
          <AttemptHistoryView
            attempts={attempts}
            onViewResult={handleViewResult}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'creator' && (
          <QuizCreatorView
            currentUser={currentUser}
            quizzes={quizzes}
            categories={categories}
            onQuizUpdated={reloadData}
            onPreviewQuiz={handleSelectQuiz}
          />
        )}

        {currentView === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onUserUpdated={handleUserChange}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && (
          <DjangoAdminView
            quizzes={quizzes}
            questions={questions}
            categories={categories}
            attempts={attempts}
            users={allUsers}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'viva' && (
          <VivaInspectorView />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal (Login / Register / Quick Demo) */}
      <AuthModal
        initialMode={authModalMode}
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleUserChange}
      />
    </div>
  );
}
