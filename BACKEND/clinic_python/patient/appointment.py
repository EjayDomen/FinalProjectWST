from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.db import transaction
from django.utils.timezone import now
from clinic_python.models.appointment_model import Appointment
from clinic_python.models.patient_model import Patient
from clinic_python.models.admin_model import Staff

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Appointment creation
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    user = request.patient

    if not hasattr(user, 'patient'):
        return Response({"error": "Patient information is missing or incomplete"}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data

    try:
        with transaction.atomic():
            # Retrieve patient details
            patient = user.patient

            # Check for duplicate appointments
            if Appointment.objects.filter(
                appointment_date=data['appointmentDate'],
                patientid=data['patientid'],
                email=data['email']
            ).exists():
                return Response({"error": "Appointment already exists for this patient and email"}, status=status.HTTP_400_BAD_REQUEST)

            # Create appointment
            appointment = Appointment.objects.create(
                patientid=patient.id,
                first_name=data.get('firstName', 'N/A'),
                middle_name=data.get('middleName', 'N/A'),
                last_name=data.get('lastName', 'N/A'),
                suffix=data.get('suffix', 'N/A'),
                age=data.get('age', 'N/A'),
                sex=data.get('gender', 'N/A'),
                emergency_contact_number=data.get('emergency_contact_number', 'N/A'),
                address=data.get('address', 'N/A'),
                purpose=data.get('purpose', 'N/A'),
                type=data.get('walk-in', 'Online'),
                status='pending',
                appointment_time=schedule.start_time,  # Assuming the schedule has a start_time field
                appointment_date=data['appointmentDate'],
                staff_id='n/a'
            )

            # Handle queue creation if QueueManagement exists
            # (Adjust this section based on your Queue model and logic)
            # ...

            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# View appointments
@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
            "queue_number": "0",  # Replace with actual queue logic if applicable
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
@permission_classes([IsAuthenticated])
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
