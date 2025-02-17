from django.shortcuts import get_object_or_404
from clinic_python.models import MedicalRecord, Patient, Staff
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
        
        token = auth_header.split(' ')[1]
        access_token = AccessToken(token)
        staff_id = access_token['id']  # Retrieve the user ID from token claims
        role = access_token['role']  # Retrieve the user role from token claims
        
        try:
            data = json.loads(request.body)
            patient = get_object_or_404(Patient, id=patient_id)
            attending_staff = get_object_or_404(Staff, id=staff_id)
            
            medical_record = MedicalRecord.objects.create(
                patientid=patient,
                transactiontype=data.get('transactiontype', ''),
                date=data.get('date'),
                timetreatment=data.get('timetreatment', ''),
                transactiondetails=data.get('transactiondetails', ''),
                medicineused=data.get('medicineused', 'N/A'),
                bpbefore=data.get('bpbefore', ''),
                bpafter=data.get('bpafter', ''),
                weightbefore=data.get('weightbefore', ''),
                weightafter=data.get('weightafter', ''),
                temperature=data.get('temperature', ''),
                pulsebefore=data.get('pulsebefore', ''),
                pulseafter=data.get('pulseafter', ''),
                generalremarks=data.get('generalremarks', 'N/A'),
                attendingstaff=attending_staff
            )

            return JsonResponse({'message': 'Medical record created successfully!', 'id': medical_record.id}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method. Use POST.'}, status=405)


def get_medical_records_by_patient(request, patient_id):
    if request.method == 'GET':
        try:
            patient = get_object_or_404(Patient, id=patient_id)
            medical_records = MedicalRecord.objects.filter(patientid=patient)
            
            records_list = [
                {
                    'id': record.id,
                    'transactiontype': record.transactiontype,
                    'date': record.date,
                    'timetreatment': record.timetreatment,
                    'transactiondetails': record.transactiondetails,
                    'medicineused': record.medicineused,
                    'bpbefore': record.bpbefore,
                    'bpafter': record.bpafter,
                    'weightbefore': record.weightbefore,
                    'weightafter': record.weightafter,
                    'temperature': record.temperature,
                    'pulsebefore': record.pulsebefore,
                    'pulseafter': record.pulseafter,
                    'generalremarks': record.generalremarks,
                    'attendingstaff': record.attendingstaff.id if record.attendingstaff else None,
                }
                for record in medical_records
            ]
            
            return JsonResponse({'patient': patient_id, 'medical_records': records_list}, status=200)
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid request method. Use GET.'}, status=405)



def count_medical_records(request):
    if request.method == 'GET':
        try:
            total_records = MedicalRecord.objects.count()
            return JsonResponse({'total_medical_records': total_records}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid request method. Use GET.'}, status=405)



def get_recent_medical_records(request):
    if request.method == 'GET':
        try:
            recent_records = MedicalRecord.objects.order_by('-createdAt')[:5]

            records_list = []
            for record in recent_records:
                try:
                    patient = Patient.objects.get(id=record.patientid.id)
                    patient_name = f"{patient.first_name} {patient.last_name}"
                except Patient.DoesNotExist:
                    patient_name = "Unknown"

                records_list.append({
                    'id': record.id,
                    'transactiontype': record.transactiontype,
                    'patientid': record.patientid.id if record.patientid else None,
                    'patientname': patient_name,
                    'date': record.date,
                    'timetreatment': record.timetreatment,
                    'transactiondetails': record.transactiondetails,
                    'medicineused': record.medicineused,
                    'bpbefore': record.bpbefore,
                    'bpafter': record.bpafter,
                    'weightbefore': record.weightbefore,
                    'weightafter': record.weightafter,
                    'temperature': record.temperature,
                    'pulsebefore': record.pulsebefore,
                    'pulseafter': record.pulseafter,
                    'generalremarks': record.generalremarks,
                    'attendingstaff': record.attendingstaff.id if record.attendingstaff else None,
                })

            return JsonResponse({'recent_medical_records': records_list}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method. Use GET.'}, status=405)


def get_medical_records_summary(request):
    if request.method == 'GET':
        try:
            medical_records = MedicalRecord.objects.select_related('patientid').values(
                'id', 'transactiontype', 'date', 'patientid__first_name', 'patientid__last_name'
            )
            
            records_list = [
                {
                    'id': record['id'],
                    'name': f"{record['patientid__first_name']} {record['patientid__last_name']}",
                    'date': record['date'],
                    'generalremarks': record['generalremarks']
                }
                for record in medical_records
            ]
            
            return JsonResponse({'medical_records': records_list}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Invalid request method. Use GET.'}, status=405)
