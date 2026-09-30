from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserRegisterForm, UserUpdateForm, ProfileUpdateForm

def register_view(request):
    """Handles new user registration."""
    if request.user.is_authenticated:
        return redirect('quizzes:quiz_list')

    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()
            
            # Save chosen role to profile
            role = form.cleaned_data.get('role', 'Student')
            profile = user.profile
            profile.role = role
            profile.save()

            login(request, user)
            messages.success(request, f"Welcome to Online Quiz System, {user.username}! Your account has been registered.")
            return redirect('quizzes:quiz_list')
        else:
            messages.error(request, "Registration failed. Please check the errors below.")
    else:
        form = UserRegisterForm()

    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    """Authenticates users securely."""
    if request.user.is_authenticated:
        return redirect('quizzes:quiz_list')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {user.username}!")
                next_url = request.GET.get('next')
                return redirect(next_url if next_url else 'quizzes:quiz_list')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})

def logout_view(request):
    """Logs out current user session."""
    logout(request)
    messages.info(request, "You have been logged out successfully.")
    return redirect('home')

@login_required
def profile_view(request):
    """Allows user to view and update personal profile details."""
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        p_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user.profile)
        if u_form.is_valid() and p_form.is_valid():
            u_form.save()
            p_form.save()
            messages.success(request, "Your profile has been updated successfully!")
            return redirect('accounts:profile')
    else:
        u_form = UserUpdateForm(instance=request.user)
        p_form = ProfileUpdateForm(instance=request.user.profile)

    return render(request, 'accounts/profile.html', {
        'u_form': u_form,
        'p_form': p_form,
    })
