import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Modal, Button, Container, Row, Col, Form, Table } from 'react-bootstrap';
import { Menu, MenuItem,Typography, Box, IconButton, Divider } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import CancelConfirmationModal from '../../LoginPage/cancelConfirmationModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/AppointmentPatient.css"; // Assuming you have a custom CSS file
import PatientChat from './PatientChat';
import SuccessModal from '../../SecretaryPage/components/successModal';



const POLLING_INTERVAL = 5000;

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'cancelled':
      return { backgroundColor: '#ef5b5b', color: 'white', padding: '5px', borderRadius: '25px' };
    case 'ongoing':
      return { backgroundColor: 'green', color: 'white', padding: '5px', borderRadius: '25px' };
    case 'in-queue':
      return { backgroundColor: 'lightblue', color: 'black', padding: '5px', borderRadius: '25px' };
    case 'reschedule':
      return { backgroundColor: 'yellow', color: 'black', padding: '5px', borderRadius: '25px' };
    default:
      return { backgroundColor: 'gray', color: 'white', padding: '5px', borderRadius: '25px' };
  }
};

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [queueModalOpen, setQueueModalOpen] = useState(false); // For the queue modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const filteredAppointments = appointments
  .filter((appointment) => {
    const search = searchTerm.toLowerCase();
    return (
      appointment.DoctorName.toLowerCase().includes(search) ||
      appointment.APPOINTMENT_DATE.toLowerCase().includes(search) ||
      appointment.STATUS.toLowerCase().includes(search)
    );
  })
  .map((appointment) => {
    const doctor = appointment.doctor; // Ensure the 'Doctor' object exists
    let doctorName = 'Unknown'; // Default value

    // Check if the 'Doctor' object exists and if its properties are available
    if (doctor) {
      const firstName = doctor.FIRST_NAME || '';
      const middleName = doctor.MIDDLE_NAME ? doctor.MIDDLE_NAME.charAt(0) + '.' : '';
      const lastName = doctor.LAST_NAME || '';
      const suffix = doctor.SUFFIX ? ', ' + doctor.SUFFIX : '';
      doctorName = `${firstName} ${middleName} ${lastName}${suffix}`;
    }

    return {
      ...appointment,
      DoctorNameFull: doctorName, // Correctly assign the doctor's full name
    };
  });

  const [queueDetails, setQueueDetails] = useState({
    queueList: [],
    patientQueueNumber: 'N/A',
    currentDoctorQueue: 'N/A',
    department: 'N/A',
    floor: 'N/A',
    roomNumber: 'N/A',
    date: 'N/A',
    time: 'N/A',
  });
  const navigate = useNavigate();
  const qrRef = useRef(null);

  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/signup/patient/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUserId(response.data.id);
      } catch (error) {
        console.error('Error fetching user info:', error);
        navigate('/');
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/patient/appointment/viewAppointments`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchUserData();
    fetchAppointments();
  }, [navigate]);

  const handleCancelAppointment = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/patient/appointment/${selectedAppointment.id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAppointments((prev) => prev.filter((app) => app.id !== selectedAppointment.id));
      setCancelConfirmationOpen(false);
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const downloadQrCode = () => {
    if (qrRef.current && selectedAppointment) {
      toPng(qrRef.current, { backgroundColor: '#ffffff' })
        .then((dataUrl) => {
          const filename = `QR_${selectedAppointment.id}.png`;
          download(dataUrl, filename);
        })
        .catch((error) => console.error('Error downloading QR code:', error));
    }
  };

  const handleDropdownOpen = (event, appointment) => {
    setDropdownAnchor(event.currentTarget);
    setSelectedAppointment(appointment);
  };

  const handleDropdownClose = () => {
    setDropdownAnchor(null);
  };

  // Open the queue modal
  const handleOpenQueueModal = () => {
    fetchQueue();
    setQueueModalOpen(true);
  };

  // Close the queue modal
  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
  };

  const handleDropdownAction = (action) => {
    if (action === 'view') {
      setQrModalOpen(true);
    } else if (action === 'cancel') {
      setCancelConfirmationOpen(true);
    }
    handleDropdownClose();
  };

  const closeQrModal = () => {
    setQrModalOpen(false);
    setSelectedAppointment(null);
  };

  const columns = [
    { field: 'id', headerName: 'AppID', width: 100 },
    {
      field: 'DoctorNameFull',
      headerName: 'Doctor Name',
      width: 350,
    },
    { field: 'APPOINTMENT_DATE', headerName: 'Date', width: 200 },
    { field: 'APPOINTMENT_TIME', headerName: 'Time', width: 200 },
    {
      field: 'Queue',
      headerName: 'Queue #',
      width: 150,        
    },
    {
      field: 'STATUS',
      headerName: 'Status',
      width: 150,
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={(event) => handleDropdownOpen(event, params.row)}
            className="dropdown-button" // Add this class
          >
            <ArrowDropDownIcon/>
          </IconButton>
          <Menu
            anchorEl={dropdownAnchor}
            open={Boolean(dropdownAnchor)}
            onClose={handleDropdownClose}
            MenuListProps={{
              style: {
                border: '2px solid gray',
                borderRadius: '8px',
                backgroundColor: 'white',
              },
            }}
          >
            <MenuItem onClick={() => handleDropdownAction('view')}>View QR</MenuItem>
            <Divider style={{ margin: '0', color: 'black' }} />
            <MenuItem onClick={() => handleDropdownAction('cancel')} style={{ color: 'red' }}>
              Cancel
            </MenuItem>
          </Menu>
        </>
      ),
    },
  ];
  

   // Fetch queue details
   const fetchQueue = async () => {
    try{
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/patient/queue/current-queue`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const currentDoctorQueue = response.data.queues?.find(queue => queue.queueStatus === 'In')?.queueNumber || 'N/A';
      const department = response.data.queues?.length ? response.data.queues[0].department : 'N/A';
      const floor = response.data.queues?.length ? response.data.queues[0].floor : 'N/A';
      const roomNumber = response.data.queues?.length ? response.data.queues[0].roomNumber : 'N/A';
      const date = response.data.queues?.length ? response.data.queues[0].appointmentDate : 'N/A';
      const time = response.data.queues?.length ? response.data.queues[0].appointmentTime : 'N/A';


      setQueueDetails({
        ...queueDetails,
        queueList: response.data.queueList || [],
        currentDoctorQueue,
        department,
        floor,
        roomNumber,
        date,
        time,
        patientQueueNumber: response.data.patientQueueNumber,
      });

      if(response.data.patientQueueNumber == currentDoctorQueue){
        setShowSuccessModal(true);
      }
    } catch(error){
        console.error('Error fetching user info:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue();
    }, POLLING_INTERVAL);
  
    return () => clearInterval(interval); // Clear the interval on cleanup
  }, []);

  return (
    <Container className='apptcont'>
      <div className="d-flex mb-3 gap-3">
        <div className='searchbar'>
          <Form.Control
            type="text"
            placeholder="Search Appointment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Button variant="success" onClick={handleOpenQueueModal}>
            Queue List
          </Button>
        </div>
      </div>

      <div style={{ height: 650, width: '100%' }}>
        <DataGrid rows={filteredAppointments} columns={columns} pageSize={10} />
      </div>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Appointment ID:</strong> {selectedAppointment?.id}</p>
          <p><strong>Doctor Name:</strong> {selectedAppointment?.DoctorName}</p>
          <p><strong>Date:</strong> {selectedAppointment?.APPOINTMENT_DATE}</p>
          <p><strong>Time:</strong> {selectedAppointment?.APPOINTMENT_TIME}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

       {/* QR Modal */}
       {qrModalOpen && selectedAppointment && (
  <div className="modal show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Appointment QR</h5>
          <button
            type="button"
            className="btn-close"
            onClick={closeQrModal}
            aria-label="Close"
          ></button>
        </div>
        <div
          className="modal-body"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
          }}
        >
          {/* QR Code Section */}
          <div
            ref={qrRef}
            style={{
              textAlign: "center",
              flex: "1",
              border: "1px solid #ddd",
              padding: "10px",
              borderRadius: "8px",
              background: "#fff",
            }}
          >
            <QRCode value={`${selectedAppointment.id}`} size={150} />
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              Appointment Number: {selectedAppointment.id}
            </p>
          </div>

          {/* Details Section */}
          <div style={{ flex: "2" }}>
            <h5>DETAILS</h5>
            <p>
              <strong>Patient Name:</strong>{" "}
              {selectedAppointment.FIRST_NAME || "N/A"}{" "}
              {selectedAppointment.LAST_NAME || "N/A"}
            </p>
            {selectedAppointment.Doctor && (
              <p>
                <strong>Doctor's Name:</strong>{" "}
                {`${selectedAppointment.Doctor.FIRST_NAME || ""} ${
                  selectedAppointment.Doctor.LAST_NAME || ""
                }`}
              </p>
            )}
            <p>
              <strong>Appointment Date:</strong>{" "}
              {selectedAppointment.APPOINTMENT_DATE || "N/A"}
            </p>
            <p>
              <strong>Appointment Time:</strong>{" "}
              {selectedAppointment.APPOINTMENT_TIME || "N/A"}
            </p>
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadQrCode}
          >
            Download
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeQrModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* Success and Error Modals */}
      {showSuccessModal && (
        <SuccessModal
          message="Yay! It's your turn to see the doctor!"
          onClose={() => setShowSuccessModal(false)}
        />
      )}

        {/* Queue Modal */}
        <Modal show={queueModalOpen} onHide={handleCloseQueueModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Queue List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
            <div style={{ marginBottom: '20px', width: '100%' }}>
              <h5>Your Queue Number:</h5>
              <div
                style={{
                  backgroundColor: '#aaf7be',
                  color: '#006400',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  width: '60%',
                }}
              >
                {queueDetails.patientQueueNumber}
              </div>
              <h5>Currently with the Doctor:</h5>
              <div
                style={{
                  backgroundColor: '#b0d4ff',
                  color: '#0044cc',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  width: '60%',
                }}
              >
                {queueDetails.currentDoctorQueue}
              </div>
            </div>
            <div style={{ width: '100%' }}>
              <h5>Details:</h5>
              <p>
                <strong>Department:</strong> {queueDetails.department}
              </p>
              <p>
                <strong>Floor:</strong> {queueDetails.floor}
              </p>
              <p>
                <strong>Room Number:</strong> {queueDetails.roomNumber}
              </p>
              <p>
                <strong>Date:</strong> {queueDetails.date}
              </p>
              <p>
                <strong>Time:</strong> {queueDetails.time}
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseQueueModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <CancelConfirmationModal
        isOpen={cancelConfirmationOpen}
        onRequestClose={() => setCancelConfirmationOpen(false)}
        onConfirm={handleCancelAppointment}
      />
      {/* Chat Component */}
      {userId && <PatientChat userId={userId} />}
    </Container>
  );
};

export default Appointment;
