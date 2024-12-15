import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {Button} from '@mui/material';
import styles from './OTPVerification.module.css';
import logoImage from './images/logo.png';
import otpImage from './images/otp-image.png';

const OtpForgotPasswordVerification = () => {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [message, setMessage] = useState(""); // State to manage messages
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const initialEmail = location.state?.email;

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

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup/verification/resend-otp`, { email: initialEmail });
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
    const otpValue = otp.join("");
    console.log("OTP Submitted", otpValue);

    // Step 1: Check if the OTP is complete
    if (otpValue.length < 4) {
      setMessage("Please enter a complete 4-digit OTP.");
      return;
    }

    try {
      // Step 1: Send the OTP to the server for verification
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/signup/verification/verify-otp`, {
        email: initialEmail, // Use the `initialEmail` variable instead of `formValues.email`
        otp: otpValue,       // Pass the entered OTP value
      });

      // Step 2: Check the server response for successful OTP verification
      if (response.status === 200) {
        console.log("OTP verified successfully:", response.data.message);
        setMessage("OTP verified successfully.");
        navigate('/changePassword', { state: { initialEmail } }); // Redirect to the password change page
      } else {
        setMessage("Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // Step 4: Check if the error is due to invalid OTP
      if (error.response && error.response.status === 400) {
        setMessage("Invalid OTP. Please check the code and try again.");
      } else {
        setMessage("An error occurred during OTP verification. Please try again later.");
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

        <div className={styles.otpInput}>
          {otp.map((data, index) => {
            return (
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
            );
          })}
        </div>

        {/* Display the message below the OTP input fields */}
        {message && <p className={`${styles.message} ${styles.errorMessage}`}>{message}</p>}


        <p>
          Didn’t you receive the OTP?{" "}

          <a className={styles.resendLink} onClick={handleResendOTP}>
            Resend OTP
          </a>

        </p>

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

export default OtpForgotPasswordVerification;
