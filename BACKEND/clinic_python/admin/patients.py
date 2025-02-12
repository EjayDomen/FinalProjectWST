import bcrypt
from django.contrib.auth.decorators import user_passes_test
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models.roles_model import Role  # Adjust import paths
from clinic_python.models.admin_model import Staff
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from clinic_python.models.patient_model import Patient

from django.views.decorators.csrf import csrf_exempt


@require_http_methods(["GET"])
# @role_required(required_role="Staff")  # Ensures only Secretaries can access
def get_patients(request):
    try:
        # Query all patients where `is_deleted` is False
        patients = Patient.objects.filter(is_deleted=False)

        # Serialize the patients into a list of dictionaries with the required fields
        patient_list = [
            {
                "id": patient.id,
                "username": patient.username,
                "first_name": patient.first_name,
                "middle_name": patient.middle_name,
                "last_name": patient.last_name,
                "suffix": patient.suffix,
                "createAt": patient.createdAt,
                "email": patient.email,
                "maritalstatus": patient.maritalstatus,
                "sex": patient.sex,
                "age": patient.age,
                "birthday": patient.birthday,
            }
            for patient in patients
        ]

        # Return the patient list as a JSON response
        return JsonResponse(patient_list, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    

@csrf_exempt
# @role_required('Staff')  
def delete_patient(request, id):
    if request.method == 'DELETE':
        try:
            # Find the patient by ID
            patient = Patient.objects.filter(id=id).first()

            if not patient:
                return JsonResponse({'message': 'Patient not found'}, status=404)

            # Perform a soft delete by setting is_deleted to True
            patient.is_deleted = True
            patient.save()

            return JsonResponse({'message': 'Patient has been soft-deleted successfully'}, status=200)

        except Exception as e:
            print(f'Error soft-deleting patient: {e}')
            return JsonResponse({'message': 'Internal server error'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)



# @role_required('Staff')  
def get_archived_patients(request):
    try:
        # Query all archived patients (soft-deleted patients)
        archived_patients = Patient.objects.filter(is_deleted=True)

        if not archived_patients.exists():
            return JsonResponse({'message': 'No archived patients found'}, status=404)

        # Serialize the archived patients into a list of dictionaries
        archived_patients_list = [
            {
                "id": patient.id,
                "name": f"{patient.first_name} {patient.last_name}",
                "email": patient.email,  # Add fields as required
                # Add any other patient fields needed here
            }
            for patient in archived_patients
        ]

        # Return the archived patients list as a JSON response
        return JsonResponse(archived_patients_list, safe=False, status=200)

    except Exception as e:
        print(f'Error fetching archived patients: {e}')
        return JsonResponse({'message': 'Internal server error'}, status=500)
    
    

# @role_required('Staff')  
def restore_patient(request, id):
    try:
        # Find the patient by ID and ensure it's archived (soft-deleted)
        patient = get_object_or_404(Patient, id=id, is_deleted=True)

        # Restore the patient by setting is_deleted to False
        patient.is_deleted = False
        patient.save()

        # Return success message
        return JsonResponse({'message': 'Patient restored successfully'}, status=200)

    except Exception as e:
        print(f'Error restoring patient: {e}')
        return JsonResponse({'message': 'Internal server error'}, status=500)
    
    
    
@api_view(['GET'])
def count_all_patients(request):
    """
    Count all active (non-deleted) patients and return the total.
    """
    try:
        # Count all patients where is_deleted is False
        active_patient_count = Patient.objects.filter(is_deleted=False).count()

        # Return the count as a JSON response
        return JsonResponse({"total_active_patients": active_patient_count}, status=200)

    except Exception as e:
        print(f"Error counting patients: {e}")
        return JsonResponse({'error': 'Internal server error'}, status=500)


@csrf_exempt
@api_view(['PUT'])
def update_patient(request, id):
    """
    Update the details of an existing patient.
    """
    try:
        # Find the patient by ID
        patient = Patient.objects.filter(id=id, is_deleted=False).first()

        if not patient:
            return JsonResponse({'message': 'Patient not found'}, status=404)

        # Parse the JSON body from the request
        data = request.data

        # Update patient fields if provided in the request data
        patient.username = data.get('username', patient.username)
        patient.first_name = data.get('first_name', patient.first_name)
        patient.middle_name = data.get('middle_name', patient.middle_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.suffix = data.get('suffix', patient.suffix)
        patient.email = data.get('email', patient.email)
        patient.age = data.get('age', patient.age)
        patient.sex = data.get('sex', patient.sex)
        patient.birthday = data.get('birthday', patient.birthday)
        patient.maritalstatus = data.get('maritalstatus', patient.maritalstatus)

        # Save the updated patient
        patient.save()

        # Return a success message with the updated patient details
        updated_patient = {
            "id": patient.id,
            "username": patient.username,
            "first_name": patient.first_name,
            "middle_name": patient.middle_name,
            "last_name": patient.last_name,
            "suffix": patient.suffix,
            "email": patient.email,
            "age": patient.age,
            "sex": patient.sex,
            "birthday": patient.birthday,
            "maritalstatus": patient.maritalstatus,
        }

        return JsonResponse({"message": "Patient updated successfully", "patient": updated_patient}, status=200)

    except Exception as e:
        print(f"Error updating patient: {e}")
        return JsonResponse({'message': 'Internal server error'}, status=500)



# Restore a patient by setting is_deleted to False
@csrf_exempt
def restore_patient(request, patient_id):
    try:
        patient = Patient.objects.get(id=patient_id)
        
        if not patient.is_deleted:
            return JsonResponse({'message': 'Patient is not archived'}, status=400)
        
        # Set the patient as active (restore)
        patient.is_deleted = False
        patient.save()
        
        return JsonResponse({'message': 'Patient restored successfully'}, status=200)

    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# List archived patients
def archived_patients(request):
    try:
        archived_patients = Patient.objects.filter(is_deleted=True)

        if not archived_patients.exists():
            return JsonResponse({'message': 'No archived patients found'}, status=404)

        patients_data = []
        for patient in archived_patients:
            patients_data.append({
                'id': patient.id,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'email': patient.email,
                'patient_type': patient.patient_type,
                'is_deleted': patient.is_deleted,
                'createdAt': patient.createdAt,
            })
        
        return JsonResponse(patients_data, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)