from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserProfileView,CustomTokenObtainPairView, get_user_by_id, health_check

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('users/<int:user_id>/', get_user_by_id, name='get_user'),
    path('health/', health_check, name='health'),
]