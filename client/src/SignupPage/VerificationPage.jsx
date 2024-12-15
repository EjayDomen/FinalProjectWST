import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {Button} from '@mui/material';
import styles from './VerificationPage.module.css';
import logoImage from './images/logo.png';
import otpImage from './images/otp-image.png';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialFormValues = location.state?.formValues;
  const otpFromServer = location.state?.generatedotp;

  const [formValues, setFormValues] = useState(initialFormValues || {});
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (formValues && formValues.email) {
      setEmail(formValues.email);
    }
  }, [formValues]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup/verification/resend-otp`, { email: formValues.email });
      if (response.status === 200) {
        setMessage("A new OTP has been sent to your email.");
        console.log("OTP resent successfully.");
      } else {
        setMessage("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setMessage("An error occurred while resending the OTP. Please try again later.");
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join(""); // Concatenate the entered OTP array into a single string
    console.log("OTP Submitted:", otpValue);

    try {
      // Step 1: Send the OTP to the server for verification
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup/verification/verify-otp`, {
        email: formValues.email, // Pass the email associated with the OTP
        otp: otpValue,           // Pass the entered OTP value
      });

      // Step 2: Check the server response for successful OTP verification
      if (response.status === 200) {
        console.log("OTP verified successfully:", response.data.message);

        // Step 3: Proceed to create the patient account
        const registerResponse = await axios.post(`${process.env.REACT_APP_API_URL}/signup/patientregister`, {
          FIRST_NAME: formValues.firstName,
          MIDDLE_NAME: formValues.middleName,
          LAST_NAME: formValues.lastName,
          SUFFIX: formValues.suffix,
          EMAIL: formValues.email,
          CONTACT_NUMBER: formValues.phoneNumber,
          PASSWORD: formValues.password,
        });

        // Check if registration was successful
        if (registerResponse.status === 201) {
          console.log('Registration successful, navigating to account success page');
          navigate('/accountSuccess'); // Navigate to the success page
        } else {
          console.error('Failed to register the patient:', registerResponse);
          alert('Failed to register. Please try again.');
        }
      }
    } catch (err) {
      // Handle specific errors based on the response
      if (err.response) {
        // If there's a response from the server
        console.error("OTP verification failed:", err.response.data.message);
        alert("Invalid OTP. Please try again."); // Display user-friendly error message
      } else {
        // Handle any other errors (like network issues)
        console.error('Error during OTP verification or registration:', err);
        alert('An error occurred. Please try again.');
      }
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.verificationBox}>
        <img src={logoImage} alt="logo" className={styles.logo} />
        <h2 className={styles.title}>
          GET STARTED WITH <span className={styles.highlight}>ACE QUEUE</span>
        </h2>
        <img src={otpImage} alt="OTP Verification" className={styles.otpImage} />
        <p className={styles.otpVer}>OTP Verification</p>

        {/* Displaying form values for confirmation (optional) */}
        <div className={styles.confirmation}>
          <p>Confirming for:</p>
          <p>Name: <b>{formValues?.firstName} {formValues?.lastName}</b></p>
          <p>Email: <b>{formValues?.email}</b></p>
        </div>

        <div className={styles.otpInput}>
          {otp.map((data, index) => (
            <input
              className={styles.otpDigit}
              type="text"
              name="otp"
              maxLength="1"
              key={index}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <p>
          Didn’t you receive the OTP?{" "}
          <a href="#" className={styles.resendLink} onClick={handleResend}>
            Resend OTP
          </a>
        </p>
        {message && <p className={styles.message}>{message}</p>} {/* Display the message */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' }}>
            <Button 
              variant="outlined"
              sx={{
                color: '#6c757d',
                borderColor: '#6c757d',
                height: '50px',
                padding:'0 70px',
                width: '65%', // Adjust width for a balanced layout
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
                padding:'0 80px',
                width: '65%', // Adjust width for a balanced layout
                '&:hover': {
                  backgroundColor: '#2e7d32',
                },
              }}
              onClick={handleSubmit}
            >
              Verify
            </Button>
          </div>
      </div>
    </div>
  );
};

export default OtpVerification;
