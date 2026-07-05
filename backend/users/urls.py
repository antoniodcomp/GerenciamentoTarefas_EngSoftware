from django.urls import path
from .views import hello_backend, UserRegistrationView, LoginView, PasswordResetConfirmView, PasswordResetRequestView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('hello/', hello_backend, name='hello_backend'),
    path('registro/', UserRegistrationView.as_view(), name='user_registration'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('recuperar-senha/solicitar/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('recuperar-senha/confirmar/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]