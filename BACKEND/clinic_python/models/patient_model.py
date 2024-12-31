# models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

def upload_to(instance, filename):
    return 'profile_pictures/{filename}'.format(filename=filename)


class Patient(models.Model):
    student_or_employee_no = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True)
    campus = models.CharField(max_length=100)
    patient_type = models.CharField(max_length=100, default="student")
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
    profilePicture = models.ImageField(default="default.png", blank=True)
    user_level_id = models.ForeignKey(
        "clinic_python.Role", on_delete=models.CASCADE, null=True, blank=True
    )
    is_deleted = models.BooleanField(default=False)  # Default is False
    createdAt = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
