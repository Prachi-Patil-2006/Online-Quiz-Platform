# Online Quiz Management and Assessment System

A full-stack, responsive, and secure **Online Quiz Management and Assessment Web Application** built using **Python Django**, **SQLite/PostgreSQL**, **Bootstrap 5**, and **Vanilla JavaScript**. Designed for academic evaluations, university coursework, and college viva presentations.

---

## 📌 Project Overview
The **Online Quiz Management and Assessment System** allows students to register, browse quizzes across technical domains, attempt timed MCQ and True/False assessments, and receive immediate server-calculated results. Educators and quiz creators can create assessments, manage questions, specify correct answers, and review student performance.

---

## 🌟 Key Features

1. **User Authentication & Role-Based Access (RBAC)**:
   - Registration with password matching validation.
   - Login, logout, and session-based authentication via Django Auth.
   - Distinct roles: **Student** (quiz taker) and **Quiz Creator / Admin** (quiz designer).
   - User profile management (Bio, avatar, email, name).

2. **Quiz Catalog & Advanced Filters**:
   - Filter by domain categories: *Python, Java, HTML/CSS, JavaScript, SQL, Electronics, Aptitude, General Knowledge*.
   - Filter by difficulty levels: *Easy, Medium, Hard*.
   - Real-time search query filtering across titles and descriptions.

3. **Interactive Quiz Attempt Interface**:
   - Clean, distraction-free interface without unnecessary page reloads.
   - Real-time countdown timer with visual alert when under 60 seconds.
   - Question Navigation Palette showing answered, unanswered, and current question.
   - Previous, Next, Clear Selection, and Review before submit options.
   - Auto-submit triggers when countdown timer reaches `00:00`.

4. **Tamper-Proof Server-Side Score Calculation**:
   - Answers are securely evaluated on the Django backend using database models.
   - Automated computation of:
     - `Correct Answers`
     - `Wrong Answers`
     - `Unanswered Questions`
     - `Marks Obtained` & `Total Marks`
     - `Percentage` formula: `(Score / Total Marks) * 100`
   - Atomic database transactions to prevent double submissions.

5. **Detailed Result & Review**:
   - Performance badges and percentage cards.
   - Question-by-question breakdown showing selected answer vs correct answer and conceptual explanation.

6. **Student Performance Dashboard**:
   - Total quizzes attempted.
   - Average score percentage.
   - Highest score achieved.
   - Total questions answered.
   - Recent attempts list with one-click result viewing.

7. **Creator & Admin Management**:
   - Create, edit, and delete quizzes.
   - Add MCQ questions with 4 distinct choices and correct answer indicator.
   - Add True/False questions.
   - Manage active/inactive status and reorder questions.
   - Django Admin integration with filters, search fields, and inlines.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, Django 5.0+ |
| **Database** | SQLite3 (Production-ready for PostgreSQL / MySQL) |
| **Frontend** | HTML5, CSS3, Bootstrap 5.3, Plus Jakarta Sans |
| **Icons** | Font Awesome 6.5 |
| **Client Scripting** | Vanilla JavaScript (ES6+) |
| **Architecture** | Django MVT (Model - View - Template) pattern |

---

## 🚀 Exact Terminal Commands to Run Locally

### 1. Clone & Navigate
```bash
git clone <repository-url>
cd online_quiz
```

