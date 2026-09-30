import React, { useState } from 'react';

export const VivaInspectorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'viva' | 'commands'>('viva');
  const [selectedFile, setSelectedFile] = useState<string>('online_quiz/settings.py');
  const [copied, setCopied] = useState<boolean>(false);

  const fileMap: Record<string, { desc: string; code: string; language: string }> = {
    'online_quiz/settings.py': {
      desc: 'Django project configuration: INSTALLED_APPS, DATABASES (SQLite3), AUTH_PASSWORD_VALIDATORS, and Static files.',
      language: 'python',
      code: `# Django settings for online_quiz project.
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-oqm-assessment-system-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Custom Apps
    'accounts.apps.AccountsConfig',
    'quizzes.apps.QuizzesConfig',
    'attempts.apps.AttemptsConfig',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LOGIN_URL = 'accounts:login'
LOGIN_REDIRECT_URL = 'quizzes:quiz_list'
LOGOUT_REDIRECT_URL = 'home'`
    },
    'quizzes/models.py': {
      desc: 'Django ORM Models for Category, Quiz, Question, and Choice with proper ForeignKey cascades.',
      language: 'python',
      code: `from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='fa-solid fa-code')

class Quiz(models.Model):
    DIFFICULTY_CHOICES = (('Easy', 'Easy'), ('Medium', 'Medium'), ('Hard', 'Hard'))
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='quizzes')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    time_limit = models.PositiveIntegerField(help_text='Time limit in minutes', default=10)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Question(models.Model):
    QUESTION_TYPES = (('MCQ', 'MCQ'), ('True/False', 'True/False'))
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MCQ')
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True, default='')

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)`
    },
    'attempts/models.py': {
      desc: 'Models for UserAttempt (overall score, percentage, metrics) and UserAnswer (individual responses).',
      language: 'python',
      code: `from django.db import models
from django.contrib.auth.models import User
from quizzes.models import Quiz, Question, Choice

class UserAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0)
    total_marks = models.PositiveIntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    unanswered = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(auto_now_add=True)
    time_taken = models.PositiveIntegerField(help_text='Seconds', default=0)

class UserAnswer(models.Model):
    attempt = models.ForeignKey(UserAttempt, on_delete=models.CASCADE, related_name='user_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_answers')
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.PositiveIntegerField(default=0)`
    },
    'attempts/views.py': {
      desc: 'Server-side score calculation engine: atomic evaluation of user choices, prevention of tampering, formula calculation.',
      language: 'python',
      code: `@login_required
@transaction.atomic
def submit_quiz(request, quiz_id):
    if request.method != 'POST':
        return redirect('quizzes:quiz_detail', pk=quiz_id)

    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = quiz.questions.all().prefetch_related('choices')

    score, total_marks = 0, 0
    correct_count, wrong_count, unanswered_count = 0, 0, 0

    attempt = UserAttempt.objects.create(
        user=request.user, quiz=quiz, started_at=timezone.now(), time_taken=int(request.POST.get('time_taken', 0))
    )

    user_answers = []
    for q in questions:
        total_marks += q.marks
        choice_id = request.POST.get(f'question_{q.id}')
        if not choice_id:
            unanswered_count += 1
            user_answers.append(UserAnswer(attempt=attempt, question=q, is_correct=False, marks_obtained=0))
        else:
            choice = Choice.objects.get(id=int(choice_id), question=q)
            is_correct = choice.is_correct
            marks = q.marks if is_correct else 0
            if is_correct: correct_count += 1; score += q.marks
            else: wrong_count += 1
            user_answers.append(UserAnswer(attempt=attempt, question=q, selected_choice=choice, is_correct=is_correct, marks_obtained=marks))

    UserAnswer.objects.bulk_create(user_answers)
    
    # Formula: Percentage = (Score / Total Marks) * 100
    percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0.0

    attempt.score = score
    attempt.total_marks = total_marks
    attempt.percentage = percentage
    attempt.correct_answers = correct_count
    attempt.wrong_answers = wrong_count
    attempt.unanswered = unanswered_count
    attempt.save()

    return redirect('attempts:quiz_result', attempt_id=attempt.id)`
    },
    'quizzes/tests.py': {
      desc: 'Automated Django test cases covering User registration, Login, Scoring calculation, and Unauthorized edit protection.',
      language: 'python',
      code: `from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from quizzes.models import Category, Quiz, Question, Choice
from attempts.models import UserAttempt

class OnlineQuizSystemTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user(username='student1', password='testpass123')
        self.category = Category.objects.create(name='Python', slug='python')
        self.quiz = Quiz.objects.create(title='Python Test', category=self.category, created_by=self.student)
        self.q1 = Question.objects.create(quiz=self.quiz, question_text='2+2?', marks=2)
        self.c_correct = Choice.objects.create(question=self.q1, choice_text='4', is_correct=True)

    def test_score_calculation(self):
        self.client.login(username='student1', password='testpass123')
        response = self.client.post(reverse('attempts:submit_quiz', kwargs={'quiz_id': self.quiz.id}), {
            f'question_{self.q1.id}': self.c_correct.id,
        })
        attempt = UserAttempt.objects.get(quiz=self.quiz)
        self.assertEqual(attempt.score, 2)
        self.assertEqual(attempt.percentage, 100.0)`
    },
  };

  const vivaQuestions = [
    {
      q: '1. What architecture does Django use, and how is it implemented in this Online Quiz System?',
      a: 'Django follows the MVT (Model - View - Template) architectural pattern. Models (quizzes/models.py, attempts/models.py) define the database structure via the Django ORM. Views (quizzes/views.py, attempts/views.py) process HTTP requests, enforce authentication, and calculate quiz scores. Templates (HTML files in templates/) render the visual UI using Jinja/Django template tags like {% for %}, {% if %}, and {{ variable }}.'
    },
    {
      q: '2. Why is score calculation done on the Django backend rather than in client-side JavaScript?',
      a: 'Security and integrity. If scores are calculated on the client side, a student could easily inspect variables in browser developer tools or spoof network payloads to mark their answers as correct. By computing the score securely on the Django backend using database models inside an atomic transaction (submit_quiz view), the correct answer keys are never exposed before submission, ensuring tamper-proof evaluations.'
    },
    {
      q: '3. Explain the database relationship between Quiz, Question, and Choice.',
      a: 'A Quiz has a one-to-many relationship with Questions (Question has ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")). Similarly, each Question has a one-to-many relationship with Choices (Choice has ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")). Using on_delete=models.CASCADE ensures referential integrity: if a quiz or question is deleted, its child choices are automatically pruned.'
    },
    {
      q: '4. How does the application handle both MCQ and True/False questions in the database?',
      a: 'In Question model, question_type is an enum field ("MCQ" or "True/False"). For True/False questions, the system automatically creates two Choice objects with texts "True" and "False", where exactly one is flagged with is_correct=True. For standard MCQs, 4 Choice rows are created with one marked correct. This uniform schema allows the evaluation engine in submit_quiz to evaluate both question types identically.'
    },
    {
      q: '5. How does the countdown timer work and what happens when it expires?',
      a: 'A JavaScript interval runs on the client counting down from total seconds (quiz.time_limit * 60). An alert or visual warning turns red when under 60 seconds. When seconds reach 00:00, the autoSubmitOnTimeout() function executes document.getElementById("quizForm").submit(), sending all marked radio answers to the backend. The backend records any unanswered questions as 0 marks, calculates the final score, and redirects the student to the result page.'
    },
    {
      q: '6. What is CSRF and why is {% csrf_token %} required in every form?',
      a: 'CSRF stands for Cross-Site Request Forgery. It occurs when a malicious website tricks an authenticated user into executing unwanted actions on your application. Django protects against this using a CSRF middleware that validates a cryptographically signed, secret token embedded in every POST form via {% csrf_token %}. Any POST request missing or having an invalid token is rejected with HTTP 403 Forbidden.'
    },
    {
      q: '7. How is role-based access control (RBAC) implemented between Students and Quiz Creators?',
      a: 'The UserProfile model extends Django\'s User with a role field ("Student" or "Creator"). Views that create, edit, or delete quizzes check either user.is_staff or user.profile.role == "Creator". In class-based views, UserPassesTestMixin or permission decorators ensure students cannot access /quiz/create/ or modify other users\' quizzes.'
    },
    {
      q: '8. How does the scoring formula work for calculating the final percentage?',
      a: 'Percentage = (Score / Total Marks) * 100. Each question has a marks attribute (e.g. 1 or 2 marks). Total Marks is the sum of all question marks in the quiz. Score is the sum of marks obtained for questions where the selected choice has is_correct=True. If total_marks is 0, the percentage defaults safely to 0.0 to prevent division by zero.'
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fileMap[selectedFile]?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold uppercase tracking-wider mb-2">
              <i className="fa-solid fa-graduation-cap"></i> College Viva Preparation Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Django Architecture & Viva Exam Guide
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Complete reference manual explaining Django models, ORM relationships, scoring mechanisms, and answers to the questions examiners ask during project viva.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('viva')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'viva' ? 'bg-yellow-400 text-slate-950 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-question-circle"></i> Viva Q&A Guide
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-yellow-400 text-slate-950 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-code"></i> Django Source Code
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'commands' ? 'bg-yellow-400 text-slate-950 shadow-md' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <i className="fa-solid fa-terminal"></i> Terminal Commands
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: VIVA QUESTIONS & ANSWERS */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <i className="fa-solid fa-award text-amber-500"></i>
              <span>Top 8 University Examiner Viva Questions & Answers</span>
            </h2>
            <p className="text-xs text-slate-500">
              Read and memorize these explanations to confidently explain your project design during viva evaluations.
            </p>
          </div>

          <div className="space-y-4">
            {vivaQuestions.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-2 hover:border-blue-300 transition"
              >
                <h3 className="font-extrabold text-base text-slate-900 flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    Q
                  </span>
                  <span>{item.q}</span>
                </h3>
                <div className="pl-8 pt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <strong className="text-blue-900 block mb-1 text-xs uppercase tracking-wider">Model Answer for Viva:</strong>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DJANGO SOURCE CODE EXPLORER */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* File selector list */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2 block">
              Django Project Files
            </span>
            {Object.keys(fileMap).map(filename => (
              <button
                key={filename}
                onClick={() => setSelectedFile(filename)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition cursor-pointer flex items-center justify-between ${
                  selectedFile === filename
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{filename}</span>
                <i className="fa-solid fa-file-code opacity-70"></i>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-8 bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-yellow-400 font-bold block">{selectedFile}</span>
                <span className="text-[11px] text-slate-400">{fileMap[selectedFile]?.desc}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="p-5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200 max-h-[500px]">
              <code>{fileMap[selectedFile]?.code}</code>
            </pre>
          </div>

        </div>
      )}

      {/* TAB 3: TERMINAL COMMANDS CHEAT SHEET */}
      {activeTab === 'commands' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-terminal text-blue-600"></i>
              <span>Terminal Execution Commands for College Submission</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Exact sequence of commands required to initialize, migrate, populate, and test the project on a local laptop.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-700 block">Step 1: Install Dependencies</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
pip install -r requirements.txt
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-700 block">Step 2: Generate & Run Migrations</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
python manage.py makemigrations accounts quizzes attempts
python manage.py migrate
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-700 block">Step 3: Create Superuser / Admin</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
python manage.py createsuperuser
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-700 block">Step 4: Execute Automated Test Suite</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
python manage.py test
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-xs uppercase text-blue-700 block">Step 5: Run Development Server</span>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
python manage.py runserver
# Open http://127.0.0.1:8000 in your browser
              </pre>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
