# clinic_python/models/appointment_model.py
from django.db import models

class Appointment(models.Model):

    APPOINTMENT_STATUS_CHOICES = [
        ("pending", "pending"),
        ("completed", "completed"),
    ]

    TYPE_CHOICES=[
        ("medicine ", "medicine "),
        ("medicalabstract", "medicalabstract "),
        ("others", "others"),
    ]

    patientid = models.ForeignKey('clinic_python.Patient', on_delete=models.CASCADE)  # Use string notation
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    suffix = models.CharField(max_length=50)
    contactnumber = models.CharField(max_length=50)
    requestdate = models.DateField()
    status = models.CharField(max_length=50, choices=APPOINTMENT_STATUS_CHOICES, default="pending")  # e.g., pending, confirmed, completed
    requestpurpose = models.CharField(max_length=100, choices=TYPE_CHOICES, default='medicine')
    staff = models.ForeignKey(
        'clinic_python.Staff', 
        on_delete=models.CASCADE, 
        null=True,  # Allows the staff field to be null
        blank=True  # Allows this field to be empty in forms
    )
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.patientid} appointment with {self.staff}'  # Avoid using the `doctor` field that doesn't exist in your model
