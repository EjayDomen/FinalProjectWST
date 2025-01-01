from rest_framework_simplejwt.tokens import AccessToken
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import Appointment, QueueManagement, Queue, Patient 
from django.core.exceptions import ObjectDoesNotExist

@csrf_exempt
@api_view(['POST'])
def create_appointment(request):
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
                appointment_date=data['appointment_date'],
                patientid=patient_id,
                purpose= data['purpose']
            ).exists():
                return Response({"error": "Appointment already exists for this patient and purpose"}, status=status.HTTP_400_BAD_REQUEST)

            # Create appointment
            appointment = Appointment.objects.create(
                patientid=patient,
                first_name=data.get('firstName', 'N/A'),
                middle_name=data.get('middleName', 'N/A'),
                last_name=data.get('lastName', 'N/A'),
                suffix=data.get('suffix', 'N/A'),
                age=data.get('age', 'N/A'),
                sex=data.get('gender', 'N/A'),
                address=data.get('address', 'N/A'),
                purpose=data.get('purpose', 'N/A'),
                type=data.get('walk-in', 'Online'),
                status='pending',  # Ensure this field is in the data
                appointment_date=data['appointment_date'],
                staff_id=None
            )

            # Queue Management Logic
            # Assuming these variables are defined in the request data or environment
            TRANSACTION = data.get('purpose', 'consultation')  # Get the transaction type
            TRANSACTION = TRANSACTION.split(' ')[0] if len(TRANSACTION.split(' ')) > 1 else TRANSACTION  # Get the second part if it exists
            DATE = data['appointment_date']  # Set appointment date
            IS_PRIORITY = data.get('is_priority', False)  # Set if priority or not
            TYPE = data.get('type', 'Online')  # Set ticket type

            # Queue Management
            queue_management, created = QueueManagement.objects.get_or_create(
                transaction_type=TRANSACTION,
                date=DATE,
                defaults={
                    "status": "in-progress",
                }
            )

                    # Ensure IS_PRIORITY is a boolean and check the transaction value.
            transaction_code_map = {
                "consultation": "CN",
                "certificate": "CEN",
                "others": "ON",
            }

            # Get the appropriate queue prefix based on transaction and priority
            queue_prefix = transaction_code_map.get(TRANSACTION.lower(), "ON")

            # Modify the prefix if IS_PRIORITY is True
            if IS_PRIORITY:
                if queue_prefix == "CN":
                    queue_prefix = "CP"
                elif queue_prefix == "CEN":
                    queue_prefix = "CEP"
                elif queue_prefix == "ON":
                    queue_prefix = "OP"
            # Determine new queue number
            last_queue = Queue.objects.filter(
                qmid=queue_management.id,
                transaction_type=TRANSACTION,
                is_priority=IS_PRIORITY,
            ).order_by('queue_number').first()

            if last_queue:
                last_number = int(last_queue.queue_number[len(queue_prefix):])
                new_queue_number = f"{queue_prefix}{last_number + 1:03d}"
            else:
                new_queue_number = f"{queue_prefix}001"

            # Add to queue
            Queue.objects.create(
                queue_number=new_queue_number,
                appointment=appointment,
                patient=patient,
                qmid=queue_management,
                is_priority=IS_PRIORITY,
                status="waiting",
                transaction_type=TRANSACTION,
                ticket_type=TYPE.lower()
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
         # Find the corresponding queue for the current appointment
        queue = Queue.objects.filter(appointment=appointment).first()  # Assuming appointment is related to Queue
        
        # Check if a queue exists for this appointment, otherwise set queue_number to '0'
        queue_number = queue.queue_number if queue else "0"  # If no queue, assign default '0'
        
        data.append({
            "appointment_id": appointment.id,
            "queue_number": queue_number,  # Replace with actual queue logic if applicable
            "details": {
                "first_name": appointment.first_name,
                "last_name": appointment.last_name,
                "appointment_date": appointment.appointment_date,
                "appointment_time": appointment.appointment_time,
                "status": appointment.status,
            }
        })

    return Response(data, status=status.HTTP_200_OK)


# Cancel appointment
@api_view(['POST'])
def cancel_appointment(request, appointment_id):
    user = request.patient

    try:
        appointment = get_object_or_404(Appointment, id=appointment_id, patientid=user.patient)

        if appointment.status.lower() == 'cancelled':
            return Response({"message": "The appointment is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        # Update status
        appointment.status = 'cancelled'
        appointment.save()

        # Create notification logic (adjust based on your notification model/service)
        # Notification.objects.create(...)

        return Response({"message": "Appointment canceled successfully"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
        queue = Queue.objects.filter(appointment=appointment).first()  # Assuming appointment is related to Queue
        
        # Check if a queue exists for this appointment, otherwise set queue_number to '0'
        queue_number = queue.queue_number if queue else "0"  # If no queue, assign default '0'
        data.append({
        "appointment_id": appointment.id,
        "queue_number": queue_number,  # Replace with actual queue logic if needed
        "patient_details": {
            "patient_id": appointment.patientid.id,
            "first_name": appointment.first_name,
            "middle_name": appointment.middle_name,
            "last_name": appointment.last_name,
            "suffix": appointment.suffix,
            "age": appointment.age,
            "address": appointment.address,
            "sex": appointment.sex,
            "contact_number": appointment.contact_number,
        },
        "appointment_details": {
            "appointment_date": appointment.appointment_date,
            "purpose": appointment.purpose,
            "status": appointment.status,
            "type": appointment.type,
        },
    })

    return Response(data, status=status.HTTP_200_OK)