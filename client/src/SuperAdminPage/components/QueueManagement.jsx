import React from 'react';
import '../css/ManagePatient.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../images/pookie.jpeg';


const QueueManagement = () => {
  return (
    <div className="patient">

      {/* Main Content */}
      <main className="patient-content">
        {/* Header Section */}
        <div className="patient-header">
          <div className="header-left">
          <h1 className="queue-title">Queue</h1>
          </div>
          <div className="header-right">
            <div className="search-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="profile-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              <img src={profileImage} alt="Profile" className="profile-image" />
              <div className="user-avatar">Nick Gerblack</div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="queue-section">
          <h1 className="queue-title">Queue List</h1>
          <p className="queue-subtitle">This is the list of doctors and their status & queue. Check now.</p>
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
              <FontAwesomeIcon icon={faFilter} /> {/* Replace with a filter icon if available */}
            </button>
            <button className="staff-button">
              + Create Queue
            </button>
          </div>

          {/* Table */}
          <div className="queue-table">
            <table>
              <thead>
                <tr>
                  <th>No</th>   
                  <th>QID</th>
                  <th>Doctor's Name</th>
                  <th>Specialty</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>01</td>
                  <td>40302</td>
                  <td>Frenz Benobo</td>
                  <td>Cardiologist</td>
                  <td>11:00am - 2:00pm</td>
                  <td>
                    <h6 className="status-bar">In</h6>
                  </td>
                  <td>
                    <button className="view-button">Cancel Reschedule</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QueueManagement;
