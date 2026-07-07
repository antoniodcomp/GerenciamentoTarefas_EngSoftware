from django.urls import path
from .views import (
    hello_backend, UserRegistrationView, LoginView,
    PasswordResetConfirmView, PasswordResetRequestView,
    UserProfileView, ChangePasswordView, UserListView, UserTipoUpdateView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('hello/', hello_backend, name='hello_backend'),
    path('register/', UserRegistrationView.as_view(), name='user_registration'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('list/', UserListView.as_view(), name='user_list'),
    path('<int:pk>/role/', UserTipoUpdateView.as_view(), name='user_tipo_update'),
]