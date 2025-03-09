import React, { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css'; // Import the CSS Module
import buildingImage from './images/AceBldg.png';
import logoImage from './images/logo.png';
import { Add } from '@mui/icons-material';
import doctorImage from '../SecretaryPage/images/doc.png'; // Adjust the path based on your component's location
import { Autocomplete, Modal, FormControl, TextField, Box, Button, Checkbox, FormControlLabel, Radio, RadioGroup, InputLabel, MenuItem, Select } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom

const LoginPage = () => {
  const [purpose, setPurpose] = React.useState(""); // Purpose selection
  const [otherPurpose, setOtherPurpose] = React.useState(""); // Specify others

  const [email, setEmail] = useState('');
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentQueueNumber, setCurrentQueueNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate hook
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [queueDetails, setQueueDetails] = useState(null);
  const [patients, setPatients] = useState([]); // List of patients
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [loadingQueue, setLoadingQueue] = useState(true); // State for loading the queue
  const [queueError, setQueueError] = useState(null); // State for queue error
  const [patientType, setPatientType] = useState('new'); // 'new' or 'existing'
  const [formData, setFormData] = useState({
      appointmentDate: '',
      appointmentTime: '',
      patientName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      age: '',
      sex: '',
      email: '',
      contactNumber: '',
      address: '',
      role: '',
    });

    const handleSelectPatient = (patient) => {
      // Set formData with selected patient information
      setSelectedPatient(patient);
      setFormData({
        firstName: patient.first_name,
        middleName: patient.middle_name,
        lastName: patient.last_name,
        suffix: patient.suffix,
        age: patient.age,
        sex: patient.sex,
        email: patient.email,
        address: patient.address
      });
    };


    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
      try {
        // Check if the purpose is 'others' and concatenate 'others - otherPurpose' if true
        const finalPurpose = purpose === 'others' ? `others - ${otherPurpose}` : purpose;
        // Prepare form data, setting missing fields to null if not provided
        const dataToSend = {
          DATE: formData.appointmentDate || null,
          FIRST_NAME: formData.firstName || null,
          MIDDLE_NAME: formData.middleName || null,
          LAST_NAME: formData.lastName || null,
          SUFFIX: formData.suffix || 'N/A',
          ADDRESS: formData.address || null,
          AGE: formData.age || null,
          SEX: formData.sex || 'N/A',
          CONTACT_NUMBER: formData.contactNumber|| null,
          EMAIL: formData.email,
          TRANSACTION: finalPurpose,
          ROLE: formData.role,
        };
  
        // Send data to the backend to join the queue
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/joinqueue/`, dataToSend, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        // Handle successful submission
        console.log('Joined queue successfully:', response.data);
        setSuccessModalOpen(true);
        setSuccessMessage('Walk-in successfully joined the queue');
        handleCloseModal(); // Close the modal on success
      } catch (error) {
        console.error('Error joining queue:', error);
        setErrorModalMessage(error.response?.data?.error || 'Failed to add walk-in. Please try again later.');
        setErrorModalOpen(true);
      }
    };

  const handlePatientTypeChange = (e) => {
    setPatientType(e.target.value);
    setFormData({ // Reset form data when switching between new/existing
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      age: '',
      sex: '',
      email: '',
      contactNumber: '',
      address: '',
      appointmentDate:'',
    });
    setSelectedPatient(null); // Reset selected patient
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login/`, {
        EMAIL: email,
        PASSWORD: password
      });

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem('token', data.access); // Store the token in localStorage

        // Redirect based on user role
        if (data.role === 'Patient') {
          navigate('/patient/home'); // Navigate to patient dashboard
        } else if (data.role === 'Staff') {
          navigate('/staff/dashboard'); // Navigate to admin dashboard
        } else if (data.role === 'Admin') {
          navigate('/superadmin/dashboard'); // Navigate to admin dashboard
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


  const fetchPatientData = async () => {
    if (!patientId) {
      alert("Please enter a valid Patient ID.");
      return;
    }
  
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/details/`, {
        params: {
          student_or_employee_no: patientId, // Sending the patientId as a query parameter
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = response.data;  // axios automatically parses the response JSON
      handleSelectPatient(data);
      setSelectedPatient(data); // Update the state with the fetched patient data
      alert("Patient data fetched successfully!");
    } catch (error) {
      console.error("Error fetching patient data:", error);
      alert("An error occurred while fetching patient data. Please try again.");
    }
  };
  

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <div className={styles.loginContainer}>
      {/* Left Image Section */}
      <div className={styles.imageSection}>
        <img src={buildingImage} alt="Building" className={styles.buildingImage} />
      </div>
      
      {/* Right Login Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formContent}>
          <div style={{marginTop:'6%'}}>
            <img src={logoImage} alt="logo" className={styles.logoImage} />
          </div>

        
          <h2 className={styles.title}>WELCOME TO <span className={styles.gradientText}>STERITEX MEDICAL SYSTEM</span></h2>
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
