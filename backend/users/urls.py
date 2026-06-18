from django.urls import path
from .views import hello_backend

urlpatterns = [
    path('hello/', hello_backend, name='hello_backend'),
]