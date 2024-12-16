from django.shortcuts import render, redirect
from django.http import JsonResponse
import json
import jwt
import bcrypt
from django.conf import settings
from clinic_python.models.admin_model import Staff
from clinic_python.models.patient_model import Patient
from clinic_python.models.superadmin_model import SuperAdmin
from clinic_python.models.roles_model import Role
from .forms import PatientRegistrationForm
from django.contrib import messages
  # Make sure to import the models
from django.views.decorators.csrf import csrf_exempt

# Patient Registration
@csrf_exempt
def register_patient(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            body = json.loads(request.body)

            # Extract data from the request body
            student_or_employee_no = body.get('student_or_employee_no')
            first_name = body.get('first_name')
            middle_name = body.get('middle_name', '')
            last_name = body.get('last_name')
            suffix = body.get('suffix', '')
            campus = body.get('campus')
            college_office = body.get('college_office')
            course_designation = body.get('course_designation')
            year = body.get('year')
            emergency_contact_number = body.get('emergency_contact_number')
            emergency_contact_relation = body.get('emergency_contact_relation')
            bloodtype = body.get('bloodtype')
            allergies = body.get('allergies', '')
            email = body.get('email')
            age = body.get('age')
            sex = body.get('sex')
            password = body.get('password')
            address = body.get('address')
            user_level_id = 1

            # Validate required fields
            required_fields = [
                'first_name', 'last_name', 'campus', 'college_office', 'course_designation',
                'year', 'emergency_contact_number', 'emergency_contact_relation', 'bloodtype',
                'email', 'age', 'sex', 'password', 'address'
            ]
            for field in required_fields:
                if not locals().get(field):
                    return JsonResponse({'error': f'{field} is required'}, status=400)

            # Hash the password before saving
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')  # Decode to string

            # Retrieve the Role object based on the user_level_id
            try:
                user_level = Role.objects.get(id=user_level_id)
            except Role.DoesNotExist:
                return JsonResponse({'error': 'Invalid user level ID'}, status=400)

            # Create and save the new patient
            new_patient = Patient.objects.create(
                student_or_employee_no = student_or_employee_no,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                suffix=suffix,
                campus=campus,
                college_office=college_office,
                course_designation=course_designation,
                year=year,
                emergency_contact_number=emergency_contact_number,
                emergency_contact_relation=emergency_contact_relation,
                bloodtype=bloodtype,
                allergies=allergies,
                email=email,
                age=age,
                sex=sex,
                password= hashed_password,
                address=address,
                user_level_id=user_level
            )

            return JsonResponse({'message': 'Patient registered successfully!'}, status=201)

        except json.JSONDecodeError:    
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    else:
        return JsonResponse({'message': 'Patient registration page.'})


@csrf_exempt
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        # Parse the request body
        body = json.loads(request.body)
        email = body.get('EMAIL')
        password = body.get('PASSWORD')

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)

        user = None
        role = None

        # Check if the user is a staff
        try:
            user = Staff.objects.get(email=email)
            role = 'Staff'
        except Staff.DoesNotExist:
            # If not found, check if the user is a patient
            try:
                user = Patient.objects.get(email=email, is_deleted=False)
                role = 'Patient'
            except Patient.DoesNotExist:
                try: 
                    user = SuperAdmin.get(email=email)
                    role = 'Admin'
                except SuperAdmin.DoesNotExist:
                    return JsonResponse({'error': 'User not found'}, status=404)

        # # Ensure the stored password is valid and check the password
        # if not isinstance(user.password, str):
        #     return JsonResponse({'error': 'Password format error'}, status=500)

        # Print the type and value of the password from the database
        print(f"password: {password}")
        print(f"user.password: {user.password}")
        print(f"password type: {type(password)}")
        print(f"user.password type: {type(user.password)}")


        valid_password = bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8"))  # Re-encode to bytes
        if not valid_password:
            return JsonResponse({'error': 'Invalid Password'}, status=401)


        # Validate user role by USER_LEVEL_ID
        if role == 'Admin' and user.user_level_id == 1:
            print('Admin logged in')
        elif role == 'Staff' and user.user_level_id == 2:
            print('Staff logged in')
        elif role == 'Patient' and user.user_level_id == 3:
            print('Patient logged in')
        else:
            print('Unauthorized user role')


        # Generate JWT token
        payload = {
            'id': user.id,
            'role': role
        }
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')

        # Return the token and role
        return JsonResponse({'token': token, 'role': role}, status=200)

    except Exception as e:
        return JsonResponse({'error': f'Error during login: {str(e)}'}, status=400)
    
    



def register_patient_demo(request):
    if request.method == 'POST':
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Your account has been created successfully!")
            return redirect('http://localhost:3000/')  # Redirect to login page after successful registration
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = PatientRegistrationForm()

    return render(request, 'register_patient.html', {'form': form})