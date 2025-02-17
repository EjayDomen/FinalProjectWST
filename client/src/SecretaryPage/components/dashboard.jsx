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
  const [specialization, setSpecialization] = useState(false);
  const [attendedData, setAttendedData] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [loadingQueue, setLoadingQueue] = useState(true); // State for loading the queue
  const [currentNotificationPage, setCurrentNotificationPage] = useState(0); // New state for current page
  const notificationsPerPage = 5; // Limit of notifications per page
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate(); // To navigate to other pages


  // Fetch doctor and appointment count from the backend
  useEffect(() => {
    const fetchDoctorCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/countpatients`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data;
        setDoctorCount(data.total_active_patients); // Update the state with the count
      } catch (error) {
        console.error('Error fetching doctor count:', error);
      }
    };

    const fetchAppointmentCount = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/medicalrecordcount/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = response.data;
        setAppointmentCount(data.total_medical_records); // Update the state with the count
      } catch (error) {
        console.error('Error fetching appointment count:', error);
      } 
    };
    const fetchTodaysAppointments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/showtodayappointment/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/getrecentmedicalrecord/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        setTodaysQueue(response.data);
      } catch (error) {
        console.error('Error fetching today\'s queue:', error);
        //  setQueueError('No queue available for today');
      } finally {
        setLoadingQueue(false);
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
    
        
        setSpecialization(secretary.workposition); // Use trim() to remove any extra spaces
      } catch (error) {
        console.error('Error fetching profile:', error);
        // navigate('/');
      }
    };

    fetchDoctorCount();
    fetchAppointmentCount();
    fetchTodaysAppointments();
    fetchTodaysQueue();
    fetchProfile();
  }, []);



  const fetchPatientsAttended = async (period) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/api/admin/appoinmentCounts/?period=${period}`;
  
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const completedCount = response.data.completed_count;
      if (Array.isArray(completedCount)) {
        setAttendedData(completedCount);
      } else {
        console.error('Invalid data format:', completedCount);
        setAttendedData([]); // Reset to an empty array in case of invalid data
      }
    } catch (error) {
      console.error('Error fetching patients attended data:', error);
    }
  };

  // Call fetchPatientsAttended when the component mounts
useEffect(() => {
  fetchPatientsAttended(period);
}, [period]);





  return (
    <div className={styles.dashboard}>
      {/* Outpatient Department Section */}
      <div className={`${styles.section} ${styles.outpatientDepartment}`}>
        <div className={styles.iconContainer}>
          <img src={building} alt="Building" className={styles.icon} />
        </div>
        <div className={styles.textContainer}>
          <h3>Clinic</h3>
          <p className={styles.roomInfo}>{`${specialization}`}</p>
        </div>
      </div>
      
      {/* Total Appointments Section */}
      <Link to="/secretary/appointments" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={`${styles.section} ${styles.totalAppointments}`}>
          <div className={styles.iconContainer}>
            <img src={calendar} alt="calendar" className={styles.icon} />
          </div>
          <div className={styles.textContainer}>
            <h3>Medical Record</h3>
            <p className={styles.count}>
              {appointmentCount}
              <span style={{ fontSize: '18px', color: '#777', marginLeft: '10px', fontWeight: 'normal' }}>Total Medical Records</span>
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
            <h3>Patients</h3>
            <p className={styles.count}>
              {doctorCount}
              <span style={{ fontSize: '18px', color: '#777', marginLeft: '10px', fontWeight: 'normal' }}>Total Patients</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Second Row: Patient Attended, Notifications */}
      <div className={styles.patientAttended}>
        <div className={styles.tableRow}>
          
        <h3><b>Today's Request</b></h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Patient Name</th>
                  <th>Request Date</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(todaysAppointments) && todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment, index) => (
                    <tr key={appointment.id}>
                      <td>{index + 1}</td>
                      <td>{`${appointment.patientid.first_name} ${appointment.patientid.last_name}`}</td>
                      <td>{appointment.appointment_date}</td>
                      <td>{appointment.purpose}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No request</td>
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
            <h3><b>Recent Medical Record</b></h3>
            {loadingQueue ? (
              <p>Loading...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Date</th>
                    <th>Time Treatment</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysQueue && todaysQueue.recent_medical_records && todaysQueue.recent_medical_records.length > 0 ? (
                    todaysQueue.recent_medical_records.map((records_list, index) => (
                      <tr key={`${todaysQueue.id}-${index}`}>
                        <td>{records_list.patientname}</td>
                        <td>{records_list.date}</td>
                        <td>{records_list.timetreatment}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center' }}>No medical record</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            <button className={styles.seeMoreBtn} onClick={() => navigate('../queue')}>See More</button>
          </div>
        

      </div>

    </div>
  );
};

export default Dashboard;