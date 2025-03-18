from rest_framework import serializers
from clinic_python.models.admin_model import Staff  # Update the model import if needed

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class StaffProfileSerializer(serializers.ModelSerializer):
    profilePicture = serializers.SerializerMethodField()

    def get_profilePicture(self, obj):
        request = self.context.get('request') 
        if obj.profilePicture:  
            return request.build_absolute_uri(obj.profilePicture.url)  
        return None

    class Meta:
        model = Staff
        fields = '__all__'
