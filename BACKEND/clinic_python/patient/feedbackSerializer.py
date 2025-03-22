from rest_framework import serializers
from clinic_python.models.feedback_model import Feedback


# Serializer
class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'