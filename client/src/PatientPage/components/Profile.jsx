import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ArrowBack } from '@mui/icons-material';
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
    lastName: "",
    firstName: "",
    suffix: "",
    middleName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    contactNumber: "",
    civilStatus: "",
    address: "",
    firstDoseBrand: "",
    firstDoseDate: "",
    secondDoseBrand: "",
    secondDoseDate: "",
    boosterBrand: "",
    boosterDate: "",
  });

  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/signup/patient/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const patientData = response.data;

        // Populate formData
        setFormData({
          lastName: patientData.LAST_NAME || "",
          firstName: patientData.FIRST_NAME || "",
          suffix: patientData.SUFFIX || "",
          middleName: patientData.MIDDLE_NAME || "",
          email: patientData.EMAIL || "",
          dateOfBirth: patientData.BIRTHDAY || "",
          age: patientData.AGE || "",
          gender: patientData.SEX || "",
          contactNumber: patientData.CONTACT_NUMBER || "",
          civilStatus: patientData.CIVIL_STATUS || "",
          address: patientData.ADDRESS || "",
          firstDoseBrand: patientData.FIRST_DOSE_BRAND || "",
          firstDoseDate: patientData.FIRST_DOSE_DATE || "",
          secondDoseBrand: patientData.SECOND_DOSE_BRAND || "",
          secondDoseDate: patientData.SECOND_DOSE_DATE || "",
          boosterBrand: patientData.BOOSTER_BRAND || "",
          boosterDate: patientData.BOOSTER_DATE || "",
        });

        // If the patient is newly registered, activate the edit button
        if (patientData.isNewlyRegistered) {
          setIsReadOnly(false);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        navigate('/');
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
      // Manual validation check for required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.age || !formData.gender || !formData.contactNumber || !formData.address) {
        setErrorMessage('Please fill out all required fields.');
        setShowErrorModal(true);
        return; // Stop the function if validation fails
      }
  
      // If validation passes, continue saving
      try {
        await axios.put(`${process.env.REACT_APP_API_URL}/signup/patient/update`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
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

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/patient/forgotPassword/reset-password`, {
        email: formData.email,
        newPassword: formData.password,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
          <h3 className="text-center">{`${formData.firstName} ${formData.middleName.charAt(0)}. ${formData.lastName} ${formData.suffix}`}</h3>
          <div style={{padding: '20px 0'}}>
            <p><strong>Age:</strong> {formData.age}</p>
            <p><strong>Birthday:</strong> {new Date(formData.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> {formData.gender}</p>
            <p><strong>Contact No.:</strong> {formData.contactNumber}</p>
            <p><strong>Address:</strong> {formData.address}</p>
          </div>
          <hr />
          <h4 style={{padding:'20px 0'}}>Medical Information:</h4>
          <p><strong>1st Dose:</strong> {formData.firstDoseBrand} on {formData.firstDoseDate || "N/A"}</p>
          <p><strong>2nd Dose:</strong> {formData.secondDoseBrand} on {formData.secondDoseDate || "N/A"}</p>
          <p><strong>Booster:</strong> {formData.boosterBrand} on {formData.boosterDate || "N/A"}</p>
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
      <label><span style={{ color: 'red' }}>*</span>Date of Birth:</label>
      <input
        type="date"
        className="form-control"
        name="dateOfBirth"
        readOnly={isReadOnly}
        value={formData.dateOfBirth}
        onChange={handleChange}
        required
      />
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
    <div className="col-md-6 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Gender:</label>
      <select
        className="form-select"
        name="gender"
        readOnly={isReadOnly}
        value={formData.gender}
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
    <div className="col-md-6 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Contact Number:</label>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          name="contactNumber"
          readOnly={isReadOnly}
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  </div>

  <div className="row">
    <div className="col-md-6 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Address:</label>
      <input
        type="text"
        className="form-control"
        name="address"
        readOnly={isReadOnly}
        value={formData.address}
        onChange={handleChange}
        required
      />
    </div>
    <div className="col-md-6 mb-3">
      <label><span style={{ color: 'red' }}>*</span>Civil Status:</label>
      <select
        className="form-select"
        name="civilStatus"
        readOnly={isReadOnly}
        value={formData.civilStatus}
        onChange={handleChange}
        required
      >
        <option value="" disabled>
          Select
        </option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </select>
    </div>
  </div>

  <h5 className="mb-4"><span style={{ color: 'red' }}>*</span>Medical Information</h5> 
  <p style={{color:'red'}}>*N/A if none.</p>
  <div className="row">
    <div className="col-md-6 mb-3">
      <label>1st Dose Brand:</label>
      <input
        type="text"
        className="form-control"
        name="firstDoseBrand"
        readOnly={isReadOnly}
        value={formData.firstDoseBrand}
        onChange={handleChange}
        required
      />
    </div>
    <div className="col-md-6 mb-3">
      <label>Date:</label>
      <input
        type="date"
        className="form-control"
        name="firstDoseDate"
        readOnly={isReadOnly}
        value={formData.firstDoseDate}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  <div className="row">
    <div className="col-md-6 mb-3">
      <label>2nd Dose Brand:</label>
      <input
        type="text"
        className="form-control"
        name="secondDoseBrand"
        readOnly={isReadOnly}
        value={formData.secondDoseBrand}
        onChange={handleChange}
      />
    </div>
    <div className="col-md-6 mb-3">
      <label>Date:</label>
      <input
        type="date"
        className="form-control"
        name="secondDoseDate"
        readOnly={isReadOnly}
        value={formData.secondDoseDate}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="row">
    <div className="col-md-6 mb-3">
      <label>Booster Brand:</label>
      <input
        type="text"
        className="form-control"
        name="boosterBrand"
        readOnly={isReadOnly}
        value={formData.boosterBrand}
        onChange={handleChange}
      />
    </div>
    <div className="col-md-6 mb-3">
      <label>Date:</label>
      <input
        type="date"
        className="form-control"
        name="boosterDate"
        readOnly={isReadOnly}
        value={formData.boosterDate}
        onChange={handleChange}
      />
    </div>
  </div>

  <div className="mt-4 d-flex justify-content-end">
    <button className="btn btn-secondary me-2" onClick={() => setIsModalOpen(true)}>
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
