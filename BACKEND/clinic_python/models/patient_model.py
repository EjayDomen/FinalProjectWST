# models.py
from django.db import models

class Patient(models.Model):
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True)
    campus = models.CharField(max_length=100)
    college_office = models.CharField(max_length=100)
    course_designation = models.CharField(max_length=100)
    year = models.CharField(max_length=100)
    emergency_contact_number = models.CharField(max_length=15)
    emergency_contact_relation = models.CharField(max_length=15)
    bloodtype = models.CharField(max_length=15)
    allergies = models.TextField(blank=True)
    email = models.EmailField()
    age = models.CharField(max_length=15)
    sex = models.CharField(max_length=10)
    password = models.CharField(max_length=255)
    address = models.TextField()
    user_level_id = models.ForeignKey(
        "clinic_python.Role", on_delete=models.CASCADE, null=True, blank=True
    )
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
