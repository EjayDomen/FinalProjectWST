from rest_framework import serializers
from clinic_python.models.patient_model import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'username', 'first_name', 'middle_name', 'last_name', 'suffix', 'email', 'age', 'sex', 'birthday', 'maritalstatus', 'profilePicture']


class UserProfileSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None  # Or a default image URL

    class Meta:
        model = Patient
        fields = ['profilePicture']