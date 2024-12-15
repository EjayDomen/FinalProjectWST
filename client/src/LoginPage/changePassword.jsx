import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import styles from './ResetPassword.module.css'; // Assuming you've created a CSS module for styling

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const finalEmail = location.state?.initialEmail;
  // Function to validate the password




  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(finalEmail);


    // Step 1: Check if the passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password === confirmPassword) {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/patient/forgotPassword/reset-password`, {
          email: finalEmail,
          newPassword: confirmPassword,
        });

        if (response && response.status === 200) {
          console.log('Passwords match! Proceed with password reset.');
          setError(''); // Clear any error messages
          navigate('/resetSuccess'); // Navigate to the success page
        }
      } catch (error) {
        console.error("Error resetting password:", error);
        setError('Failed to reset password. Please try again.');
      }
    } else {
      setError('Passwords do not match');
    }
  };


  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <img src={require('./images/logo.png')} alt="logo" className={styles.logo} />
        <h2 className={styles.title}>
          RESET YOUR <span className={styles.highlight}>PASSWORD</span>
        </h2>
        <p className={styles.subtitle}>Enter and confirm your new password</p>

        <form onSubmit={handleSubmit}>
          {/* New Password Field */}
          <TextField
            label="New Password"
            variant="outlined"
            type="password"
            fullWidth
            style={{ marginBottom: '20px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <p style={{
            textAlign: 'left', fontSize: '0.9em',
            color: 'gray', marginBottom: '20px'
          }}>
            Password must:
            <ul>
              <li>be at least a minimum of 8 characters.</li>
              <li>include one uppercase letter.</li>
              <li>include one lowercase letter.</li>
              <li>include one number.</li>
            </ul>
          </p>


          {/* Confirm New Password Field */}
          <TextField
            label="Confirm New Password"
            variant="outlined"
            type="password"
            fullWidth
            style={{ marginBottom: '20px' }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={!!error}
            helperText={error}
          />


          <div style={{ display: 'flex', gap: '20px', marginTop: '30px', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              sx={{
                color: '#6c757d',
                borderColor: '#6c757d',
                height: '50px',
                width: '40%',
                padding: '0 30px',
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
              fullWidth
              sx={{
                backgroundColor: '#3d9d3b',
                color: 'white',
                marginBottom: '20px',
                padding: '0 30px',
                width: '40%',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#2e7d32',
                },
              }}
              type="submit"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
