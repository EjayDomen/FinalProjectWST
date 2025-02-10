import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Container, Row, Col, Form, Table } from 'react-bootstrap';
import { Menu, MenuItem,Typography, Box, IconButton, Divider, TextField } from '@mui/material';
import { Autocomplete, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
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
  const [purpose, setPurpose] = React.useState(""); // Purpose selection
  const [otherPurpose, setOtherPurpose] = React.useState(""); 
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
  const [specificPurpose, setSpecificPurpose] = useState('');
  const [newAppointment, setNewAppointment] = useState({
    first_name:'',
    middle_name:'',
    last_name:'',
    suffix:'',
    age:'',
    birthday:'',
    contactnumber:'',
    requestpurpose:'',
    staff:'n/a',
    requestdate: '',
  });
  const [addAppointmentModalOpen, setAddAppointmentModalOpen] = useState(false);
  

  const handleSpecificPurposeChange = (e) => {
    const value = e.target.value;
    setSpecificPurpose(value);

    // Update the purpose only when "others" is selected
    if (newAppointment.purpose === 'others') {
      setNewAppointment({
        ...newAppointment,
        purpose: `others - ${value}`, // Concatenate the value with "others"
      });
    }
  };
  
  const filteredAppointments = appointments
  .filter((appointment) =>
    appointment.appointment_details.requestpurpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointment_details.requestdate ?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.appointment_details.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((appointment) => ({
    id: appointment.appointment_id, // Ensure this is unique for each row
    purpose: `${appointment.appointment_details.purpose}`,
    requestdate: appointment.appointment_details.appointment_date,
    status: appointment.appointment_details.status,
  }));


  const handleAddAppointment = async () => {
    try {
      const finalPurpose = purpose === 'others' ? `others - ${otherPurpose}` : purpose;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/patient/createAppointment/`,
        {
          ...newAppointment,  // Spread the existing newAppointment object
          purpose: finalPurpose,  // Assign the final purpose value
        },
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
          contactnumber: response.data.contactnumber || '',
          birthday: response.data.birthday || '',
          age: response.data.age || '',
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
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'requestpurpose',
      headerName: 'Purpose',
      width: 350,
    },
    { field: 'requestdate', headerName: 'Date', width: 200 },
    {
      field: 'status',
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
  className="btn btn-success"
  onClick={() => setAddAppointmentModalOpen(true)}
  style={{
    width: '200px'
  }}
>
  + Add Request
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
      <p><strong>birthday:</strong> {selectedAppointment?.patient_details?.birthday || "N/A"}</p>
    </div>
    <Divider />
    {/* Appointment Information */}
    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
      <h5>Appointment Information</h5>
      <p><strong>Request ID:</strong> {selectedAppointment?.request_id || "N/A"}</p>
      <p><strong>Date:</strong> {selectedAppointment?.appointment_details?.requestdate || "N/A"}</p>
      <p><strong>Status:</strong> {selectedAppointment?.appointment_details?.status || "N/A"}</p>
      <p><strong>Purpose:</strong> {selectedAppointment?.appointment_details?.requestpurpose || "N/A"}</p>
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
              <strong>Request Date:</strong>{" "}
              {selectedAppointment.REQUEST_DATE || "N/A"}
            </p>
            {/* <p>
              <strong>Appointment Time:</strong>{" "}
              {selectedAppointment.APPOINTMENT_TIME || "N/A"}
            </p> */}
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

      <Modal
  show={addAppointmentModalOpen}
  onHide={() => setAddAppointmentModalOpen(false)}
  centered
  dialogClassName="custom-modal-width"
>
  <Modal.Header closeButton>
    <Modal.Title>Request Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Row>
        {/* First Column */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.first_name || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, first_name: e.target.value })}
            />
          </Form.Group> 
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.last_name || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, last_name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Birthday</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.birthday || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, birthday: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              className="uniform-input"
              value={newAppointment?.age || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, age: e.target.value })}
            />
          </Form.Group>
        </Col>

        {/* Second Column */}
        <Col md={6}>
        <Form.Group className="mb-3">
            <Form.Label>Middle Name</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.middle_name || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, middle_name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sex</Form.Label>
            <Form.Select
              className="uniform-input"
              value={newAppointment?.sex || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, sex: e.target.value })}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.contact_number || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, contact_number: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Request Date</Form.Label>
            <Form.Control
              type="date"
              className="uniform-input"
              value={newAppointment?.requestdate || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, requestdate: e.target.value })}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Additional Fields in Full Width */}
      <Row>
        <Col md={6}>
        <Form.Group className="mb-3">
      <h5>Purpose:</h5>
      <FormControl component="fieldset" style={{ marginBottom: "20px" }}>
      <RadioGroup
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        >
          <FormControlLabel
            value="consultation"
            control={<Radio />}
            label="Consultation"
          />
          <FormControlLabel
            value="certificate"
            control={<Radio />}
            label="Certificates"
          />
          <FormControlLabel
            value="others"
            control={<Radio />}
            label="Others"
          />
        </RadioGroup>
      </FormControl>

      {purpose === "others" && (
        <TextField
          fullWidth
          margin="normal"
          label="Specify Purpose"
          value={otherPurpose}
          onChange={(e) => setOtherPurpose(e.target.value)}
          required
        />
      )}
    </Form.Group>
        </Col>
        {/* <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control
              type="text"
              className="uniform-input"
              value={newAppointment?.type || ''}
              onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
            />
          </Form.Group>
        </Col> */}
      </Row>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="danger" onClick={() => setIsModalOpen(false)}>Close</Button>
    <Button variant="success" onClick={handleAddAppointment}>
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
