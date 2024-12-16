from django.contrib import admin

# Import models from models folder (not too early in the process)
from clinic_python.models import (
    patient_model, 
    appointment_model, 
    admin_model, 
    medicalrecord_model, 
    queue_model, 
    roles_model
)

# Customizing Patient Admin
@admin.register(patient_model.Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email')  # Example: Add other fields as needed
    search_fields = ('first_name', 'last_name', 'email')

# Customizing Appointment Admin
@admin.register(appointment_model.Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patientid', 'appointment_date', 'status')  # Add 'doctor' or any related field
    list_filter = ('status', 'appointment_date')  # Example filter by doctor if there's a relation

# Customizing User Admin (Admin model)
@admin.register(admin_model.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email')  # Add 'is_active' or other useful fields
    search_fields = ('first_name', 'last_name', 'email')

# Customizing Medical Record Admin
@admin.register(medicalrecord_model.MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('patientid', 'transactiontype', 'date', 'transactiondetails')
    search_fields = ('patientid', 'transactiontype', 'date', 'transactiondetails')
    list_filter = ('transactiontype', 'date')  # Optional: Filter by transaction type or date


# Customizing Role Admin
@admin.register(roles_model.Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'role_name')  # Make sure to remove the empty string
    search_fields = ('role_name',)
    list_filter = ('role_name',)  # Optional: Filter by role name

