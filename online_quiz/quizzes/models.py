from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Category(models.Model):
    """
    Quiz Category (e.g. Python, Java, SQL, Aptitude, Electronics).
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='fa-solid fa-code')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Quiz(models.Model):
    """
    Represents an individual quiz with metadata, category, and time limit.
    """
    DIFFICULTY_CHOICES = (
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='quizzes')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    time_limit = models.PositiveIntegerField(help_text='Time limit in minutes', default=10)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.category.name})"

    @property
    def questions_count(self):
        return self.questions.count()

    @property
    def total_marks(self):
        return sum(q.marks for q in self.questions.all())

class Question(models.Model):
    """
    Question belonging to a Quiz.
    Supports Multiple Choice Questions (MCQ) and True/False questions.
    """
    QUESTION_TYPES = (
        ('MCQ', 'Multiple Choice Question (MCQ)'),
        ('True/False', 'True / False'),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='MCQ')
    marks = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=1)
    explanation = models.TextField(blank=True, default='', help_text='Explanation shown on review.')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}... ({self.quiz.title})"

    @property
    def correct_choice(self):
        return self.choices.filter(is_correct=True).first()

class Choice(models.Model):
    """
    Answer choice associated with a Question.
    At least one choice must have is_correct=True.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        status = " (Correct)" if self.is_correct else ""
        return f"{self.choice_text}{status}"
