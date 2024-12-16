from django import forms
import bcrypt  # Import bcrypt
from django.contrib.auth.hashers import make_password  # Import make_password
from clinic_python.models.patient_model import Patient

class PatientRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Password'
    }))
    
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Confirm Password'
    }))

    class Meta:
        model = Patient
        fields = [
            'first_name', 'middle_name', 'last_name', 'suffix', 'campus', 'college_office',
            'course_designation', 'year', 'emergency_contact_number', 'emergency_contact_relation',
            'bloodtype', 'allergies', 'email', 'age', 'sex', 'address'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}),
            'middle_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Middle Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}),
            'suffix': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Suffix'}),
            'campus': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Campus'}),
            'college_office': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'College Office'}),
            'course_designation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Course Designation'}),
            'year': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Year'}),
            'emergency_contact_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Emergency Contact Number'}),
            'emergency_contact_relation': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Emergency Contact Relation'}),
            'bloodtype': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Blood Type'}),
            'allergies': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Allergies'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
            'age': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Age'}),
            'sex': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Sex'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Address'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password != confirm_password:
            raise forms.ValidationError("Passwords do not match")

        # Hash the password before saving using bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Store the hashed password
        cleaned_data["password"] = hashed_password
        
        return cleaned_data
