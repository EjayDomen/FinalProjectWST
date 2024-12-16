# Generated by Django 4.2.17 on 2024-12-16 00:28

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('clinic_python', '0005_alter_appointment_status_alter_appointment_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Permission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission_name', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role_name', models.CharField(max_length=50)),
                ('Permission', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clinic_python.permission')),
            ],
        ),
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('middle_name', models.CharField(blank=True, max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('suffix', models.CharField(blank=True, max_length=10)),
                ('specialization', models.CharField(max_length=255)),
                ('email', models.EmailField(max_length=254)),
                ('password', models.CharField(max_length=255)),
                ('user_level_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clinic_python.role')),
            ],
        ),
        migrations.RemoveField(
            model_name='medicalrecord',
            name='attendingstaff',
        ),
        migrations.RemoveField(
            model_name='medicalrecord',
            name='patientid',
        ),
        migrations.RemoveField(
            model_name='queue',
            name='appointment',
        ),
        migrations.RemoveField(
            model_name='queue',
            name='patient',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='type',
        ),
        migrations.DeleteModel(
            name='Appointment',
        ),
        migrations.DeleteModel(
            name='MedicalRecord',
        ),
        migrations.DeleteModel(
            name='Queue',
        ),
        migrations.DeleteModel(
            name='User',
        ),
        migrations.AddField(
            model_name='patient',
            name='user_level_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='clinic_python.role'),
        ),
    ]
