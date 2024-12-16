
from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('me/', views.get_patient_details, name='Profile'),
    path('updateProfile/', views.update_patient_details, name= 'UpdateProfile'),
    path('deleteAcc/', views.soft_delete_patient, name= 'Delete'),
    path('update-password/', views.UpdatePasswordView, name='update-password'),
    # Add other paths for superadmin-related views here
]   

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
