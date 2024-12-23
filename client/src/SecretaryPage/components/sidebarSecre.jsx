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
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [currentNotificationPage, setCurrentNotificationPage] = useState(0);
  const notificationsPerPage = 5;
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null); const menuRef = useRef(null);

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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
        }
      });
      const secretary = response.data;
  
      // Safely construct the full name
      const firstName = secretary.FIRST_NAME || "";
      const lastName = secretary.LAST_NAME || "";
      
      setUserName(`${firstName} ${lastName}`.trim()); // Use trim() to remove any extra spaces
    } catch (error) {
      console.error('Error fetching profile:', error);
      // navigate('/');
    }
  };

    // Function to count unread notifications
    const countUnreadNotifications = (notifications) => {
      return notifications.filter(notification => notification.status !== 'read').length; // Adjust the condition based on your status field
    };
    const getDisplayedNotifications = () => {
      // Calculate the slice for the current page
      const startIndex = currentNotificationPage * notificationsPerPage;
      const endIndex = startIndex + notificationsPerPage;
      return notifications.slice(startIndex, endIndex);
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
    const intervalId = setInterval(updateDateTime, 1000);
  
    return () => clearInterval(intervalId);
  }, []);  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/notifications/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const data = response.data;
  
        // Sort the notifications: unread first, then read
        const sortedNotifications = data.sort((a, b) => {
          if (a.STATUS === 'unread' && b.STATUS === 'read') {
            return -1;
          } else if (a.STATUS === 'read' && b.STATUS === 'unread') {
            return 1;
          } else {
            return 0;
          }
        });
  
        setNotifications(sortedNotifications); // Set the notifications state with the sorted notifications

      // Count unread notifications and update the state
      const unreadCount = sortedNotifications.filter((notification) => notification.STATUS === 'unread').length;
      setUnreadNotificationCount(unreadCount); // Update the unread notifications count


        if (unreadCount > 0) {
          setNewNotification(true); // Set new notification state if there are unread notifications
        } else {
          setNewNotification(false); // Reset if no unread notifications
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
  
    // Fetch notifications initially and then every 10 seconds
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);
  
    return () => clearInterval(interval); // Clear the interval on component unmount
  }, []);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL}/secretary/notifications/${notificationId}`, { status: 'read' }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification.ID !== notificationId)
      );
      setUnreadNotificationCount(prevCount => prevCount - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  return (
    <div className={styles.bgcol}>
       <div className={styles.sidebar1}>
        <div className={styles.logo1}>
          <img src={logo} alt="Logo" />
        </div>
        <nav className={styles.nav1}>
          <NavLink to="/secretary/dashboard" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Home />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/secretary/patients" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Groups2 />
            <span>Patients</span>
          </NavLink>
          <NavLink to="/secretary/appointments" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <EventNote />
            <span>Appointments</span>
          </NavLink>
          <NavLink to="/secretary/queueList" className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}>
            <Queue />
            <span>Queue</span>
          </NavLink>
          
          <div>
            <NavLink
              to="/secretary/report"
              className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
            >
              <Assessment />
              <span>Reports</span>
            </NavLink>
            <div style={{ display: window.location.pathname.includes('/secretary/report') ? 'block' : 'none', marginLeft: '15%' }}>
              <NavLink
                to="/secretary/report/logs"
                className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
              >
                <History style={{ fontSize: '25px' }} />
                <span style={{ fontSize: '22px' }}>Logs</span>
              </NavLink>
              <NavLink
                to="/secretary/report/feedback"
                className={({ isActive }) => `${styles.navItem1} ${isActive ? styles.aactive1 : ''}`}
              >
                <Feedback style={{ fontSize: '25px' }} />
                <span style={{ fontSize: '22px' }}>Feedback</span>
              </NavLink>
            </div>
          </div>

          <div>
            
            <div style={{ display: window.location.pathname.includes('/secretary/services') || window.location.pathname.includes('/secretary/PredefinedQuestion') ? 'block' : 'none', marginLeft: '15%' }}>
              <NavLink
                to="/secretary/PredefinedQuestion"
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
        <Notifications 
              className={styles.iconSmall}
              style={{ fontSize: '60px', padding: '10px', cursor: 'pointer', color: 'gray' }}
              onClick={toggleNotifications}  ref={notificationRef}
            />
            {unreadNotificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '10%',  // Adjust this value as needed to position the badge correctly
              right: '80%', // Adjust this value as needed
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              fontWeight: 'bold',
              lineHeight: 'normal',
            }}>
              {unreadNotificationCount}
            </span>
            )}
            {showNotifications && (
              <div className={styles.notificationDropdown}>
                {notifications.length > 0 ? (
                  notifications.slice(
                    currentNotificationPage * notificationsPerPage, 
                    (currentNotificationPage + 1) * notificationsPerPage
                  ).map((notification, index) => (
                    <div 
                      key={index} 
                      className={styles.notificationItem} 
                      style={getNotificationStyle(notification.TYPE)}
                      onClick={() => handleNotificationClick(notification.ID)}
                    >
                      <p>{notification.MESSAGE}</p>
                    </div>
                  ))
                ) : (
                  <p>No new notifications.</p>
                )}
              </div>
            )}
          <div className={styles.user}>
            <NavLink to="/secretary/profile" className={styles.profileIcon}>
              <AccountCircle style={{ fontSize: '60px', padding: '10px', cursor: 'pointer', color: 'gray' }} />
            </NavLink>
            <span className={styles.userName}>{userName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
