# Online Quiz Management System 🎯

A web-based **Online Quiz Management System** developed using **Python Django**. The application allows users to register, create quizzes, attempt quizzes, answer MCQ and True/False questions, receive automatic scores, and track their quiz performance through a dashboard.

## 📌 Project Description

The Online Quiz Management System provides an interactive platform for creating and conducting online quizzes. Users can browse available quizzes, select answers, submit quizzes, and view their results instantly.

Quiz creators can create quizzes, add questions and choices, set correct answers, categories, and difficulty levels.

## ✨ Features

* User Registration and Login
* User Profile Management
* Create and Manage Quizzes
* MCQ Questions
* True/False Questions
* Correct Answer Management
* Quiz Categories
* Difficulty Levels
* Interactive Question Navigation
* Countdown Timer
* Automatic Score Calculation
* Quiz Results
* Attempt History
* User Dashboard
* Django Admin Panel
* Responsive UI
* Form Validation
* Secure Authentication

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* Bootstrap 5
* JavaScript

### Backend

* Python
* Django

### Database

* SQLite

### Tools

* Visual Studio Code
* Git
* GitHub

## 📂 Project Structure

```text
Online-Quiz-Management-System/
│
├── manage.py
├── db.sqlite3
├── requirements.txt
│
├── online_quiz/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── accounts/
│   ├── models.py
│   ├── views.py
│   ├── forms.py
│   └── urls.py
│
├── quizzes/
│   ├── models.py
│   ├── views.py
│   ├── forms.py
│   ├── urls.py
│   └── admin.py
│
├── attempts/
│   ├── models.py
│   ├── views.py
│   └── urls.py
│
├── templates/
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd Online-Quiz-Management-System
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

### 4. Activate Virtual Environment

**Windows:**

```bash
venv\Scripts\activate
```

**Linux/Mac:**

```bash
source venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` is not available, install Django:

```bash
pip install django
```

### 6. Apply Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Create Admin User

```bash
python manage.py createsuperuser
```

Enter the required username, email and password.

### 8. Run the Development Server

```bash
python manage.py runserver
```

Open the application in your browser:

```text
http://127.0.0.1:8000/
```

## 👤 User Workflow

```text
Register/Login
      ↓
Dashboard
      ↓
Browse Available Quizzes
      ↓
Select Quiz
      ↓
Answer Questions
      ↓
Submit Quiz
      ↓
Automatic Score Calculation
      ↓
View Result
      ↓
Track Previous Attempts
```

## 📝 Quiz Creator Workflow

```text
Login
  ↓
Create Quiz
  ↓
Set Category & Difficulty
  ↓
Add Questions
  ↓
Add Choices
  ↓
Select Correct Answer
  ↓
Publish/Activate Quiz
  ↓
Users Attempt Quiz
```

## 🗄️ Main Database Models

The project uses Django models for managing quiz data.

* **User** – Stores user authentication information.
* **UserProfile** – Stores additional profile information.
* **Quiz** – Stores quiz details such as title, category and difficulty.
* **Question** – Stores quiz questions.
* **Choice** – Stores answer choices and correct answers.
* **UserAttempt** – Stores quiz scores and attempt information.
* **UserAnswer** – Stores answers selected by users.

## 📊 Scoring System

The system automatically compares the user's selected answers with the correct answers stored in the database.

The percentage is calculated using:

```text
Percentage = (Score / Total Marks) × 100
```

The result includes:

* Total Score
* Percentage
* Correct Answers
* Wrong Answers
* Unanswered Questions
* Time Taken

## 🧪 Testing

Run Django tests using:

```bash
python manage.py test
```

The project tests important functionality such as:

* User authentication
* Quiz creation
* Question creation
* Answer processing
* Score calculation
* Result storage

## 🔮 Future Enhancements

Possible future improvements include:

* Email notifications
* Leaderboard
* Randomized questions
* Question bank
* Certificate generation
* Advanced performance analytics
* MySQL/PostgreSQL database
* Online deployment
* Admin analytics dashboard

## 🎓 Academic Project

**Project:** Online Quiz Management System
**Technology:** Python Django
**Type:** Web Application
**Purpose:** Online Quiz and Assessment Management

## 👩‍💻 Author

**Prachi Patil**

---

⭐ If you find this project useful, consider giving the repository a star.
