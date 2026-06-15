"""
Shared abstract models for the Meridian backend.

TimeStampedModel provides `created_at` and `updated_at` fields
to all models that inherit from it.
"""
from django.db import models


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
