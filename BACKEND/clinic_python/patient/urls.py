
from django.urls import path
from . import views
from . import appointment
from . import medicalrecord
from django.conf.urls.static import static
from django.conf import settings
from .views import UpdatePatientDetails
from . import feedback

urlpatterns = [
    path('me/', views.get_patient_details, name='Profile'),
    path('update-patient/', UpdatePatientDetails.as_view(), name='update-patient'),
    path('deleteAcc/', views.soft_delete_patient, name= 'Delete'),
    path('update-password/', views.UpdatePasswordView, name='update-password'),
    path('createAppointment/', appointment.create_request, name='create-request'),
    path('viewAppointment/', appointment.view_all_appointments, name= 'view_all_appointments'),
    path('details/', views.get_patient_details_by_student_or_employee_no, name='get_patient_details_by_student_or_employee_no'),
    path('treatment-summary/<str:view_type>/', medicalrecord.get_treatment_summary, name="treatment-summary"),
    path('medical_records/', medicalrecord.get_medical_records, name='get_medical_records'),
    path('submitfeedback/', feedback.submit_feedback, name='submit_feedback')
    # Add other paths for superadmin-related views here
]   

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
