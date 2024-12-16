import json
import jwt
import bcrypt
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from clinic_python.models.patient_model import Patient
from django.contrib.auth.decorators import login_required
from .serializers import UpdatePasswordSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password

@csrf_exempt
def get_patient_details(request):
    # Extract token from Authorization header
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.split(' ')[1] if 'Bearer ' in auth_header else None

    if not token:
        return JsonResponse({'error': 'Token not provided'}, status=401)

    try:
        # Decode JWT token
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
        patient_id = payload.get('id')

        # Fetch patient details
        try:
            patient = Patient.objects.get(id=patient_id)
            patient_data = {
                'id': patient.id,
                'student_or_employee_no': patient.student_or_employee_no,
                'first_name': patient.first_name,
                'middle_name': patient.middle_name,
                'last_name': patient.last_name,
                'suffix': patient.suffix,
                'campus': patient.campus,
                'college_office': patient.college_office,
                'course_designation': patient.course_designation,
                'year': patient.year,
                'emergency_contact_number': patient.emergency_contact_number,
                'emergency_contact_relation': patient.emergency_contact_relation,
                'bloodtype': patient.bloodtype,
                'allergies': patient.allergies,
                'email': patient.email,
                'age': patient.age,
                'sex': patient.sex,
                'address': patient.address,
            }
            return JsonResponse(patient_data, status=200)
        except Patient.DoesNotExist:
            return JsonResponse({'error': 'Patient not found'}, status=404)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Token has expired'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid token'}, status=401)


from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os

@csrf_exempt
def update_patient_details(request):
    if request.method == 'PUT':
        try:
            # Handle file upload if present
            image = request.FILES.get('image')  # assuming the image is sent as 'image' field
            if image:
                # Save the image to the media folder (or handle as needed)
                fs = FileSystemStorage(location=settings.MEDIA_ROOT)  # You can specify a custom path here
                image_name = fs.save(image.name, image)
                image_url = fs.url(image_name)  # URL to access the image

            # Parse the JSON body of the request
            body = json.loads(request.body)
            # Extract fields from request body
            student_or_employee_no = body.get('student_or_employee_no')
            last_name = body.get('lastName')
            first_name = body.get('firstName')
            middle_name = body.get('middleName')
            suffix = body.get('suffix', '')
            email = body.get('email')
            campus = body.get('campus')
            age = body.get('age')
            sex = body.get('sex')
            emergency_contact_number = body.get('emergency_contact_number')
            emergency_contact_relation = body.get('emergency_contact_relation')
            address = body.get('address')
            bloodtype = body.get('bloodtype')
            allergies = body.get('allergies', '')
            college_office = body.get('college_office')
            course_designation = body.get('course_designation')
            year = body.get('year')

            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization', '')
            token = auth_header.split(' ')[1] if 'Bearer ' in auth_header else None

            if not token:
                return JsonResponse({'error': 'Token not provided'}, status=401)

            # Decode JWT token to get patient ID
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
                patient_id = payload.get('id')
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)

            # Find the patient
            try:
                patient = Patient.objects.get(id=patient_id)
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Patient not found'}, status=404)

            # Update only the provided fields
            if student_or_employee_no: patient.student_or_employee_no = student_or_employee_no
            if first_name: patient.first_name = first_name
            if last_name: patient.last_name = last_name
            if middle_name: patient.middle_name = middle_name
            if suffix: patient.suffix = suffix
            if email: patient.email = email
            if campus: patient.campus = campus
            if age: patient.age = age
            if sex: patient.sex = sex
            if emergency_contact_number: patient.emergency_contact_number = emergency_contact_number
            if emergency_contact_relation: patient.emergency_contact_relation = emergency_contact_relation
            if address: patient.address = address
            if bloodtype: patient.bloodtype = bloodtype
            if allergies: patient.allergies = allergies
            if college_office: patient.college_office = college_office
            if course_designation: patient.course_designation = course_designation
            if year: patient.year = year
            if image: patient.image = image_url  # Add the image URL if provided

            # Save changes
            patient.save()

            # Return updated patient details
            patient_data = {
                'id': patient.id,
                'student_or_employee_no': student_or_employee_no,
                'first_name': patient.first_name,
                'middle_name': patient.middle_name,
                'last_name': patient.last_name,
                'suffix': patient.suffix,
                'email': patient.email,
                'campus': patient.campus,
                'age': patient.age,
                'sex': patient.sex,
                'emergency_contact_number': patient.emergency_contact_number,
                'emergency_contact_relation': patient.emergency_contact_relation,
                'address': patient.address,
                'bloodtype': patient.bloodtype,
                'allergies': patient.allergies,
                'college_office': patient.college_office,
                'course_designation': patient.course_designation,
                'year': patient.year,
                'image': image_url if image else None  # Return the image URL if updated
            }
            return JsonResponse(patient_data, status=200)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    else:
        return JsonResponse({'message': 'This endpoint only supports PUT requests.'}, status=405)


@csrf_exempt
def soft_delete_patient(request):
    if request.method == 'PUT':
        # Extract token from Authorization header
         # Extract token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        token = auth_header.split(' ')[1] if 'Bearer ' in auth_header else None

        if not token:
            return JsonResponse({'error': 'Token not provided'}, status=401)


        try:
            # Decode JWT token to get patient ID
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
            patient_id = payload.get('id')
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)

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

            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization', '')
            token = auth_header.split(' ')[1] if 'Bearer ' in auth_header else None

            if not token:
                return JsonResponse({'error': 'Token not provided'}, status=401)

            # Decode JWT token to get patient ID
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
                patient_id = payload.get('id')
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