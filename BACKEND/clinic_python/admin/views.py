from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.http import JsonResponse
from clinic_python.models import Staff, Role
import bcrypt
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from clinic_python.models import Staff

def get_all_staff(request):
    if request.method == 'GET':
        try:
            # Query all staff members
            staff_members = Staff.objects.all().values(
                'id', 
                'first_name', 
                'middle_name', 
                'last_name', 
                'suffix', 
                'specialization', 
                'email'
            )

            # Create a list of staff members
            staff_list = list(staff_members)

            # Return success response
            return JsonResponse({'staff': staff_list}, status=200)

        except Exception as e:
            return JsonResponse({'error': f'Error fetching staff members: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


def is_admin(user):
    return user.groups.filter(name='admin').exists()

@login_required
@user_passes_test(is_admin)
def manage_schedule(request):
    data = {"message": "Admin: Manage schedule"}
    return JsonResponse(data)


def dashboard(request):
    return render(request, 'admin/dashboard.html')




@csrf_exempt
def create_staff(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            body = json.loads(request.body)
            first_name = body.get('first_name')
            middle_name = body.get('middle_name', '')
            last_name = body.get('last_name')
            suffix = body.get('suffix', '')
            specialization = body.get('specialization')
            email = body.get('email')
            password = body.get('password')

            # Check if all required fields are provided
            if not first_name or not last_name or not specialization or not email or not password:
                return JsonResponse({'error': 'All fields are required'}, status=400)

            # Check if the user_level_id for Staff (2) exists in Role model
            try:
                role = Role.objects.get(id=2)  # Assuming 2 is for Staff
            except Role.DoesNotExist:
                return JsonResponse({'error': 'Role with user_level_id 2 not found'}, status=400)

            # Hash the password using bcrypt
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            # Create the Staff instance
            staff = Staff.objects.create(
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                suffix=suffix,
                specialization=specialization,
                email=email,
                password=hashed_password.decode('utf-8'),  # Store hashed password
                user_level_id=role
            )

            # Return success response
            return JsonResponse({
                'message': f'Staff {first_name} {last_name} created successfully.',
                'staff_id': staff.id
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': f'Error creating staff: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
