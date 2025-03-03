# clinic_python/superadmin/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='superadmin_dashboard'),
    path('createSuperAdmin/', views.create_superadmin, name='create_superadmin'),
    path('me/', views.view_logged_in_superadmin, name='view_logged_in_superadmin'),
    path('updateProfile/', views.update_superadmin_details, name='update_superadmin_details'),
    path('countPatient/', views.count_patient_types, name='count_patient_types'),
    path('activePatient/', views.count_patient_status, name='count_patient_status'),
    path('requestCount/', views.get_request_counts, name='get_request_counts'),
    # Add other paths for superadmin-related views here
]
