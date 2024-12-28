import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Modal from 'react-modal';
import { Delete, Archive } from '@mui/icons-material';
import styles from '../styles/patientsSecre.module.css';
import DeleteConfirmationModal from '../components/deleteConfirmationModal.jsx';
import ArchivedPatients from './archivedPatient.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

const Patient = () => {
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

  const columns = [
    { field: 'id', headerName: 'Patient ID', width: 200 },
    { field: 'first_name', headerName: 'First Name', width: 300 },
    { field: 'last_name', headerName: 'Last Name', width: 300 },
    {
      field: 'createAt',
      headerName: 'Account Created',
      width: 360,
      renderCell: (params) => (
        <span>{formatDate(params.value)}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <button
          className={styles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(params.row.id);
          }}
        >
          <Delete />
        </button>
      ),
    },
  ]  

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

  const filteredPatients = patients.filter((patient) =>
    Object.values(patient).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{ fontSize: '35px' }}>Patients</h2>
          <p style={{ marginLeft: '10px', marginTop: '7px' }}>Manage patients account</p>
        </div>
      </div>

      <div className={styles.searchAppointment}>
        <div style={{display: 'flex', gap:'1%'}}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
      </div>

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
      </div>
    </div>
  );
};

export default Patient;
