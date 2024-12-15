from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny




def register_patient(request):
    if request.method == 'POST':
        # Handle the form data here (e.g., save a new patient to the database)
        return HttpResponse("Patient registered successfully!")
    else:
        # Render the registration form
        return HttpResponse("This is the patient registration page.")

def login_patient(request):
    if request.method == 'POST':
        # Handle login logic here, e.g., check credentials
        return HttpResponse("Patient login successful!")
    else:
        # Display login form
        return HttpResponse("This is the patient login page.")