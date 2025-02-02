# Generated by Django 5.1.4 on 2024-12-11 11:44

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('middle_name', models.CharField(blank=True, max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('suffix', models.CharField(blank=True, max_length=10)),
                ('campus', models.CharField(max_length=100)),
                ('college_office', models.CharField(max_length=100)),
                ('course_designation', models.CharField(max_length=100)),
                ('year', models.CharField(max_length=100)),
                ('emergency_contact_number', models.CharField(max_length=15)),
                ('emergency_contact_relation', models.CharField(max_length=15)),
                ('bloodtype', models.CharField(max_length=15)),
                ('allergies', models.TextField(blank=True)),
                ('email', models.EmailField(max_length=254)),
                ('age', models.CharField(max_length=15)),
                ('sex', models.CharField(max_length=10)),
                ('password', models.CharField(max_length=255)),
                ('address', models.TextField()),
                ('type', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('middle_name', models.CharField(blank=True, max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('suffix', models.CharField(blank=True, max_length=10)),
                ('gender', models.CharField(max_length=10)),
                ('email', models.EmailField(max_length=254)),
                ('password', models.CharField(max_length=255)),
                ('license_number', models.CharField(blank=True, max_length=100)),
                ('schedule', models.CharField(blank=True, max_length=100)),
                ('department', models.CharField(blank=True, max_length=100)),
                ('role', models.CharField(choices=[('Patient', 'Patient'), ('Admin', 'Admin'), ('SuperAdmin', 'SuperAdmin')], max_length=20)),
                ('user_level_id', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=50)),
                ('middle_name', models.CharField(max_length=50)),
                ('last_name', models.CharField(max_length=50)),
                ('suffix', models.CharField(max_length=50)),
                ('age', models.CharField(max_length=50)),
                ('address', models.CharField(max_length=50)),
                ('sex', models.CharField(max_length=50)),
                ('contact_number', models.CharField(max_length=50)),
                ('appointment_time', models.DateTimeField()),
                ('appointment_date', models.DateField()),
                ('purpose', models.TextField()),
                ('status', models.CharField(max_length=50)),
                ('type', models.CharField(max_length=50)),
                ('patientid', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clinic_python.patient')),
                ('staff', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clinic_python.user')),
            ],
        ),
    ]
