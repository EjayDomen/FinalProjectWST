from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.shortcuts import render
import json
import bcrypt
from clinic_python.models import SuperAdmin
from clinic_python.models import Role  # Adjust this import based on your project structure
from django.views.decorators.csrf import csrf_exempt

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
