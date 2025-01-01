import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
  const [user, setUser] = useState(null);
  const [dropdownAnchor, setDropdownAnchor] = useState(null);
  const [queueModalOpen, setQueueModalOpen] = useState(false); // For the queue modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    first_name:'',
    middle_name:'',
    last_name:'',
    suffix:'',
    age:'',
    address:'',
    sex:'',
    contact_number:'',
    purpose:'',
    type:'',
    staff:'n/a',
    appointmentDate: '',
  });
  const [addAppointmentModalOpen, setAddAppointmentModalOpen] = useState(false);
  
  
  const filteredAppointments = appointments
  .filter((appointment) =>
    appointment.appointment_details.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointment_details.appointment_date ?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointment_details.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((appointment) => ({
    id: appointment.appointment_id, // Ensure this is unique for each row
    purpose: `${appointment.appointment_details.purpose}`,
    APPOINTMENT_DATE: appointment.appointment_details.appointment_date,
    Queue: appointment.queue_number || 'N/A',
    STATUS: appointment.appointment_details.status,
  }));


  const handleAddAppointment = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/patient/createAppointment/`,
        newAppointment,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // Handle success case (appointment added successfully)
      setAddAppointmentModalOpen(false);
      setNewAppointment({ appointmentDate: '' });
  
    } catch (error) {
      console.error('Error adding appointment:', error);
  
      // Check if the error is an Axios error and has a response
      if (error.response) {
        const errorData = error.response.data;
  
        // Specific error handling for "user_not_found"
        if (errorData.code === 'user_not_found') {
          alert(errorData.detail); // Show specific message to the user
        } else {
          // Generic error for other responses
          alert('Failed to add appointment. Please try again.');
        }
      } else {
        // If there's no response, it's a network or other issue
        alert('An error occurred. Please check your internet connection and try again.');
      }
    }
  };
  
  
  

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
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);  // Assuming you're storing the entire response data in the user state
        setNewAppointment((prev) => ({
          ...prev,
          first_name: response.data.first_name || '',
          middle_name: response.data.middle_name || '',
          last_name: response.data.last_name || '',
          suffix: response.data.suffix || '',
          age: response.data.age || '',
          address: response.data.address || '',
          sex: response.data.sex || '',
        }));
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/patient/viewAppointment/`, {
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
      field: 'purpose',
      headerName: 'Purpose',
      width: 350,
    },
    { field: 'APPOINTMENT_DATE', headerName: 'Date', width: 200 },
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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchQueue();
  //   }, POLLING_INTERVAL);
  
  //   return () => clearInterval(interval); // Clear the interval on cleanup
  // }, []);

  return (
    
    <Container className='apptcont'>
      <div className="d-flex mb-3 gap-3">
        <div className='searchbar'>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
          <Form.Control
            type="text"
            placeholder="Search Appointment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
        <button
  type="button"
  className="btn btn-primary"
  onClick={() => setAddAppointmentModalOpen(true)}
>
  Add Appointment
</button>
              </div>
      </div>

      <div style={{ height: 650, width: '100%' }}>
        <DataGrid rows={filteredAppointments} columns={columns} pageSize={10} />
      </div>

      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Appointment Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Patient Information */}
    <div style={{ marginBottom: '15px' }}>
      <h5>Patient Information</h5>
      <p><strong>Full Name:</strong> {`${selectedAppointment?.patient_details?.first_name || "N/A"} ${selectedAppointment?.patient_details?.middle_name || ""} ${selectedAppointment?.patient_details?.last_name || "N/A"} ${selectedAppointment?.patient_details?.suffix || ""}`}</p>
      <p><strong>Age:</strong> {selectedAppointment?.patient_details?.age || "N/A"}</p>
      <p><strong>Sex:</strong> {selectedAppointment?.patient_details?.sex || "N/A"}</p>
      <p><strong>Contact Number:</strong> {selectedAppointment?.patient_details?.contact_number || "N/A"}</p>
      <p><strong>Address:</strong> {selectedAppointment?.patient_details?.address || "N/A"}</p>
    </div>
    <Divider />
    {/* Appointment Information */}
    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
      <h5>Appointment Information</h5>
      <p><strong>Appointment ID:</strong> {selectedAppointment?.appointment_id || "N/A"}</p>
      <p><strong>Date:</strong> {selectedAppointment?.appointment_details?.appointment_date || "N/A"}</p>
      <p><strong>Type:</strong> {selectedAppointment?.appointment_details?.type || "N/A"}</p>
      <p><strong>Status:</strong> {selectedAppointment?.appointment_details?.status || "N/A"}</p>
      <p><strong>Purpose:</strong> {selectedAppointment?.appointment_details?.purpose || "N/A"}</p>
      <p><strong>Queue Number:</strong> {selectedAppointment?.queue_number || "N/A"}</p>
    </div>
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

      <Modal show={addAppointmentModalOpen}
  onHide={() => setAddAppointmentModalOpen(false)} centered>



  <Modal.Header closeButton>
    <Modal.Title>Appointment Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* Patient Information */}
    <Form.Group className="mb-3">
      <Form.Label>First Name</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.first_name || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, first_name: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Middle Name</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.middle_name || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, middle_name: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Last Name</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.last_name || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, last_name: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Suffix</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.suffix || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, suffix: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Age</Form.Label>
      <Form.Control 
        type="number" 
        value={newAppointment?.age || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, age: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Address</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.address || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, address: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Sex</Form.Label>
      <Form.Select 
        value={newAppointment?.sex || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, sex: e.target.value })}>
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </Form.Select>
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Contact Number</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.contact_number || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, contact_number: e.target.value })} 
      />
    </Form.Group>

    {/* Appointment Information */}
    <Form.Group className="mb-3">
      <Form.Label>Appointment Date</Form.Label>
      <Form.Control 
        type="date" 
        value={newAppointment?.appointment_date || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, appointment_date: e.target.value })} 
      />
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Purpose</Form.Label>
      <Form.Select 
        value={newAppointment?.purpose || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, purpose: e.target.value })}>
        <option value=""> select</option>
        <option value="consultation"> Consultation</option>
        <option value="certificates"> Certificates</option>
        <option value="others"> Other</option>
        </Form.Select>
    </Form.Group>
    <Form.Group className="mb-3">
      <Form.Label>Type</Form.Label>
      <Form.Control 
        type="text" 
        value={newAppointment?.type || ''} 
        onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })} 
      />
    </Form.Group>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Close</Button>
    <Button variant="primary" onClick={handleAddAppointment}>
      Add Appointment
    </Button>
  </Modal.Footer>
</Modal>
      

      <CancelConfirmationModal
        isOpen={cancelConfirmationOpen}
        onRequestClose={() => setCancelConfirmationOpen(false)}
        onConfirm={handleCancelAppointment}
      />
    </Container>
    
  );
};


export default Appointment;
