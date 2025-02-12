from django.db import models

class Staff(models.Model):

    profilepicture = models.ImageField(default="default.png", blank=True)
    username = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True)
    workposition = models.CharField(max_length=255)
    address = models.CharField(max_length=100)
    phonenumber = models.CharField(max_length=100)
    maritalstatus = models.CharField(max_length=100)
    sex = models.CharField(max_length=10)
    birthday = models.DateField()
    email = models.EmailField()
    password = models.CharField(max_length=255)
    user_level_id = models.ForeignKey(
        "clinic_python.Role", on_delete=models.CASCADE, null=True, blank=True
    )
    is_deleted = models.BooleanField(default=False)  # Default is False

    def __str__(self):
        return f'{self.first_name} {self.last_name}'
