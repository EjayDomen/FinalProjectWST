import React, { useState } from 'react';
import axios from 'axios';
import styles from './LoginPage.module.css'; // Import the CSS Module
import buildingImage from './images/AceBldg.png';
import logoImage from './images/logo.png';
import { Add } from '@mui/icons-material';
import doctorImage from '../SecretaryPage/images/doc.png'; // Adjust the path based on your component's location
import { Autocomplete, Modal, FormControl, TextField, Box, Button, Checkbox, FormControlLabel, Radio, RadioGroup } from '@mui/material';
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
      address: ''
    });

    const handleSelectPatient = (patient) => {
      // Set formData with selected patient information
      setSelectedPatient(patient);
      setFormData({
        firstName: patient.FIRST_NAME,
        middleName: patient.MIDDLE_NAME,
        lastName: patient.LAST_NAME,
        suffix: patient.SUFFIX,
        age: patient.AGE,
        sex: patient.SEX,
        email: patient.EMAIL,
        contactNumber: patient.CONTACT_NUMBER,
        address: patient.ADDRESS
      });
    };

    const fetchQueueDetails = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/queues/today/CurrentQueueList`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        // Check if QueueManagement status is 'in-progress'
        if (response.data.status === 'in-progress') {
          setQueueDetails(response.data);
    
          // Find the queue with status 'In' to display the current active queue
          const inQueue = response.data.queues.find(queue => queue.status === 'In');
          setCurrentQueueNumber(inQueue ? inQueue.queueNumber : null);
    
          const formattedTime = response.data.time ? response.data.time.slice(0, 5) : '';
          setFormData((prevData) => ({
            ...prevData,
            appointmentDate: response.data.date || '',
            appointmentTime: formattedTime,
          }));
        } else {
          // Handle cases where the status is not 'in-progress'
          setQueueDetails(null);
          setQueueError('No available queue'); // Display message if no active queue
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching queue details:', err);
        setError('Failed to load queue details');
        setQueueError('No queue available for today');
        setLoading(false);
      } finally {
        setLoadingQueue(false);
      }
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
      try {
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
        fetchQueueDetails();
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
          navigate('/secretary/dashboard'); // Navigate to admin dashboard
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
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || "Failed to fetch patient data."}`);
        return;
      }
  
      const data = await response.json();
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
          <div>
            <button className={styles.addDoctorBtn} onClick={handleOpenModal}>
              <Add style={{ fontSize: '30px'}} /> Walk-ins
            </button>
          </div>
          <div style={{marginTop:'6%'}}>
            <img src={logoImage} alt="logo" className={styles.logoImage} />
          </div>

          {/* Modal for Join Queue */}
      <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="join-queue-modal"
      aria-describedby="modal-to-join-queue"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '10px',
          boxShadow: 24,
          overflowY:'scroll',
          p: 4,
        }}
      >
        <button  style={{ top: '1%', right: '2%'}} className={styles.closeModalButton} onClick={handleCloseModal}>&times;</button>
        <h3 id="join-queue-modal-title">Walk-in patient form:</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            flex: '2',
            marginRight: '20px',
            height: '120px'
          }}>
            <div style={{ marginRight: '10px' }}>
              <img src={doctorImage} alt="Doctor" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            </div>
            <div>
              {/* <h4>{`Doctor: ${queueDetails.doctorName} - ${queueDetails.specialty}`}</h4> */}
            </div>
          </div>
        </div>

        <h5>Select Patient Type:</h5>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={patientType}
            onChange={handlePatientTypeChange}
          >
            <FormControlLabel value="new" control={<Radio />} label="New Patient" />
            <FormControlLabel value="existing" control={<Radio />} label="Existing Patient" />
          </RadioGroup>
        </FormControl>

        {patientType === 'existing' && (
          <>
          <h5>Enter Patient ID:</h5>
          <TextField
            fullWidth
            margin="normal"
            label="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)} // Update state with the entered ID
          />
          <Button
            variant="contained"
            color="primary"
            onClick={fetchPatientData} // Call function to fetch patient data
          >
            Fetch Patient Data
          </Button>
        </>
        )}

        <h5>Patient Information:</h5>
        <form>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              margin="normal"
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              margin="normal"
              style={{ width: '145px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '100px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <div style={{ display: 'block', marginTop: '-0.7%' }}>
              <label htmlFor="gender">Gender:</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                disabled={patientType === 'existing'} // Disable if it's an existing patient
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              fullWidth
              style={{ width: '340px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              margin="normal"
              fullWidth
              style={{ width: '300px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
            label="Date"
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate || new Date().toISOString().split('T')[0]}
            onChange={handleChange}
            margin="normal"
            fullWidth
            style={{ width: '300px' }}
            InputLabelProps={{
              shrink: true, // Ensures the label stays above the field
            }}
            disabled={patientType === 'existing'} // Disable if it's an existing patient
          />

          </div>

          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={2}
            style={{ marginBottom: '20px' }}
            disabled={patientType === 'existing'} // Disable if it's an existing patient
          />

<h5>Purpose:</h5>
<FormControl component="fieldset" style={{ marginBottom: "20px" }}>
  <RadioGroup
    value={purpose}
    onChange={(e) => setPurpose(e.target.value)}
  >
    <FormControlLabel
      value="consultation"
      control={<Radio />}
      label="Consultation"
    />
    <FormControlLabel
      value="certificates"
      control={<Radio />}
      label="Certificates"
    />
    <FormControlLabel
      value="others"
      control={<Radio />}
      label="Others"
    />
  </RadioGroup>
</FormControl>

{purpose === "others" && (
  <TextField
    fullWidth
    margin="normal"
    label="Specify Purpose"
    value={otherPurpose}
    onChange={(e) => setOtherPurpose(e.target.value)}
    required
  />
)}

          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '5px', marginBottom: '20px' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              style={{
                backgroundColor: '#13C82E',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 20px',
                width: '30%',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              Confirm
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
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
