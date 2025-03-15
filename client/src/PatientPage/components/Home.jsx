import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Notifications } from '@mui/icons-material';
import doctorImage from '../images/doctor.png';
import { Grid, Typography, Button, Card, CardContent } from "@mui/material";
import Modal from '@mui/material/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/HomePatient.css"; // Assuming you have a custom CSS file
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

const fetchTreatmentSummary = async (view) => {
  try {
    const token = localStorage.getItem("token"); // Get token from local storage
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/treatment-summary/${view}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching treatment summary:", error);
    return [];
  }
};


const Home = () => {
  const [requests, setRequests] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [user , setUser] = useState("")
  const navigate = useNavigate();
  const [treatmentStats, setTreatmentStats] = useState({ monthly: 0, yearly: 0 });
  const [view, setView] = useState("monthly"); // Toggle between monthly and yearly
  const [treatmentData, setTreatmentData] = useState([]);


  const data = [
    { name: "Treatments", count: view === "monthly" ? treatmentStats.monthly : treatmentStats.yearly },
  ];

  // Fetch user info
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/patient/me/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setUser(response.data);
        if (response.data.isNewlyRegistered) navigate('/patient/profile');
      })

      const fetchRequests = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/viewAppointment`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setRequests(response.data);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      };
      fetchRequests();
  }, []);


  useEffect(() => {
    const loadSummary = async () => {
      const data = await fetchTreatmentSummary(view);
      setTreatmentData(data);
    };
    loadSummary();
  }, [view]);


  const handleOpenAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setSelectedAppointment(null);
    setOpenAppointmentModal(false);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Function to convert 24-hour time to 12-hour format with AM/PM
  const convertToStandardTime = (time) => {
    const [hours, minutes] = time.split(':'); // Split hours and minutes
    const hours12 = (hours % 12) || 12; // Convert hours to 12-hour format
    const ampm = hours < 12 ? 'AM' : 'PM'; // Determine AM/PM
    return `${hours12}:${minutes} ${ampm}`; // Return formatted time
  };

  // Format data for chart
  const formatData = treatmentData.map((item) => ({
    name: view === "monthly"
      ? new Date(item.date__year, item.date__month - 1).toLocaleString("default", { month: "long" }) 
      : item.date__year.toString(),
    count: item.count,
  }));

  return (
    <div className="container">
       {/* Patient Information (Left Side on Desktop, Top on Mobile) */}
       <Grid item xs={12} md={4}>
        <Card sx={{ padding: 2, textAlign: "center" }}>
          <img 
            src={`${process.env.REACT_APP_API_URL}${user?.patientprofile}` || doctorImage}
            alt="Patient" 
            style={{ width: 120, height: 120, borderRadius: "50%" }} 
          />
          <Typography variant="h6">
            {user ? `${user.first_name} ${user.middle_name || ""} ${user.last_name} ${user.suffix || ""}` : "Loading..."}
          </Typography>
          <Typography>Age: {user?.age || "N/A"}</Typography>
          <Typography>Gender: {user?.sex || "N/A"}</Typography>
          <Typography>Email: {user?.email || "N/A"}</Typography>
          <Typography>Treatments this month: {treatmentStats.monthly}</Typography>
          <Typography>Treatments this year: {treatmentStats.yearly}</Typography>
          <Button variant="contained" sx={{ marginTop: 2 }} href="/patient/profile">View Profile</Button>
        </Card>
      </Grid>

      {/* Treatment Chart (Right Side on Desktop, Bottom on Mobile) */}
      <Grid item xs={12} md={8}>
        <Card sx={{ padding: 2 }}>
          <Typography variant="h6">Treatment Statistics</Typography>
          <Button variant="contained" onClick={() => setView("monthly")} sx={{ marginRight: 1 }}>Monthly</Button>
          <Button variant="contained" onClick={() => setView("yearly")}>Yearly</Button>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
      
      {/* Appointments and Notifications */}
  <div className="row g-4 mt-4">
    {/* Appointments Section */}
    <div className="col-lg-8">
      <div className="bg-white p-4 rounded shadow-sm">
        <h2 className="fw-bold">Requests</h2>
        <table className="table mt-3">
          <thead>
            <tr>
              <th>ReqId</th>
              <th>Purpose</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((appointment) => (
                <tr key={appointment.id}>
                  {/* <td>{appointment.id}</td>
                  <td>{appointment.doctor.LAST_NAME}</td>
                  <td>{new Date(appointment.APPOINTMENT_DATE).toLocaleDateString()}</td>
                  <td>{convertToStandardTime(appointment.APPOINTMENT_TIME)}</td>  Convert time to standard format */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No Request found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
          <div>
            <button className="seeMoreBtn" onClick={() => navigate('../appointment')}>See More</button>
          </div>
      </div>
    </div>

  
  {/* Date & Time */}
  <div className="col-lg-4">
    <div className="bg-white p-4 rounded shadow-sm text-center">
      <p className="display-1 fw-bold">{currentTime}</p>
      <p className="fs-4">{currentDate}</p>
    </div>
  </div>
  </div>



      {/* Appointment Modal */}
      <Modal open={openAppointmentModal} onClose={handleCloseAppointmentModal}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Appointment Details</h5>
              <button className="btn-close" onClick={handleCloseAppointmentModal}></button>
            </div>
            <div className="modal-body">
              {selectedAppointment && (
                <>
                  <p>ID: {selectedAppointment.id}</p>
                  <p>
                    Doctor: Dr. {selectedAppointment.doctor.FIRST_NAME} {selectedAppointment.doctor.LAST_NAME}
                  </p>
                  <p>Expertise: {selectedAppointment.doctor.EXPERTISE}</p>
                  <p>
                    Date: {new Date(selectedAppointment.APPOINTMENT_DATE).toLocaleDateString()}
                  </p>
                  <p>Time: {selectedAppointment.APPOINTMENT_TIME}</p>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseAppointmentModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
