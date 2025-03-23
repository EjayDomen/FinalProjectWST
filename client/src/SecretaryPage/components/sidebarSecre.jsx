import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Person, Groups2, EventNote, Queue, Message, Assessment, Logout, Notifications, AccountCircle, History, Feedback, Build } from '@mui/icons-material';
import logo from '../images/logo.png';
import styles from '../styles/sidebarSecre.module.css';
import axios from 'axios';

const Sidebar = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [profile, setProfile] = useState('');

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'SUCCESS':
        return { color: '#28a745', backgroundColor: '#d4edda', border: '1px solid #c3e6cb' };
      case 'FAILED':
        return { color: '#dc3545', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' };
      case 'WARNING':
        return { color: '#000', backgroundColor: '#fff3cd', border: '1px solid #ffeeba' };
      case 'INFO':
        return { color: '#007bff', backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' };
      case 'CRITICAL':
        return { color: '#8b0000', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' };
      case 'NEUTRAL':
      default:
        return { color: '#6c757d', backgroundColor: '#e2e3e5', border: '1px solid #d6d8db' };
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/me/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
        }
      });
      const secretary = response.data;
  
      // Safely construct the full name
      const firstName = secretary.first_name || "";
      const lastName = secretary.last_name || "";
      setProfile(secretary.profilePicture);
      
      setUserName(`${firstName} ${lastName}`.trim()); // Use trim() to remove any extra spaces
    } catch (error) {
      console.error('Error fetching profile:', error);
      // navigate('/');
    }
  };



  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); // Updated date format
    };
  
    fetchProfile();
    updateDateTime();
  }, []);  




  return (
    <div className={styles.bgcol}>
       <div className={styles.sidebar1}>
        <div className={styles.logo1}>
          <img src={logo} alt="Logo" />
        </div>
        <nav className={styles.nav1}>
          <NavLink to="/staff/dashboard" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Home />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/staff/patients" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Groups2 />
            <span>Patients</span>
          </NavLink>
          <NavLink to="/staff/request" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <EventNote />
            <span>Requests</span>
          </NavLink>
          <NavLink to="/staff/medicalrecords" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Queue />
            <span>Medical Records</span>
          </NavLink>
          
          <div>
          <NavLink
              to="/staff/report"
              className={({ isActive }) =>
                `${styles.navItem1} ${
                  isActive && window.location.pathname === '/staff/report' ? styles.aactive1 : ''
                }`
              }
          >
              <Assessment />
              <span>Reports</span>
            </NavLink>
            <div style={{ display: window.location.pathname.includes('/staff/report') ? 'block' : 'none', marginLeft: '15%' }}>
              <NavLink
                to="/staff/report/logs"
                className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
              >
                <History style={{ fontSize: '24px' }} />
                <span style={{ fontSize: '18px' }}>Logs</span>
              </NavLink>
              <NavLink
                to="/staff/report/feedback"
                className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
              >
                <Feedback style={{ fontSize: '24px' }} />
                <span style={{ fontSize: '18px' }}>Feedback</span>
              </NavLink>
            </div>
          </div>

          <div>
            
            <div style={{ display: window.location.pathname.includes('/staff/services') || window.location.pathname.includes('/staff/PredefinedQuestion') ? 'block' : 'none', marginLeft: '15%' }}>
              <NavLink
                to="/staff/PredefinedQuestion"
                className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
              >
                <Message style={{ fontSize: '25px' }} />
                <span style={{ fontSize: '22px' }}>FAQs</span>
              </NavLink>
            </div>
          </div>


          <NavLink to="/" className={({ isActive }) => `${styles.logout} ${isActive ? styles.aactive1 : ''}`} onClick={handleLogout}>
            <Logout />
            <span>Log Out</span>
          </NavLink>
        </nav>
      </div>
      <div className={styles.header}>
        <div className={styles.greeting}>
          <h1>{currentTime}</h1>
          <b><p>{currentDate}</p></b>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.user} >
            <NavLink to="/staff/profile" className={styles.profileIcon}>
              <img 
                src={`${process.env.REACT_APP_API_URL}${profile}` } 
                alt="Profile Picture" 
                className="me-2 rounded-circle" 
                style={{ width: "40px", height: "40px", objectFit: "cover" }} 
              />
              <span 
              className={styles.userName} 
              style={{ textDecoration: "none", borderBottom: "none", display: "inline-block" }}
            >{userName}</span>

            </NavLink>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
