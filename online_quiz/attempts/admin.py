from django.contrib import admin
from .models import UserAttempt, UserAnswer

class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ('question', 'selected_choice', 'is_correct', 'marks_obtained')
    can_delete = False

@admin.register(UserAttempt)
class UserAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'total_marks', 'percentage', 'correct_answers', 'wrong_answers', 'unanswered', 'completed_at')
    list_filter = ('quiz__category', 'quiz__difficulty', 'completed_at')
    search_fields = ('user__username', 'quiz__title')
    readonly_fields = ('started_at', 'completed_at', 'time_taken')
    inlines = [UserAnswerInline]

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'selected_choice', 'is_correct', 'marks_obtained')
    list_filter = ('is_correct',)
    search_fields = ('attempt__user__username', 'question__question_text')
