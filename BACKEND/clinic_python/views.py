from django.shortcuts import render, redirect
from django.http import JsonResponse
import json
import datetime
import jwt
from django.conf import settings
import bcrypt
from django.conf import settings
from clinic_python.models import Staff
from clinic_python.models import Patient
from clinic_python.models import SuperAdmin
from clinic_python.models import Role
from django.contrib import messages
  # Make sure to import the models
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken

# Patient Registration
@csrf_exempt
def register_patient(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            body = json.loads(request.body)

            # Extract data from the request body
            username = body.get('username')
            first_name = body.get('first_name')
            middle_name = body.get('middle_name', '')
            last_name = body.get('last_name')
            suffix = body.get('suffix', '')
            email = body.get('email')
            age = body.get('age')
            sex = body.get('sex')
            password = body.get('password')
            birthday = body.get('birthday')
            maritalstatus = body.get('maritalstatus')
            user_level_id = 3

            # Validate required fields
            required_fields = [
                'first_name', 'last_name',
                'email', 'age', 'sex', 'password', 'birthday', 'maritalstatus'
            ]
            for field in required_fields:
                if not locals().get(field):
                    return JsonResponse({'error': f'{field} is required'}, status=400)

            # Hash the password before saving
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Decode to string

            # Retrieve the Role object based on the user_level_id
            try:
                user_level = Role.objects.get(id=user_level_id)
            except Role.DoesNotExist:
                return JsonResponse({'error': 'Invalid user level ID'}, status=400)

            # Create and save the new patient
            new_patient = Patient.objects.create(
                username = username,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                suffix=suffix,
                email=email,
                age=age,
                sex=sex,
                password= hashed_password,
                birthday = birthday,
                maritalstatus = maritalstatus,
                user_level_id=user_level
            )

            # Assuming user_level is a foreign key to a Role model
            role_data = {
                'id': new_patient.user_level_id.id,
            }

            # Return the created patient's data including its ID
            return JsonResponse({
                'message': 'Patient registered successfully!',
                'patient': {
                    'id': new_patient.id,
                    'username': new_patient.username,
                    'first_name': new_patient.first_name,
                    'middle_name': new_patient.middle_name,
                    'last_name': new_patient.last_name,
                    'suffix': new_patient.suffix,
                    'email': new_patient.email,
                    'age': new_patient.age,
                    'sex': new_patient.sex,
                    'birthday': new_patient.birthday,
                    'maritalstatus': new_patient.maritalstatus,
                    'user_level_id': role_data
                }
            }, status=201)

        except json.JSONDecodeError:    
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    else:
        return JsonResponse({'message': 'Patient registration page.'})


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        # Parse request body
        body = json.loads(request.body)
        email = body.get('EMAIL')
        password = body.get('PASSWORD')

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)

        user = None
        role = None

        # Authenticate user (Staff, Patient, Admin)
        try:
            user = Staff.objects.get(email=email)
            role = 'Staff'
        except Staff.DoesNotExist:
            try:
                user = Patient.objects.get(email=email, is_deleted=False)
                role = 'Patient'
            except Patient.DoesNotExist:
                try:
                    user = SuperAdmin.objects.get(email=email)
                    role = 'Admin'
                except SuperAdmin.DoesNotExist:
                    return JsonResponse({'error': 'User not found'}, status=404)

        # Validate password
        valid_password = bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8"))
        if not valid_password:
            return JsonResponse({'error': 'Invalid password'}, status=401)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        

        # Add custom claims to token for role and ID
        refresh['role'] = role
        refresh['id'] = user.id
        access_token = str(refresh.access_token)

        # Return tokens and user role
        return JsonResponse({
            'refresh': str(refresh),
            'access': access_token,
            'role': role,
            "patient": user.id
        }, status=200)

    except Exception as e:
        return JsonResponse({'error': f'Error during login: {str(e)}'}, status=500)

