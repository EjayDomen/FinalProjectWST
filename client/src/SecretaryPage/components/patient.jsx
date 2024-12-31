import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Modal from 'react-modal';
import { Delete, Archive } from '@mui/icons-material';
import styles from '../styles/patientsSecre.module.css';
import DeleteConfirmationModal from '../components/deleteConfirmationModal.jsx';
import MedicalRecordsModal from '../components/MedicalRecordsModal';
import ArchivedPatients from './archivedPatient.jsx';
import CreateMedicalRecordModal from './CreateMedicalRecordModal';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


Modal.setAppElement('#root'); // Set the root element for accessibility

const Patient = () => {
  const [isModalRecordOpen, setModalRecordOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation modal
  const [patientToDelete, setPatientToDelete] = useState(null); // Holds the patient ID to delete
  const [isMedicalRecordsModalOpen, setMedicalRecordsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);

  const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);
  const handleOpenArchiveModal = () => {
    setArchiveModalOpen(true); // Open the archive modal
  };

  const handleCloseArchiveModal = () => {
    setArchiveModalOpen(false); // Close the archive modal
  };
  // Utility function to format dates safely
  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '');

  useEffect(() => {
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
    fetchPatients();
  }, []);

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

  const handleEditClick = () => {
    if (isEditing) {
      saveChanges(); // Call saveChanges to save edits
    } else {
      setIsEditing(true); // Enable edit mode
    }
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPatient((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = (patientId) => {
    setPatientToDelete(patientId);
    setShowDeleteConfirmation(true);
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

  const openMedicalRecordsModal = async (patientId) => {
    setSelectedPatientId(patientId);
    console.log(patientId);
    setMedicalRecordsModalOpen(true);
  };



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
          <button
            className={styles.iconButton}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click from triggering
              openCreateMedicalRecordModal(params.row.id);
            }}
          >
            Create Medical Record
          </button>
        </div>
      ),
    },
  ];
  

  const saveChanges = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/updatePatientDetails/${selectedPatient.id}/`, selectedPatient, {
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

  const filteredPatients = patients.filter((patient) =>
    Object.values(patient).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const openCreateMedicalRecordModal = (patientId) => {
    setSelectedPatientId(patientId);
    setModalRecordOpen(true);
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

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{ fontSize: '35px' }}>Patients</h2>
          <p style={{ marginLeft: '10px', marginTop: '7px' }}>Manage patients account</p>
        </div>
      </div>

      <div className={styles.searchAppointment}>
        <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', /* Center the content horizontally */
            margin: 0, /* Remove default margin */
            gap: '12px',
            width: '90%'}}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{
            position: 'absolute',
            left: '22px',
            color: '#aaa'
          }} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: '60px'
            }}
          />
          <button className={styles.iconButton}onClick={handleOpenArchiveModal}><Archive/> Archive</button>
        </div>
        {/* Archive Modal */}
      <ArchivedPatients
        isOpen={isArchiveModalOpen}
        onClose={handleCloseArchiveModal}
      />

      <div style={{ height: '100%', width: '100%', marginTop:'1%'}}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <DataGrid sx={{ height: 600, width: '100%', cursor:'pointer' }}
            rows={filteredPatients}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            className={styles.dataGrid}
          />
        )}
        {/* Medical Records Modal */}
      <MedicalRecordsModal
        isOpen={isMedicalRecordsModalOpen}
        onClose={closeMedicalRecordsModal}
        patientName={medicalRecords}
        patientId={selectedPatientId}
      />
      </div>

      <Modal
  isOpen={isModalOpen}
  onClose={closeModal}
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
    </div>
  );
};

export default Patient;
