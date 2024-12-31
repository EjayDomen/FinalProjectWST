from django.contrib import admin
from django.urls import path, include
from . import views
from api.views import CreateUserView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/superadmin/', include('clinic_python.superadmin.urls')),
    path('api/admin/', include('clinic_python.admin.urls')),
    path('api/patient/', include('clinic_python.patient.urls')), 
    path('api/auth/', include('clinic_python.authentication.urls')),
    path('api/register/', views.register_patient, name='register_patient'),
    path('api/login/', views.login_view, name='login_patient'),
    path('demo/register/', views.register_patient_demo, name='register_patient_demo'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)