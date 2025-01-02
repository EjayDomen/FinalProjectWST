import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ManagePatient.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { faBell, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../images/pookie.jpeg';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import Modal from 'react-modal';
import styles from '../styles/ManagePatient.module.css';
import { Delete, Archive } from '@mui/icons-material';
import MedicalRecordsModal from '../../SecretaryPage/components/MedicalRecordsModal';
import CreateMedicalRecordModal from '../../SecretaryPage/components/CreateMedicalRecordModal';
import DeleteConfirmationModal from '../../SecretaryPage/components/deleteConfirmationModal.jsx';
import ArchivedPatients from '../../SecretaryPage/components/archivedPatient.jsx';

const PatientManagement = () => {
    const [medicalRecords, setMedicalRecords] = useState([]);
  const [isModalRecordOpen, setModalRecordOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [error, setError] = useState(null);
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
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '');

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

  const filteredPatients = patients.filter((patient) =>
    Object.values(patient).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const columns = [
    { field: 'id', headerName: 'Patient ID', width: 200 },
    { field: 'first_name', headerName: 'First Name', width: 300 },
    { field: 'last_name', headerName: 'Last Name', width: 300 },
    {
      field: 'createAt',
      headerName: 'Account Created',
      width: 200,
      renderCell: (params) => (
        <span>{formatDate(params.value)}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: 400, // Adjusted width to accommodate both buttons
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="iconButton"
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click from triggering
              openMedicalRecordsModal(params.row.id);
            }}
            style={{
              backgroundColor: '#6290C8'
            }}
          >
            <VisibilityIcon />View Medical Records
          </button>
          <button
            className="iconButton"
            style={{
              marginLeft: '10px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(params.row.id);
            }}
          >
            <Delete /> Delete
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
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/getallpatients/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      setPatients(response.data.length > 0 ? response.data : []);
      setError(response.data.length === 0 ? 'No patients found.' : null);
    } catch (error) {
      setError('An error occurred while fetching the data.');
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
    const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
    const handleOpenArchiveModal = () => {
      setArchiveModalOpen(true); // Open the archive modal
    };
  const handleCloseArchiveModal = () => {
    setArchiveModalOpen(false); // Close the archive modal
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
              <NavLink to="/superadmin/userprofile" className="profile-nav">
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
              <button className="staff-button"onClick={handleOpenArchiveModal}
              style={{
                backgroundColor: '#ffc107'
              }}><Archive/> Archive</button>
            </div>

             {/* Archive Modal */}
      <ArchivedPatients
        isOpen={isArchiveModalOpen}
        onClose={handleCloseArchiveModal}
      />
            {/* DataGrid */}
            <div className="queue-table">
              <DataGrid
                rows={filteredPatients}
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
               {/* Email Field */}
               <div className={styles.formGroup}>
                 <label><strong>Student or Employee Number:</strong></label>
                 <input
                   type="text"
                   name="student_or_employee_no"
                   value={selectedPatient.student_or_employee_no || ''}
                   onChange={handleInputChange}
                   readOnly={!isEditing}
                   style={{ width: '100%' }} // Full width input
                 />
               </div>
               <div className={styles.formGroup}>
                 <label><strong>Name:</strong></label>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <input
                     type="text"
                     name="first_name"
                     placeholder='firstname'
                     value={selectedPatient.first_name || ''}
                     onChange={handleInputChange}
                     readOnly={!isEditing}
                     style={{ flex: '1', minWidth: '150px' }} // Set a consistent width
                   />
                   <input
                     type="text"
                     name="middle_name"
                     placeholder='middlename'
                     value={selectedPatient.middle_name || ''}
                     onChange={handleInputChange}
                     readOnly={!isEditing}
                     style={{ flex: '1', minWidth: '100px' }} // Set a consistent width
                   />
                   <input
                     type="text"
                     name="last_name"
                     placeholder='lastname'
                     value={selectedPatient.last_name || ''}
                     onChange={handleInputChange}
                     readOnly={!isEditing}
                     style={{ flex: '1', minWidth: '150px' }} // Set a consistent width
                   />
                   <input
                     type="text"
                     name="suffix"
                     placeholder='suffix'
                     value={selectedPatient.suffix || ''}
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
                   name="email"
                   value={selectedPatient.email || ''}
                   onChange={handleInputChange}
                   readOnly={!isEditing}
                   style={{ width: '100%' }} // Full width input
                 />
               </div>
         
               {/* Birthday, Age, and Sex Fields */}
               <div className={styles.formGroup}>
                 <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{ flex: 1 }}>
                     <label><strong>Patient Type</strong></label>
                     <input
                       type="text"
                       name="patient_type"
                       value={selectedPatient.patient_type || ''} // Use the raw date format
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label><strong>Age:</strong></label>
                     <input
                       type="text"
                       name="age"
                       value={selectedPatient.age || ''}
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label><strong>Gender:</strong></label>
                     <select
                       name="sex"
                       value={selectedPatient.sex || ''}
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
         
               {/* Address Field */}
               <div className={styles.formGroup}>
                 <label><strong>Address:</strong></label>
                 <input
                   type="text"
                   name="address"
                   value={selectedPatient.address || ''}
                   onChange={handleInputChange}
                   readOnly={!isEditing}
                   style={{ width: '100%' }} // Full width input
                 />
               </div>
         
                     {/* Birthday, Age, and Sex Fields */}
                 <div className={styles.formGroup}>
                 <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{ flex: 1 }}>
                     <label><strong>College or Office:</strong></label>
                     <input
                       type="text"
                       name="college_office"
                       value={selectedPatient.college_office || ''} // Use the raw date format
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label><strong>Course or Designation:</strong></label>
                     <input
                       type="text"
                       name="course_designation"
                       value={selectedPatient.age || ''}
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label><strong>Year:</strong></label>
                     <input
                       type="text"
                       name="year"
                       value={selectedPatient.year || ''}
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
         
                 </div>
               </div>
               <div className={styles.formGroup}>
                 <label><strong>Emergency Contact Number:</strong></label>
                 <input
                   type="email"
                   name="emergency_contact_number"
                   value={selectedPatient.emergency_contact_number || ''}
                   onChange={handleInputChange}
                   readOnly={!isEditing}
                   style={{ width: '100%' }} // Full width input
                 />
               </div>
               <div className={styles.formGroup}>
                 <label><strong>Emergency Contact Relation:</strong></label>
                 <input
                   type="email"
                   name="emergency_contact_relation"
                   value={selectedPatient.emergency_contact_relation || ''}
                   onChange={handleInputChange}
                   readOnly={!isEditing}
                   style={{ width: '100%' }} // Full width input
                 />
               </div>
         
                   {/* Birthday, Age, and Sex Fields */}
                   <div className={styles.formGroup}>
                 <div style={{ display: 'flex', gap: '20px' }}>
                   <div style={{ flex: 1 }}>
                     <label><strong>BloodType:</strong></label>
                     <input
                       type="text"
                       name="bloodtype"
                       value={selectedPatient.bloodtype || ''} // Use the raw date format
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
                   <div style={{ flex: 1 }}>
                     <label><strong>Allergies:</strong></label>
                     <input
                       type="text"
                       name="allergies"
                       value={selectedPatient.allergies || ''}
                       onChange={handleInputChange}
                       readOnly={!isEditing}
                       style={{ width: '100%' }} // Full width input
                     />
                   </div>
         
                 </div>
               </div>
         
               
         
               {/* Modal Actions */}
               <div className={styles.modalActions}>
                 <button onClick={closeModal} className={styles.backButton}>Back</button>
                 <button onClick={handleEditClick} className={styles.editButton}>
                   {isEditing ? 'Save' : 'Edit'}
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