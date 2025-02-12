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
        setAppointmentCount(data.total_appointments); // Update the state with the count
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

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/me/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
          }
        });
        const secretary = response.data;
    
        
        setSpecialization(secretary.specialization); // Use trim() to remove any extra spaces
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


// // Function to prepare chart data based on the selected period
// const prepareChartData = (attendedData, period) => {
//   // Prepare data for the chart based on period
//   const groupedData = attendedData.reduce((acc, item) => {
//     // Get the label based on the period (Month, Week, or Day)
//     const label = period === 'monthly' ? item.month :
//                   period === 'weekly' ? item.week :
//                   item.date;

//     if (!acc[label]) {
//       acc[label] = { Missed: 0, Cancelled: 0, Completed: 0 }; // Initialize counts for each status
//     }


//      // Increment the count based on status
//      if (item.status.toLowerCase()  === 'missed') acc[label].Missed += item.appointmentCount;
//      if (item.status.toLowerCase() === 'cancelled') acc[label].Cancelled += item.appointmentCount;
//      if (item.status.toLowerCase() === 'completed') acc[label].Completed += item.appointmentCount;

//     return acc;
//   }, {});

//   // Convert grouped data into chart-compatible format
//   const labels = Object.keys(groupedData); // X-axis labels (dates/weeks/months)
//   const data = [
//     // Patients with 'Missed' status
//     labels.map(label => groupedData[label].Missed),
//     // Patients with 'Cancelled' status
//     labels.map(label => groupedData[label].Cancelled),
//     // Patients with 'Completed' status
//     labels.map(label => groupedData[label].Completed),
//   ];

//   return {
//     labels,
//     datasets: [
//       {
//         label: 'Missed',
//         data: data[0],
//         borderColor: 'rgba(255, 99, 132, 1)',
//         backgroundColor: 'rgba(255, 99, 132, 0.2)',
//         fill: true,
//       },
//       {
//         label: 'Cancelled',
//         data: data[1],
//         borderColor: 'rgba(255, 159, 64, 1)',
//         backgroundColor: 'rgba(255, 159, 64, 0.2)',
//         fill: true,
//       },
//       {
//         label: 'Completed',
//         data: data[2],
//         borderColor: 'rgba(75, 192, 192, 1)',
//         backgroundColor: 'rgba(75, 192, 192, 0.2)',
//         fill: true,
//       },
//     ],
//   };
// };


const prepareChartData = (attendedData, period) => {
  // Sample data for demonstration
  const sampleData = [
    { date: '2024-01-01', status: 'completed', appointmentCount: 10 },
    { date: '2024-01-01', status: 'missed', appointmentCount: 5 },
    { date: '2024-01-01', status: 'cancelled', appointmentCount: 2 },
    { date: '2024-01-02', status: 'completed', appointmentCount: 8 },
    { date: '2024-01-02', status: 'missed', appointmentCount: 3 },
    { date: '2024-01-02', status: 'cancelled', appointmentCount: 1 },
    { week: 'Week 1', status: 'completed', appointmentCount: 50 },
    { week: 'Week 1', status: 'missed', appointmentCount: 20 },
    { week: 'Week 1', status: 'cancelled', appointmentCount: 10 },
    { month: 'January', status: 'completed', appointmentCount: 200 },
    { month: 'January', status: 'missed', appointmentCount: 80 },
    { month: 'January', status: 'cancelled', appointmentCount: 40 },
  ];

  // Use sample data if no real data is provided
  const dataSource = attendedData.length > 0 ? attendedData : sampleData;

  // Prepare data for the chart based on period
  const groupedData = dataSource.reduce((acc, item) => {
    const label = period === 'monthly' ? item.month :
                  period === 'weekly' ? item.week :
                  item.date;

    if (!acc[label]) {
      acc[label] = { Missed: 0, Cancelled: 0, Completed: 0 }; // Initialize counts for each status
    }

    if (item.status.toLowerCase() === 'missed') acc[label].Missed += item.appointmentCount;
    if (item.status.toLowerCase() === 'cancelled') acc[label].Cancelled += item.appointmentCount;
    if (item.status.toLowerCase() === 'completed') acc[label].Completed += item.appointmentCount;

    return acc;
  }, {});

  // Convert grouped data into chart-compatible format
  const labels = Object.keys(groupedData); // X-axis labels (dates/weeks/months)
  const data = [
    labels.map(label => groupedData[label].Missed),
    labels.map(label => groupedData[label].Cancelled),
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
                  <th>Appointment Date</th>
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
                    <td colSpan="4" style={{ textAlign: 'center' }}>No Request</td>
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
                  {todaysQueue && todaysQueue.queues && todaysQueue.queues.length > 0 ? (
                    todaysQueue.queues.map((queue, index) => (
                      <tr key={`${todaysQueue.qmid}-${index}`}>
                        <td>{queue.queue_number}</td>
                        <td>{queue.patient.first_name}</td>
                        <td>{queue.transaction_type}</td>
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
            <button className={styles.seeMoreBtn} onClick={() => navigate('../queue')}>See More</button>
          </div>
        

      </div>

       {/* Third Row: Today's Appointment and Queue List */}
       
       <div className={styles.patientAttended2}>
       <h1>Requested Chart</h1>
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