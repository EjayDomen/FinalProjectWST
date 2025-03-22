from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from clinic_python.models import Feedback
from clinic_python.models.patient_model import Patient
from .feedbackSerializers import FeedbackSerializer
from rest_framework_simplejwt.tokens import AccessToken

@api_view(['GET'])
def get_feedbacks(request):
    auth_header = request.headers.get('Authorization', '')

    # Fetch all feedbacks
    feedbacks = Feedback.objects.all().order_by('-created_at')  # Order by latest feedback
    feedback_list = []

    for feedback in feedbacks:
        patient = feedback.user  # Assuming 'user' is a ForeignKey to Patient

        # Handle missing patient case
        if patient:
            full_name = f"{patient.first_name} {patient.last_name}".strip()
        else:
            full_name = "Unknown"  # Fallback if patient record is missing
        
        feedback_list.append({
            'id': feedback.id,
            'patient_id': feedback.user.id,
            'patient_name': full_name,
            'rating': feedback.rating,
            'comments': feedback.comments,
            'created_at': feedback.created_at.strftime("%Y-%m-%d %H:%M:%S"),  # Ensure proper date format
        })

    return Response({'feedback': feedback_list}, status=HTTP_200_OK)
