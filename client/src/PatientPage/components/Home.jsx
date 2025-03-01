import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Notifications } from '@mui/icons-material';
import doctorImage from '../images/doctor.png';
import Modal from '@mui/material/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/HomePatient.css"; // Assuming you have a custom CSS file

const Home = () => {
  const [requests, setRequests] = useState([]);
  const [queueList, setQueueList] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const navigate = useNavigate();

  // Fetch user info
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/patient/me/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setUserId(response.data.id);
        if (response.data.isNewlyRegistered) navigate('/patient/profile');
      })
  }, []);

  useEffect(() => {
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

  return (
    <div className="container">
      {/* Banner */}
      <div className="banner">
        <div className="bannerContent">
          <img src={doctorImage} alt="Doctor Illustration" className="bannerImage" />
            <div className="bannerText">
            <p>
              Make a Request in Queue Care to find the service you are looking for.
            </p>
            <div>
              <Link to="/patient/request" className="findDoctorButton">
                Check the List of Request
              </Link>
            </div>
          </div>
        </div>
      </div>

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
