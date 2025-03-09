import json
import jwt
import bcrypt
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from clinic_python.models.patient_model import Patient
from rest_framework_simplejwt.tokens import AccessToken
from django.core.files.storage import FileSystemStorage
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .serializer import PatientSerializer
import os



@csrf_exempt
def get_patient_details(request):
    
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
        # Extract the token from the header
    token = auth_header.split(' ')[1]
    access_token = AccessToken(token)
    role = access_token['role']  # Retrieve the user role from token claims
    patient_id = access_token['id']

    if not token:
        return JsonResponse({'error': 'Token not provided'}, status=401)

    try:
        # Decode JWT token
        

        # Fetch patient details
        try:
            patient = Patient.objects.get(id=patient_id)
            patient_data = {
                'id': patient.id,
                'username': patient.username,
                'first_name': patient.first_name,
                'middle_name': patient.middle_name,
                'last_name': patient.last_name,
                'suffix': patient.suffix,
                'email': patient.email,
                'age': patient.age,
                'sex': patient.sex,
                'birthday': patient.birthday,
                'maritalstatus' : patient.maritalstatus,
                'patientprofile' : patient.profilePicture.url if patient.profilePicture else None,
            }
            return JsonResponse(patient_data, status=200)
        except Patient.DoesNotExist:
            return JsonResponse({'error': 'Patient not found'}, status=404)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)



@method_decorator(csrf_exempt, name='dispatch')
class UpdatePatientDetails(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def put(self, request):
        try:
            # Handle image upload if present
            image = request.FILES.get('image')  
            image_url = None
            if image:
                fs = FileSystemStorage(location=settings.MEDIA_ROOT)
                image_name = fs.save(image.name, image)
                # Store only the relative path (Recommended)
                image_url = f"media/{image_name}"

            # Parse JSON body
            body = request.data if isinstance(request.data, dict) else json.loads(request.body)

            # Extract fields
            username = body.get('username')
            last_name = body.get('lastName')
            first_name = body.get('firstName')
            middle_name = body.get('middleName')
            suffix = body.get('suffix', '')
            email = body.get('email')
            age = body.get('age')
            sex = body.get('sex')
            birthday = body.get('birthday')
            maritalstatus = body.get('maritalstatus')

            # Extract token
            auth_header = request.headers.get('Authorization', '')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
            
            token = auth_header.split(' ')[1]

            # Decode JWT token to get patient ID
            try:
                access_token = AccessToken(token)
                patient_id = access_token['id']
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

            # Find patient
            try:
                patient = Patient.objects.get(id=patient_id)
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Patient not found'}, status=404)

            # Update fields dynamically
            update_data = {
                'username': username or patient.username,
                'first_name': first_name or patient.first_name,
                'middle_name': middle_name or patient.middle_name,
                'last_name': last_name or patient.last_name,
                'suffix': suffix or patient.suffix,
                'email': email or patient.email,
                'age': age or patient.age,
                'sex': sex or patient.sex,
                'birthday': birthday or patient.birthday,
                'maritalstatus': maritalstatus or patient.maritalstatus,
                'profilePicture': image_url or patient.profilePicture,
            }

            # Use serializer to update the patient record
            serializer = PatientSerializer(patient, data=update_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=200)
            else:
                return JsonResponse(serializer.errors, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

            

@csrf_exempt
def soft_delete_patient(request):
    if request.method == 'PUT':
        auth_header = request.headers.get('Authorization', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
            # Extract the token from the header
        token = auth_header.split(' ')[1]
        access_token = AccessToken(token)
        patient_id = access_token['id']

        # Find the patient
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return JsonResponse({'error': 'Patient not found'}, status=404)

        # Mark the patient as deleted
        patient.is_deleted = True
        patient.save()

        # Return success response
        return JsonResponse({'message': 'Patient marked as deleted successfully'}, status=200)
    else:
        return JsonResponse({'message': 'This endpoint only supports PUT requests.'}, status=405)


@csrf_exempt
def UpdatePasswordView(request):
    if request.method == 'PUT':
        try:
            # Parse the JSON body of the request
            body = json.loads(request.body)

            # Extract email and password fields from request body
            email = body.get('email')
            password = body.get('newPassword')

            if not email or not password:
                return JsonResponse({'error': 'Email and password are required'}, status=400)


            # Decode JWT token to get patient ID
            try:
                auth_header = request.headers.get('Authorization', '')
                if not auth_header or not auth_header.startswith('Bearer '):
                    return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
                    # Extract the token from the header
                token = auth_header.split(' ')[1]
                access_token = AccessToken(token)
                patient_id = access_token['id']
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

            # Find the patient
            try:
                patient = Patient.objects.get(id=patient_id)
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Patient not found'}, status=404)
            
            # Hash the password before saving
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Decode to string

            # Update the patient's email and password
            patient.email = email
            patient.password = hashed_password # Hash the password before saving

            # Save the patient object
            patient.save()

            # Return updated patient details (excluding password)
            patient_data = {
                'id': patient.id,
                'email': patient.email,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
            }
            return JsonResponse(patient_data, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'message': 'This endpoint only supports PUT requests.'}, status=405)
    
    
    
    
@csrf_exempt
def get_patient_details_by_student_or_employee_no(request):
    # Extract the student_or_employee_no from URL parameters
    student_or_employee_no = request.GET.get('student_or_employee_no', None)
    
    if not student_or_employee_no:
        return JsonResponse({'error': 'student_or_employee_no parameter is required'}, status=400)

    try:
        # Fetch patient details by student_or_employee_no
        patient = Patient.objects.get(student_or_employee_no=student_or_employee_no)
        
        
        patient_data = {
            'id': patient.id,
            'username': patient.username,
            'first_name': patient.first_name,
            'middle_name': patient.middle_name,
            'last_name': patient.last_name,
            'suffix': patient.suffix,
            'email': patient.email,
            'age': patient.age,
            'sex': patient.sex,
            'birthday': patient.birthday,
            'maritalstatus': patient.maritalstatus
        }
        
        return JsonResponse(patient_data, status=200)
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
