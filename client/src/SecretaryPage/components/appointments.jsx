import React, { useState, useEffect } from 'react';
import { ContentPaste, CalendarMonth, Opacity } from '@mui/icons-material';
import { TextField, Box, Button, IconButton, Menu, MenuItem, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import styles from '../styles/appointmentsSecre.module.css';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState(''); // State for storing search input
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [startDate, setStartDate] = useState(''); // Date range filter start
  const [endDate, setEndDate] = useState(''); // Date range filter end
  const [events, setEvents] = useState([]); // State to hold schedule events
  const navigate = useNavigate();


  const StatusDropdown = ({ rowId, currentStatus, updateRequestStatus }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus.toLowerCase());
  
    const handleStatusChange = async (event) => {
      const newStatus = event.target.value;
      setSelectedStatus(newStatus);
  
      try {
        await updateRequestStatus(rowId, newStatus);
        alert("Status updated successfully!");
      } catch (error) {
        alert("Failed to update status. Please try again.");
      }
    };
  
    return (
      <Select value={selectedStatus} onChange={handleStatusChange} variant="outlined" size="small">
        {Object.entries(REQUEST_STATUSES).map(([key, { label }]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </Select>
    );
  };

  const fetchRequest = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/showallappointment/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (response.status === 200) {
        // Log raw API response
        console.log('Raw response data:', response.data); // Log raw response
  
          const eventData = response.data.map(event => {
          return {
            ...event,
            id: event.id,
            title: `${event.patientid.first_name} ${event.patientid.last_name} ${event.patientid.suffix && event.patientid.suffix.toLowerCase() !== 'n/a' ? event.patientid.suffix : ''}`.trim(),
            backgroundColor: 'rgba(10, 193, 28, 0.5)',
            purpose: event.purpose,
            date: event.appointment_date,
            status: event.status,
          };
        });
  
        console.log('Mapped eventData:', eventData); // Log after mapping
  
        // Deduplicate if necessary
        const uniqueEventData = [...new Map(eventData.map(item => [item.id, item])).values()];
        console.log('Unique eventData:', uniqueEventData); // Log deduplicated data
  
        setEvents(uniqueEventData);
        setFilteredEvents(response.data);
      } else {
        console.error('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error.response ? error.response.data : error.message);
    }
  };
  
  
  
  useEffect(() => {
    fetchRequest();
    const today = new Date();
    const manilaDate = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    // Set the default value for startDate and endDate to today's date
    setStartDate(manilaDate);
    setEndDate(manilaDate);
  }, []);


  
  const formatTime = (time) => {
    // If the time is in "HH:MM" format, append ":00" to create a valid Date string
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute, 0);
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleEventClick = (params) => {
    console.log("Params:", params);
  
    if (!params || !params.row) {
      console.warn("Row data is undefined. Check DataGrid configuration.");
      return;
    }
    console.log("Filtered Events Data:", filteredEvents);
  
    const doctorName = params.row.title || 'Unknown Doctor'; // Adjust for actual field name
    const appDate = params.row.date || 'Unknown Date';
    const time = `${formatTime(params.row.startTime || '')} - ${formatTime(params.row.endTime || '')}`;
    
    navigate(`/staff/appointments/patientList/${params.row.schedId}`, {
      state: { doctorName, appDate, time },
    });
  };
  

  
  const filterEvents = () => {
    const filteredData = events
      .filter((event) => {
        const matchesSearchTerm = Object.values(event).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
  
        const eventDate = new Date(event.appointment_date);
        const isWithinDateRange =
          (!startDate || new Date(startDate) <= eventDate) &&
          (!endDate || eventDate <= new Date(endDate));
  
        return matchesSearchTerm && isWithinDateRange;
      })
      .map((event, index) => ({ ...event, rowNumber: index + 1 }));
  
    console.log('Filtered Events:', filteredData); // Log filtered events
    setFilteredEvents(filteredData);
  };
  

  useEffect(() => {
    filterEvents();
  }, [searchTerm, startDate, endDate, events]);
    // Define columns for the DataGrid

    const columns = [
      { field: 'rowNumber', headerName: '#', width: 100 },
      { field: 'id', headerName: 'Request ID', width: 130 },
      { field: 'title', headerName: 'Patient Name', width: 250 },
      { field: 'date', headerName: 'Date', width: 200 },
      { field: 'purpose', headerName: 'Purpose', width: 220 },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => {
          const status = REQUEST_STATUSES[params.value?.toLowerCase()] || {
            label: params.value,
            color: "#000"
          };
    
          return (
            <span
              style={{
                backgroundColor: status.color,
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "5px",
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              {status.label}
            </span>
          );
        }
      },
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        width: 180,
        renderCell: (params) => (
          <StatusDropdown rowId={params.row.id} currentStatus={params.row.status} />
        )
      }
    ];
    


const updateRequestStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem('token'); // Get auth token if required
    const response = await axios.put(
      `${process.env.REACT_APP_API_URL}/api/admin/updaterequeststatus/${id}/`,
      { status: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const handleStatusChange = async (id, status) => {
      try {
        const result = await updateRequestStatus(id, status);
        alert(`Request ID: ${id} updated to ${status}`);
        console.log(result); // Do something with the response
      } catch (error) {
        alert('Failed to update request status');
      }
    };

    console.log('Status Update Response:', response.data);
    return response.data; // Return response if needed

  } catch (error) {
    console.error('Error updating request status:', error.response ? error.response.data : error.message);
    throw error; // Rethrow error for handling in the UI
  }
};


const REQUEST_STATUSES = {
  pending: { label: "Pending", color: "#FFC107" }, // Yellow
  approved: { label: "Approved", color: "#4CAF50" }, // Green
  rejected: { label: "Rejected", color: "#F44336" }, // Red
  in_progress: { label: "In Progress", color: "#2196F3" }, // Blue
  completed: { label: "Completed", color: "#673AB7" }, // Purple
  cancelled: { label: "Cancelled", color: "#9E9E9E" } // Grey
};



return (
  <div className={styles.doctorsSection}>
    {/* Search bar, date filters, and calendar toggle button in one row */}
    <div className={styles.searchAppointment}>
      <div className={styles.actionButtons} style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', /* Center the content horizontally */
        margin: 0, /* Remove default margin */
        gap: '12px',
        width: '90%'
      }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{
                    position: 'absolute',
                    left: '22px',
                    color: '#aaa'
                  }} />
       <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
          style={{
            paddingLeft: '50px'
          }}
        />
      
      <TextField
        label="Start Date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
      </div>


          {/* Conditional rendering for list or calendar view */}
          <div style={{height: '100%', width:'100%'}}>
             <Box sx={{ height: 600, width: '100%' }}>
       
             {/* Date Range Filter */}
             <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
               <TextField
                 label="Start Date"
                 type="date"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 InputLabelProps={{ shrink: true }}
                 style={{display: 'none'}}
               />
               <TextField
                 label="End Date"
                 type="date"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 InputLabelProps={{ shrink: true }}
                 style={{display: 'none'}}
               />
             </Box>
             
              {/* DataGrid with Pagination, Row Count, and Search */}
              <div style={{ height: '100%', width: '100%' }}>
                <DataGrid style={{cursor:'pointer'}}
                  rows={filteredEvents}
                  columns={columns}
                  pageSize={10} // Default rows per page
                  rowsPerPageOptions={[10, 20, 50]} // Row count options
                  onRowClick={handleEventClick}
                />
              </div>
           </Box>
          </div>
    </div>
    </div>
  );
};

export default Appointments;
