from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import Appointment

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
