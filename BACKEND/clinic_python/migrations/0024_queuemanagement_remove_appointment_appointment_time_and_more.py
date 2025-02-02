# Generated by Django 4.2.17 on 2024-12-23 01:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clinic_python', '0023_remove_queue_appointment_remove_queue_patient_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='QueueManagement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(max_length=50)),
                ('date', models.DateField()),
                ('transaction_type', models.CharField(choices=[('Consultation', 'Consultation'), ('Certificates', 'Certificates'), ('Others', 'Others')], default='Consultation', max_length=20)),
            ],
        ),
        migrations.RemoveField(
            model_name='appointment',
            name='appointment_time',
        ),
        migrations.CreateModel(
            name='Queue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('queue_number', models.IntegerField()),
                ('status', models.CharField(choices=[('Waiting', 'Waiting'), ('Served', 'Served'), ('Skipped', 'Skipped'), ('Pending', 'Pending')], default='Pending', max_length=10)),
                ('ticket_type', models.CharField(choices=[('walk-in', 'Walk-in'), ('appointment', 'Appointment')], default='walk-in', max_length=15)),
                ('transaction_type', models.CharField(choices=[('Consultation', 'Consultation'), ('Certificates', 'Certificates'), ('Others', 'Others')], default='Consultation', max_length=20)),
                ('is_priority', models.BooleanField(default=False)),
                ('appointment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='clinic_python.appointment')),
                ('patient', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clinic_python.patient')),
                ('qmid', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clinic_python.queuemanagement')),
            ],
        ),
    ]
