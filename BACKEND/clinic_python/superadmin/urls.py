# clinic_python/superadmin/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='superadmin_dashboard'),
    path('createSuperAdmin/', views.create_superadmin, name='create_superadmin'),
    # Add other paths for superadmin-related views here
]
