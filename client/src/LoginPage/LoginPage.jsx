import React, { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css'; // Import the CSS Module
import buildingImage from './images/AceBldg.png';
import logoImage from './images/logo.png';
import { TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login/`, {
        EMAIL: email,
        PASSWORD: password
      });

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('token', data.token); // Store the token in localStorage

        // Redirect based on user role
        if (data.role === 'Patient') {
          navigate('/patient/home'); // Navigate to patient dashboard
        } else if (data.role === 'Staff') {
          navigate('/secretary/dashboard'); // Navigate to admin dashboard
        } else if (data.role === 'Admin') {
          navigate('/secretary/dashboard'); // Navigate to admin dashboard
        }else {
          setError('Unauthorized user role'); // Set error if role is not recognized
        }
      } else {
        setError(response.data.error); // Set the error message to display
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password. Please try again.'); // Updated error message for wrong credentials
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Image Section */}
      <div className={styles.imageSection}>
        <img src={buildingImage} alt="Building" className={styles.buildingImage} />
      </div>
      
      {/* Right Login Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <img src={logoImage} alt="logo" className={styles.logoImage} />
          
          <h2 className={styles.title}>WELCOME TO <span className={styles.gradientText}>QUEUE CARE</span></h2>
          <p className={styles.phrase}>"In Queue care, we queue for you"</p>
          
          <div className={styles.content}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              className={styles.textField}
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Update email state
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              className={styles.textField}
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
            />
            
            <div className={styles.formOptions}>
              <FormControlLabel
                control={<Checkbox name="rememberMe" color="primary" />}
                label="Remember me"
              />
              <a href="#" className={styles.forgotPassword}><Link to="/reset" className={styles.signupLink}>Forgot Password?</Link></a>
            </div>
            
            {error && <p className={styles.errorText}>{error}</p>} {/* Display error message */}
            
            <Button
              variant="contained"
              color="success"
              fullWidth
              className={styles.loginButton}
              onClick={handleLogin} // Call handleLogin on click
            >
              Log in
            </Button>
            
            <p className={styles.text}>Don't have an account? <Link to="/signup" className={styles.signupLink}>Sign up here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
