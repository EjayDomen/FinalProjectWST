import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManagePatient.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../images/pookie.jpeg';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Modal from 'react-modal';
import styles from '../styles/ManagePatient.module.css';
import { Delete, Archive } from '@mui/icons-material';
import MedicalRecordsModal from '../../SecretaryPage/components/MedicalRecordsModal';
import ArchivedPatients from '../../SecretaryPage/components/archivedPatient';
import CreateMedicalRecordModal from '../../SecretaryPage/components/CreateMedicalRecordModal';
import DeleteConfirmationModal from '../../SecretaryPage/components/deleteConfirmationModal.jsx';


const PatientManagement = () => {
    const [medicalRecords, setMedicalRecords] = useState([]);
  const [isModalRecordOpen, setModalRecordOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isMedicalRecordsModalOpen, setMedicalRecordsModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null); // Holds the patient ID to delete
  const openMedicalRecordsModal = async (patientId) => {
    setSelectedPatientId(patientId);
    console.log(patientId);
    setMedicalRecordsModalOpen(true);
  };
  const openCreateMedicalRecordModal = (patientId) => {
    setSelectedPatientId(patientId);
    setModalRecordOpen(true);
  };
  const closeMedicalRecordsModal = () => {
    setMedicalRecordsModalOpen(false);
    setSelectedPatientId(null);
    setMedicalRecords([]);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/deletepatient/${patientToDelete}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setPatients((prevPatients) => prevPatients.filter((patient) => patient.id !== patientToDelete));
      setUpdateMessage('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      setUpdateMessage('Error deleting patient');
    } finally {
      setShowDeleteConfirmation(false);
      setPatientToDelete(null);
    }
  };
  const closeCreateMedicalRecordModal = () => {
    setModalRecordOpen(false);
    setSelectedPatientId(null);
  };

  const handleCreateMedicalRecord = (patientId, data) => {
    // Send data to the backend using an API call
    fetch('${process.env.REACT_APP_API_URL}/api/admin/patients/${patientId}/medical-records/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ patientId, ...data }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Medical record created:', result);
        // Refresh data or give user feedback
      })
      .catch((error) => console.error('Error creating medical record:', error));
  };

  const columns = [
    { field: 'patientId', headerName: 'Patient ID', width: 150 },
    { field: 'name', headerName: 'Patient Name', width: 350 },
    { field: 'createdAt', headerName: 'Account Created', width: 300 },
    {
          field: 'actions',
          headerName: 'Action',
          sortable: false,
          width: 400, // Adjusted width to accommodate both buttons
          renderCell: (params) => (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={styles.iconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(params.row.id);
                }}
              >
                <Delete />
              </button>
              <button
                className={styles.iconButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row click from triggering
                  openMedicalRecordsModal(params.row.id);
                }}
              >
                View Medical Records
              </button>
            </div>
          ),
    },
  ];

  const handleDeleteClick = (patientId) => {
    setPatientToDelete(patientId);
    setShowDeleteConfirmation(true);
  };
  const handleView = (row) => {
    alert(`Viewing details for ${row.name}`);
    // Navigate or show a modal with patient details here
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPatient((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditClick = () => {
    if (isEditing) {
      saveChanges(); // Call saveChanges to save edits
    } else {
      setIsEditing(true); // Enable edit mode
    }
  };

  const handleRowClick = (params) => {
    setSelectedPatient(params.row);
    setIsModalOpen(true);
    setIsEditing(false);
    setUpdateMessage(null);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/getallpatients/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      // Map response data to match DataGrid rows
      const formattedRows = response.data.map((patient, index) => ({
        id: index + 1, // Ensure unique IDs for DataGrid
        patientId: patient.id || `P${index + 1}`, // Fallback if patientId is missing
        name: `${patient.first_name} ${patient.last_name}`,
        createdAt: patient.createAt 
    ? patient.createAt.split('T')[0] 
    : 'N/A', // Extract only the date part or use 'N/A'
}));
      setRows(formattedRows);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };
  const saveChanges = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/secretary/patients/update/${selectedPatient.id}`, selectedPatient, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUpdateMessage('Patient information updated successfully');
      setIsEditing(false); // Disable editing
      setPatients((prevPatients) => 
        prevPatients.map((patient) =>
          patient.id === selectedPatient.id ? { ...patient, ...selectedPatient } : patient
        )
      );
    } catch (error) {
      console.error('Error updating patient information:', error);
      setUpdateMessage('Error updating patient information');
    }
  };


  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="patient">
      {/* Main Content */}
      <main className="patient-content">
        {/* Header Section */}
        <div className="patient-header">
          <div className="header-left">
            <p className="current-time">10:00 AM</p>
            <p className="current-date">August 30, 2024</p>
          </div>
          <div className="header-right">
            <div className="search-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="profile-icon-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              <NavLink to="/dashboard/userprofile" className="profile-nav">
                <img src={profileImage} alt="Profile" className="profile-image" />
                <div className="user-avatar">Nick Gerblack</div>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="queue-section">
          <h1 className="queue-title">Queue List</h1>
          <p className="queue-subtitle">
            This is the list of patients and their status & queue. Check now.
          </p>
          <div className="queue-content">
            <div className="queue-search">
              <div className="queue-search-container">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Appointment"
                  className="search-appointment-input"
                />
              </div>
              <button className="filter-button">
                <FontAwesomeIcon icon={faFilter} />
              </button>
            </div>

            {/* DataGrid */}
            <div className="queue-table">
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 15]}
                loading={loading}
                onRowClick={handleRowClick}
                autoHeight
                disableSelectionOnClick
                sx={{
                  height: 600,
                  width: '100%',
                  cursor: 'pointer',
                  '& .MuiDataGrid-cell': { fontSize: '14px' },
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                }}
              />
               {/* Medical Records Modal */}
              <MedicalRecordsModal
                isOpen={isMedicalRecordsModalOpen}
                onClose={closeMedicalRecordsModal}
                patientName={medicalRecords}
                patientId={selectedPatientId}
              />
            </div>
          </div>
        </div>
      </main>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
        contentLabel="Patient Information"
      >
        {selectedPatient && (
          <div>
            <h2><b>Patient Information</b></h2>
            <hr />
            {updateMessage && <p>{updateMessage}</p>}
            <h3>Personal Information</h3>
            <div className={styles.formGroup}>
              <label><strong>Name:</strong></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  name="FIRST_NAME"
                  placeholder='firstname'
                  value={selectedPatient.FIRST_NAME || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '1', minWidth: '150px' }} // Set a consistent width
                />
                <input
                  type="text"
                  name="MIDDLE_NAME"
                  placeholder='middlename'
                  value={selectedPatient.MIDDLE_NAME || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '1', minWidth: '100px' }} // Set a consistent width
                />
                <input
                  type="text"
                  name="LAST_NAME"
                  placeholder='lastname'
                  value={selectedPatient.LAST_NAME || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '1', minWidth: '150px' }} // Set a consistent width
                />
                <input
                  type="text"
                  name="SUFFIX"
                  placeholder='suffix'
                  value={selectedPatient.SUFFIX || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '0.5', minWidth: '70px' }} // Smaller width for suffix
                />
              </div>
            </div>
      
            {/* Email Field */}
            <div className={styles.formGroup}>
              <label><strong>Email:</strong></label>
              <input
                type="email"
                name="EMAIL"
                value={selectedPatient.EMAIL || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                style={{ width: '100%' }} // Full width input
              />
            </div>
      
            {/* Birthday, Age, and Sex Fields */}
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label><strong>Birthday:</strong></label>
                  <input
                    type="date"
                    name="BIRTHDAY"
                    value={selectedPatient.BIRTHDAY || ''} // Use the raw date format
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    style={{ width: '100%' }} // Full width input
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label><strong>Age:</strong></label>
                  <input
                    type="text"
                    name="AGE"
                    value={selectedPatient.AGE || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    style={{ width: '100%' }} // Full width input
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label><strong>Gender:</strong></label>
                  <select
                    name="SEX"
                    value={selectedPatient.SEX || ''}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{ width: '100%', height:'60%', color:'gray' }} // Full width dropdown
                  >
                    <option value="" disabled selected>
                        Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
      
              </div>
            </div>
      
            {/* Contact Number Field */}
            <div className={styles.formGroup}>
              <label><strong>Contact No.:</strong></label>
              <input
                type="text"
                name="CONTACT_NUMBER"
                value={selectedPatient.CONTACT_NUMBER || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                style={{ width: '100%' }} // Full width input
              />
            </div>
      
            {/* Address Field */}
            <div className={styles.formGroup}>
              <label><strong>Address:</strong></label>
              <input
                type="text"
                name="ADDRESS"
                value={selectedPatient.ADDRESS || ''}
                onChange={handleInputChange}
                readOnly={!isEditing}
                style={{ width: '100%' }} // Full width input
              />
            </div>
      
            {/* Medical Information */}
            <hr />
            <h3>Medical Information</h3>
            <h4 style={{ color: 'gray' }}>Covid-19 Vaccination Details:</h4>
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label><strong>1st Dose Brand:</strong></label>
                <input
                  type="text"
                  name="FIRST_DOSE_BRAND"
                  value={selectedPatient.FIRST_DOSE_BRAND || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '1', minWidth: '150px' }}
                />
                <label><strong>Date:</strong></label>
                <input
                  type="date"
                  name="FIRST_DOSE_DATE"
                  value={selectedPatient.FIRST_DOSE_DATE}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  style={{ flex: '1', minWidth: '150px' }}
                />
              </div>
              {/* 2nd Dose Details */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <label><strong>2nd Dose Brand:</strong></label>
                      <input
                        type="text"
                        name="SECOND_DOSE_BRAND"
                        value={selectedPatient.SECOND_DOSE_BRAND || ''}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        style={{ flex: '1', minWidth: '150px', marginLeft:'-8px' }}
                      />
                      <label><strong>Date:</strong></label>
                      <input
                        type="date"
                        name="SECOND_DOSE_DATE"
                        value={selectedPatient.SECOND_DOSE_DATE}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                    </div>
      
                    {/* Booster Dose Details */}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <label><strong>Booster Brand:</strong></label>
                      <input
                        type="text"
                        name="BOOSTER_BRAND"
                        value={selectedPatient.BOOSTER_BRAND || ''}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                      <label><strong>Date:</strong></label>
                      <input
                        type="date"
                        name="BOOSTER_DATE"
                        value={selectedPatient.BOOSTER_DATE}
                        onChange={handleInputChange}
                        readOnly={!isEditing}
                        style={{ flex: '1', minWidth: '150px' }}
                      />
                    </div>
            </div>
      
            {/* Modal Actions */}
            <div className={styles.modalActions}>
              <button onClick={closeModal} className={styles.backButton}>Back</button>
              <button onClick={handleEditClick} className={styles.editButton}>
                {isEditing ? 'Save' : 'Edit'}
              </button>
              <button onClick={handleEditClick} className={styles.editButton}>
                view medical record
              </button>
            </div>
          </div>
        )}
      </Modal>
          {/* Delete Confirmation Modal */}
          {showDeleteConfirmation && (
          <DeleteConfirmationModal
            isOpen={showDeleteConfirmation}
            onRequestClose={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
          />
        )}

        {/* Other components, like a patient table */}
      <CreateMedicalRecordModal
        isOpen={isModalRecordOpen}
        onClose={closeCreateMedicalRecordModal}
        onSubmit={handleCreateMedicalRecord}
        patientId={selectedPatientId}
      />
    </div>
  );
};

export default PatientManagement;