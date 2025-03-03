from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.shortcuts import render
import json
import bcrypt
from clinic_python.models import SuperAdmin, Patient, MedicalRecord, Appointment, Staff
from clinic_python.models import Role  # Adjust this import based on your project structure
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import AccessToken
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth
from datetime import date, timedelta
from django.db.models import Count




def is_superadmin(user):
    return user.groups.filter(name='superadmin').exists()

@login_required
@user_passes_test(is_superadmin)
def manage_users(request):
    data = {"message": "Superadmin: Manage users"}
    return JsonResponse(data)

# clinic_python/superadmin/views.py



def dashboard(request):
    return render(request, 'superadmin/dashboard.html')



# Create a SuperAdmin
@csrf_exempt
def create_superadmin(request):
    if request.method == 'POST':
        try:
            # Parse request body
            body = json.loads(request.body)

            # Extract fields from the request
            first_name = body.get('first_name')
            middle_name = body.get('middle_name', '')  # Optional
            last_name = body.get('last_name')
            suffix = body.get('suffix', '')  # Optional
            email = body.get('email')
            password = body.get('password')
            user_level_id = body.get('user_level_id')  # ID of the role

            # Validate required fields
            if not first_name or not last_name or not email or not password:
                return JsonResponse({'error': 'All fields (first_name, last_name, email, password) are required.'}, status=400)

            # Check if email already exists
            if SuperAdmin.objects.filter(email=email).exists():
                return JsonResponse({'error': 'A SuperAdmin with this email already exists.'}, status=400)

            # Hash the password using bcrypt
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            # Create the SuperAdmin instance
            superadmin = SuperAdmin(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                suffix=suffix,
                email=email,
                password=hashed_password,
                user_level_id=Role.objects.get(id=user_level_id) if user_level_id else None  # Optional role assignment
            )
            superadmin.save()  # Save to the database

            # Return success response
            return JsonResponse({'message': 'SuperAdmin created successfully!', 'superadmin_id': superadmin.id}, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Error creating SuperAdmin: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method. Please use POST.'}, status=405)



@csrf_exempt
def view_logged_in_superadmin(request):
    """
    View details of the currently logged-in SuperAdmin using an access token.
    """
    # Get the Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

    # Extract the token from the header
    token = auth_header.split(' ')[1]

    try:
        # Decode the token
        access_token = AccessToken(token)

        # Extract the user ID from the token
        user_id = access_token['id']

        # Fetch the SuperAdmin from the database
        try:
            superadmin = SuperAdmin.objects.get(id=user_id)
        except SuperAdmin.DoesNotExist:
            return JsonResponse({'error': 'SuperAdmin not found'}, status=404)

        # Prepare the response data
        data = {
            'id': superadmin.id,
            'first_name': superadmin.first_name,
            'middle_name': superadmin.middle_name,
            'last_name': superadmin.last_name,
            'suffix': superadmin.suffix,
            'email': superadmin.email,
            'user_level': {
                'id': superadmin.user_level_id.id,
                'name': superadmin.user_level_id.role_name
            } if superadmin.user_level_id else None,
        }

        return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)


@csrf_exempt
def update_superadmin_details(request):
    """
    Update the details of the currently logged-in SuperAdmin using an access token.
    """
    # Get the Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

    # Extract the token from the header
    token = auth_header.split(' ')[1]

    try:
        # Decode the token
        access_token = AccessToken(token)

        # Extract the user ID from the token
        user_id = access_token['id']

        # Fetch the SuperAdmin from the database
        try:
            superadmin = SuperAdmin.objects.get(id=user_id)
        except SuperAdmin.DoesNotExist:
            return JsonResponse({'error': 'SuperAdmin not found'}, status=404)

        # Parse request body for updates
        if request.method == 'PUT':
            body = json.loads(request.body)

            # Validate required fields
            required_fields = ['first_name', 'last_name', 'email']
            missing_fields = [field for field in required_fields if field not in body or not body[field]]
            if missing_fields:
                return JsonResponse({'error': f'Missing required fields: {", ".join(missing_fields)}'}, status=400)

            # Update fields
            superadmin.first_name = body['first_name']
            superadmin.middle_name = body.get('middle_name', '')  # Optional
            superadmin.last_name = body['last_name']
            superadmin.suffix = body.get('suffix', '')  # Optional
            superadmin.email = body['email']

            # If updating password
            if 'password' in body and body['password']:
                valid_password = bcrypt.checkpw(body['password'].encode("utf-8"), superadmin.password.encode("utf-8"))
                if not valid_password:
                    return JsonResponse({'error': 'Invalid password'}, status=401)
                hashed_password = bcrypt.hashpw(body['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                superadmin.password = hashed_password

            # Save updated fields
            superadmin.save()

            return JsonResponse({'message': 'SuperAdmin details updated successfully'}, status=200)

        return JsonResponse({'error': 'Invalid request method. Use PUT for updates.'}, status=405)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

@csrf_exempt
def count_patient_types(request):
    """
    Count the number of patients for each patient type (student, employee, non-academic personnel).
    """
    try:
        # Count the number of patients for each patient type
        patient_count = Patient.objects.filter(is_deleted=False).count()

        # Assuming Staff is a separate model, otherwise adjust accordingly
        staffs_count = Staff.objects.filter(is_deleted=False).count()  

        medicalrecord_count = MedicalRecord.objects.count()

        request_count = Appointment.objects.exclude(status='completed').count()


        # Prepare the data to return
        data = {
            'patient_count': patient_count,
            'staffs_count': staffs_count,
            'medicalrecord_count': medicalrecord_count,
            'request_count': request_count,
        }

        return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({'error': f'Error counting patient types: {str(e)}'}, status=500)
    
def count_patient_status(request):
    """
    Count the number of active and inactive/deleted patients.
    """
    try:
        # Count active (not deleted) patients
        active_patient_count = Patient.objects.filter(is_deleted=False).count()
        request_count = Appointment.objects.exclude(status='completed').count()

        # Count inactive (deleted) patients
        deleted_patient_count = Patient.objects.filter(is_deleted=True).count()

        # Prepare the data to return
        data = {
            'active_patient_count': active_patient_count,
            'deleted_patient_count': deleted_patient_count
        }

        return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({'error': f'Error counting patient status: {str(e)}'}, status=500)



def get_request_counts(request):
    """Fetch appointment counts grouped by day, week, or month."""
    
    # Get the filter type (day, week, month) from the request
    filter_type = request.GET.get("filter", "day")  # Default to 'day'

    # Set truncation based on filter type
    if filter_type == "day":
        trunc_function = TruncDay("requestdate")
    elif filter_type == "week":
        trunc_function = TruncWeek("requestdate")
    elif filter_type == "month":
        trunc_function = TruncMonth("requestdate")
    else:
        return JsonResponse({"error": "Invalid filter type"}, status=400)

    # Query the database and group by the selected time period
    appointments = (
        Appointment.objects
        .filter(requestdate__gte=date.today() - timedelta(days=30))  # Last 30 days
        .annotate(period=trunc_function)
        .values("period")
        .annotate(count=Count("id"))
        .order_by("period")
    )

    # Convert data for the frontend chart
    labels = [str(entry["period"]) for entry in appointments]
    data = [entry["count"] for entry in appointments]

    response_data = {
        "labels": labels,
        "datasets": [
            {
                "label": f"Appointments ({filter_type})",
                "data": data,
                "borderColor": "#2563EB",
                "backgroundColor": "rgba(37, 99, 235, 0.2)",
                "tension": 0.3,
                "fill": True,
            }
        ],
    }

    return JsonResponse(response_data)