from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from quizzes.models import Category, Quiz, Question, Choice
from attempts.models import UserAttempt, UserAnswer

class OnlineQuizSystemTests(TestCase):
    """
    Comprehensive Test Suite covering:
    1. User Registration & Login
    2. Category & Quiz Creation
    3. Question & Choice validation
    4. Quiz Attempt & Server-side Score Calculation Formula: (Score / Total Marks) * 100
    5. Percentage calculation & UserAttempt model integrity
    6. Unauthorized quiz edit protection
    """

    def setUp(self):
        # Create standard test users
        self.student = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpassword123',
            first_name='Aarav',
            last_name='Patel'
        )
        self.creator = User.objects.create_user(
            username='creator1',
            email='creator1@test.com',
            password='testpassword123',
            first_name='Dr. Sharma',
            last_name='Teacher'
        )
        self.creator.profile.role = 'Creator'
        self.creator.profile.save()

        # Create Category
        self.category = Category.objects.create(
            name='Python',
            slug='python',
            description='Python programming language assessment'
        )

        # Create Quiz
        self.quiz = Quiz.objects.create(
            title='Python Fundamentals',
            description='Test basic syntax and types',
            category=self.category,
            difficulty='Easy',
            time_limit=10,
            created_by=self.creator,
            is_active=True
        )

        # Create Question 1 (MCQ) - 2 marks
        self.q1 = Question.objects.create(
            quiz=self.quiz,
            question_text='What is the keyword for function in Python?',
            question_type='MCQ',
            marks=2,
            order=1
        )
        self.c1_correct = Choice.objects.create(question=self.q1, choice_text='def', is_correct=True)
        self.c1_wrong = Choice.objects.create(question=self.q1, choice_text='function', is_correct=False)

        # Create Question 2 (True/False) - 1 mark
        self.q2 = Question.objects.create(
            quiz=self.quiz,
            question_text='Lists in Python are immutable.',
            question_type='True/False',
            marks=1,
            order=2
        )
        self.c2_wrong = Choice.objects.create(question=self.q2, choice_text='True', is_correct=False)
        self.c2_correct = Choice.objects.create(question=self.q2, choice_text='False', is_correct=True)

        self.client = Client()

    def test_user_registration(self):
        """Test registering a new student account."""
        response = self.client.post(reverse('accounts:register'), {
            'username': 'newuser',
            'first_name': 'New',
            'last_name': 'User',
            'email': 'newuser@test.com',
            'role': 'Student',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_user_login(self):
        """Test authenticating an existing user."""
        logged_in = self.client.login(username='student1', password='testpassword123')
        self.assertTrue(logged_in)

    def test_quiz_properties(self):
        """Verify quiz question counts and total marks calculation."""
        self.assertEqual(self.quiz.questions_count, 2)
        # Total marks: 2 (q1) + 1 (q2) = 3
        self.assertEqual(self.quiz.total_marks, 3)

    def test_score_calculation_all_correct(self):
        """Test quiz submission when student selects all correct answers."""
        self.client.login(username='student1', password='testpassword123')

        response = self.client.post(reverse('attempts:submit_quiz', kwargs={'quiz_id': self.quiz.id}), {
            f'question_{self.q1.id}': self.c1_correct.id,
            f'question_{self.q2.id}': self.c2_correct.id,
            'time_taken': '95',
        })
        self.assertEqual(response.status_code, 302)

        attempt = UserAttempt.objects.filter(user=self.student, quiz=self.quiz).first()
        self.assertIsNotNone(attempt)
        self.assertEqual(attempt.score, 3)
        self.assertEqual(attempt.total_marks, 3)
        self.assertEqual(attempt.percentage, 100.0)
        self.assertEqual(attempt.correct_answers, 2)
        self.assertEqual(attempt.wrong_answers, 0)
        self.assertEqual(attempt.unanswered, 0)

    def test_score_calculation_partial_and_unanswered(self):
        """Test quiz submission with 1 wrong and 1 unanswered question."""
        self.client.login(username='student1', password='testpassword123')

        # q1 answered wrong, q2 unanswered
        self.client.post(reverse('attempts:submit_quiz', kwargs={'quiz_id': self.quiz.id}), {
            f'question_{self.q1.id}': self.c1_wrong.id,
            'time_taken': '50',
        })

        attempt = UserAttempt.objects.filter(user=self.student, quiz=self.quiz).first()
        self.assertIsNotNone(attempt)
        self.assertEqual(attempt.score, 0)
        self.assertEqual(attempt.percentage, 0.0)
        self.assertEqual(attempt.wrong_answers, 1)
        self.assertEqual(attempt.unanswered, 1)

    def test_unauthorized_quiz_editing(self):
        """Ensure standard students cannot edit quizzes created by other instructors."""
        self.client.login(username='student1', password='testpassword123')

        response = self.client.post(reverse('quizzes:quiz_edit', kwargs={'pk': self.quiz.id}), {
            'title': 'Hacked Title',
            'description': 'Changed description',
            'category': self.category.id,
            'difficulty': 'Easy',
            'time_limit': 10,
        })
        # Should be forbidden (403) via UserPassesTestMixin
        self.assertEqual(response.status_code, 403)
