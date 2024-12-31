import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import styles from '../styles/profileSecre.module.css';  // Import as module
import { ArrowBack} from '@mui/icons-material';
import SuccessModal from '../components/successModal';
import ErrorModal from '../components/errorModal.jsx';
import doc from '../images/doc.png';

const Profile = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const handleCloseSuccessModal = () => {
      setShowSuccessModal(false);
    };
    const handleCloseErrorModal = () => {
      setShowErrorModal(false);
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
    const validatePassword = (password) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    };
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    suffix:"",
    middleName: "",
    email: "",
    department: "",
    profilePicture: null,
  });

  const [isEditable, setIsEditable] = useState(false); // Toggle for edit mode

  const handleFileChange = (e) => {
    const file = e.target.files[0];
  
    // Optional: Check if the file is an image
    if (file && file.type.startsWith("image/")) {
      setProfilePicture(file);  // This will update the profilePicture state (optional)
      
      // Update formData with the file object
      setFormData((prevData) => ({
        ...prevData,
        profilePicture: file,
      }));
    } else {
      alert("Please select a valid image file.");
    }
  };
  

  const fetchProfile = async () => {
    try { 
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/me/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
        }
      });
      const secretary = response.data;
      setFormData({
        lastName: secretary.last_name || "",
        firstName: secretary.first_name || "",
        middleName: secretary.middle_name || "",
        suffix: secretary.suffix || "",
        email: secretary.email || "",
        department: secretary.specialization || "",
        profilePicture: null,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleEditMode = () => {
    setIsEditable((prev) => !prev);
    if (isEditable) {
      updateProfile(); // Save when toggling back
    }
  }; 

  const updateProfile = async () => {
    try {
      const formDataToSend = new FormData();
    
    // Append the profile data (including image, if updated)
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('middleName', formData.middleName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('suffix', formData.suffix);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('department', formData.department);

    if (profilePicture) {
      formDataToSend.append('profilePicture', profilePicture); // Append image file if updated
    }

    // Make the request to update the profile
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/admin/update_staff/`,
      formDataToSend,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data', // Set content type for FormData
        },
      }
    );
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className={styles.cont}>
      <div className={styles.container}>
        {/* Left Section */}
        <div className={styles.leftSection}>
        <button 
            style={{
              float: 'left',
              cursor: 'pointer',
              padding: '5px 10px',
              backgroundcolor: '#6c757d',
              bordercolor: '#6c757d',     
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }} 
            onClick={() => navigate(-1)}
          >
            <ArrowBack></ArrowBack>
          </button>
          <div style={{ textAlign: 'center', marginBottom: '10px', position: 'relative' }}>
  {/* Profile Picture */}
  <img
    src={formData.profilePicture ? formData.profilePicture.url : doc}  // Show the uploaded picture or fallback
    alt="Profile"
    style={{
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      objectFit: 'cover',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    }}
  />
  
  {/* File Input - Visible and overlaying the profile picture */}
  <input
    type="file"
    id="profilePictureInput"
    name="profilePicture"
    style={{
      position: 'absolute',
      top: '0',
      left: '0',
      width: '150px',
      height: '150px',
      opacity: '0', // Make input invisible but still clickable
      cursor: 'pointer', // Make the file input clickable
      borderRadius: '50%',  // Round the corners to match the profile image
    }}
    onChange={handleFileChange} // Handle file change
  />
  
  {/* Optional - Change Profile Picture Button */}
  <div
    style={{
      bottom: '0px', // Adjusted to place it below the image
      left: '50%',
      width: '225px',
      height: '30px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      borderRadius: '15px', // Optional, to make the button rounder
    }}
    onClick={() => document.getElementById("profilePictureInput").click()}  // Trigger file input on button click
  >
    <span>Change Profile Picture</span> {/* You can use an icon here (e.g., Material-UI icon) */}
  </div>

                <h2>{formData.firstName} {formData.middleName.charAt(0)}. {formData.lastName} {formData.suffix}</h2>
          </div>

          <div className={styles.detailsSection}>
            <p><span className={styles.label}>Email:</span> {formData.email}</p>
              <hr />
            <h3>Clinic Details:</h3>
            <p><span className={styles.label}>Specialization:</span> {formData.department}</p>

            <h4>Notes:</h4>
            <p>{formData.notes}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className={styles.rightSection}>
          <div style={{display: 'flex', justifyContent:'space-between'}}>
            <div className={styles.sectionTitle}>Personal Information:</div>
            <button className={styles.editButton} onClick={toggleEditMode}>
              {isEditable ? "Save" : "Edit"}
            </button>
          </div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            <div className={styles.formGroup} style={{maxWidth:'min-content'}}>
              <label htmlFor="suffix">Suffix:</label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="middleName">Middle Name:</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            </div>


          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditable} // Block when not editable
            />
          </div>


          <div className={styles.sectionTitle}>Clinic Details:</div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="department">Specialization:</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
          </div>
          <div>
            <button className="btn btn-secondary" style={{float:'right'}} onClick={() => setIsModalOpen(true)}>
              Change Password
            </button>
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
    </div>
  );
};

export default Profile;
