import React, { useEffect, useState } from 'react';
import calendar from '../images/calendar.png';
import building from '../images/building.png';
import doctorLogo from '../images/doctor.png'; 
import { Notifications } from '@mui/icons-material';
import styles from '../styles/dashboardSecre.module.css';
import axios from 'axios';
import { Line } from 'react-chartjs-2'; // Import Line chart component from Chart.js
import { useNavigate } from 'react-router-dom';
import { Delete } from '@mui/icons-material'; // Import the delete icon
import { Link } from 'react-router-dom';

// Chart.js components and options
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartDataLabels);

const Dashboard = () => {
  const [period, setPeriod] = useState('daily'); // Default period is 'daily'
  const [doctorCount, setDoctorCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [todaysQueue, setTodaysQueue] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState(false);
  const [attendedData, setAttendedData] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [loadingQueue, setLoadingQueue] = useState(true); // State for loading the queue
  const [currentNotificationPage, setCurrentNotificationPage] = useState(0); // New state for current page
  const notificationsPerPage = 5; // Limit of notifications per page
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate(); // To navigate to other pages


  //try errorModal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const handleSeeMoreClick = () => {
    // Simulate an error or trigger the modal
    setShowErrorModal(true);
};

  // Function to count unread notifications
  const countUnreadNotifications = (notifications) => {
    return notifications.filter(notification => notification.status !== 'read').length; // Adjust the condition based on your status field
  };

   // Notification styling function
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

  // Fetch doctor and appointment count from the backend
  useEffect(() => {
    const fetchDoctorCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/doctors/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data;
        setDoctorCount(data.doctorCount); // Update the state with the count
      } catch (error) {
        console.error('Error fetching doctor count:', error);
      }
    };

    const fetchAppointmentCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/appointments/count`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data;
        setAppointmentCount(data.appointmentCount); // Update the state with the count
      } catch (error) {
        console.error('Error fetching appointment count:', error);
      } 
    };
    const fetchTodaysAppointments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/appointments/today/today`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          params: { limit: 5 }
        });

        const data = response.data;
        console.log(data);
        setTodaysAppointments(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching today\'s appointments:', error);
        setLoading(false);
      }
    };

    const fetchTodaysQueue = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/queues/today/todayQueue`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          params: { limit: 5 }
        });
        setTodaysQueue(response.data);
      } catch (error) {
        console.error('Error fetching today\'s queue:', error);
        //  setQueueError('No queue available for today');
      } finally {
        setLoadingQueue(false);
      }
    };

    fetchDoctorCount();
    fetchAppointmentCount();
    fetchPatientsAttended();
    fetchTodaysAppointments();
    fetchTodaysQueue();
  }, []);

  const markNotificationAsRead = async (id) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/secretary/notifications/${id}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prevNotifications) => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, status: 'read' } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Function to handle notification deletion
  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/secretary/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Polling for new notifications every 10 seconds
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
  
  // Function to calculate and return displayed notifications
  const getDisplayedNotifications = () => {
    // Calculate the slice for the current page
    const startIndex = currentNotificationPage * notificationsPerPage;
    const endIndex = startIndex + notificationsPerPage;
    return notifications.slice(startIndex, endIndex);
  };
  
  // Get notifications for the current page
  const displayedNotifications = getDisplayedNotifications();
  
 
   // Function to handle next page click
   const handleNextPage = () => {
     if ((currentNotificationPage + 1) * notificationsPerPage < notifications.length) {
       setCurrentNotificationPage(prevPage => prevPage + 1);
     }
   };

   // Function to handle previous page click
  const handlePreviousPage = () => {
    if (currentNotificationPage > 0) {
      setCurrentNotificationPage(prevPage => prevPage - 1);
    }
  };
  const fetchPatientsAttended = async (period) => {
    try {
      let url;
      if (period === 'daily') {
        url = `${process.env.REACT_APP_API_URL}/secretary/patients/patients-attended/daily`;
      } else if (period === 'weekly') {
        url = `${process.env.REACT_APP_API_URL}/secretary/patients/patients-attended/weekly`;
      } else if (period === 'monthly') {
        url = `${process.env.REACT_APP_API_URL}/secretary/patients/patients-attended/monthly`;
      }
  
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      setAttendedData(response.data); // Set the data for the chart
    } catch (error) {
      console.error('Error fetching patients attended data:', error);
    }
  };

  // Call fetchPatientsAttended when the component mounts
useEffect(() => {
  fetchPatientsAttended(period);
}, [period]);


// Function to prepare chart data based on the selected period
const prepareChartData = (attendedData, period) => {
  // Prepare data for the chart based on period
  const groupedData = attendedData.reduce((acc, item) => {
    // Get the label based on the period (Month, Week, or Day)
    const label = period === 'monthly' ? item.month :
                  period === 'weekly' ? item.week :
                  item.date;

    if (!acc[label]) {
      acc[label] = { Missed: 0, Cancelled: 0, Completed: 0 }; // Initialize counts for each status
    }

    // Increment the count based on status
    if (item.status.toLowerCase()  === 'missed') acc[label].Missed += item.appointmentCount;
    if (item.status.toLowerCase() === 'cancelled') acc[label].Cancelled += item.appointmentCount;
    if (item.status.toLowerCase() === 'completed') acc[label].Completed += item.appointmentCount;

    return acc;
  }, {});

  // Convert grouped data into chart-compatible format
  const labels = Object.keys(groupedData); // X-axis labels (dates/weeks/months)
  const data = [
    // Patients with 'Missed' status
    labels.map(label => groupedData[label].Missed),
    // Patients with 'Cancelled' status
    labels.map(label => groupedData[label].Cancelled),
    // Patients with 'Completed' status
    labels.map(label => groupedData[label].Completed),
  ];

  return {
    labels,
    datasets: [
      {
        label: 'Missed',
        data: data[0],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Cancelled',
        data: data[1],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true,
      },
      {
        label: 'Completed',
        data: data[2],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };
};

// Calculate the maximum count dynamically
const calculateMaxCount = (datasets) => {
  let maxCount = 0;
  datasets.forEach((dataset) => {
    const maxValue = Math.max(...dataset.data);
    if (maxValue > maxCount) {
      maxCount = maxValue;
    }
  });
  return maxCount;
};





// Use the function to generate the chart data
const chartData = prepareChartData(attendedData, period);
// Use the function to compute maxCount
const maxCount = calculateMaxCount(chartData.datasets);

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Number of Patients Attended (${period.charAt(0).toUpperCase() + period.slice(1)})`,
    },
    datalabels: {
      color: '#000',
      font: {
        size: 12,
        weight: 'bold',
      },
      anchor: 'end',
      align: 'end',
      offset: -10,
      formatter: (value) => value,
    },
  },
  scales: {
    y: {
      display: true,
      beginAtZero: true,
      min: 0,
      max: maxCount, // Set max value dynamically based on maxCount
      ticks: {
        stepSize: Math.ceil(maxCount / 10), // Dynamically calculate stepSize
        callback: function (value) {
          return value % 5 === 0 ? value : ''; // Adjust this logic if needed
        },
      },
      title: {
        display: true,
        text: 'Appointment Count',
      },
    },
  },
};



  return (
    <div className={styles.dashboard}>
      {/* Outpatient Department Section */}
      <div className={`${styles.section} ${styles.outpatientDepartment}`}>
        <div className={styles.iconContainer}>
          <img src={building} alt="Building" className={styles.icon} />
        </div>
        <div className={styles.textContainer}>
          <h3>Outpatient Department</h3>
          <p className={styles.roomInfo}>For <span>Room 420</span></p>
        </div>
      </div>
      
      {/* Total Appointments Section */}
      <Link to="/secretary/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={`${styles.section} ${styles.totalAppointments}`}>
          <div className={styles.iconContainer}>
            <img src={calendar} alt="calendar" className={styles.icon} />
          </div>
          <div className={styles.textContainer}>
            <h3>Appointments</h3>
            <p className={styles.count}>
              {appointmentCount}
              <span style={{ fontSize: '18px', color: '#777', marginLeft: '10px', fontWeight: 'normal' }}>Total Appointments</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Doctors Section */}
      <Link to="/secretary/doctors" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={`${styles.section} ${styles.doctors}`}>
          <div className={styles.iconContainer}>
            <img src={doctorLogo} alt="doctor" className={styles.icon} />
          </div>
          <div className={styles.textContainer}>
            <h3>Doctors</h3>
            <p className={styles.count}>
              {doctorCount}
              <span style={{ fontSize: '18px', color: '#777', marginLeft: '10px', fontWeight: 'normal' }}>Total Doctors</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Second Row: Patient Attended, Notifications */}
      <div className={styles.patientAttended}>
        <div className={styles.tableRow}>
          
        <h3><b>Today's Appointment</b></h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Patient Name</th>
                  <th>Appointment Date</th>
                  <th>Doctor's Schedule</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(todaysAppointments) && todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment, index) => (
                    <tr key={appointment.id}>
                      <td>{index + 1}</td>
                      <td>{`${appointment.FIRST_NAME} ${appointment.LAST_NAME}`}</td>
                      <td>{appointment.APPOINTMENT_DATE}</td>
                      <td>{appointment.APPOINTMENT_TIME}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No appointments</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          <div>
            <button className={styles.seeMoreBtn} onClick={() => navigate('../appointments')}>See More</button>
          </div>
          <hr />


          {/* Today's Queue List Table */}
            <h3><b>Today's Queue List</b></h3>
            {loadingQueue ? (
              <p>Loading...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Queue No.</th>
                    <th>Patient Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysQueue && todaysQueue.queues && todaysQueue.queues.length > 0 ? (
                    todaysQueue.queues.map((queue, index) => (
                      <tr key={`${todaysQueue.queueManagementId}-${index}`}>
                        <td>{queue.queueNumber}</td>
                        <td>{queue.patientName}</td>
                        <td>{queue.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center' }}>No queue entries</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <button className={styles.seeMoreBtn} onClick={() => navigate('../queuelist')}>See More</button>
          </div>
        
      </div>

      <div className={styles.notifications}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3><b>Notifications</b></h3>
          <div style={{ position: 'relative', marginLeft: '10px' }}>
            <Notifications style={{ fontSize: '35px', marginTop:'-40%', color: newNotification ? 'red' : 'gray' }} />
            {unreadNotificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-68%',
                right: '-22.5%',
                background: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '12px',
              }}>
                {unreadNotificationCount}
              </span>
            )}
          </div>
        </div>
        {displayedNotifications.length > 0 ? (
          <ul>
          {displayedNotifications.map((notification) => (
            <li 
              key={notification.id} 
              style={{
                ...getNotificationStyle(notification.TYPE), 
                fontWeight: notification.status === 'unread' ? 'bold' : 'normal'
              }} 
              onClick={() => markNotificationAsRead(notification.id)} 
              className={styles.notificationItem}
            >
              <span style={{ cursor: 'pointer', display: 'block' }}>
                {notification.MESSAGE}
              </span>
              <span 
                onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.id); }} 
                style={{ cursor: 'pointer', margin:'-23px 0', float: 'right', color:'red'}} 
                title="Delete Notification"
              >
                <Delete />
              </span>
            </li>
          ))}
        </ul>
        ) : (
          <p>No new notifications</p>
        )}
        {/* Navigation buttons for notifications */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <button 
            onClick={handlePreviousPage} 
            disabled={currentNotificationPage === 0}
            className={styles.navigationButton}
          >
            Previous
          </button>
          <button 
            onClick={handleNextPage} 
            disabled={(currentNotificationPage + 1) * notificationsPerPage >= notifications.length}
            className={styles.navigationButton}
          >
            Next
          </button>
        </div>
      </div>

       {/* Third Row: Today's Appointment and Queue List */}
       
       <div className={styles.patientAttended2}>
       <h1>Appointment Chart</h1>
          <div>
            <button className={styles.chartBtn} onClick={() => setPeriod('daily')}>Daily</button>
            <button className={styles.chartBtn} onClick={() => setPeriod('weekly')}>Weekly</button>
            <button className={styles.chartBtn} onClick={() => setPeriod('monthly')}>Monthly</button>
          </div>
          <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;