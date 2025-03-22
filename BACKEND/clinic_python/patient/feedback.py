from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import AccessToken
from clinic_python.models import Feedback
from .feedbackSerializer import FeedbackSerializer
from clinic_python.models.patient_model import Patient


@api_view(['POST'])
def submit_feedback(request):
    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

    # Extract and validate token
    token = auth_header.split(' ')[1]
    try:
        access_token = AccessToken(token)
        patient_id = access_token['id']
        role = access_token['role']  # Retrieve user role from token claims
    except Exception:
        return JsonResponse({'error': 'Invalid or expired token'}, status=401)

    # Get the user from the token
    user = Patient.objects.get(id=patient_id)

    # Get request data
    rating = request.data.get('rating')
    comments = request.data.get('comments', '')

    if not rating:
        return Response({'error': 'Rating is required'}, status=HTTP_400_BAD_REQUEST)

    # Create feedback
    feedback = Feedback.objects.create(user=user, rating=rating, comments=comments)
    serializer = FeedbackSerializer(feedback)

    return Response({'message': 'Feedback submitted successfully', 'data': serializer.data}, status=HTTP_201_CREATED)

