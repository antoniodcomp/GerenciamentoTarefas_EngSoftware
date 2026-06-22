from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Encaminha para o app users
    path('api/', include('boards.urls')),       # Encaminha para o app boards (projetos)
]