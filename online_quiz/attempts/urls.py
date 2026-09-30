from django.urls import path
from . import views

app_name = 'attempts'

urlpatterns = [
    path('quiz/<int:quiz_id>/start/', views.start_quiz_attempt, name='start_quiz'),
    path('quiz/<int:quiz_id>/submit/', views.submit_quiz, name='submit_quiz'),
    path('result/<int:attempt_id>/', views.quiz_result, name='quiz_result'),
    path('history/', views.attempt_history, name='attempt_history'),
]
