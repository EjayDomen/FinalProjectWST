import React, { useState, useEffect } from 'react';
import { ContentPaste, CalendarMonth, Opacity } from '@mui/icons-material';
import { TextField, Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from '@mui/material/Modal';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import styles from '../styles/appointmentsSecre.module.css';

const ActionDropdown = ({ onReminder, onReschedule }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    event.stopPropagation(); // Prevent row click event
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleOpenMenu}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()} // Prevent row click when selecting menu items
      >
        <MenuItem onClick={() => { onReminder(); handleCloseMenu(); }}>Reminder</MenuItem>
        <MenuItem onClick={() => { onReschedule(); handleCloseMenu(); }}>Reschedule</MenuItem>
      </Menu>
    </div>
  );
};

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState(''); // State for storing search input
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [startDate, setStartDate] = useState(''); // Date range filter start
  const [endDate, setEndDate] = useState(''); // Date range filter end
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [events, setEvents] = useState([]); // State to hold schedule events
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [dropdownOpen, setDropdownOpen] = useState(null); // State for managing the dropdown per row
  const [formData, setFormData] = useState({
    newDate: '', // New date field
    scheduleId: '', // Add this line
    oldDate:''
  });
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null); // To store selected event details for rescheduling


  const fetchDoctors = async () => {
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
          const startTime = event.startTime ? formatTime(event.startTime) : '';
          const endTime = event.endTime ? formatTime(event.endTime) : '';
          const dow = event.dow ? [event.dow] : [];
          const startRecur = new Date().toISOString().split('T')[0];
          return {
            ...event,
            id: event.id,
            title: event.patient_name,
            backgroundColor: 'rgba(10, 193, 28, 0.5)',
            daysOfWeek: dow,
            startRecur,
            purpose: event.purpose,
            type: event.type,
            date: event.appointment_date,
            borderColor: event.borderColor || '#0056b3', // Default border color
            extendedProps: {
              specialization: event.specialization,
              profilePicture: event.profilePicture,
              schedCount: event.schedCount,
              schedId: event.schedId,
        },
          };
        });
  
        console.log('Mapped eventData:', eventData); // Log after mapping
  
        // Deduplicate if necessary
        const uniqueEventData = [...new Map(eventData.map(item => [item.schedId, item])).values()];
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
    fetchDoctors();
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
    
    navigate(`/secretary/appointments/patientList/${params.row.schedId}`, {
      state: { doctorName, appDate, time },
    });
  };
  

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'list' ? 'calendar' : 'list'));
  };

  const handleOpenModal = (event) => {
    console.log("Event object:", event); // Check what properties are available on the event
    setSelectedEvent(event); // Store selected event details
    setOpenModal(true);
    setFormData({
      scheduleId: event.schedId || '', // Safeguard if id is undefined
      oldDate: event.date || '', // Safeguard if date is undefined
    });
  };
  

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null); // Clear selected event
    setFormData({ newDate: '',
      oldDate:''
     }); // Reset form data
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


   const handleSubmit = async () => {
    if (!selectedEvent || !formData.newDate) {
      alert("Please fill out all fields.");
      return;
    }
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/secretary/appointments/rescheduleAppointments/resched`, {
        scheduleId: formData.scheduleId,
        newDate: formData.newDate,
        oldDate: formData.oldDate
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        alert(`Appointment for schedule ID ${selectedEvent.id} has been rescheduled to ${formData.newDate}.`);
        // Optionally refresh events or close modal here
        handleCloseModal(); // Close modal on success
        fetchDoctors();
      } else {
        alert('Unexpected response. Please try again.');
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      alert(error.response?.data?.error || 'Failed to reschedule appointment. Please try again.');
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  
  const filterEvents = () => {
    // Filter events based on the search term and date range
    const filteredData = events
      .filter((event) => {
        const matchesSearchTerm = Object.values(event).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
  
        const eventDate = new Date(event.date);
        const isWithinDateRange =
          (!startDate || new Date(startDate) <= eventDate) &&
          (!endDate || eventDate <= new Date(endDate));
  
        return matchesSearchTerm && isWithinDateRange;
      })
      .map((event, index) => ({ ...event, rowNumber: index + 1 })); // Add rowNumber
  
    setFilteredEvents(filteredData);
  };

  useEffect(() => {
    filterEvents();
  }, [searchTerm, startDate, endDate, events]);
    // Define columns for the DataGrid

const columns = [
  { field: 'rowNumber', headerName: '#', width: 100 },
  { field: 'id', headerName: 'Appointment ID', width: 130 },
  { field: 'title', headerName: 'Patient Name', width: 250 },
  { field: 'date', headerName: 'Date', width: 200 },
  { field: 'purpose', headerName: 'Purpose', width: 220 },
  { field: 'type', headerName: 'Type', width: 150 },
  { field: 'status', headerName: 'Status', width: 150 },
  {
    field: 'actions',
    headerName: 'Actions',
    sortable: false,
    width: 100,
    renderCell: (params) => (
      <ActionDropdown
        onReminder={() => console.log(`Reminder action for ID ${params.row.id}`)}
        onReschedule={() => handleOpenModal(params.row)}
      />
    ),
  },
];
const handleEventClickCalendar = (info) => {
  const event = info.event; // Extract the clicked event
  console.log("Clicked Event Details:", event);

  // Prepare the necessary data for navigation
  const doctorName = event.title || 'Unknown Doctor';
  const appDate = event.startStr.split('T')[0] || 'Unknown Date'; // Extract date from ISO string
  const time = `${event.start?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${event.end?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

  // Navigate to the desired page with state
  navigate(`/secretary/appointments/patientList/${event.extendedProps.schedId}`, {
    state: { doctorName, appDate, time },
  });
};


return (
  <div className={styles.doctorsSection}>
    {/* Search bar, date filters, and calendar toggle button in one row */}
    <div className={styles.searchAppointment}>
      <div className={styles.actionButtons}>
       <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
          
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
      {/* { <Button
        onClick={toggleViewMode}
        sx={{
          padding: '10px 15px',
          backgroundColor: '#4a4a4a',
          color: 'white',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: '#333333', // Set hover color here
          },
        }}
      >
        {viewMode === 'list' ? <CalendarMonth /> : <ContentPaste />}
      </Button> } */}
      </div>

        {/* Reschedule Modal */}
        <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="reschedule-modal-title">
            <div className={styles.modalContainer}>
              <h2 id="reschedule-modal-title">Reschedule Appointment</h2>
              <hr />
              {selectedEvent && (
                <>
                  <p>Doctor: {selectedEvent.title}</p>
                  <p>Time: {selectedEvent.time}</p>
                  <p>Date: {selectedEvent.date || 'N/A'}</p>
                  
                  <input
                    type="date"
                    name="newDate"
                    value={formData.newDate}
                    onChange={handleChange}
                  />
                  {/* Hidden input for schedule ID */}
                  <input
                    type="hidden"
                    name="scheduleId"
                    value={formData.scheduleId} // Pass the scheduleId here
                  />
                  <div className={styles.modalButtons}>
                    <button onClick={handleCloseModal} className={styles.cancelButton}>Cancel</button>
                    <button onClick={handleSubmit} className={styles.submitButton}>Submit</button>
                  </div>
                </>
              )}
            </div>
          </Modal>

          {/* Conditional rendering for list or calendar view */}
          <div style={{height: '100%', width:'100%'}}>
          {viewMode === 'list' ? (
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
                  getRowClassName={(params) =>
                    params.index % 2 === 0 ? styles.evenRow : styles.oddRow
                  }
                  onRowClick={handleEventClick}
                />
              </div>
           </Box>
        ) : (
          <div>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, googleCalendarPlugin, interactionPlugin]}
            themeSystem="none"
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'today',
              center: 'prev,title,next',
              right: 'timeGridWeek,dayGridMonth,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClickCalendar}
            editable={false}
            dayMaxEvents={true}
            allDaySlot={false}
            eventContent={(eventInfo) => (
              <div
                style={{
                  borderLeft: `5px solid ${eventInfo.event.borderColor}`,
                  borderRadius: '8px',
                  padding: '8px',
                  color: '#313b34', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {eventInfo.event.extendedProps.profilePicture && (
                  <img
                    src={eventInfo.event.extendedProps.profilePicture}
                    alt="Doctor"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '1px solid #fff',
                    }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{eventInfo.event.title}</div>
                  <div style={{ fontSize: '10px' }}>{eventInfo.timeText}</div>
                  <div style={{ fontSize: '10px', color: '#ddd' }}>{eventInfo.event.extendedProps.specialization}</div>
                </div>
              </div>
            )}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
            }}
            height="auto"
          />
        
          {/* Adding inline styles for calendar elements */}
          <style>
            {`
              /* Inline styles for FullCalendar components */
              /* Remove All Grid Lines and Borders in Calendar */
              .fc-timegrid {
                background-color: #fff;
              }
              .fc-timegrid-slot-lane,
              .fc-col-header-cell-cushion,
              .fc-daygrid-day-number,
              .fc-col-header-cell,
              .fc-daygrid-day,
              .fc-scrollgrid-sync-inner {
                border-bottom: 1px solid black !important;
              }
              .fc-timegrid-event,
              .fc-scrollgrid,
              .fc-timegrid-divider,
              .fc-timegrid-slot {
                border: none !important; /* Remove all borders */
                box-shadow: none !important; /* Remove any shadow effects */
              }
                /* Remove Underline from Header Cell Cushion */
              .fc-col-header-cell-cushion {
                font-weight: bold;
                font-size: 18px;
                color: #000;
                text-align: center;
                border: none !important; /* Remove any underline */
                text-decoration: none !important;
              }
              .fc-col-header-cell-cushion::after {
                content: attr(data-date);
                display: block;
                font-size: 12px;
                color: #333;
                margin-top: 3px;
              }
              .fc-header-toolbar {
                margin-top: 2% !important;
                margin-bottom: 1% !important;
                display: flex !important;
                justify-content: space-between !important; /* Centering toolbar content */
                align-items: center !important;
              }
              .fc-toolbar-title {
                font-size: 30px !important; /* Match previous design */
                font-weight: bold !important;
                color: #333 !important; /* Title color */
              }
              .fc-button {
                background-color: #666 !important; /* Match previous black buttons */
                color: white !important;
                border: none !important;
                border-radius: 5px !important;
                padding: 5px 10px !important;
                display: none; /* Hide all buttons */
              }
              .fc-button:hover {
                background-color: #333 !important; /* Darker on hover */
              }
              .fc-timegrid-slot {
                height: 40px !important; /* Reduced slot height */
                padding: 2px 0 !important; /* Adjust padding to save space */
              }
                .fc-daygrid-day {
                min-height: 30px !important; /* Lower day grid height */
              }
              .fc-prev-button,
              .fc-next-button {
                display: none; /* Hide left/right buttons */
              }
              .fc-today-button {
                background-color: green !important; /* Persistent orange color from previous design */
                color: #fff !important;
                border-radius: 5px !important;
                padding: 8px 12px !important;
              }
              .fc-today-button:hover {
                background-color: #218838 !important; /* Darker orange on hover */
              }
              .fc-title {
                font-size: 20px !important;
                font-weight: bold !important;
                color: #333 !important;
              }
              .fc-col-header-cell-cushion {
                color: black !important; /* Change the text color of the column headers (weekdays) */
                text-decoration: none;
              }
              .fc-toolbar-chunk {
                display: flex;
              }
              .fc-toolbar-chunk div {
                display: flex;
                align-items: center; /* Align items vertically in the center */
                justify-content: center; /* Align items horizontally in the center */
                gap: 5px;
              }
              .fc .fc-daygrid-day-number {
                text-decoration: none;
                color: black; /* Maintain black color for day numbers */
              }
              .fc .fc-timegrid-col.fc-day-today {
                background-color: #E9E9E9;
              }
              .fc .fc-daygrid-day.fc-day-today {
                background-color: #E9E9E9;
              }
              .fc .fc-daygrid-event-harness {
                background-color: rgba(10, 193, 28, 0.5);
              }
            `}
          </style>
        </div>
        
        
          )}
          </div>
    </div>
    </div>
  );
};

export default Appointments;
