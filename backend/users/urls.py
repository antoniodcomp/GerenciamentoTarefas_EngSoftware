from django.urls import path
from .views import (
    hello_backend, UserRegistrationView, LoginView,
    PasswordResetConfirmView, PasswordResetRequestView,
    UserProfileView, ChangePasswordView, UserListView, UserTipoUpdateView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('hello/', hello_backend, name='hello_backend'),
    path('registro/', UserRegistrationView.as_view(), name='user_registration'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('recuperar-senha/solicitar/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('recuperar-senha/confirmar/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('perfil/', UserProfileView.as_view(), name='user_profile'),
    path('perfil/alterar-senha/', ChangePasswordView.as_view(), name='change_password'),
    path('lista/', UserListView.as_view(), name='user_list'),
    path('<int:pk>/tipo/', UserTipoUpdateView.as_view(), name='user_tipo_update'),
]