
from django.urls import path
from . import views
from . import appointment
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('me/', views.get_patient_details, name='Profile'),
    path('updateProfile/', views.update_patient_details, name= 'UpdateProfile'),
    path('deleteAcc/', views.soft_delete_patient, name= 'Delete'),
    path('update-password/', views.UpdatePasswordView, name='update-password'),
    path('createAppointment/', appointment.create_appointment, name='create-appointment'),
    path('viewAppointment/', appointment.view_all_appointments, name= 'view_all_appointments'),
    path('details/', views.get_patient_details_by_student_or_employee_no, name='get_patient_details_by_student_or_employee_no'),
    # Add other paths for superadmin-related views here
]   

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
