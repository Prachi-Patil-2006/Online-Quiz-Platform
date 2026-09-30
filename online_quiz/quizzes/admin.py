from django.contrib import admin
from .models import Category, Quiz, Question, Choice

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'quizzes_count')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')

    def quizzes_count(self, obj):
        return obj.quizzes.count()

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'difficulty', 'time_limit', 'created_by', 'is_active', 'created_at')
    list_filter = ('category', 'difficulty', 'is_active', 'created_at')
    search_fields = ('title', 'description', 'created_by__username')
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'quiz', 'question_type', 'marks', 'order')
    list_filter = ('quiz', 'question_type')
    search_fields = ('question_text', 'quiz__title')
    inlines = [ChoiceInline]

    def question_text_short(self, obj):
        return obj.question_text[:60] + "..." if len(obj.question_text) > 60 else obj.question_text

@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('choice_text', 'question', 'is_correct')
    list_filter = ('is_correct',)
    search_fields = ('choice_text', 'question__question_text')
