"""
Shared abstract models for the Meridian backend.

TimeStampedModel provides `created_at` and `updated_at` fields
to all models that inherit from it.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TimeStampedModel(models.Model):
    """
    Abstract base model that provides automatic `created_at` and `updated_at` fields.

    All concrete models in this project should inherit from this class
    to get consistent, automatic timestamping without boilerplate.
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Profile(TimeStampedModel):
    """
    User profile linked to Django's built-in User model.
    Stores AI credits, subscription status, and admin privileges.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    ai_credits = models.IntegerField(default=30)
    is_premium = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} Profile"
