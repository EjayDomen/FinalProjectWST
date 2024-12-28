from django.db import transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models.patient_model import Patient
from clinic_python.models.appointment_model import Appointment
from clinic_python.models.queuemanagement_model import QueueManagement
from clinic_python.models.queue_model import Queue
import bcrypt
from clinic_python.utils.auth import role_required
from rest_framework_simplejwt.tokens import AccessToken
from django.http import JsonResponse
from datetime import datetime



@api_view(['POST'])
# @role_required(required_role="Staff") 
def join_queue(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)
        # Extract the token from the header
    token = auth_header.split(' ')[1]
    access_token = AccessToken(token)
    staff_id = access_token['id']  # Retrieve the user ID from token claims
    role = access_token['role']  # Retrieve the user role from token claims

    # Check if the role is 'Staff'
    if role != 'Staff':
        return JsonResponse({'error': 'Unauthorized role'}, status=403)

    data = request.data

    # Extract patient details from request
    PATIENT_ID = data.get("PATIENT_ID")
    STUDENT_OR_EMPLOYEE_NO = data.get("STUDENT_OR_EMPLOYEE_NO", "N/A")
    FIRST_NAME = data.get("FIRST_NAME", "N/A")
    MIDDLE_NAME = data.get("MIDDLE_NAME", "N/A")
    LAST_NAME = data.get("LAST_NAME", "N/A")
    SUFFIX = data.get("SUFFIX", "N/A")
    AGE = data.get("AGE", "N/A")
    SEX = data.get("SEX", "N/A")
    EMAIL = data.get("EMAIL", "N/A")
    ADDRESS = data.get("ADDRESS", "N/A")
    TRANSACTION = data.get("TRANSACTION", "N/A")
    IS_PRIORITY = data.get("IS_PRIORITY", "false").lower() == "true"

    # Appointment-related details
    DATE = data.get("DATE", "N/A")
    TYPE = data.get("TYPE", "walk-in")  # Can be "followup" or "walk-in"

    try:
        with transaction.atomic():
             # Check if the student_or_employee_no already exists
            patient = None
            if PATIENT_ID:
                patient = Patient.objects.filter(id=PATIENT_ID).first()
            elif STUDENT_OR_EMPLOYEE_NO != "N/A":
                patient = Patient.objects.filter(student_or_employee_no=STUDENT_OR_EMPLOYEE_NO).first()

            # Create new patient if none found
            if not patient:
            # Check for existing patient
                password = f"{LAST_NAME.lower()}123"
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                patient = Patient.objects.create(
                    student_or_employee_no=STUDENT_OR_EMPLOYEE_NO,
                    first_name=FIRST_NAME,
                    middle_name=MIDDLE_NAME,
                    last_name=LAST_NAME,
                    suffix=SUFFIX,
                    email=EMAIL,
                    age=AGE,
                    sex=SEX,
                    password=hashed_password,
                    address=ADDRESS,
                    campus="N/A",
                    college_office="N/A",
                    course_designation="N/A",
                    year="N/A",
                    emergency_contact_number="N/A",
                    emergency_contact_relation="N/A",
                    bloodtype="N/A",
                    allergies="N/A"
                )

            # Create an appointment
            appointment = Appointment.objects.create(
                patientid=patient,
                first_name=FIRST_NAME,
                middle_name=MIDDLE_NAME,
                last_name=LAST_NAME,
                suffix=SUFFIX,
                # age=AGE,
                # address=ADDRESS,
                sex=SEX,
                appointment_date=DATE,
                purpose=TRANSACTION,
                status="pending",
                type=TYPE.lower(),
                staff_id=staff_id
            )

            # Queue Management
            queue_management, created = QueueManagement.objects.get_or_create(
                transaction_type=TRANSACTION,
                date=DATE,
                defaults={
                    "status": "in-progress",
                    }
            )


           # Determine queue number format
            transaction_code_map = {
                "consultation": "CN" if not IS_PRIORITY else "CP",
                "certificate": "CEN" if not IS_PRIORITY else "CEP",
                "others": "ON" if not IS_PRIORITY else "OP"
            }
            queue_prefix = transaction_code_map.get(TRANSACTION, "ON" if not IS_PRIORITY else "OP")

            # Determine new queue number
            last_queue = Queue.objects.filter(
                qmid=queue_management.id,
                transaction_type=TRANSACTION,
                is_priority=IS_PRIORITY
            ).order_by('-queue_number').first()

            if last_queue:
                last_number = int(last_queue.queue_number[len(queue_prefix):])
                new_queue_number = f"{queue_prefix}{last_number + 1:03d}"
            else:
                new_queue_number = f"{queue_prefix}000"

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

            return Response({"message": "Patient added to queue successfully"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def view_queue(request):
    try:
        # Get parameters from the request
        transaction_type = request.query_params.get('transaction')
        date = request.query_params.get('date')

        # Validate required parameters
        if not transaction_type or not date:
            return Response(
                {"error": "transaction and date are required parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Format the date
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Find the qmid in QueueManagement
        queue_management = QueueManagement.objects.filter(
            transaction_type=transaction_type,
            date=date_obj
        ).first()

        if not queue_management:
            return Response({"error": "QueueManagement with the specified transaction and date not found."},
                            status=status.HTTP_404_NOT_FOUND)

        # Filter the Queue by qmid
        queues = Queue.objects.filter(qmid=queue_management.id).select_related('patient', 'appointment')

        # Serialize and return the queue data
        queue_data = []
        for queue in queues:
            queue_data.append({
                "queue_number": queue.queue_number,
                "is_priority": queue.is_priority,
                "status": queue.status,
                "transaction_type": queue.transaction_type,
                "ticket_type": queue.ticket_type,
                "patient": {
                    "id": queue.patient.id,
                    "first_name": queue.patient.first_name,
                    "last_name": queue.patient.last_name,
                    "email": queue.patient.email
                },
                "appointment": {
                    "id": queue.appointment.id,
                    "appointment_date": queue.appointment.appointment_date,
                    "status": queue.appointment.status,
                    "purpose": queue.appointment.purpose
                }
            })

        return Response({"queues": queue_data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['POST'])
def update_queue_status(request):
    try:
        # Get parameters from the request data
        queue_number = request.data.get('queueNumber')
        qmid = request.data.get('qmid')
        status_update = request.data.get('newStatus')
        transaction_type = request.data.get('transaction_type')

        # Validate required parameters
        if not queue_number or not qmid or not status_update or not transaction_type:
            return Response(
                {"error": "queue_number, qmid, status, and transaction are required parameters"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the QueueManagement entry exists with the given transaction_type and qmid
        queue_management = QueueManagement.objects.filter(
            id=qmid
        ).first()

        if not queue_management:
            return Response(
                {"error": "QueueManagement with the specified qmid and transaction type not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Find the queue with the given queue_number and qmid
        queue = Queue.objects.filter(queue_number=queue_number, qmid=queue_management, transaction_type= transaction_type).first()

        if not queue:
            return Response(
                {"error": f"Queue with queue_number {queue_number} and qmid {qmid} not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update the queue status
        queue.status = status_update
        queue.save()

        # If the status is "completed", update the related appointment as well
        if status_update == "completed" and queue.appointment:
            queue.appointment.status = "completed"
            queue.appointment.save()

        # Prepare the response data
        updated_queue = {
            "queue_number": queue.queue_number,
            "status": queue.status,
            "qmid": queue.qmid.id,
            "transaction_type": queue.qmid.transaction_type,
            "appointment_id": queue.appointment.id if queue.appointment else None,
            "appointment_status": queue.appointment.status if queue.appointment else None
        }

        return Response(
            {"message": "Queue status updated successfully", "updated_queue": updated_queue},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
@api_view(['GET'])
def get_first_5_waiting_queues(request):
    try:
        # Get today's date
        today_date = datetime.now().date()

        # Filter queues with "waiting" status and today's date
        queues = Queue.objects.filter(
            status="waiting",
            qmid__date=today_date
        ).select_related('patient', 'appointment').order_by('queue_number')[:5]

        # Prepare the response data
        queue_data = [
            {
                "queue_number": queue.queue_number,
                "is_priority": queue.is_priority,
                "status": queue.status,
                "transaction_type": queue.transaction_type,
                "ticket_type": queue.ticket_type,
                "qmid": queue.qmid,
                "patient": {
                    "id": queue.patient.id,
                    "first_name": queue.patient.first_name,
                    "last_name": queue.patient.last_name,
                    "email": queue.patient.email
                },
                "appointment": {
                    "id": queue.appointment.id,
                    "appointment_date": queue.appointment.appointment_date,
                    "status": queue.appointment.status,
                    "purpose": queue.appointment.purpose
                }
            }
            for queue in queues
        ]

        return Response({"queues": queue_data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
