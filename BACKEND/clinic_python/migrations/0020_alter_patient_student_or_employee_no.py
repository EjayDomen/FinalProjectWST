# Generated by Django 4.2.17 on 2024-12-21 16:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clinic_python', '0019_alter_patient_student_or_employee_no_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='patient',
            name='student_or_employee_no',
            field=models.CharField(max_length=100),
        ),
    ]
