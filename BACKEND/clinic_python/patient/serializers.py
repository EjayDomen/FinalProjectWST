from rest_framework import serializers
from clinic_python.models.patient_model import Patient
from django.contrib.auth.hashers import make_password

class PatientSerializer(serializers.ModelSerializer):
    profilePicture = serializers.ImageField(required=False)

    class Meta:
        model = Patient
        fields = ['firstName', 'lastName', 'email', 'campus', 'age', 'sex', 'emergency_contact_number','emergency_contact_relation', 'address', 'profilePicture','campus','bloodtype', 'allergies', 'college_office', 'course_designation', 'year']

class UpdatePasswordSerializer(serializers.ModelSerializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Patient
        fields = ['email', 'password']

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.password = make_password(validated_data['password'])
        instance.save()
        return instance