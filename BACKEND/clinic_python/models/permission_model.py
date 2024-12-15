from django.db import models

class Permission(models.Model):
    permission_name = models.CharField(max_length=50)

    def __str__(self):
        return self.permission_name
