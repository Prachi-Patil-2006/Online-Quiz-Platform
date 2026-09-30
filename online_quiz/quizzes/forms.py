from django import forms
from .models import Quiz, Question, Choice

class QuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ['title', 'description', 'category', 'difficulty', 'time_limit', 'is_active']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Python Core Concepts'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Provide an overview of the quiz topics...'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'difficulty': forms.Select(attrs={'class': 'form-select'}),
            'time_limit': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 180}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ['question_text', 'question_type', 'marks', 'order', 'explanation']
        widgets = {
            'question_text': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Enter question problem statement...'}),
            'question_type': forms.Select(attrs={'class': 'form-select', 'id': 'id_question_type'}),
            'marks': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'order': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'explanation': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Explanation shown to students after completion...'}),
        }

class ChoiceForm(forms.ModelForm):
    class Meta:
        model = Choice
        fields = ['choice_text', 'is_correct']
        widgets = {
            'choice_text': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Choice option text'}),
            'is_correct': forms.CheckboxInput(attrs={'class': 'form-check-input choice-correct-checkbox'}),
        }
