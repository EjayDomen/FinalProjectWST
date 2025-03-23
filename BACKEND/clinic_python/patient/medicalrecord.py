from django.utils.timezone import now
from django.http import JsonResponse
from django.db.models import Count
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from clinic_python.models import MedicalRecord

@api_view(['GET'])
def get_treatment_summary(request, view_type):
    """
    API endpoint to get the total count of treatments grouped by month or year for the logged-in patient.
    :param view_type: 'monthly' for count per month, 'yearly' for count per year
    """

    # Extract Authorization Token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization header missing or invalid'}, status=401)

    # Extract the token from the header
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
    except Exception:
        return Response({'error': 'Invalid or expired token'}, status=401)

    # Get the logged-in patient's ID
    patient_id = access_token['id']
    role = access_token['role']

    # Fetch treatments and group by month or year
    if view_type == "monthly":
        treatments = (
            MedicalRecord.objects.filter(patientid=patient_id)
            .values("date__year", "date__month")  
            .annotate(count=Count("id"))  
            .order_by("date__year", "date__month")
        )

    elif view_type == "yearly":
        treatments = (
            MedicalRecord.objects.filter(patientid=patient_id)
            .values("date__year")  
            .annotate(count=Count("id"))  
            .order_by("date__year")
        )

    else:
        return Response({"error": "Invalid view type. Use 'monthly' or 'yearly'."}, status=400)

    return Response({"view": view_type, "data": list(treatments)})



@api_view(['GET'])
def get_medical_records(request):
    """
    API endpoint to fetch all medical records of the logged-in patient.
    """

    # Extract Authorization Token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return Response({'error': 'Authorization header missing or invalid'}, status=401)

    # Extract the token from the header
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
    except Exception:
        return Response({'error': 'Invalid or expired token'}, status=401)

    # Get the logged-in patient's ID
    patient_id = access_token['id']

    # Fetch medical records with attending staff's name
    medical_records = MedicalRecord.objects.filter(patientid=patient_id).select_related('attendingstaff').order_by('-date')

    # Convert QuerySet to List of Dictionaries (Including New Fields)
    medical_records_list = [
        {
            'id': record.id,
            'patientid': record.patientid_id,  # Ensure correct reference
            'date': record.date,
            'generalremarks': record.generalremarks,
            'attendingstaff': (
                f"{record.attendingstaff.first_name} {record.attendingstaff.last_name} "
                f"{record.attendingstaff.suffix if record.attendingstaff.suffix else ''}".strip()
                if record.attendingstaff else "Unknown"
            ),
            'timetreatment': record.timetreatment,
            'medicineused': record.medicineused,
            # New Fields for Vitals
            'bpbefore': record.bpbefore if record.bpbefore else "N/A",
            'bpafter': record.bpafter if record.bpafter else "N/A",
            'weightbefore': record.weightbefore if record.weightbefore else "N/A",
            'weightafter': record.weightafter if record.weightafter else "N/A",
            'temperature': record.temperature if record.temperature else "N/A",
            'pulsebefore': record.pulsebefore if record.pulsebefore else "N/A",
            'pulseafter': record.pulseafter if record.pulseafter else "N/A",
            'notes': record.notes if record.notes else "N/A",
        }
        for record in medical_records
    ]

    return JsonResponse({'medical_records': medical_records_list}, status=200)



@api_view(['GET'])
def get_medical_record(request, record_id):
    try:
        record = get_object_or_404(MedicalRecord, id=record_id)
        record_data = {
            'id': record.id,
            'patientid': record.patientid.id,
            'date': record.date,
            'timetreatment': record.timetreatment,
            'medicineused': record.medicineused,
            'bpbefore': record.bpbefore,
            'bpafter': record.bpafter,
            'weightbefore': record.weightbefore,
            'weightafter': record.weightafter,
            'temperature': record.temperature,
            'pulsebefore': record.pulsebefore,
            'pulseafter': record.pulseafter,
            'generalremarks': record.generalremarks,
            'attendingstaff': record.attendingstaff.id,
            'createdAt': record.createdAt,
            'notes': record.notes,
        }
        return Response(record_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)