from django.db import models

class MedicalRecord(models.Model):
    patientid = models.ForeignKey('clinic_python.Patient', on_delete=models.CASCADE)
    transactiontype = models.CharField(max_length=100)
    date = models.DateField()
    transactiondetails = models.CharField(max_length=100)
    height = models.CharField(max_length=50)
    weight = models.CharField(max_length=50)
    age = models.CharField(max_length=50)
    hr = models.CharField(max_length=50)
    rr = models.CharField(max_length=50)
    temperature = models.CharField(max_length=50)
    bloodpressure = models.CharField(max_length=50)
    painscale = models.CharField(max_length=50)
    othersymptoms = models.CharField(max_length=255)
    initialdiagnosis = models.CharField(max_length=255)
    notes = models.CharField(max_length=255)
    age = models.CharField(max_length=50)
    attendingstaff = models.ForeignKey('clinic_python.User', on_delete=models.CASCADE)  # Use string notation

    def __str__(self):
        return f'{self.patientid} appointment with {self.attendingstaff}'
