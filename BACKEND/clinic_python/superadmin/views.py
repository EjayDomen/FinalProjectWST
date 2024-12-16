from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.shortcuts import render

def is_superadmin(user):
    return user.groups.filter(name='superadmin').exists()

@login_required
@user_passes_test(is_superadmin)
def manage_users(request):
    data = {"message": "Superadmin: Manage users"}
    return JsonResponse(data)

# clinic_python/superadmin/views.py



def dashboard(request):
    return render(request, 'superadmin/dashboard.html')
