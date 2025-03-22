from rest_framework import serializers
from clinic_python.models import Feedback
from clinic_python.models.patient_model import Patient

class FeedbackSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()  # Custom method to get patient's name

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'rating', 'comments', 'created_at']

    def get_user(self, obj):
        """Retrieve the full name of the patient."""
        if isinstance(obj.user, Patient):
            return f"{obj.user.first_name} {obj.user.last_name}"
        return None
