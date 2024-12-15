# clinic_python/models/appointment_model.py
from django.db import models

class Appointment(models.Model):

    APPOINTMENT_STATUS_CHOICES = [
        ("pending", "pending"),
        ("in-queue", "in-queue"),
        ("completed", "completed"),
        ("missed", "missed"),
        ("cancelled", "cancelled"),
    ]

    TYPE_CHOICES=[
        ("consultation ", "consultation "),
        ("certificates", "certificates "),
        ("others", "others"),
    ]

    patientid = models.ForeignKey('clinic_python.Patient', on_delete=models.CASCADE)  # Use string notation
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    suffix = models.CharField(max_length=50)
    age = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    sex = models.CharField(max_length=50)
    contact_number = models.CharField(max_length=50)
    appointment_time = models.DateTimeField()
    appointment_date = models.DateField()
    purpose = models.TextField()
    status = models.CharField(max_length=50, choices=APPOINTMENT_STATUS_CHOICES, default="Pending")  # e.g., pending, confirmed, completed
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='none')
    staff = models.ForeignKey('clinic_python.User', on_delete=models.CASCADE)  # Use string notation
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.patientid} appointment with {self.staff}'  # Avoid using the `doctor` field that doesn't exist in your model
