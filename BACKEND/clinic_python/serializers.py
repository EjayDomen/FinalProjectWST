from django.contrib.auth.models import User
from rest_framework import serializers

class ImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageUpload
        fields = '__all__'