import React, { useState } from 'react';
import axios from 'axios';
import styles from './SignupPage.module.css';
import logoImage from './images/logo.png';
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TermsModal from './TermsModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    student_or_employee_no: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    campus: '',
    college_office: '',
    course_designation: '',
    year: '',
    emergency_contact_number: '',
    emergency_contact_relation: '',
    bloodtype: '',
    allergies: '',
    age: '',
    sex: '',
    address: '',
  });

  const [errors, setErrors] = useState({
    confirmPassword: '',
    requiredFields: '',
    terms: '',
    server: '',
    email: '',
    phoneNumber: '',
  });

  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    setIsTermsChecked(e.target.checked);
  };

  

  const validateForm = () => {
    let valid = true;
    setErrors({ confirmPassword: '', requiredFields: '', terms: '', server: '', email: '', phoneNumber: '' });
  
    if (formValues.password !== formValues.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Passwords do not match',
      }));
      valid = false;
    }
  
    const validatePassword = (password) => {
      // Updated password regex: At least 8 characters, one uppercase, one lowercase, and one number
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
      return passwordRegex.test(password);
    };
  
    // Validate password complexity
    if (!validatePassword(formValues.password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: 'Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, and one number.',
      }));
      valid = false;
    }
  
    // Create an object excluding 'suffix' and 'middleName'
    const fieldsToCheck = { ...formValues };
    delete fieldsToCheck.suffix; // Exclude 'suffix'
    delete fieldsToCheck.middleName; // Exclude 'middleName'
  
    // Validate phone number
    const validatePhoneNumber = (phoneNumber) => {
      const phoneNumberRegex = /^09\d{9}$/;
      return phoneNumberRegex.test(phoneNumber);
    };
  
    if (!validatePhoneNumber(formValues.phoneNumber)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber: 'Phone number must start with "09" and have exactly 11 digits.',
      }));
      valid = false;
    }
  
    // // Check required fields
    // for (const key in fieldsToCheck) {
    //   if (fieldsToCheck[key].trim() === '') {
    //     setErrors((prevErrors) => ({
    //       ...prevErrors,
    //       requiredFields: 'All fields are required except Suffix and Middle Name.',
    //     }));
    //     valid = false;
    //     break;
    //   }
    // }
  
    // Validate terms and conditions
    if (!isTermsChecked) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        terms: 'You must agree to the Terms and Privacy Policy.',
      }));
      valid = false;
    }
  
    return valid;
  };
  

  const handleCreateAccount = async () => {
    if (validateForm()) {
      try {
        // Pass form values to the next page via the navigate function
        const { email, middleName, firstName, lastName } = formValues;

  
        // Register the patient account
        const registerResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/register/`, {
          student_or_employee_no : formValues.student_or_employee_no,
          first_name: formValues.firstName,
          middle_name: formValues.middleName,
          last_name: formValues.lastName,
          suffix: formValues.suffix,
          email: formValues.email,
          contact_number: formValues.phoneNumber,
          password: formValues.password,
          campus: formValues.campus,
          college_office: formValues.college_office,
          course_designation: formValues.course_designation,
          year: formValues.year,
          emergency_contact_number: formValues.emergency_contact_number,
          emergency_contact_relation: formValues.emergency_contact_relation,
          bloodtype: formValues.bloodtype,
          allergies: formValues.allergies,
          age: formValues.age,
          sex: formValues.sex,
          address: formValues.address,
        });
  
        // Check if registration was successful
        if (registerResponse.status === 201) {
          console.log('Registration successful, navigating to account success page');
          navigate('/accountSuccess'); // Navigate to the success page
        } else {
          console.error('Failed to register the patient:', registerResponse);
          alert('Failed to register. Please try again.');
        }
      } catch (err) {
        if (err.response && err.response.status === 409) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: 'A patient with this name or email already exists.',
          }));
        } else {
          console.error('Signup error:', err);
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: 'An unexpected error occurred. Please try again later.',
          }));
        }
      }
    }
  };
  

  const inlineBodyStyle = {
    margin: '0',
    padding: '0',
    boxSizing: 'border-box',
    background: `url(${require('./images/AceBldg.png')}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    minHeight: '100vh',
  };


  return (
    <div style={inlineBodyStyle}>
      <div className={styles.signupContainer}>
        <div className={styles.formSection}>
          <div className={styles.formContent}>
            <img src={logoImage} alt="logo" className={styles.logoImage} />
            <h2 className={styles.title}>
              GET STARTED WITH <span className={styles.gradientText}>Queue Care</span>
            </h2>
            <p className={styles.text}>Create an account now!</p>

            {/* All error messages above First Name and Last Name fields */}
            {(errors.requiredFields || errors.server || errors.confirmPassword || errors.terms || errors.email || errors.phoneNumber) && (
              <p className={styles.errorText}>
                {errors.requiredFields || errors.server || errors.confirmPassword || errors.terms || errors.email || errors.phoneNumber}
              </p>
            )}

            <div className={styles.inputGroup}>
              <TextField
                label="Student or Employee Number: "
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="student_or_employee_no"
                value={formValues.student_or_employee_no}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                required
              />

              <TextField
                label="Middle Name"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="middleName"
                value={formValues.middleName}
                onChange={handleInputChange}
              />

              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                required
              />

              <TextField
                label="Suffix"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="suffix"
                value={formValues.suffix}
                onChange={handleInputChange}
                style={{ maxWidth: '100%' }}
              />
            </div>

            <div className={styles.inputGroup}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
                type="email"
              />
              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="phoneNumber"
                value={formValues.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="password"
                value={formValues.password}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                required

              />
              

            </div>

            <div className={styles.inputGroup}>
            <TextField
                label="Campus"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="campus"
                value={formValues.campus}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="College or Office"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="college_office"
                value={formValues.college_office}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Course or Designation"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="course_designation"
                value={formValues.course_designation}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Year"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="year"
                value={formValues.year}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.inputGroup}>
            <TextField
                label="Emergency Contact Number"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="emergency_contact_number"
                value={formValues.emergency_contact_number}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Emergency Contact Relation"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="emergency_contact_relation"
                value={formValues.emergency_contact_relation}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
            <TextField
                label="Blood Type"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="bloodtype"
                value={formValues.bloodtype}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Allergies"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="allergies"
                value={formValues.allergies}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Sex"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="sex"
                value={formValues.sex}
                onChange={handleInputChange}
                required
              />
              <TextField
                label="Age"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="age"
                value={formValues.age}
                onChange={handleInputChange}
                required
              />
            </div>


            <div className={styles.inputGroup}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                className={styles.inputField}
                name="address"
                value={formValues.address}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Terms and Privacy Policy Modals */}
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
            <PrivacyPolicyModal isOpen={isPrivacyPolicyModalOpen} onClose={() => setIsPrivacyPolicyModalOpen(false)} />

            <div className={styles.checkbox}>
              <div className={styles.box1}>
                <FormControlLabel
                  control={<Checkbox name="rememberMe" color="primary" />}
                  label="Remember me"
                />
              </div>
              <div className={styles.box2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="terms"
                      color="primary"
                      checked={isTermsChecked}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={
                    <>
                      I agree to all the
                      <a href="#" onClick={() => setIsTermsModalOpen(true)} className={styles.termsLink}> Terms </a>
                      and
                      <a href="#" onClick={() => setIsPrivacyPolicyModalOpen(true)} className={styles.privacyLink}> Privacy policy. </a>
                    </>
                  }
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                sx={{
                  color: '#6c757d',
                  borderColor: '#6c757d',
                  height: '50px',
                  width: '45%', // Adjust width for a balanced layout
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
                onClick={() => navigate(-1)}
              >
                Back
              </Button>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#3d9d3b',
                  color: 'white',
                  height: '50px',
                  width: '45%', // Adjust width for a balanced layout
                  '&:hover': {
                    backgroundColor: '#2e7d32',
                  },
                }}
                onClick={handleCreateAccount}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
