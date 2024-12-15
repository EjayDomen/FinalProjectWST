import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios'; // For API calls
import styles from '../styles/doctorsSecre.module.css';

const ArchivedDoctorsModal = ({ isOpen, onClose }) => {
  const [archiveRows, setArchiveRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch archived doctors when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchArchivedDoctors();
    }
  }, [isOpen]);

    const fetchArchivedDoctors = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/patients/archivedDoctor`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Include auth token
        });
        const rows = response.data.map((doctor) => ({
          id: doctor.id,
          FIRST_NAME: doctor.FIRST_NAME,
          LAST_NAME: doctor.LAST_NAME,
          EXPERTISE: doctor.EXPERTISE,
        }));
        setArchiveRows(rows);
      } catch (error) {
        console.error('Error fetching archived doctors:', error);
      } finally {
        setLoading(false);
      }
    };

  const restoreDoctor = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/secretary/patients/restoreDoctor/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Include auth token
      });
      alert('Doctor and associated schedules restored successfully!');
      fetchArchivedDoctors(); // Refresh the list after restoration
    } catch (error) {
      console.error('Error restoring doctor:', error);
      alert('Failed to restore doctor.');
    }
  };

  // Define columns with a Restore button
  const columns = [
    { field: 'id', headerName: 'ID', width: 180 },
    { field: 'FIRST_NAME', headerName: 'First Name', width: 200 },
    { field: 'LAST_NAME', headerName: 'Last Name', width: 200 },
    { field: 'EXPERTISE', headerName: 'Specialization', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <button
          className={styles.restoreBtn}
          onClick={() => restoreDoctor(params.row.id)}
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
      className={styles.archiveModal}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalContent}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Archived Doctors</h2>
        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Here are the doctors who have been archived. You can restore them if needed.
        </p>
        <div style={{ height: '100%', width: '100%' }}>
          <DataGrid
            rows={archiveRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            sx={{
              height: 600,
              width: '100%',
              cursor: 'default',
            }}
            loading={loading}
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

export default ArchivedDoctorsModal;
