import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowBack} from '@mui/icons-material';
import { ArrowDropDown } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useLocation } from 'react-router-dom'; // Import useParams and useLocation to get the schedule ID and passed state
import styles from '../styles/patientListSecre.module.css';
import axios from 'axios';

const PatientList = () => {
  const navigate = useNavigate();
  const { scheduleId } = useParams();
  const { state } = useLocation(); // Access the passed state
  const doctorName = state?.doctorName || 'Unknown Doctor'; // Fallback to 'Unknown Doctor' if no state is passed
  const appDate = state?.appDate || 'N/A'; // Renamed for clarity
  const time = state?.time || 'N/A';
  const [patients, setPatients] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null); // Track dropdown state
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [searchTerm, setSearchTerm] = useState(''); // State for storing search input
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [startDate, setStartDate] = useState(''); // Date range filter start
  const [endDate, setEndDate] = useState(''); // Date range filter end

  useEffect(() => {
    if (scheduleId) {
      fetchPatients(scheduleId, appDate);
    }
  }, [scheduleId, appDate]);

  // Fetch patients based on schedule ID
  const fetchPatients = async (schedId, appDate) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/appointments/patientList/appointmentList/${schedId}/${appDate}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const columns = [
    { field: 'id', headerName: 'Patient ID', width: 180 },
    { field: 'name', headerName: 'Patient Name', width: 300 },
    { field: 'date', headerName: 'Date', width: 250 },
    { field: 'time', headerName: 'Time', width: 250 },
    { field: 'type', headerName: 'Type', width: 200 },
    { field: 'status', headerName: 'Status', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <div>
          <ArrowDropDown
            onClick={() => toggleDropdown(params.id)}
            style={{ cursor: 'pointer' }}
          />
          {dropdownOpen === params.id && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem} onClick={() => alert('Follow up appointment clicked')}>
                Follow up
              </div>
              <div className={styles.dropdownItem} onClick={() => alert('No show up clicked')}>
                No show up
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

   // Filtered rows based on search term
   const filteredRows = patients
   .filter((appointment) =>
     `${appointment.FIRST_NAME} ${appointment.LAST_NAME}`.toLowerCase().includes(searchTerm.toLowerCase())
   )
   .map((appointment, index) => ({
     id: index + 1,
     name: `${appointment.FIRST_NAME} ${appointment.LAST_NAME}` || 'Unknown Patient',
     date: appointment.APPOINTMENT_DATE,
     time: appointment.APPOINTMENT_TIME,
     type: appointment.TYPE || 'N/A',
     status: appointment.STATUS || 'N/A',
   }));

  return (
    <div className={styles.patientListContainer}>
      <button 
            style={{
              float: 'left',
              cursor: 'pointer',
              padding: '5px 10px',
              backgroundcolor: '#6c757d',
              bordercolor: '#6c757d',     
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }} 
            onClick={() => navigate(-1)}
          >
            <ArrowBack></ArrowBack>
          </button>
      <div className={styles.patientListHeader}>
        <div>
          <h2>
            Doctor: {doctorName} <span>{appDate}</span> <span>{time}</span>
          </h2>
          <p style={{ marginLeft: '10px' }}>This is the list of patients for the doctor's appointment. Check now!</p>
        </div>
      </div>

      <div className={styles.searchAppointment}>

        <div style={{display: 'flex'}}>
          <input
            type="text"
            placeholder="Search Appointment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ height: 600, width: '100%', marginTop:'1%' }}>
          <DataGrid sx={{ height: 600, width: '100%', cursor:'pointer' }}
            rows={filteredRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowClassName={(params) => 
              params.index % 2 === 0 ? styles.evenRow : styles.oddRow
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PatientList;
