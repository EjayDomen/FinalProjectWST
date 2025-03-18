from django.db import models

class MedicalRecord(models.Model):
    patientid = models.ForeignKey('clinic_python.Patient', on_delete=models.CASCADE)
    date = models.DateField()
    timetreatment = models.CharField(max_length=100)  #start, end time
    medicineused = models.TextField(default="N/A", blank=True) #term will be use in ui Medicine given during treatment
    bpbefore = models.CharField(max_length=50)
    bpafter = models.CharField(max_length=50)
    weightbefore = models.CharField(max_length=50)
    weightafter = models.CharField(max_length=50)
    temperature = models.CharField(max_length=50)
    pulsebefore = models.CharField(max_length=50)
    pulseafter = models.CharField(max_length=50)
    generalremarks = models.TextField(default="N/A", blank=True)
    attendingstaff = models.ForeignKey('clinic_python.Staff', on_delete=models.CASCADE)  # Use string notation
    createdAt = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f'{self.patientid} appointment with {self.attendingstaff}'
