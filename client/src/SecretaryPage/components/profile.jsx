import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import styles from '../styles/profileSecre.module.css';  // Import as module
import { ArrowBack} from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    suffix:"",
    middleName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    contactNumber: "",
    email: "",
    notes: "",
    department: "",
    room: "",
    floor: "",
    duty: "",
  });

  const [isEditable, setIsEditable] = useState(false); // Toggle for edit mode

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
        }
      });
      const secretary = response.data;
      setFormData({
        lastName: secretary.LAST_NAME || "",
        firstName: secretary.FIRST_NAME || "",
        middleName: secretary.MIDDLE_NAME || "",
        dateOfBirth: secretary.DATE_OF_BIRTH || "",
        age: calculateAge(secretary.DATE_OF_BIRTH),
        gender: secretary.GENDER || "",
        contactNumber: secretary.CONTACT_NUMBER || "",
        email: secretary.EMAIL || "",
        notes: secretary.NOTES || "",
        department: secretary.DEPARTMENT || "",
        room: secretary.ROOM_NUMBER || "",
        floor: secretary.FLOOR_NUMBER || "",
        duty: secretary.SCHEDULE || "",
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
      await axios.put(`${process.env.REACT_APP_API_URL}/secretary/profileUpdate`, {
        FIRST_NAME: formData.firstName,
        MIDDLE_NAME: formData.middleName,
        DATE_OF_BIRTH: formData.dateOfBirth,
        AGE: formData.age,
        GENDER: formData.gender,
        CONTACT_NUMBER: formData.contactNumber,
        EMAIL: formData.email,
        NOTES: formData.notes,
        DEPARTMENT: formData.department,
        ROOMNUMBER: formData.room,
        FLOORNUMBER: formData.floor,
        SCHEDULE: formData.duty,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
        }
      });
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
          <div style={{ marginTop: '15%' }}>
            <h2>{formData.firstName} {formData.middleName.charAt(0)}. {formData.lastName} {formData.suffix}</h2>
            <p className={styles.label}>Secretary</p>
          </div>

          <div className={styles.detailsSection}>
            <p><span className={styles.label}>Age:</span> {formData.age}</p>
            <p><span className={styles.label}>Birthday:</span> {formData.dateOfBirth}</p>
            <p><span className={styles.label}>Sex:</span> {formData.gender}</p>
            <p><span className={styles.label}>Contact No.:</span> {formData.contactNumber}</p>
            <p><span className={styles.label}>Email:</span> {formData.email}</p>
              <hr />
            <h3>Clinic Details:</h3>
            <p><span className={styles.label}>Department:</span> {formData.department}</p>
            <p><span className={styles.label}>Room:</span> {formData.room}</p>
            <p><span className={styles.label}>Floor No.:</span> {formData.floor}</p>
            <p><span className={styles.label}>Duty:</span> {formData.duty}</p>

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
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">Date of Birth:</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="age">Age:</label>
              <input type="text" name="age" value={formData.age} disabled />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="gender">Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              >
                <option value="" disabled selected>
                  Select
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="contactNumber">Contact Number:</label>
              <div className={styles.phoneInput}disabled={!isEditable}>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={!isEditable} // Block when not editable
                />
              </div>
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

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="notes">Additional Notes (optional):</label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              disabled={!isEditable} // Block when not editable
            />
          </div>

          <div className={styles.sectionTitle}>Clinic Details:</div>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="department">Department:</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="room">Room:</label>
              <input
                type="text"
                name="room"
                value={formData.room}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="floor">Floor Number:</label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="duty">Duty:</label>
              <input
                type="text"
                name="duty"
                value={formData.duty}
                onChange={handleChange}
                disabled={!isEditable} // Block when not editable
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
