# models.py
from django.db import models
from django.utils.translation import gettext_lazy as _

def upload_to(instance, filename):
    return 'profile_pictures/{filename}'.format(filename=filename)


class Patient(models.Model):
    username = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    age = models.CharField(max_length=15)
    sex = models.CharField(max_length=15)
    birthday = models.DateField()
    maritalstatus = models.CharField(max_length=20)
    profilePicture = models.ImageField(default="default.png", blank=True)
    user_level_id = models.ForeignKey(
        "clinic_python.Role", on_delete=models.CASCADE, null=True, blank=True
    )
    is_deleted = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f'{self.first_name} {self.last_name}'
