import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import styles from '../styles/patientsSecre.module.css';

const ArchivedPatientsModal = ({ isOpen, onClose }) => {
  const [archiveRows, setArchiveRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch archived patients
  const fetchArchivedPatients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/viewArchivedPatient`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const rows = response.data.map((patient) => ({
        id: patient.id,
        FIRST_NAME: patient.first_name,
        LAST_NAME: patient.last_name,
        createdAt: new Date(patient.createdAt).toLocaleDateString(), // Format the date
      }));
      setArchiveRows(rows);
    } catch (error) {
      console.error('Error fetching archived patients:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // Restore a patient
  const restorePatient = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/restorePatient/${id}/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Patient restored successfully!');
      fetchArchivedPatients(); // Refresh the list
    } catch (error) {
      console.error('Error restoring patient:', error.response?.data || error);
      alert('Failed to restore patient.');
    }
  };

  // Fetch data when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchArchivedPatients();
    }
  }, [isOpen]);

  // Columns for the data grid
  const columns = [
    { field: 'id', headerName: 'Patient ID', width: 200 },
    { field: 'FIRST_NAME', headerName: 'First Name', width: 200 },
    { field: 'LAST_NAME', headerName: 'Last Name', width: 200 },
    { field: 'createdAt', headerName: 'Account Created', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <button
          onClick={() => restorePatient(params.row.id)}
          className={styles.restoreBtn}
        >
          Restore
        </button>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.modalOverlay}
      className={styles.modalContent}
    >
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Archived Patients</h2>
        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Here are the patients who have been archived. You can restore them if needed.
        </p>
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={archiveRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            loading={loading}
            sx={{
              height: 600,
              width: '100%',
              cursor: 'default',
            }}
            disableSelectionOnClick
          />
        </div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className={styles.backButton}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ArchivedPatientsModal;
