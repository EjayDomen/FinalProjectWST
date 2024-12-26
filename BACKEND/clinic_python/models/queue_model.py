from django.db import models

class Queue(models.Model):
    QUEUE_STATUS_CHOICES = [
        ("Waiting", "Waiting"),
        ("Served", "Served"),
        ("Skipped", "Skipped"),
        ("Pending", "Pending"),
    ]

    TICKET_TYPE_CHOICES = [
        ("walk-in", "Walk-in"),
        ("appointment", "Appointment"),
    ]

    TRANSACTION_TYPE_CHOICES = [
        ("Consultation", "Consultation"),
        ("Certificates", "Certificates"),
        ("Others", "Others"),
    ]

    queue_number = models.CharField(max_length=5)
    status = models.CharField(
        max_length=10, choices=QUEUE_STATUS_CHOICES, default="Pending"
    )
    ticket_type = models.CharField(
        max_length=15, choices=TICKET_TYPE_CHOICES, default="walk-in"
    )
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPE_CHOICES, default="Consultation"
    )
    is_priority = models.BooleanField(default=False)
    appointment = models.ForeignKey(
        "clinic_python.Appointment", on_delete=models.SET_NULL, null=True, blank=True
    )
    patient = models.ForeignKey(
        "clinic_python.Patient", on_delete=models.CASCADE, null=True, blank=True
    )
    qmid = models.ForeignKey(
        "clinic_python.QueueManagement", on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return f"Queue {self.queue_number} - {self.status}"