### 2. Create and Activate Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows (cmd):
python -m venv venv
venv\Scripts\activate
```

### 3. Install Required Dependencies
```bash
pip install -r requirements.txt
```

### 4. Apply Database Migrations
```bash
python manage.py makemigrations accounts quizzes attempts
python manage.py migrate
```

### 5. Create Superuser (Admin Account)
```bash
python manage.py createsuperuser
# Enter username, email, and password as prompted
```

### 6. Run Automated Test Suite
```bash
python manage.py test
```

### 7. Start the Development Server
```bash
python manage.py runserver
```
Visit **http://127.0.0.1:8000/** in your web browser!

---

## 📂 Project Folder Structure

```
online_quiz/
│
├── manage.py                          # Django CLI utility
├── requirements.txt                   # Project Python packages
├── README.md                          # Documentation & Viva notes
├── db.sqlite3                         # Local SQLite database
│
├── online_quiz/                       # Project Configuration Root
│   ├── __init__.py
│   ├── settings.py                    # App settings & DB configuration
│   ├── urls.py                        # Top-level URL routing
│   ├── wsgi.py                        # WSGI gateway for deployment
│   └── asgi.py                        # ASGI asynchronous gateway
│
├── accounts/                          # User Authentication App
│   ├── models.py                      # UserProfile model
│   ├── forms.py                       # Registration & Profile forms
│   ├── views.py                       # Login, Register, Profile views
│   ├── urls.py                        # Accounts routing (/accounts/...)
│   └── admin.py                       # Profile admin configuration
│
├── quizzes/                           # Quiz & Question Management App
│   ├── models.py                      # Category, Quiz, Question, Choice
│   ├── forms.py                       # Quiz & Question creation forms
│   ├── views.py                       # Home, Dashboard, Quiz CRUD views
│   ├── urls.py                        # Quizzes routing (/quizzes/...)
│   ├── admin.py                       # Inline Question & Choice admin
│   └── tests.py                       # Unit tests for scoring & auth
│
├── attempts/                          # Quiz Attempt & Evaluation App
│   ├── models.py                      # UserAttempt, UserAnswer
│   ├── views.py                       # Interactive runner & scoring engine
│   ├── urls.py                        # Attempt & Result routing
│   └── admin.py                       # Attempt logs admin view
│
├── templates/                         # HTML5 + Bootstrap 5 Templates
│   ├── base.html                      # Global layout & Navbar
│   ├── home.html                      # Landing page with hero & stats
│   ├── dashboard.html                 # Student performance dashboard
│   ├── accounts/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── profile.html
│   ├── quizzes/
│   │   ├── quiz_list.html             # Catalog with category/difficulty filters
│   │   ├── quiz_detail.html           # Quiz instructions & overview
│   │   ├── quiz_form.html             # Quiz creation form
│   │   ├── manage_questions.html      # Creator question list
│   │   └── question_form.html         # Add MCQ / True-False question
│   └── attempts/
│       ├── quiz_attempt.html          # Interactive timed runner + palette
│       ├── quiz_result.html           # Detailed score & answers report
│       └── attempt_history.html       # Student chronological history
│
└── static/
    ├── css/
    │   └── style.css                  # Custom styling & animations
    └── js/
        └── quiz_attempt.js            # Timer, question palette & AJAX logic
```

---

## 🎓 College Viva Q&A Guide

**Q1: Why is score calculation done on the Django backend instead of JavaScript?**
*Answer:* Client-side JavaScript can be intercepted or manipulated in browser DevTools. Performing the scoring on the Django backend ensures database security, prevents tampering with correct answer keys, and maintains an immutable audit log in `UserAttempt` and `UserAnswer`.

**Q2: What is the database relationship between Quiz, Question, and Choice?**
*Answer:* One `Quiz` has many `Question` instances (`ForeignKey(Quiz, related_name='questions')`). Each `Question` has multiple `Choice` instances (`ForeignKey(Question, related_name='choices')`). When a quiz or question is deleted, cascading deletion (`on_delete=models.CASCADE`) automatically purges child choices.

**Q3: How does the countdown timer interact with the submission view?**
*Answer:* When JavaScript countdown hits `00:00`, it triggers `document.getElementById('quizForm').submit()`. The backend reads `request.POST`, determines elapsed time, records unanswered questions as `0 marks`, and redirects to `quiz_result`.

---

## 🔮 Future Enhancements
- Negative marking toggle (-0.25 or -0.5 per wrong answer).
- Real-time multiplayer quiz battles via Django Channels WebSockets.
- PDF Certificate generation upon scoring > 80%.
- AI-assisted question generation from lecture notes.
