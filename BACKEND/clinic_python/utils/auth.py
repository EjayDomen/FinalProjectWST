# utils/auth.py
import os
import jwt
from django.http import JsonResponse
from functools import wraps
from clinic_python.models import Staff, Patient, SuperAdmin, Role
from rest_framework_simplejwt.tokens import AccessToken


def role_required(required_role=None):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            try:
                # Check for Authorization header
                auth_header = request.headers.get('Authorization')
                if not auth_header or not auth_header.startswith('Bearer '):
                    return JsonResponse({'error': 'Authorization header is missing or malformed'}, status=401)

                
                token = auth_header.split(' ')[1]
                access_token = AccessToken(token)
                staff_id = access_token['id']  # Retrieve the user ID from token claims
                role = access_token['role']  # Retrieve the user role from token claims# Extract token from header


                # Fetch the user based on role
                user = None
                if role == 'Staff':
                    user = Staff.objects.filter(id=staff_id).first()
                elif role == 'Patient':
                    user = Patient.objects.filter(id=staff_id).first()
                elif role == 'Admin':
                    user = SuperAdmin.objects.filter(id=staff_id).first()
                else:
                    return JsonResponse({'error': 'Invalid role'}, status=401)

                if not user:
                    return JsonResponse({'error': 'User not found'}, status=404)

                # Fetch user's role level from UserLevel model
                user_level = UserLevel.objects.filter(id=user.user_level_id).first()
                if not user_level:
                    return JsonResponse({'error': 'User level not found'}, status=404)

                # Check if user's role matches the required role
                if required_role and user_level.role_name != required_role:
                    return JsonResponse({'error': 'Access denied'}, status=403)

                # Attach user info to request
                request.user = {
                    'id': decoded.get('id'),
                    'role': decoded.get('role'),
                    **user.__dict__,  # Attach all fields from the user
                }
                return view_func(request, *args, **kwargs)

            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': 'Token has expired'}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=401)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

        return _wrapped_view
    return decorator
