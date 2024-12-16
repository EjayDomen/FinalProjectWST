from django.db import models

class Staff(models.Model):

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    suffix = models.CharField(max_length=10, blank=True)
    specialization = models.CharField(max_length=255)
    email = models.EmailField()
    password = models.CharField(max_length=255)
    user_level_id = models.ForeignKey(
        "clinic_python.Role", on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f'{self.first_name} {self.last_name}'
