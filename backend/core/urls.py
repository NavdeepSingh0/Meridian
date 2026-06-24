from django.urls import path
from core.views import UserProfileView

urlpatterns = [
    path("profile/", UserProfileView.as_view(), name="auth-profile"),
]
