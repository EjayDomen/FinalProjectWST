import React, { useState, useEffect } from 'react';
import { Add, Search, QrCodeScanner, ArrowDropDown } from '@mui/icons-material';
import { 
  Autocomplete, Modal, Box, TextField, Button, MenuItem, Select, InputLabel, 
  FormControl, Radio, RadioGroup, FormControlLabel, FormLabel 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/queueListSecre.module.css';
import doctorImage from '../images/doc.png';
import schedImage from '../images/sched.png';
import QRCodeReader from './QRCodeReader';
import SuccessModal from './successModal.jsx';
import ErrorModal from './errorModal.jsx';

const QueueList = () => {
  const { qid } = useParams();
  const { state } = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [queueDetails, setQueueDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentQueueNumber, setCurrentQueueNumber] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [openPatientModal, setOpenPatientModal] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [queueDetails2, setQueueDetails2] = useState(false);

  // Fetch queue details
  const fetchQueueDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/queues/${qid}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQueueDetails(response.data);
    } catch (err) {
      console.error('Error fetching queue details:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchQueueDetails2 = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/queue-management/${qid}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQueueDetails2(response.data);
    } catch (err) {
      console.error('Error fetching queue details:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchQueueDetails();
    fetchQueueDetails2();
  }, [qid]);

  const toggleDropdown = (rowId, event) => {
    event.stopPropagation();
    setDropdownOpen(prev => (prev === rowId ? null : rowId));
  };

  const handleDropdownAction = async (action, rowId,  qmid, transaction_type) => {
    const newStatus = {
      Complete: 'Completed',
      Missed: 'Missed',
      In: 'In',
      Cancelled: 'Cancelled',
    }[action];

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/updatequeuestatus/`,
        { queueNumber: rowId, newStatus, qmid, transaction_type },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchQueueDetails();
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const handleRowClick = (queue) => {
    setSelectedQueue(queue);
    setOpenPatientModal(true);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);


  const rows = queueDetails?.map((queue) => ({
    id: queue.id,
    qmid: queue.qmid,
    queueNumber: queue.queue_number,
    patient: queue.patient,
    is_priority: queue.is_priority ? 'Yes' : 'No',
    status: queue.status,
    ticketType: queue.ticket_type,
    transactionType: queue.transaction_type,
  })) || [];

  const columns = [
    { field: 'queueNumber', headerName: 'Queue No.', width: 180 },
    { field: 'patient', headerName: 'Patient ID', width: 300 },
    { field: 'is_priority', headerName: 'Priority', width: 150 },
    { field: 'status', headerName: 'Status', width: 200 },
    { field: 'ticketType', headerName: 'Ticket Type', width: 200 },
    { field: 'transactionType', headerName: 'Transaction Type', width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      renderCell: (params) => (
        <div>
          <ArrowDropDown
            onClick={(event) => toggleDropdown(params.row.queueNumber, event)}
            style={{ cursor: 'pointer' }}
          />
          {dropdownOpen === params.row.queueNumber && (
            <div className={styles.dropdown}>
              {['Complete', 'Missed', 'Cancelled', 'In'].map((action) => (
                <div
                  key={action}
                  className={styles.dropdownItem}
                  onClick={() => handleDropdownAction(action, params.row.queueNumber, params.row.qmid, params.row.transactionType)}
                >
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];

  const closeQRCodeModal = () => setIsQRCodeModalOpen(false);
  const openQRCodeModal = () => setIsQRCodeModalOpen(true);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <div>
          <h2>Purpose: {queueDetails2?.transaction_type || 'N/A'}</h2>
          <p>Date: {queueDetails2?.date || 'N/A'}</p>
          <p>Status: {queueDetails2?.status || 'N/A'}</p>
        </div>
      </div>
      <div className={styles.searchAppointment}>
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          onRowClick={(params) => handleRowClick(params.row)}
        />
      </div>
      <Modal open={isQRCodeModalOpen} onClose={closeQRCodeModal}>
        <Box>
          <QRCodeReader />
        </Box>
      </Modal>
    </div>
  );
};

export default QueueList;
