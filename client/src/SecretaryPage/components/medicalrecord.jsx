import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Typography, TextField, Paper, Grid } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import styles from '../styles/queuesSecre.module.css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

Modal.setAppElement('#root');

const Queue = () => {
  const [queueManagements, setQueueManagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  useEffect(() => {
    const fetchQueueManagements = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/medicalrecordlist/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQueueManagements(response.data || {});
      } catch (error) {
        console.error('Error fetching queue management details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueueManagements();
  }, []);

  const fetchMedicalRecordDetails = async (recordId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/medical-record/${recordId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSelectedMedicalRecord(response.data);
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error fetching medical record details:', error);
    }
  };

  const filteredMedicalRecords = queueManagements?.medical_records?.filter((medicalRecord) =>
    Object.values(medicalRecord).some((value) => 
      value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const columns = [
    { field: 'id', headerName: 'Id', width: 150 },
    { field: 'name', headerName: 'Name', width: 360 },
    { field: 'date', headerName: 'Date', width: 300 },
    { field: 'generalremarks', headerName: 'General Remarks', width: 350 },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => (
        <Button onClick={() => fetchMedicalRecordDetails(params.row.id)}>View</Button>
      ),
    },
  ];

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <h2 style={{ fontSize: '35px' }}>Queue List</h2>
        <p style={{ marginLeft: '10px', marginTop: '7px' }}>
          This is the list of medical records. Check now!
        </p>
      </div>
      
      <div className={styles.searchAppointment}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '90%' }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ position: 'absolute', left: '22px', color: '#aaa' }} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '60px' }}
          />
        </div>
      </div>
    
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={filteredMedicalRecords}
          columns={columns}
          pageSize={5}
          loading={loading}
        />
      </div>

      <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      contentLabel="Medical Record Details"
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Medical Record Details</h2>
        <button className={styles.closeButton} onClick={() => setModalIsOpen(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {selectedMedicalRecord ? (
        <div className={styles.modalDetails}>
          <Typography variant="h5" sx={{ mb: 2 }}>🩺 Medical Record Details</Typography>
          {selectedMedicalRecord && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="📝 Diagnosis" fullWidth variant="filled" value={selectedMedicalRecord.generalremarks} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="👨‍⚕️ Physician" fullWidth variant="filled" value={selectedMedicalRecord.attendingstaff.name} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📅 Record Date" fullWidth variant="filled" value={selectedMedicalRecord.date} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📌 Time Treatment" fullWidth variant="filled" value={selectedMedicalRecord.timetreatment} InputProps={{ readOnly: true }} />
              </Grid>

              <Grid item xs={6}>
                <TextField label="📊 BP Before" fullWidth variant="filled" value={selectedMedicalRecord.bpbefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="📊 BP After" fullWidth variant="filled" value={selectedMedicalRecord.bpafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="⚖️ Weight Before" fullWidth variant="filled" value={selectedMedicalRecord.weightbefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="⚖️ Weight After" fullWidth variant="filled" value={selectedMedicalRecord.weightafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="🌡️ Temperature" fullWidth variant="filled" value={selectedMedicalRecord.temperature || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="❤️ Pulse Before" fullWidth variant="filled" value={selectedMedicalRecord.pulsebefore || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="❤️ Pulse After" fullWidth variant="filled" value={selectedMedicalRecord.pulseafter || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="📝 Doctor's Notes" fullWidth multiline variant="filled" value={selectedMedicalRecord.notes || "N/A"} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          )}
          <Button className={styles.closeModalButton} onClick={() => setModalIsOpen(false)}>
        Close
      </Button>
        </div>
      ) : (
        <p>Loading...</p>
      )}

    </Modal>
    </div>
  );
};

export default Queue;
