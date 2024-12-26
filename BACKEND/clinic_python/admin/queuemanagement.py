from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import QueueManagement

@api_view(['GET'])
def get_all_queue_management(request):
    """
    Fetch all QueueManagement records and return them as a response.
    """
    try:
        # Fetch all QueueManagement records
        queue_management_list = QueueManagement.objects.all()

        # Prepare the response data
        data = [
            {
                "id": queue.id,
                "status": queue.status,
                "date": queue.date.strftime("%Y-%m-%d"),
                "transaction_type": queue.transaction_type,
            }
            for queue in queue_management_list
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
