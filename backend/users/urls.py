from django.urls import path
from .views import hello_backend, UserRegistrationView

urlpatterns = [
    path('hello/', hello_backend, name='hello_backend'),
    path('registro/', UserRegistrationView.as_view(), name='user_registration'),
    path('login/', LoginView.as_view(), name='login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]