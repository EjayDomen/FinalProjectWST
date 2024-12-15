from django.contrib import admin
from django.urls import path

from . import views


from django.urls import path, include

urlpatterns = [
    path('admin1/', admin.site.urls),
    path('superadmin/', include('clinic_python.superadmin.urls')),
    path('admin/', include('clinic_python.admin.urls')),
    path('patient/', include('clinic_python.patient.urls')),
    path('auth/', include('clinic_python.authentication.urls')),
    path('register/', views.register_patient, name='register_patient'),
    path('login/', views.login_patient, name='login_patient')
]