import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Menu, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import styles from '../styles/queuesSecre.module.css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import profileImage from '../images/pookie.jpeg';
import {  AccountCircle} from '@mui/icons-material';


Modal.setAppElement('#root');

const Queue = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [queueManagements, setQueueManagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); // Updated date format
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/me/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
          }
        });
        const secretary = response.data;
    
        // Safely construct the full name
        const firstName = secretary.first_name || "";
        const lastName = secretary.last_name || "";
        
        setUserName(`${firstName} ${lastName}`.trim()); // Use trim() to remove any extra spaces
      } catch (error) {
        console.error('Error fetching profile:', error);
        // navigate('/');
      }
    };

    updateDateTime();
    fetchProfile();
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
    <div>
    <div className="patient-header">
        <div className="header-left">
          <p className="current-time">{currentTime}</p>
          <p className="current-date">{currentDate}</p>
        </div>
        <div className="header-right">
          <div className="profile-icon-container">
            <NavLink to="/superadmin/userprofile" className="profile-nav">
              <AccountCircle style={{ fontSize: '60px', padding: '10px', cursor: 'pointer', color: 'gray' }} />
              <div className="user-avatar">{userName}</div>
            </NavLink>
          </div>
        </div>
      </div>
    <div className={styles.doctorsSection}>
      {/* Header Section */}


      <div className={styles.doctorsHeader}>
        <h2 style={{ fontSize: '24px' }}>Medical Records</h2>
        <p style={{ marginLeft: '0px', marginTop: '7px' }}>
          This is the list of medical records. Check now!
        </p>
      </div>
      
      {/* Search Bar & Table Container */}
      <div className={styles.tableContainer}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={styles.searchIcon}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Data Grid */}
        <div style={{ height: 400, width: "100%", marginTop: "20px" }}>
          <DataGrid
            rows={filteredMedicalRecords}
            columns={columns}
            pageSize={5}
            loading={loading}
          />
        </div>
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
          <p><strong>Transaction Type:</strong> {selectedMedicalRecord.transactiontype}</p>
          <p><strong>Date:</strong> {selectedMedicalRecord.date}</p>
          <p><strong>Time of Treatment:</strong> {selectedMedicalRecord.timetreatment}</p>
          <p><strong>Transaction Details:</strong> {selectedMedicalRecord.transactiondetails}</p>
          <p><strong>Medicine Used:</strong> {selectedMedicalRecord.medicineused}</p>
          <p><strong>BP Before:</strong> {selectedMedicalRecord.bpbefore}</p>
          <p><strong>BP After:</strong> {selectedMedicalRecord.bpafter}</p>
          <p><strong>Weight Before:</strong> {selectedMedicalRecord.weightbefore}</p>
          <p><strong>Weight After:</strong> {selectedMedicalRecord.weightafter}</p>
          <p><strong>Temperature:</strong> {selectedMedicalRecord.temperature}</p>
          <p><strong>Pulse Before:</strong> {selectedMedicalRecord.pulsebefore}</p>
          <p><strong>Pulse After:</strong> {selectedMedicalRecord.pulseafter}</p>
          <p><strong>General Remarks:</strong> {selectedMedicalRecord.generalremarks}</p>
          <p><strong>Attending Staff:</strong> {selectedMedicalRecord.attendingstaff?.name}</p>
          <p><strong>Patient:</strong> {selectedMedicalRecord.patient?.name}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <Button className={styles.closeModalButton} onClick={() => setModalIsOpen(false)}>
        Close
      </Button>
    </Modal>
    </div>
    </div>
  );
};

export default Queue;
