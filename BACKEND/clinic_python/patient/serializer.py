from rest_framework import serializers
from clinic_python.models.patient_model import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'username', 'first_name', 'middle_name', 'last_name', 'suffix', 'email', 'age', 'sex', 'birthday', 'maritalstatus', 'profilePicture']
