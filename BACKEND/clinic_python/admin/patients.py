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
from clinic_python.utils.auth import role_required


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
                "student_or_employee_no": patient.student_or_employee_no,
                "first_name": patient.first_name,
                "middle_name": patient.middle_name,
                "last_name": patient.last_name,
                "suffix": patient.suffix,
                "campus": patient.campus,
                "college_office": patient.college_office,
                "course_designation": patient.course_designation,
                "year": patient.year,
                "emergency_contact_number": patient.emergency_contact_number,
                "emergency_contact_relation": patient.emergency_contact_relation,
                "bloodtype": patient.bloodtype,
                "allergies": patient.allergies,
                "email": patient.email,
                "age": patient.age,
                "sex": patient.sex,
                "address": patient.address,
                "createAt": patient.createdAt,
            }
            for patient in patients
        ]

        # Return the patient list as a JSON response
        return JsonResponse(patient_list, safe=False, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    


@role_required('Staff')  
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



@role_required('Staff')  
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
    
    

@role_required('Staff')  
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