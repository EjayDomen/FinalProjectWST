from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse

def is_patient(user):
    return user.groups.filter(name='patient').exists()

@login_required
@user_passes_test(is_patient)
def view_appointments(request):
    data = {"message": "Patient: View appointments"}
    return JsonResponse(data)
