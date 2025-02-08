from rest_framework_simplejwt.tokens import AccessToken
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import Appointment, Patient 
from django.core.exceptions import ObjectDoesNotExist

@csrf_exempt
@api_view(['POST'])
def create_request(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
    
    # Extract the token from the header
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
    except Exception as e:
        return JsonResponse({'error': 'Invalid or expired token'}, status=401)
    
    role = access_token['role']  # Retrieve the user role from token claims
    patient_id = access_token['id']

    if not token:
        return JsonResponse({'error': 'Token not provided'}, status=401)

    data = request.data

    try:
        with transaction.atomic():
            # Ensure the patient ID is provided and valid
            if not patient_id:
                return JsonResponse({'error': 'Patient ID is required'}, status=400)

            patient = Patient.objects.get(id=patient_id)

            # Check for duplicate appointments
            if Appointment.objects.filter(
                requestdate=data['requestdate'],
                patientid=patient_id,
                requestpurpose= data['purpose']
            ).exists():
                return Response({"error": "Appointment already exists for this patient and purpose"}, status=status.HTTP_400_BAD_REQUEST)

            # Create appointment
            appointment = Appointment.objects.create(
                patientid=patient,
                first_name=data.get('firstName', 'N/A'),
                middle_name=data.get('middleName', 'N/A'),
                last_name=data.get('lastName', 'N/A'),
                suffix=data.get('suffix', 'N/A'),
                contactnumber=data.get('contactnumber', 'N/A'),
                requestpurpose=data.get('requestpurpose', 'N/A'),
                status='pending',  # Ensure this field is in the data
                requestdate=data['appointmentdate'],
                staff_id=None
            )


            # Serialize and return the created appointment
            return Response({"message": "Appointment created successfully", "appointment_id": appointment.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# View appointments
@api_view(['GET'])
def view_appointments(request):
    user = request.patient

    if not hasattr(user, 'patient'):
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    patient = user.patient
    appointments = Appointment.objects.filter(patientid=patient).select_related('staff')

    if not appointments.exists():
        return Response({"message": "No active appointments found for this patient."}, status=status.HTTP_404_NOT_FOUND)

    data = []
    for appointment in appointments:
        staff = appointment.staff
        doctor_name = f"{staff.first_name} {staff.last_name}" if staff else "N/A"
        
        
        data.append({
            "appointment_id": appointment.id,
            "details": {
                "first_name": appointment.first_name,
                "last_name": appointment.last_name,
                "suffix": f"{appointment.last_name}" if staff else " ",
                "appointment_date": appointment.requestdate,
                "status": appointment.status,
            }
        })

    return Response(data, status=status.HTTP_200_OK)


# Cancel appointment
# @api_view(['POST'])
# def cancel_appointment(request, appointment_id):
#     user = request.patient

#     try:
#         appointment = get_object_or_404(Appointment, id=appointment_id, patientid=user.patient)

#         if appointment.status.lower() == 'cancelled':
#             return Response({"message": "The appointment is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

#         # Update status
#         appointment.status = 'cancelled'
#         appointment.save()

#         # Create notification logic (adjust based on your notification model/service)
#         # Notification.objects.create(...)

#         return Response({"message": "Appointment canceled successfully"}, status=status.HTTP_200_OK)

#     except Exception as e:
#         return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def view_all_appointments(request):
    # Extract the token from the Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization header missing or invalid'}, status=status.HTTP_401_UNAUTHORIZED)
    
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
        patient_id = access_token['id']  # Retrieve the patient ID from token claims
    except Exception:
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

    # Ensure the patient exists
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=status.HTTP_404_NOT_FOUND)

    # Retrieve all appointments for the patient
    appointments = Appointment.objects.filter(patientid=patient).select_related('staff')

    # Handle the case where there are no appointments
    if not appointments.exists():
        return Response({'message': 'No appointments found for this patient.'}, status=status.HTTP_404_NOT_FOUND)

    # Serialize the appointment data
    data = []
    for appointment in appointments:
        data.append({
        "appointment_id": appointment.id,
        "patient_details": {
            "patient_id": appointment.patientid.id,
            "first_name": appointment.first_name,
            "middle_name": appointment.middle_name,
            "last_name": appointment.last_name,
            "suffix": appointment.suffix,
            "contact_number": appointment.contactnumber,
        },
        "appointment_details": {
            "appointment_date": appointment.requestdate,
            "purpose": appointment.requestpurpose,
            "status": appointment.status,
        },
    })

    return Response(data, status=status.HTTP_200_OK)