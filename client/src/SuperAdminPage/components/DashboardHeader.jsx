import React from 'react';
import '../styles/Dashboard.css';
import { NavLink } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { faMagnifyingGlass, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import profileImage from '../images/pookie.jpeg';


const Dashboard = () => {
  // Data for Line Chart
  const lineData = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'This week',
        data: [20, 40, 35, 50, 45, 60, 70, 65, 80],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Data for Doughnut Chart
  const doughnutData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: ['#2563EB', '#E5E7EB'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="dashboard">

      <main className="dashboard-content">
        <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="search-container">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            <div className="profile-icon-container">
              <FontAwesomeIcon icon={faBell} className="notification-icon" />
              <NavLink to="/superadmin/userprofile" className="profile-nav">
              <img src={profileImage} alt="Profile" className="profile-image" />
              <div className="user-avatar">Nick Gerblack</div>
              </NavLink>
              </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="stats-container">
          <div className="stats-card" id="stat1" style={{color: 'white'}}>
            <h3>Students</h3>
            <h1>21</h1>
          </div>
          <div className="stats-card" id="stat2" style={{color: 'white'}}>
            <h3>Employees</h3>
            <h1>22</h1>
          </div>
          <div className="stats-card" id="stat3">
            <h3>Employees</h3>
            <h1>23</h1>
          </div>
          <div className="stats-card" id="stat4">
            <h3>Employees</h3>
            <h1>24</h1>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <Line data={lineData} />
          </div>
          <div className="chart-card">
            <Doughnut data={doughnutData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
