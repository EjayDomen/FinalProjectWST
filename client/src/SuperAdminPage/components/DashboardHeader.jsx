import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { NavLink } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import { faMagnifyingGlass, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import profileImage from '../images/pookie.jpeg';
import axios from 'axios';
import {  AccountCircle} from '@mui/icons-material';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('');
  const [patientCounts, setPatientCounts] = useState({
    studentCount: 0,
    employeeCount: 0,
    nonAcademicCount: 0,
    activePatientCount: 0,
    deletedPatientCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [],
  });

  const fetchChartData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/requestCount/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      const data = response.data;
  
      setLineData({
        labels: data.labels ?? ['1', '2', '3', '4', '5', '6', '7', '8', '9'], // Default labels
        datasets: [
          {
            label: 'Day',
            data: data.day ?? [0, 0, 0, 0, 0, 0, 0, 0, 0], // Default values
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Week',
            data: data.week ?? [0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Month',
            data: data.month ?? [0, 0, 0, 0, 0, 0, 0, 0, 0],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            tension: 0.3,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };
  
  useEffect(() => {
    fetchChartData();
  }, []);
  
  
  // Call fetchChartData("day") or fetchChartData("week") based on selection
  

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [patientTypeResponse, patientStatusResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/countPatient/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/activePatient/`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        // Update state with fetched data
        setPatientCounts({
          patientCount: patientTypeResponse.data.patient_count,
          staffsCount: patientTypeResponse.data.staffs_count,
          medicalrecordCount: patientTypeResponse.data.medicalrecord_count,
          requestCount: patientTypeResponse.data.request_count,
          activePatientCount: patientStatusResponse.data.active_patient_count,
          deletedPatientCount: patientStatusResponse.data.deleted_patient_count,
        });
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })); // Updated date format
    };

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/superadmin/me/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assuming token-based authentication
          }
        });
        const secretary = response.data;
    
        // Safely construct the full name
        const firstName = secretary.first_name || "";
        const lastName = secretary.last_name || "";
        
        setUserName(`${firstName} ${lastName}`.trim()); // Use trim() to remove any extra spaces
      } catch (error) {
        console.error('Error fetching profile:', error);
        // navigate('/');
      }
    };

    fetchCounts();
    updateDateTime();
    fetchProfile();
  }, []);

  const lineData1 = {
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Day',
        data: [20, 40, 35, 50, 45, 60, 70, 65, 80],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Week',
        data: [15, 30, 25, 40, 35, 50, 55, 60, 70],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Month',
        data: [10, 20, 15, 30, 25, 35, 40, 45, 50],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
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
        data: [patientCounts?.activePatientCount ?? 0, patientCounts?.deletedPatientCount ?? 0],
        backgroundColor: ['#2563EB', '#E5E7EB'],
        hoverOffset: 4,
      },
    ],
  };
  
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'User Status',
        font: {
          size: 20,
          weight: 'bold',
        },
        color: '#1E293B',
      },
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 15,
          boxWidth: 20,
        },
      },
      datalabels: { 
        color: '#00000',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: (value) => value.toFixed(0), // Display whole number instead of percentage
      },
    },
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard">
      <main className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <p className="current-time">{currentTime}</p>
            <p className="current-date">{currentDate}</p>
          </div>
          <div className="header-right">
            <div className="profile-icon-container">
              <NavLink to="/superadmin/userprofile" className="profile-nav">
                <AccountCircle style={{ fontSize: '60px', padding: '10px', cursor: 'pointer', color: 'gray' }} />
                <div className="user-avatar">{userName}</div>
              </NavLink>
            </div>
          </div>
        </div>

        {/* Stats */}
        {/* Queue List */}
        <div className="stats-section">
          <h1 className="dashboard-title" style={{padding:"20px"}}>Dashboard</h1>
        <div className="stats-container">
          <div className="stats-card" id="stat1" style={{ color: 'white' }}>
            <h3>Request</h3>
            <h1>{patientCounts.requestCount}</h1>
          </div>
          <div className="stats-card" id="stat2" style={{ color: 'white' }}>
            <h3>Medical Records</h3>
            <h1>{patientCounts.medicalrecordCount}</h1>
          </div>
          <div className="stats-card" id="stat3" style={{ color: 'white' }}>
            <h3>Patients</h3>
            <h1>{patientCounts.patientCount}</h1>
          </div>
          <div className="stats-card" id="stat4" style={{ color: 'white' }}s>
            <h3>Staffs</h3>
            <h1>{patientCounts.staffsCount}</h1>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-container">
          <div className="chart-card">
            <Line data={lineData} />
          </div>
          <div className="chart-card">
            <Doughnut data={doughnutData} options={options}/>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

