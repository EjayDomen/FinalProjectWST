import React from 'react';
import '../css/ManagePatient.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../images/pookie.jpeg';
import { NavLink } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';

const QueueManagement = () => {
  const rows = [
    {
      id: 1,
      qid: '40302',
      doctorName: 'Frenz Benobo',
      specialty: 'Cardiologist',
      time: '11:00am - 2:00pm',
      status: 'In',
    },
  ];

  const columns = [
    { field: 'id', headerName: 'No', width: 100 },
    { field: 'qid', headerName: 'QID', width: 150 },
    { field: 'doctorName', headerName: "Doctor's Name", width: 250 },
    { field: 'specialty', headerName: 'Specialty', width: 150 },
    { field: 'time', headerName: 'Time', width: 180 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: () => (
        <button className="view-button">Cancel Reschedule</button>
      ),
    },
  ];

  return (
    <div className="patient">
      <main className="patient-content">
        <div className="patient-header">
          <div className="header-left">
            <h1 className="queue-title">Queue</h1>
          </div>
          <div className="header-right">
            <div className="search-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="profile-icon-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              <NavLink to="/dashboard/userprofile" className="profile-nav">
                <img src={profileImage} alt="Profile" className="profile-image" />
                <div className="user-avatar">Nick Gerblack</div>
              </NavLink>
            </div>
          </div>
        </div>

        <div className="queue-section">
          <h1 className="queue-title">Queue List</h1>
          <p className="queue-subtitle">
            This is the list of doctors and their status & queue. Check now.
          </p>
          <div className="queue-content">
            <div className="queue-search">
              <div className="queue-search-container">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search Appointment"
                  className="search-appointment-input"
                />
              </div>
              <button className="filter-button">
                <FontAwesomeIcon icon={faFilter} />
              </button>
              <button className="staff-button">+ Create Queue</button>
            </div>

            <div className="queue-table">
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 15]}
                autoHeight
                disableSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': { fontSize: '14px' },
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueManagement;
