from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from clinic_python.models import Staff, Role
import bcrypt
import json
from django.views.decorators.csrf import csrf_exempt
from clinic_python.models import Staff
from rest_framework_simplejwt.tokens import AccessToken
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

@require_GET
def get_all_staff(request):
    try:
        staff_members = Staff.objects.filter(is_deleted=False).values(
            'id', 'first_name', 'middle_name', 'last_name', 
            'suffix', 'workposition', 'email'
        )
        return JsonResponse({'staff': list(staff_members)}, status=200)
    except DatabaseError as e:
        return JsonResponse({'error': f'Database error: {str(e)}'}, status=500)

def get_archived_staff(request):
    if request.method == 'GET':
        try:
            # Fetch staff that are soft-deleted
            archived_staff = Staff.objects.filter(is_deleted=True).values(
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'specialization',
                'email'
            )

            archived_staff_list = list(archived_staff)

            return JsonResponse({'staff': archived_staff_list}, status=200)
        except Exception as e:
            return JsonResponse({'error': f'Error fetching archived staff: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def restore_staff(request, id):
    if request.method == 'POST':  # Or whichever method you're using
        try:
            # Fetch staff that are soft-deleted
            staff = Staff.objects.get(id=id, is_deleted=True)
            staff.is_deleted = False  # Restore the staff record
            staff.save()

            # Return success response
            return JsonResponse({'message': 'Staff restored successfully.'}, status=200)
        except Staff.DoesNotExist:
            return JsonResponse({'error': 'Staff not found or not soft-deleted.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Error restoring staff: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method. Use POST or PUT.'}, status=405)


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
def delete_staff(request, id):
    if request.method == 'DELETE':
        try:
            staff = Staff.objects.get(id= id)

            if staff.is_deleted:
                return JsonResponse({'error': 'Staff is already deleted.'}, status=400)

            staff.is_deleted = True
            staff.save()

            return JsonResponse({'message': 'Staff deleted successfully.'}, status=200)
        except Staff.DoesNotExist:
            return JsonResponse({'error': 'Staff not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'error': f'Error deleting staff: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method.'}, status=405)

@csrf_exempt
def edit_staff(request, id):
    """
    Edit a staff member's details like name, specialization, and email.
    Allows admins or the staff member themselves to update their details.
    """
    if request.method == 'PUT':
        try:

            # Retrieve the staff record from the database
            staff = Staff.objects.get(id=id, is_deleted=False)

            # Parse the incoming JSON body to get the updated fields
            body = json.loads(request.body)
            first_name = body.get('first_name', staff.first_name)
            middle_name = body.get('middle_name', staff.middle_name)
            last_name = body.get('last_name', staff.last_name)
            suffix = body.get('suffix', staff.suffix)
            workposition = body.get('workposition', staff.workposition)
            email = body.get('email', staff.email)

            # Update fields only if they are provided in the request
            staff.first_name = first_name
            staff.middle_name = middle_name
            staff.last_name = last_name
            staff.suffix = suffix
            staff.workposition = workposition
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



@csrf_exempt
def create_staff(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            body = json.loads(request.body)
            username = body.get('username')
            first_name = body.get('first_name')
            middle_name = body.get('middle_name', '')
            last_name = body.get('last_name')
            suffix = body.get('suffix', '')
            workposition = body.get('workposition')  # Make sure the field matches your model
            email = body.get('email')
            address = body.get('address')
            phonenumber = body.get('phonenumber')
            maritalstatus = body.get('maritalstatus')
            sex = body.get('sex')
            birthday = body.get('birthday')  # Should be a valid datetime string

            # Check if all required fields are provided
            if not first_name or not last_name or not workposition or not email or not birthday:
                return JsonResponse({'error': 'All fields are required'}, status=400)

            # Check if the user_level_id for Staff (2) exists in the Role model
            try:
                role = Role.objects.get(id=2)  # Assuming 2 is for Staff
            except Role.DoesNotExist:
                return JsonResponse({'error': 'Role with user_level_id 2 not found'}, status=400)


            # Create a predefined password: 'LastName123'
            predefined_password = f"{last_name}123"

            # Hash the password using Django's built-in password hashing
            # Hash the password before saving
            hashed_password = bcrypt.hashpw(predefined_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Decode to string

            # Create the Staff instance
            staff = Staff.objects.create(
                username=username,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                suffix=suffix,
                workposition=workposition,
                email=email,
                password=hashed_password,  # Store hashed password
                user_level_id=role,
                address=address,
                phonenumber=phonenumber,
                maritalstatus=maritalstatus,
                sex=sex,
                birthday=birthday,
                is_deleted=False  # Ensure the staff isn't marked as deleted by default
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
                'username': staff.username,
                'first_name': staff.first_name,
                'middle_name': staff.middle_name,
                'last_name': staff.last_name,
                'suffix': staff.suffix,
                'workposition': staff.workposition,
                'email': staff.email,
                'user_level_id': staff.user_level_id.id if staff.user_level_id else None,
                'profilePicture': staff.profilepicture.url if staff.profilepicture else None,
                'address': staff.address,
                'phonenumber': staff.phonenumber,
                'sex': staff.sex,
                'birthday': staff.birthday,
                'maritalstatus': staff.maritalstatus,
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
    Update the logged-in staff's details like name, specialization, email, and profile picture.
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

            # # Check if profile picture is part of the request
            # if 'PROFILE_PICTURE' in request.FILES:
            #     staff.profilepicture = request.FILES['PROFILE_PICTURE']
            #     print("File name:", request.FILES['PROFILE_PICTURE'].name)
            #     print("File size:", request.FILES['PROFILE_PICTURE'].size)
            # else:
            #     print("No file uploaded")

            # Parse the incoming JSON body to get the updated fields
            body = json.loads(request.body)
            username = body.get('username', staff.username)
            first_name = body.get('first_name', staff.first_name)
            middle_name = body.get('middle_name', staff.middle_name)
            last_name = body.get('last_name', staff.last_name)
            suffix = body.get('suffix', staff.suffix)
            workposition = body.get('workposition', staff.workposition)
            email = body.get('email', staff.email)
            address = body.get('address', staff.address)
            phonenumber = body.get('phonenumber', staff.phonenumber)
            maritalstatus = body.get('maritalstatus', staff.maritalstatus)
            sex = body.get('sex', staff.sex)
            birthday = body.get('birthday', staff.birthday)



            # Update fields only if they are provided in the request
            staff.username = username
            staff.first_name = first_name
            staff.middle_name = middle_name
            staff.last_name = last_name
            staff.suffix = suffix
            staff.workposition = workposition
            staff.email = email
            staff.address = address
            staff.phonenumber = phonenumber
            staff.maritalstatus = maritalstatus
            staff.sex = sex
            staff.birthday = birthday

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
