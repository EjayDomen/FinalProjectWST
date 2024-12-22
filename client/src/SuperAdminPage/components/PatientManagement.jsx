import React from 'react';
import '../css/ManagePatient.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import profileImage from '../images/pookie.jpeg';
import { NavLink } from 'react-router-dom';


const PatientManagement = () => {
  return (
    <div className="patient">

      {/* Main Content */}
      <main className="patient-content">
        {/* Header Section */}
        <div className="patient-header">
          <div className="header-left">
            <p className="current-time">10:00 AM</p>
            <p className="current-date">August 30, 2024</p>
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

        {/* Queue List */}
        <div className="queue-section">
          <h1 className="queue-title">Queue List</h1>
          <p className="queue-subtitle">This is the list of patients and their status & queue. Check now.</p>
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
          </div>

          {/* Table */}
          <div className="queue-table">
            <table>
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Account Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>P40231</td>
                  <td>Ejay Domen</td>
                  <td>02-01-2024</td>
                  <td>
                    <button className="view-button">View</button>
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

export default PatientManagement;
