from django.db import models


class QueueManagement(models.Model):
    
    TRANSACTION_TYPE_CHOICES = [
        ("Consultation", "Consultation"),
        ("Certificates", "Certificates"),
        ("Others", "Others"),
    ]
    
    status = models.CharField(max_length=50)  # e.g., in-progress, completed, waiting
    date = models.DateField()
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPE_CHOICES, default="Consultation"
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f'Queue {self.status} for {self.date}'
