from django.db import models

# Feedback Model
class Feedback(models.Model):
    user = models.ForeignKey('clinic_python.Patient', on_delete=models.CASCADE)
    rating = models.IntegerField()
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user.username}"  
