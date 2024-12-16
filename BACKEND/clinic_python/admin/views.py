from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse

def is_admin(user):
    return user.groups.filter(name='admin').exists()

@login_required
@user_passes_test(is_admin)
def manage_schedule(request):
    data = {"message": "Admin: Manage schedule"}
    return JsonResponse(data)


def dashboard(request):
    return render(request, 'admin/dashboard.html')
