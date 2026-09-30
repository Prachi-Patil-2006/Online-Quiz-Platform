from django.db import models
from django.contrib.auth.models import User
from quizzes.models import Quiz, Question, Choice

class UserAttempt(models.Model):
    """
    Stores an entire attempt session by a user on a specific quiz.
    Contains overall calculated score, percentage, metrics, and timestamps.
    """
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
    time_taken = models.PositiveIntegerField(help_text='Time taken in seconds', default=0)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.percentage}%)"

    @property
    def formatted_time_taken(self):
        minutes = self.time_taken // 60
        seconds = self.time_taken % 60
        return f"{minutes:02d}m {seconds:02d}s"

class UserAnswer(models.Model):
    """
    Stores the specific answer choice selected by the user for a single question.
    """
    attempt = models.ForeignKey(UserAttempt, on_delete=models.CASCADE, related_name='user_answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_answers')
    selected_choice = models.ForeignKey(Choice, on_delete=models.SET_NULL, null=True, blank=True, related_name='selected_by')
    is_correct = models.BooleanField(default=False)
    marks_obtained = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question__order']

    def __str__(self):
        return f"Ans: Q{self.question.order} - {self.attempt.user.username} ({'Correct' if self.is_correct else 'Wrong'})"
