# Generated by Django 4.2.17 on 2024-12-29 17:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clinic_python', '0029_rename_hr_medicalrecord_heart_rate_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='patient',
            name='patient_type',
            field=models.CharField(default='student', max_length=100),
        ),
    ]
