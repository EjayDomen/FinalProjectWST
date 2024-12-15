import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import styles from './ResetPassword.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowBack} from '@mui/icons-material';

const ResetPasswordPage = () => {
  // State to capture the user's email input and manage errors
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    server: '',
  });
  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    // Reset errors
    setErrors({ email: '', server: '' });

    // Check if email is empty
    if (email.trim() === '') {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Email is required.',
      }));
      valid = false;
    }

    // Check if the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== '' && !emailRegex.test(email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Please enter a valid email address.',
      }));
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    try {
      // Send a request to find the patient by email
      const checkResponse = await axios.post(`${process.env.REACT_APP_API_URL}/patient/forgotPassword/find-patient`, {
        EMAIL: email,
      });

      if (checkResponse.status === 200) {
        console.log('Patient exists, proceeding to OTP verification.');
        console.log(email);

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup/verification/send-otp`, { email });
        if (response.status === 200) {
          console.log(response.data.message); // Log success message




          // Pass form values to the next page via the navigate function
          navigate(`/OTPVerification`, { state: { email } });
        } else {
          alert("Failed to send OTP. Please try again.");
        }



      }
    } catch (err) {
      console.error('Error finding patient:', err);

      if (err.response && err.response.status === 409) {
        // Handle the case where the patient already exists
        setErrors((prevErrors) => ({
          ...prevErrors,
          server: 'A patient with this email or contact number already exists.',
        }));
      } else if (err.response && err.response.status === 404) {
        // Handle the case where the patient does not exist
        setErrors((prevErrors) => ({
          ...prevErrors,
          server: 'No existing patient with this email. Please try again.',
        }));
      } else {
        // Generic error message for other types of errors
        setErrors((prevErrors) => ({
          ...prevErrors,
          server: 'An error occurred. Please try again later.',
        }));
      }
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <img src={require('./images/logo.png')} alt="logo" className={styles.logo} />
        <h2 className={styles.title}>
          GET STARTED WITH <span className={styles.highlight}>ACE QUEUE</span>
        </h2>
        <p className={styles.subtitle}>Create a new password</p>

        <p style={{ float: 'left' }}>Enter your Email below :</p>
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            style={{ marginBottom: '20px' }} // Inline style to control spacing
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
          />

          {errors.server && <p style={{ color: 'red', marginBottom: '20px' }}>{errors.server}</p>}

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
              type="submit"
            >
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
