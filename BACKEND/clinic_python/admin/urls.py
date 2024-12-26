# clinic_python/superadmin/urls.py

from django.urls import path
from . import views
from . import joinqueue
from . import patients
from . import queuemanagement
from . import appointment
from . import medicalrecord

urlpatterns = [
    path('', views.dashboard, name='admin_dashboard'),
    path('createStaff/', views.create_staff, name='create_staff'),
    path('joinqueue/', joinqueue.join_queue, name='join_queue'),
    path('viewqueue/', joinqueue.view_queue, name='view_queue'),
    path('updatequeuestatus/', joinqueue.update_queue_status, name='update_queue_status'),
    path('getallpatients/', patients.get_patients, name='get_patients'),
    path('deletepatient/', patients.delete_patient, name='delete_patient'),
    path('archivedpatient/', patients.get_archived_patients, name='get_archived_patients'),
    path('restorepatient/', patients.restore_patient, name='restore_patient'),
    path('viewallqm/', queuemanagement.get_all_queue_management, name='get_all_queue_management'),
    path('showallappointment/', appointment.get_all_appointments, name='get_all_appointments'),
    path('createmedicalrecord/', medicalrecord.create_medical_record , name='create_medical_record'),
    path('medical-records/<int:patient_id>/', medicalrecord.get_medical_records_by_patient, name='get_medical_records_by_patient'),
    path('show-allstaff/', views.get_all_staff , name='get_all_staff'),
    # Add other paths for superadmin-related views here
]
