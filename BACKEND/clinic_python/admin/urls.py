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
    path('me/', views.get_staff_detail, name='get_staff_detail'),
    path('update_staff/', views.update_logged_in_staff, name='get_staff_detail'),
    
    path('createStaff/', views.create_staff, name='create_staff'),
    path('deleteStaff/<int:id>/', views.delete_staff, name='delete_staff'),
    path('editStaff/<int:id>/', views.edit_staff, name='edit_staff'),
    path('get_archived_staff/', views.get_archived_staff, name='get_archived_staff'),
    path('restore_staff/<int:id>/', views.restore_staff, name='restore_staff'),
    
    path('joinqueue/', joinqueue.join_queue, name='join_queue'),
    path('viewqueue/', joinqueue.view_queue, name='view_queue'),
    path('updatequeuestatus/', joinqueue.update_queue_status, name='update_queue_status'),
    path('getallpatients/', patients.get_patients, name='get_patients'),
    path('deletepatient/<int:id>/', patients.delete_patient, name='delete_patient'),
    path('archivedpatient/', patients.get_archived_patients, name='get_archived_patients'),
    path('restorepatient/', patients.restore_patient, name='restore_patient'),
    path('viewallqm/', queuemanagement.get_all_queue_management, name='get_all_queue_management'),
    path('viewqmtoday/', queuemanagement.get_today_queue_management, name='get_today_queue_management'),
    path('queues/<int:qmid>/', queuemanagement.get_queues_by_qmid, name='get_queues_by_qmid'),
    path('update-queue-status/<int:queue_id>/', queuemanagement.update_queue_status, name='update_queue_status'),
    path('queue-management/<int:queue_id>/', queuemanagement.get_queue_management_by_id, name='get_queue_management_by_id'),
    
    
    path('showallappointment/', appointment.get_all_appointments, name='get_all_appointments'),
    path('patients/<int:patient_id>/medical-records/', medicalrecord.create_medical_record , name='create_medical_record'),
    path('medical-records/<int:patient_id>/', medicalrecord.get_medical_records_by_patient, name='get_medical_records_by_patient'),
    path('medical-records/<int:patient_id>/', medicalrecord.get_medical_records_by_patient, name='get_medical_records_by_patient'),
    path('show-allstaff/', views.get_all_staff , name='get_all_staff'),
    path('countapp/', appointment.count_all_appointments , name='count_all_appointment'),
    path('countpatients/', patients.count_all_patients , name='count_all_patient'),
    path('showtodayappointment/', appointment.get_todays_appointments , name='show_today_appointment'),
    path('reports/appointments/', appointment.get_appointment_details_report , name='get_appointment_details_report'),
    
    
    path('showtodayqueue/', joinqueue.get_first_5_waiting_queues , name='get_first_5_waiting_queues'),
    # Add other paths for superadmin-related views here
]
