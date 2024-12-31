from django.shortcuts import get_object_or_404
from clinic_python.models import MedicalRecord, Patient, Staff, SuperAdmin
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework_simplejwt.tokens import AccessToken

@csrf_exempt
def create_medical_record(request, patient_id):
    if request.method == 'POST':
        auth_header = request.headers.get('Authorization', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
            # Extract the token from the header
        token = auth_header.split(' ')[1]
        access_token = AccessToken(token)
        staff_id = access_token['id']  # Retrieve the user ID from token claims
        role = access_token['role']  # Retrieve the user role from token claims

        # # Check if the role is 'Staff'
        # if role != 'Staff' or role!= 'Admin':
        #     return JsonResponse({'error': 'Unauthorized role'}, status=403)
        try:
            # Parse the incoming JSON data
            data = json.loads(request.body)

            # Fetch the related patient and staff objects
            patient = get_object_or_404(Patient, id=patient_id)
            if role == 'Staff':
                attending_staff = get_object_or_404(Staff, id=staff_id)
            elif role =='Admin' :
                attending_staff = get_object_or_404(SuperAdmin, id=staff_id)
            # Create the medical record
            medical_record = MedicalRecord.objects.create(
                patientid=patient,
                transactiontype=data.get('transactiontype', ''),
                date=data.get('date'),  # Ensure the date is in YYYY-MM-DD format
                transactiondetails=data.get('transactiondetails', ''),
                height=data.get('height', ''),
                weight=data.get('weight', ''),
                age=data.get('age', ''),
                heart_rate=data.get('hr', ''),
                respiratory_rate=data.get('rr', ''),
                temperature=data.get('temperature', ''),
                bloodpressure=data.get('bloodpressure', ''),
                painscale=data.get('painscale', ''),
                othersymptoms=data.get('othersymptoms', ''),
                initialdiagnosis=data.get('initialdiagnosis', ''),
                notes=data.get('notes', ''),
                attendingstaff=attending_staff
            )

            return JsonResponse({'message': 'Medical record created successfully!', 'id': medical_record.id}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method. Use POST.'}, status=405)


def get_medical_records_by_patient(request, patient_id):
    if request.method == 'GET':
        try:
            # Fetch the patient object
            patient = get_object_or_404(Patient, id=patient_id)

            # Retrieve all medical records for the patient
            medical_records = MedicalRecord.objects.filter(patientid=patient)

            # Format the data for JSON response
            records_list = [
                {
                    'id': record.id,
                    'transactiontype': record.transactiontype,
                    'date': record.date,
                    'transactiondetails': record.transactiondetails,
                    'height': record.height,
                    'weight': record.weight,
                    'age': record.age,
                    'heart_rate': record.heart_rate,
                    'respiratory_rate': record.respiratory_rate,
                    'temperature': record.temperature,
                    'bloodpressure': record.bloodpressure,
                    'painscale': record.painscale,
                    'othersymptoms': record.othersymptoms,
                    'initialdiagnosis': record.initialdiagnosis,
                    'notes': record.notes,
                    'attendingstaff': record.attendingstaff.id if record.attendingstaff else None,
                }
                for record in medical_records
            ]

            return JsonResponse({'patient': patient_id, 'medical_records': records_list}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method. Use GET.'}, status=405)