import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Menu, MenuItem } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/queuesSecre.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const Queue = () => {
  const [queueManagements, setQueueManagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchQueueManagements = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/medicalrecordlist/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setQueueManagements(response.data.length > 0? response.data: []);
      } catch (error) {
        console.error('Error fetching queue management details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueueManagements();
  }, []);

  const filteredMedicalRecords = queueManagements.filter((queuemanagement) =>
    Object.values(queuemanagement).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleRowClick = (params) => {
    navigate(`/staff/queueList/${params.row.id}`, {
      state: {
        purpose: params.row.transaction_type,
        date: params.row.date,
        status: params.row.status,
      },
    });
  };

  const handleMenuOpen = (event, queue) => {
    setAnchorEl(event.currentTarget);
    setSelectedQueue(queue);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedQueue(null);
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedQueue) return;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/update-queue-status/${selectedQueue.id}/`,
        { status },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      alert(response.data.message);
    } catch (error) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
    handleMenuClose();
  };

  const columns = [
    { field: 'id', headerName: 'Id', width: 100 },
    { field: 'dame', headerName: 'Name', width: 200 },
    { field: 'date', headerName: 'Date', width: 150 },
    { field: 'generalremarks', headerName: 'General Remarks', width: 150 },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => (
        <>
          <Button onClick={(event) => handleMenuOpen(event, params.row)}>
            Options
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <h2 style={{ fontSize: '35px' }}>Queue List</h2>
        <p style={{ marginLeft: '10px', marginTop: '7px' }}>
          This is the list of doctors and their status. Check now!
        </p>
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
  
        </div>
      
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={filteredMedicalRecords}
          columns={columns}
          pageSize={5}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleStatusUpdate('cancel')}>Cancel</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('reschedule')}>Reschedule</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('completed')}>Completed</MenuItem>
      </Menu>
    </div>
    </div>
  );
};

export default Queue;
