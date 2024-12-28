from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import Appointment
from datetime import datetime
from django.utils.timezone import make_aware
import pytz
from django.db.models import Prefetch
from django.http import JsonResponse

@api_view(['GET'])
def get_all_appointments(request):
    """
    Fetch all Appointment records and return them as a response.
    """
    try:
        # Fetch all Appointment records
        appointments = Appointment.objects.select_related('patientid', 'staff').all()

        # Prepare the response data
        data = [
            {
                "id": appointment.id,
                "patient_id": appointment.patientid.id,
                "patient_name": f"{appointment.first_name} {appointment.last_name} {appointment.suffix or ''}".strip(),
                "age": appointment.age,
                "address": appointment.address,
                "sex": appointment.sex,
                "contact_number": appointment.contact_number,
                "appointment_date": appointment.appointment_date.strftime("%Y-%m-%d"),
                "purpose": appointment.purpose,
                "status": appointment.status,
                "type": appointment.type,
                "staff_id": appointment.staff.id,
                "created_at": appointment.createdAt.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for appointment in appointments
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def count_all_appointments(request):
    """
    Count all Appointment records and return the total as a response.
    """
    try:
        # Count all Appointment records
        appointment_count = Appointment.objects.count()

        # Return the count as a response
        return Response({"total_appointments": appointment_count}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




@api_view(['GET'])
def get_todays_appointments(request):
    """
    Fetch up to 5 Appointment records for today in the Manila timezone and return them as a response.
    """
    try:
        # Define Manila timezone
        manila_tz = pytz.timezone('Asia/Manila')

        # Get today's date in Manila timezone
        today = datetime.now(manila_tz).date()

        # Fetch up to 5 appointments scheduled for today
        todays_appointments = (
            Appointment.objects.select_related('patientid', 'staff')
            .filter(appointment_date=today)
            .order_by('appointment_date')[:5]  # Limit to 5 records
        )

        # Prepare the response data
        data = [
            {
                "id": appointment.id,
                "patient_id": appointment.patientid.id,
                "patient_name": f"{appointment.first_name} {appointment.last_name} {appointment.suffix or ''}".strip(),
                "age": appointment.age,
                "address": appointment.address,
                "sex": appointment.sex,
                "contact_number": appointment.contact_number,
                "appointment_date": appointment.appointment_date.strftime("%Y-%m-%d"),
                "purpose": appointment.purpose,
                "status": appointment.status,
                "type": appointment.type,
                "staff_id": appointment.staff.id,
                "created_at": make_aware(appointment.createdAt, timezone=manila_tz).strftime("%Y-%m-%d %H:%M:%S"),
            }
            for appointment in todays_appointments
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



def get_appointment_details_report(request):
    """
    Fetch a detailed report of all appointments with patient and staff details.
    """
    try:
        # Fetch appointments with related patient and staff details
        appointments = Appointment.objects.select_related('patientid', 'staff').filter(
            status='completed'  # Filter only completed appointments
        )

        # Format the data
        response = []
        for appointment in appointments:
            response.append({
                "appointmentId": appointment.id,
                "patientFullName": f"{appointment.first_name} {appointment.middle_name} {appointment.last_name} {appointment.suffix}".strip(),
                "age": appointment.age,
                "address": appointment.address,
                "sex": appointment.sex,
                "contactNumber": appointment.contact_number,
                "appointmentDate": appointment.appointment_date.strftime('%Y-%m-%d'),
                "purpose": appointment.purpose,
                "status": appointment.status,
                "type": appointment.type,
                "staffFullName": f"{appointment.staff.first_name} {appointment.staff.last_name}" if appointment.staff else None,
                "createdAt": appointment.createdAt.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return JsonResponse(response, safe=False, status=200)

    except Exception as e:
        return JsonResponse({
            "message": "An error occurred while fetching appointment details.",
            "error": str(e)
        }, status=500)