from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db import transaction
from quizzes.models import Quiz, Question, Choice
from .models import UserAttempt, UserAnswer

@login_required
def start_quiz_attempt(request, quiz_id):
    """
    Renders the interactive quiz interface.
    Loads all questions and choices for client-side navigation.
    """
    quiz = get_object_or_404(Quiz, id=quiz_id, is_active=True)
    questions = quiz.questions.all().prefetch_related('choices')

    if not questions.exists():
        messages.warning(request, "This quiz currently has no questions. Please check back later.")
        return redirect('quizzes:quiz_detail', pk=quiz.id)

    # Record started_at timestamp in user session
    session_key = f'quiz_{quiz.id}_started_at'
    if session_key not in request.session:
        request.session[session_key] = timezone.now().isoformat()

    return render(request, 'attempts/quiz_attempt.html', {
        'quiz': quiz,
        'questions': questions,
        'time_limit_seconds': quiz.time_limit * 60,
    })

@login_required
@transaction.atomic
def submit_quiz(request, quiz_id):
    """
    SECURE SERVER-SIDE SCORE CALCULATION.
    Processes submitted answers, compares with database choices, prevents tampering,
    calculates correct/wrong/unanswered, percentage, and saves records.
    """
    if request.method != 'POST':
        return redirect('quizzes:quiz_detail', pk=quiz_id)

    quiz = get_object_or_404(Quiz, id=quiz_id)
    questions = quiz.questions.all().prefetch_related('choices')

    # Retrieve started time from session or fallback
    session_key = f'quiz_{quiz.id}_started_at'
    started_at_str = request.session.pop(session_key, None)
    if started_at_str:
        started_at = timezone.datetime.fromisoformat(started_at_str)
    else:
        started_at = timezone.now()

    # Time taken in seconds
    time_taken_input = request.POST.get('time_taken')
    try:
        time_taken = int(time_taken_input) if time_taken_input else int((timezone.now() - started_at).total_seconds())
    except (ValueError, TypeError):
        time_taken = 0

    score = 0
    total_marks = 0
    correct_count = 0
    wrong_count = 0
    unanswered_count = 0

    # Create parent UserAttempt record
    attempt = UserAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=0,
        total_marks=0,
        percentage=0.0,
        correct_answers=0,
        wrong_answers=0,
        unanswered=0,
        started_at=started_at,
        time_taken=time_taken
    )

    user_answers_to_create = []

    for question in questions:
        total_marks += question.marks
        post_key = f'question_{question.id}'
        selected_choice_id = request.POST.get(post_key)

        if not selected_choice_id:
            # Unanswered question
            unanswered_count += 1
            user_answers_to_create.append(UserAnswer(
                attempt=attempt,
                question=question,
                selected_choice=None,
                is_correct=False,
                marks_obtained=0
            ))
        else:
            try:
                choice = Choice.objects.get(id=int(selected_choice_id), question=question)
                if choice.is_correct:
                    correct_count += 1
                    score += question.marks
                    is_correct = True
                    marks_obtained = question.marks
                else:
                    wrong_count += 1
                    is_correct = False
                    marks_obtained = 0

                user_answers_to_create.append(UserAnswer(
                    attempt=attempt,
                    question=question,
                    selected_choice=choice,
                    is_correct=is_correct,
                    marks_obtained=marks_obtained
                ))
            except (Choice.DoesNotExist, ValueError):
                # Invalid choice submitted
                wrong_count += 1
                user_answers_to_create.append(UserAnswer(
                    attempt=attempt,
                    question=question,
                    selected_choice=None,
                    is_correct=False,
                    marks_obtained=0
                ))

    # Bulk insert user answers
    UserAnswer.objects.bulk_create(user_answers_to_create)

    # Compute percentage formula: Percentage = (Score / Total Marks) * 100
    percentage = round((score / total_marks * 100), 2) if total_marks > 0 else 0.0

    # Update attempt summary
    attempt.score = score
    attempt.total_marks = total_marks
    attempt.percentage = percentage
    attempt.correct_answers = correct_count
    attempt.wrong_answers = wrong_count
    attempt.unanswered = unanswered_count
    attempt.save()

    messages.success(request, f"Quiz submitted successfully! You scored {score}/{total_marks} ({percentage}%).")
    return redirect('attempts:quiz_result', attempt_id=attempt.id)

@login_required
def quiz_result(request, attempt_id):
    """Displays detailed score breakdown and review of user answers."""
    attempt = get_object_or_404(UserAttempt, id=attempt_id)
    if attempt.user != request.user and not request.user.is_staff:
        messages.error(request, "Permission denied.")
        return redirect('quizzes:quiz_list')

    user_answers = attempt.user_answers.select_related('question', 'selected_choice').prefetch_related('question__choices')

    return render(request, 'attempts/quiz_result.html', {
        'attempt': attempt,
        'user_answers': user_answers,
    })

@login_required
def attempt_history(request):
    """Displays chronological history of all quiz attempts by the user."""
    attempts = UserAttempt.objects.filter(user=request.user).select_related('quiz', 'quiz__category').order_by('-completed_at')
    return render(request, 'attempts/attempt_history.html', {
        'attempts': attempts,
    })
