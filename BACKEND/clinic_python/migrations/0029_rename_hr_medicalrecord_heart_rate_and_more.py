# Generated by Django 4.2.17 on 2024-12-29 15:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('clinic_python', '0028_alter_queue_status'),
    ]

    operations = [
        migrations.RenameField(
            model_name='medicalrecord',
            old_name='hr',
            new_name='heart_rate',
        ),
        migrations.RenameField(
            model_name='medicalrecord',
            old_name='rr',
            new_name='respiratory_rate',
        ),
    ]
