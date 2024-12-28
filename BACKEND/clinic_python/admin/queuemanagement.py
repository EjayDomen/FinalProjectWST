from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from clinic_python.models import QueueManagement
from datetime import date
from clinic_python.models import Queue
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

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
    
    
@api_view(['GET'])
def get_today_queue_management(request):
    """
    Fetch QueueManagement records where the date is today's date.
    """
    try:
        # Get today's date
        today = date.today()

        # Filter records with today's date
        queue_management_today = QueueManagement.objects.filter(date=today)

        # Prepare the response data
        data = [
            {
                "id": queue.id,
                "status": queue.status,
                "date": queue.date.strftime("%Y-%m-%d"),
                "transaction_type": queue.transaction_type,
            }
            for queue in queue_management_today
        ]

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_queues_by_qmid(request, qmid):
    """
    Fetch all Queue records associated with the given qmid, ordered by queue_number.
    """
    try:
        # Filter queues by qmid and order them by queue_number in ascending order
        queues = Queue.objects.filter(qmid_id=qmid).order_by('queue_number')

        # Prepare the response data
        data = [
            {
                "id": queue.id,
                "queue_number": queue.queue_number,
                "status": queue.status,
                "ticket_type": queue.ticket_type,
                "transaction_type": queue.transaction_type,
                "is_priority": queue.is_priority,
                "appointment": queue.appointment.id if queue.appointment else None,
                "patient": queue.patient.id if queue.patient else None,
                "qmid": queue.qmid.id if queue.qmid else None,
            }
            for queue in queues
        ]

        # Return the response
        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@csrf_exempt
def update_queue_status(request, queue_id):
    """
    Update the status of a QueueManagement object.

    Args:
        request: HTTP request object (expects 'status' in JSON body).
        queue_id: ID of the queue to update.

    Returns:
        JsonResponse with success or error message.
    """
    if request.method == "POST":
        try:
            # Parse JSON data
            import json
            data = json.loads(request.body)

            # Retrieve new status from JSON data
            new_status = data.get("status", "").strip()

            # Validate input
            if not new_status:
                return JsonResponse({"error": "Status cannot be empty."}, status=400)

            # Fetch the QueueManagement object
            queue = get_object_or_404(QueueManagement, id=queue_id)

            # Update the status
            queue.status = new_status
            queue.save()

            return JsonResponse(
                {"message": f"Queue status updated to '{new_status}' successfully."}
            )
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)


@api_view(['GET'])
def get_queue_management_by_id(request, queue_id):
    """
    Fetch a single QueueManagement record by its ID.

    Args:
        request: HTTP request object.
        queue_id: ID of the QueueManagement record to fetch.

    Returns:
        JsonResponse with the record's details or an error message.
    """
    try:
        # Fetch the QueueManagement object by ID
        queue = get_object_or_404(QueueManagement, id=queue_id)

        # Prepare the response data
        data = {
            "id": queue.id,
            "status": queue.status,
            "date": queue.date.strftime("%Y-%m-%d"),
            "transaction_type": queue.transaction_type,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
