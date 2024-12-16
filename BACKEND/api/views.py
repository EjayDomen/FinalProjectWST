from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics  # Correct import
from .serializers import UserSerializer  # Make sure this serializer exists and is implemented
from rest_framework.permissions import AllowAny

# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Use your custom serializer
    permission_classes = [AllowAny]
