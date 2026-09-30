from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """
    UserProfile extends Django's built-in User model.
    Stores additional personal information like bio, profile avatar, and role.
    """
    ROLE_CHOICES = (
        ('Student', 'Student / Candidate'),
        ('Creator', 'Quiz Creator / Teacher'),
        ('Admin', 'Administrator'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_image = models.ImageField(upload_to='profile_pics/', default='default_avatar.png', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Student')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile ({self.role})"

# Automatic creation of profile on User instance save
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
