from django.urls import path
from . import views

app_name = 'quizzes'

urlpatterns = [
    path('', views.QuizListView.as_view(), name='quiz_list'),
    path('<int:pk>/', views.QuizDetailView.as_view(), name='quiz_detail'),
    path('create/', views.QuizCreateView.as_view(), name='quiz_create'),
    path('<int:pk>/edit/', views.QuizUpdateView.as_view(), name='quiz_edit'),
    path('<int:pk>/delete/', views.QuizDeleteView.as_view(), name='quiz_delete'),
    
    # Question management
    path('<int:quiz_id>/questions/', views.manage_questions, name='manage_questions'),
    path('<int:quiz_id>/questions/add/', views.add_question, name='add_question'),
    path('question/<int:question_id>/delete/', views.delete_question, name='delete_question'),
]
