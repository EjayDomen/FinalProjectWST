from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from clinic_python.models import Staff, Role
import bcrypt
import json
from django.views.decorators.csrf import csrf_exempt
from clinic_python.models import Staff
from rest_framework_simplejwt.tokens import AccessToken

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


def get_staff_detail(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization token is missing or invalid'}, status=401)
    
    token = auth_header.split(' ')[1]
    access_token = AccessToken(token)
    
    try:
        role = access_token['role']
        staff_id = access_token['id']
    
        if role != 'Staff':
            return JsonResponse({'error': 'Unauthorized access'}, status=403)
        
        try:
            staff = Staff.objects.get(id=staff_id, is_deleted=False)
            staff_data = {
                'id': staff.id,
                'first_name': staff.first_name,
                'middle_name': staff.middle_name,
                'last_name': staff.last_name,
                'suffix': staff.suffix,
                'specialization': staff.specialization,
                'email': staff.email,
                'user_level_id': staff.user_level_id.id if staff.user_level_id else None,
                'is_deleted': staff.is_deleted,
            }
            return JsonResponse(staff_data, status=200)
        except Staff.DoesNotExist:
            return JsonResponse({'error': 'Staff not found'}, status=404)
    except KeyError:
        return JsonResponse({'error': 'Invalid token payload'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def update_logged_in_staff(request):
    """
    Update the logged-in staff's details like name, specialization, and email.
    Only allows the staff member to update their own details.
    """
    if request.method == 'PUT':
        try:
            # Get the Authorization token from request header
            auth_header = request.headers.get('Authorization', '')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse({'error': 'Authorization token is missing or invalid'}, status=401)
            
            # Extract the token and decode it
            token = auth_header.split(' ')[1]
            access_token = AccessToken(token)
            
            # Get staff ID from the token payload
            staff_id = access_token['id']
            
            # Retrieve the staff record from the database
            staff = Staff.objects.get(id=staff_id, is_deleted=False)
            
            # Parse the incoming JSON body to get the updated fields
            body = json.loads(request.body)
            first_name = body.get('FIRST_NAME', staff.first_name)
            middle_name = body.get('MIDDLE_NAME', staff.middle_name)
            last_name = body.get('LAST_NAME', staff.last_name)
            suffix = body.get('SUFFIX', staff.suffix)
            specialization = body.get('DEPARTMENT', staff.specialization)
            email = body.get('EMAIL', staff.email)
            
            # Update fields only if they are provided in the request
            staff.first_name = first_name
            staff.middle_name = middle_name
            staff.last_name = last_name
            staff.suffix = suffix
            staff.specialization = specialization
            staff.email = email

            # Save the changes to the database
            staff.save()

            # Return success response
            return JsonResponse({
                'message': f'Staff {first_name} {last_name} details updated successfully.',
                'staff_id': staff.id
            }, status=200)

        except Staff.DoesNotExist:
            return JsonResponse({'error': 'Staff not found'}, status=404)
        except KeyError:
            return JsonResponse({'error': 'Invalid token payload'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Error updating staff: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method. Use PUT.'}, status=405)
