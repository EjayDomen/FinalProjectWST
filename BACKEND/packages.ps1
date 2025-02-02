# Define the list of packages
$packages = @(
    "asgiref==3.8.1",
    "backports.zoneinfo==0.2.1",
    "bcrypt==4.2.1",
    "Django==4.2.17",
    "django-cors-headers==4.4.0",
    "django-widget-tweaks==1.5.0",
    "djangorestframework==3.15.2",
    "djangorestframework-simplejwt==5.3.1",
    "pillow==10.4.0",
    "pip==24.3.1",
    "PyJWT==2.9.0",
    "python-dotenv==1.0.1",
    "pytz==2024.2",
    "setuptools==41.2.0",
    "sqlparse==0.5.3",
    "typing_extensions==4.12.2",
    "tzdata==2024.2"
)

# Ensure pip is up to date
Write-Host "Upgrading pip..."
pip install --upgrade pip

# Install each package
foreach ($package in $packages) {
    Write-Host "Installing $package..."
    pip install $package
}

Write-Host "All packages installed successfully."
