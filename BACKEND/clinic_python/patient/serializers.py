from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # Allows optional image upload

    class Meta:
        model = Patient
        fields = [
            'id', 'username', 'first_name', 'middle_name', 'last_name', 'suffix',
            'email', 'age', 'sex', 'birthday', 'maritalstatus', 'image'
        ]
