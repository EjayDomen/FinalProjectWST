# admin.py
from django.contrib import admin

# Import models from models folder (not too early in the process)
from clinic_python.models import patient_model, appointment_model, admin_model, medicalrecord_model, queue_model

# Customizing Patient Admin
@admin.register(patient_model.Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email')
    search_fields = ('first_name', 'last_name', 'email')

# Customizing Appointment Admin
@admin.register(appointment_model.Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patientid', 'appointment_date', 'status')
    list_filter = ('status', 'appointment_date')

# Customizing User Admin (Admin model)
@admin.register(admin_model.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'role')
    search_fields = ('first_name', 'last_name', 'email', 'role')

@admin.register(medicalrecord_model.MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patientid', 'transactiontype', 'date', 'transactiondetails')
    search_fields = ('patientid', 'transactiontype', 'date', 'transactiondetails')

@admin.register(queue_model.Queue)
class queueAdmin(admin.ModelAdmin):
    list_display = ('queue_number', 'appointment', 'patient', 'date', 'is_priority')
    search_fields = ('queue_number', 'appointment', 'patient', 'date')

