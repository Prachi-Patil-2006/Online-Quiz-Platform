from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import View, ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse_lazy, reverse
from django.db.models import Q, Avg, Max, Count
from .models import Quiz, Question, Choice, Category
from .forms import QuizForm, QuestionForm
from attempts.models import UserAttempt, UserAnswer

class HomeView(View):
    """Landing Home Page with Hero, Feature cards, and Categories."""
    def get(self, request):
        categories = Category.objects.all()
        featured_quizzes = Quiz.objects.filter(is_active=True).order_by('-created_at')[:6]
        total_quizzes = Quiz.objects.filter(is_active=True).count()
        total_questions = Question.objects.count()
        total_attempts = UserAttempt.objects.count()

        context = {
            'categories': categories,
            'featured_quizzes': featured_quizzes,
            'total_quizzes': total_quizzes,
            'total_questions': total_questions,
            'total_attempts': total_attempts,
        }
        return render(request, 'home.html', context)

class DashboardView(LoginRequiredMixin, View):
    """User Dashboard showing overall statistics, recent attempts, and analytics."""
    def get(self, request):
        user = request.user
        attempts = UserAttempt.objects.filter(user=user).order_by('-completed_at')
        total_attempts = attempts.count()
        
        avg_score = attempts.aggregate(Avg('percentage'))['percentage__avg'] or 0
        highest_score = attempts.aggregate(Max('percentage'))['percentage__max'] or 0
        total_questions_answered = UserAnswer.objects.filter(attempt__user=user).count()

        recent_attempts = attempts[:5]
        available_quizzes = Quiz.objects.filter(is_active=True).exclude(
            id__in=attempts.values_list('quiz_id', flat=True)
        )[:4]

        # Quizzes created by user (if creator)
        my_quizzes = Quiz.objects.filter(created_by=user).annotate(
            total_student_attempts=Count('attempts')
        )

        context = {
            'total_attempts': total_attempts,
            'avg_score': round(avg_score, 1),
            'highest_score': round(highest_score, 1),
            'total_questions_answered': total_questions_answered,
            'recent_attempts': recent_attempts,
            'available_quizzes': available_quizzes,
            'my_quizzes': my_quizzes,
        }
        return render(request, 'dashboard.html', context)

class QuizListView(ListView):
    """Browse all active quizzes with filtering by category, difficulty, and search keyword."""
    model = Quiz
    template_name = 'quizzes/quiz_list.html'
    context_object_name = 'quizzes'
    paginate_by = 9

    def get_queryset(self):
        queryset = Quiz.objects.filter(is_active=True)
        category_slug = self.request.GET.get('category')
        difficulty = self.request.GET.get('difficulty')
        query = self.request.GET.get('q')

        if category_slug and category_slug != 'all':
            queryset = queryset.filter(category__slug=category_slug)
        if difficulty and difficulty != 'all':
            queryset = queryset.filter(difficulty=difficulty)
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(description__icontains=query) | Q(category__name__icontains=query)
            )

        return queryset.order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['selected_category'] = self.request.GET.get('category', 'all')
        context['selected_difficulty'] = self.request.GET.get('difficulty', 'all')
        context['search_query'] = self.request.GET.get('q', '')
        return context

class QuizDetailView(DetailView):
    """View quiz summary, rules, question counts, and instructions prior to start."""
    model = Quiz
    template_name = 'quizzes/quiz_detail.html'
    context_object_name = 'quiz'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['user_attempts'] = UserAttempt.objects.filter(
                quiz=self.object, user=self.request.user
            ).order_by('-completed_at')
        return context

class QuizCreateView(LoginRequiredMixin, CreateView):
    """Create a new quiz (Creators / Authenticated users)."""
    model = Quiz
    form_class = QuizForm
    template_name = 'quizzes/quiz_form.html'

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        messages.success(self.request, "Quiz created successfully! Now add questions.")
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('quizzes:manage_questions', kwargs={'quiz_id': self.object.id})

class QuizUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    """Update existing quiz (Owner or Staff only)."""
    model = Quiz
    form_class = QuizForm
    template_name = 'quizzes/quiz_form.html'

    def test_func(self):
        quiz = self.get_object()
        return self.request.user == quiz.created_by or self.request.user.is_staff

    def form_valid(self, form):
        messages.success(self.request, "Quiz updated successfully!")
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('quizzes:quiz_detail', kwargs={'pk': self.object.id})

class QuizDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    """Delete a quiz."""
    model = Quiz
    template_name = 'quizzes/quiz_confirm_delete.html'
    success_url = reverse_lazy('quizzes:quiz_list')

    def test_func(self):
        quiz = self.get_object()
        return self.request.user == quiz.created_by or self.request.user.is_staff

    def delete(self, request, *args, **kwargs):
        messages.success(request, "Quiz deleted successfully.")
        return super().delete(request, *args, **kwargs)

@login_required
def manage_questions(request, quiz_id):
    """List and manage all questions for a specific quiz."""
    quiz = get_object_or_404(Quiz, id=quiz_id)
    if quiz.created_by != request.user and not request.user.is_staff:
        messages.error(request, "You do not have permission to manage this quiz.")
        return redirect('quizzes:quiz_detail', pk=quiz.id)

    questions = quiz.questions.all().prefetch_related('choices')
    return render(request, 'quizzes/manage_questions.html', {
        'quiz': quiz,
        'questions': questions,
    })

@login_required
def add_question(request, quiz_id):
    """Add MCQ or True/False question to quiz."""
    quiz = get_object_or_404(Quiz, id=quiz_id)
    if quiz.created_by != request.user and not request.user.is_staff:
        messages.error(request, "Permission denied.")
        return redirect('quizzes:quiz_detail', pk=quiz.id)

    if request.method == 'POST':
        q_form = QuestionForm(request.POST)
        if q_form.is_valid():
            question = q_form.save(commit=False)
            question.quiz = quiz
            question.save()

            q_type = question.question_type
            if q_type == 'True/False':
                tf_correct = request.POST.get('tf_correct')
                Choice.objects.create(question=question, choice_text='True', is_correct=(tf_correct == 'True'))
                Choice.objects.create(question=question, choice_text='False', is_correct=(tf_correct == 'False'))
            else:
                # MCQ 4 choices
                correct_idx = request.POST.get('mcq_correct')
                choice_texts = request.POST.getlist('choice_text')
                for idx, text in enumerate(choice_texts):
                    if text.strip():
                        Choice.objects.create(
                            question=question,
                            choice_text=text.strip(),
                            is_correct=(str(idx) == str(correct_idx))
                        )

            messages.success(request, "Question added successfully!")
            return redirect('quizzes:manage_questions', quiz_id=quiz.id)
    else:
        next_order = quiz.questions.count() + 1
        q_form = QuestionForm(initial={'order': next_order})

    return render(request, 'quizzes/question_form.html', {
        'quiz': quiz,
        'q_form': q_form,
        'action': 'Add',
    })

@login_required
def delete_question(request, question_id):
    """Delete a question from a quiz."""
    question = get_object_or_404(Question, id=question_id)
    quiz = question.quiz
    if quiz.created_by != request.user and not request.user.is_staff:
        messages.error(request, "Permission denied.")
        return redirect('quizzes:quiz_detail', pk=quiz.id)

    question.delete()
    messages.success(request, "Question deleted successfully.")
    return redirect('quizzes:manage_questions', quiz_id=quiz.id)
