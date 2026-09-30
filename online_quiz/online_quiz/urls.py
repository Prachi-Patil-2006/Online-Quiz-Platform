"""
Root URL configuration for online_quiz project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from quizzes.views import HomeView, DashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', HomeView.as_view(), name='home'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    
    # App URLs
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('quizzes/', include('quizzes.urls', namespace='quizzes')),
    path('attempts/', include('attempts.urls', namespace='attempts')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
