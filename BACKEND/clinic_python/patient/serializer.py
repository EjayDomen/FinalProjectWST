from rest_framework import serializers
from clinic_python.models.patient_model import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'username', 'first_name', 'middle_name', 'last_name', 'suffix', 'email', 'age', 'sex', 'birthday', 'maritalstatus', 'profilePicture']


class UserProfileSerializer(serializers.ModelSerializer):
    profilePicture = serializers.SerializerMethodField()

    def get_profilePicture(self, obj):
        request = self.context.get('request') 
        if obj.profilePicture:  
            return request.build_absolute_uri(obj.profilePicture.url)  
        return None

    class Meta:
        model = Patient
        fields = '__all__'