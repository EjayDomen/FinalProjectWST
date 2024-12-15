from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, User

class Command(BaseCommand):
    help = "Create user groups and assign users to groups"

    def handle(self, *args, **kwargs):
        # Create groups
        groups = ['superadmin', 'admin', 'patient']
        for group_name in groups:
            Group.objects.get_or_create(name=group_name)
        
        # Assign a user to a group (Example)
        try:
            user = User.objects.get(username='example_user')
            group = Group.objects.get(name='admin')
            user.groups.add(group)
            self.stdout.write(self.style.SUCCESS('User assigned to admin group.'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('User "example_user" does not exist.'))
