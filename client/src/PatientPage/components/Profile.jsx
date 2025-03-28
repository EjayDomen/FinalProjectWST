import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ArrowBack, AccountCircle } from '@mui/icons-material';
import SuccessModal from '../../SecretaryPage/components/successModal';
import ErrorModal from '../../SecretaryPage/components/errorModal.jsx';
import '../styles/ProfilePatient.module.css'

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const ChangePasswordModal = ({ isOpen, onClose, formData, handleChange, handleSavePassword }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><b>Change Password</b></h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="text"
                className="form-control"
                name="email"
                value={formData.email}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Enter Old Password:</label>
              <input
                type="password"
                className="form-control"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">New Password:</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSavePassword}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    lastName: "",
    firstName: "",
    suffix: "",
    middleName: "",
    email: "",
    password: "",
    birthday: "",
    age: "",
    sex: "",
    maritalstatus: "",
  });

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [image, setImage] =useState('')
  const imageInput = useRef(null);

  function handleImage(e){
    console.log(e.target.files)
    setImage((e.target.files[0]))
  }

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/me/  `, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const patientData = response.data;

        // Populate formData
        setFormData({
          username: patientData.username ||"",
          lastName: patientData.last_name || "",
          firstName: patientData.first_name || "",
          suffix: patientData.suffix || "",
          middleName: patientData.middle_name || "",
          email: patientData.email || "",
          birthday: patientData.birthday || "",
          age: patientData.age || "",
          sex: patientData.sex || "",
          maritalstatus: patientData.maritalstatus || "",
          profilepicture: patientData.patientprofile || "",
        });

        // If the patient is newly registered, activate the edit button
        if (patientData.isNewlyRegistered) {
          setIsReadOnly(false);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prevData) => {
      // Calculate age when birthday is updated
      const updatedData = { ...prevData, [name]: value };
      if (name === "dateOfBirth") {
        updatedData.age = calculateAge(value);
      }
      return updatedData;
    });
  };
  
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };
  
const handleSave = async () => {
  if (isReadOnly) {
    setIsReadOnly(false);
  } else {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('sex', formData.sex);
      formDataToSend.append('address', formData.address);

      // Check if file is selected and append
      if (imageInput.current && imageInput.current.files && imageInput.current.files[0]) {
        formDataToSend.append('image', imageInput.current.files[0]);
      }

      // Make the PUT request with the form data
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/patient/update-patient/`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data', // Make sure backend supports this
          },
        }
      );

      setSuccessMessage('Profile updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(error.response?.data?.error || 'Failed to update profile. Please check your details and try again.');
      setShowErrorModal(true);
    }

    setIsReadOnly(true);
  }
};

  
  

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSavePassword = async () => {
    if (!validatePassword(formData.password)) {
      alert('Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in first.');
        navigate('/login'); // Redirect to login page if token is not found
        return;
      }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/patient/update-password/`, {
        email: formData.email,
        newPassword: formData.password,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setShowSuccessModal(true);
      setSuccessMessage('Reset password updated successfully!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error.response?.data || error.message);
      setErrorMessage(error.response?.data?.error || 'Failed to reset password. Please check your details and try again.');
      setShowErrorModal(true);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm("Are you sure you want to delete your profile?");
    if (confirmation) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in first.');
        navigate('/login'); // Redirect to login page if token is not found
        return;
      }
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/patient/deleteAcc/`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        alert("Your profile has been deleted successfully.");
        navigate('/'); // Redirect to home or login page after deletion
      } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again later.');
      }
    }
  };
  
  

  return (
    <div className="container" style={{marginTop:'5%', backgroundColor:'#fff', padding:'30px 20px', borderRadius:'8px'}}>
      <style>
        {`
          @media (max-width: 576px) {
            .btn {
              margin-top: 8%;
            }
          }
        `}
      </style>
      <div className="row">
        {/* Left Section */}
        <div className="col-md-4 border-end">
        <button
        className="btn btn-light mb-4"
        onClick={() => navigate('../home')}
      >
        <ArrowBack /> Back
      </button>
      {/* Profile Upload Container */}
      <div className="text-center mb-4">
        <input type="file" ref={imageInput} id="profileUpload" className="d-none" accept="image/*" onChange={handleImage} />
        <label htmlFor="profileUpload" className="d-block">
          <img
            src={`${process.env.REACT_APP_API_URL}${formData.profilepicture}`}
            alt="Profile"
            className="rounded-circle border"
            style={{
              width: "200px",
              height: "200px",
              minWidth: "200px",
              minHeight: "200px",
              maxWidth: "200px",
              maxHeight: "200px ",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        </label>
      </div>

  
  <h3 className="text-center">{`${formData.firstName} ${formData.middleName.charAt(0)}. ${formData.lastName} ${formData.suffix}`}</h3>
  <div style={{padding: '20px 0'}}>
    <p><strong>Age:</strong> {formData.age}</p>
    <p><strong>Birthday:</strong> {formData.birthday}</p>
    <p><strong>Sex:</strong> {formData.sex}</p>
    <p><strong>Marital Status:</strong> {formData.maritalstatus}</p>
  </div>
</div>

        {/* Right Section */}
    <div className="col-md-8">
      {/* Reminder Message */}
        {!isReadOnly && (
          <div
            className="alert alert-warning"
            style={{ fontSize: '14px', marginBottom: '20px', fontWeight: 'bold' }}
          >
            Please fill out all required fields marked with <span style={{ color: 'red' }}>*</span>.
          </div>
        )}
      <div className="d-flex" style={{justifyContent:'space-between'}}>
        <h5 className="mb-4">Patient Information</h5>
        <button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "15px 30px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
            float: "right",
          }}
          onClick={handleSave}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#45a049")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4CAF50")}
        >
          {isReadOnly ? "Edit" : "Save Changes"}
        </button>
      </div>

  {/* Fields */}
  <div className="row">
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Username:</label>
      <input
        type="text"
        className="form-control"
        name="username"
        readOnly={isReadOnly}
        value={formData.username}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="row">
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Last Name:</label>
      <input
        type="text"
        className="form-control"
        name="lastName"
        readOnly={isReadOnly}
        value={formData.lastName}
        onChange={handleChange}
        required
      />
    </div>
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>First Name:</label>
      <input
        type="text"
        className="form-control"
        name="firstName"
        readOnly={isReadOnly}
        value={formData.firstName}
        onChange={handleChange}
        required
      />
    </div>
    <div className="col-md-4 mb-3">
      <label>Suffix:</label>
      <input
        type="text"
        className="form-control"
        name="suffix"
        readOnly={isReadOnly}
        value={formData.suffix}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="row">
    <div className="col-md-4 mb-3">
      <label>Middle Name:</label>
      <input
        type="text"
        className="form-control"
        name="middleName"
        readOnly={isReadOnly}
        value={formData.middleName}
        onChange={handleChange}
      />
    </div>
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Sex:</label>
      <select
        className="form-select"
        name="sex"
        readOnly={isReadOnly}
        value={formData.sex}
        onChange={handleChange}
        required
      >
        <option value="" disabled>
          Select
        </option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Others">Others</option>
      </select>
    </div>
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Age:</label>
      <input
        type="text"
        className="form-control"
        name="age"
        readOnly={isReadOnly}
        value={formData.age}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="row">
    <div className="col-md-3 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Birthday:</label>
      <input
        type="date"
        className="form-control"
        name="birthday"
        readOnly={isReadOnly}
        value={formData.birthday}
        onChange={handleChange}
        required
      />
    </div>
    <div className="col-md-4 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Marital Status:</label>
      <input
        type="text"
        className="form-control"
        name="maritalstatus"
        readOnly={isReadOnly}
        value={formData.maritalstatus}
        onChange={handleChange}
        required
      />
      </div>
  </div>


  <div className="mt-4 d-flex justify-content-end">
    <button
    className="btn btn-danger mt-3"
    onClick={handleDelete}
    >
      Delete Profile
    </button>
    <button className="btn btn-secondary mt-3" onClick={() => setIsModalOpen(true)}>
      Change Password
    </button>
  </div>
</div>


      {/* Modals */}
      <ChangePasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        handleChange={handleChange}
        handleSavePassword={handleSavePassword}
      />
      {showSuccessModal && <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />}
      {showErrorModal && <ErrorModal message={errorMessage} onClose={handleCloseErrorModal} />}
    </div>
    </div>
  );
};

export default Profile;
