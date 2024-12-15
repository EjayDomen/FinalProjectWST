from django.db import models


class QueueManagement(models.Model):
    status = models.CharField(max_length=50)  # e.g., in-progress, completed, waiting
    date = models.DateField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    def __str__(self):
        return f'Queue {self.status} for {self.date}'
