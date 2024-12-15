import React, { useState, useEffect } from 'react';
import { Add, Search, QrCodeScanner, ArrowDropDown } from '@mui/icons-material';
import { Autocomplete, Modal, Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';

import styles from '../styles/queueListSecre.module.css';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import doctorImage from '../images/doc.png'; // Adjust the path based on your component's location
import schedImage from '../images/sched.png';
import QRCodeReader from './QRCodeReader'; // Import QRCodeReader 
import SuccessModal from './successModal.jsx';
import { DataGrid } from '@mui/x-data-grid';
import ErrorModal from './errorModal.jsx';

const Queuelist = () => {
  const { qid } = useParams(); // Get qid from URL params
  const { state } = useLocation(); // Access the passed state
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [queueDetails, setQueueDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(true); // State for loading the queue
  const [queueError, setQueueError] = useState(null); // State for queue error
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for storing search input
  const [openModal, setOpenModal] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    patientName: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    age: '',
    sex: '',
    email: '',
    contactNumber: '',
    address: ''
  });
  // New state to hold the current queue number with status 'In'
  const [currentQueueNumber, setCurrentQueueNumber] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null); // State for selected queue
  const [openPatientModal, setOpenPatientModal] = useState(false); // State for modal visibility
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false); // State
  const [patients, setPatients] = useState([]); // List of patients
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientType, setPatientType] = useState('new'); // 'new' or 'existing'
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  


  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/patients/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }); // Modify the URL to your API endpoint
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };
  const handleSelectPatient = (patient) => {
    // Set formData with selected patient information
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.FIRST_NAME,
      middleName: patient.MIDDLE_NAME,
      lastName: patient.LAST_NAME,
      suffix: patient.SUFFIX,
      age: patient.AGE,
      sex: patient.SEX,
      email: patient.EMAIL,
      contactNumber: patient.CONTACT_NUMBER,
      address: patient.ADDRESS
    });
  };

  const handlePatientTypeChange = (e) => {
    setPatientType(e.target.value);
    setFormData({ // Reset form data when switching between new/existing
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      age: '',
      sex: '',
      email: '',
      contactNumber: '',
      address: ''
    });
    setSelectedPatient(null); // Reset selected patient
  };

  // Fetch patients when modal is opened
  useEffect(() => {
    if (openModal && patientType === 'existing') {
      fetchPatients();
    }
  }, [openModal, patientType]);



  const fetchQueueDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/queues/today/CurrentQueueList`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      // Check if QueueManagement status is 'in-progress'
      if (response.data.status === 'in-progress') {
        setQueueDetails(response.data);
  
        // Find the queue with status 'In' to display the current active queue
        const inQueue = response.data.queues.find(queue => queue.status === 'In');
        setCurrentQueueNumber(inQueue ? inQueue.queueNumber : null);
  
        const formattedTime = response.data.time ? response.data.time.slice(0, 5) : '';
        setFormData((prevData) => ({
          ...prevData,
          appointmentDate: response.data.date || '',
          appointmentTime: formattedTime,
        }));
      } else {
        // Handle cases where the status is not 'in-progress'
        setQueueDetails(null);
        setQueueError('No available queue'); // Display message if no active queue
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching queue details:', err);
      setError('Failed to load queue details');
      setQueueError('No queue available for today');
      setLoading(false);
    } finally {
      setLoadingQueue(false);
    }
  };
  
  useEffect(() => {
    fetchQueueDetails();
  }, [qid]);
  
  const handleRowClick = (queue) => {
    setSelectedQueue(queue);
    setOpenPatientModal(true);
  };

  const handleDetailsCloseModal = () => {
    setOpenPatientModal(false);
    setSelectedQueue(null);
  };

  const handleScanComplete = () => {
    // Close the QR code modal
    closeQRCodeModal();
    // Reload the queue details after a scan
    fetchQueueDetails();
  };

  const toggleDropdown = (rowId, event) => {
    event.stopPropagation();

    // If rowId is null, do not toggle anything
    if (rowId === 0) {
      return;
    }

    // Check if the dropdown is currently open for this row
    setDropdownOpen((prev) => (prev === rowId ? null : rowId));
  };
  

  const handleDropdownAction = async (action, rowId, queueManagementId) => {
    const newStatus =
      action === 'Complete' ? 'Completed' :
        action === 'Missed' ? 'Missed' :
          action === 'In' ? 'In' :
            'Cancelled';

    try {
      // Update the current queue's status
      await axios.post(`${process.env.REACT_APP_API_URL}/secretary/queues/queue/changeStatus`, {
        queueNumber: rowId,
        queueManagementId,
        newStatus,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });


      // Update the queue details locally without a full refresh
      setQueueDetails((prevDetails) => {
        const updatedQueues = prevDetails.queues.map((queue) => {
          // Update the status of the changed queue
          if (queue.queueNumber === rowId) {
            return { ...queue, status: newStatus };
          }
          return queue;
        });

        // Find the next queue's index
        const nextQueueIndex = updatedQueues.findIndex(queue => queue.queueNumber === rowId) + 1;

        // Update the next queue's status if it exists and is not already 'Completed'
        if (nextQueueIndex < updatedQueues.length) {
          const nextQueue = updatedQueues[nextQueueIndex];
          if (nextQueue && nextQueue.status !== 'Completed') {
            nextQueue.status = 'In'; // Change next queue status to 'In'

            // Update the next queue's status on the server
            axios.post(`${process.env.REACT_APP_API_URL}/secretary/queues/queue/changeStatus`, {
              queueNumber: nextQueue.queueNumber, // Use the correct queue number
              queueManagementId,
              newStatus: nextQueue.status,
            }, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }).catch(error => {
              console.error(`Failed to update next queue status:`, error);
            });
          }
        }

        // Return the updated state with the changed queue at the bottom
        return {
          ...prevDetails,
          queues: updatedQueues, // Return the updated queues array
        };
      });

      setDropdownOpen(null); // Close dropdown after action
      fetchQueueDetails(); // Refresh the queue details if needed
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };




  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      // Prepare form data, setting missing fields to null if not provided
      const dataToSend = {
        doctor_id: queueDetails.doctorId || null,
        schedule_id: queueDetails.scheduleId || null,
        DATE: queueDetails.date || null,
        FIRST_NAME: formData.firstName || null,
        MIDDLE_NAME: formData.middleName || null,
        LAST_NAME: formData.lastName || null,
        SUFFIX: formData.suffix || 'N/A',
        ADDRESS: formData.address || null,
        AGE: formData.age || null,
        SEX: formData.sex || 'N/A',
        CONTACT_NUMBER: formData.contactNumber|| null,
        EMAIL: formData.email,
      };

      // Send data to the backend to join the queue
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/secretary/appointments/joinQueue`, dataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Handle successful submission
      console.log('Joined queue successfully:', response.data);
      setSuccessModalOpen(true);
      setSuccessMessage('Walk-in successfully joined the queue');
      handleCloseModal(); // Close the modal on success
      fetchQueueDetails();
    } catch (error) {
      console.error('Error joining queue:', error);
      setErrorModalMessage(error.response?.data?.error || 'Failed to add walk-in. Please try again later.');
      setErrorModalOpen(true);
    }
  };
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false); // Close success modal
    setSuccessMessage('');
  };

  const handleChange2 = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };


  if (loading) return <div>Loading...</div>;
  if (queueError) return (
    <div className={styles.centeredError}>
      <h2>{queueError}</h2>
    </div>
  );

  // Sort the queue details: non-zero queue numbers first, then zero queue numbers
 const sortedQueues = queueDetails?.queues
  ? [...queueDetails.queues].sort((a, b) => {
      if (a.queueNumber === 0) return 1;
      if (b.queueNumber === 0) return -1;
      return a.queueNumber - b.queueNumber;
    })
  : [];

  const columns = [
    { field: 'queueNumber', headerName: 'Queue No.', width: 180 },
    { field: 'patientName', headerName: 'Patient Name', width: 300 },
    { field: 'date', headerName: 'Date', width: 250 },
    { field: 'type', headerName: 'Type', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 250,
      renderCell: (params) => (
        <span>
          {params.row.status}
        </span>
      )
    },
    // { 
    //   field: 'status', 
    //   headerName: 'Status', 
    //   width: 200
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 70,
      sortable: false,
      renderCell: (params) => (
        <div>
          <ArrowDropDown
            onClick={(event) => {
              event.stopPropagation();
              if (params.row.queueNumber !== 0) {
                toggleDropdown(params.row.queueNumber, event);
              }
            }}
            style={{ cursor: 'pointer' }}
          />
          {dropdownOpen === params.row.queueNumber && (
            <div className={styles.dropdown}>
              {['Complete', 'Missed', 'Cancelled', 'In'].map((action) => (
                <div
                  key={action}
                  className={styles.dropdownItem}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDropdownAction(action, params.row.queueNumber, queueDetails.queueManagementId);
                  }}
                >
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
  ];
  
  const filteredQueues = sortedQueues.filter((queue) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (
      queue.patientName.toLowerCase().includes(lowerCaseSearchTerm) ||
      (queue.queueNumber && queue.queueNumber.toString().includes(lowerCaseSearchTerm)) ||
      queue.type.toLowerCase().includes(lowerCaseSearchTerm)
    );
  });

  const rows = filteredQueues.map((queue, index) => ({
    id: `${queueDetails.queueManagementId}-${index}`,
    queueNumber: queue.queueNumber,
    patientName: queue.patientName,
    date: queueDetails.date,
    time: queueDetails.time,
    type: queue.type,
    age: queue.age,
    address: queue.address,
    contactNumber: queue.contactNumber,
    status: queue.status,
  }));

  // Define open and close modal functions here
  const openQRCodeModal = () => setIsQRCodeModalOpen(true);
  const closeQRCodeModal = () => setIsQRCodeModalOpen(false);


  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#98fb98', color: '#19A519', fontWeight: 500, padding: '2px 5px', borderRadius: '10px', width: '100px' }; // Added padding and border radius
      case 'Missed':
        return { backgroundColor: '#ff6f00', color: '	#633a00', fontWeight: 500, padding: '2px 5px', borderRadius: '10px', width: '100px' };
      case 'Cancelled':
        return { backgroundColor: '#ffc0cb', color: '#f70d1a', fontWeight: 500, padding: '2px 5px', borderRadius: '10px', width: '100px' };
      case 'In':
        return { backgroundColor: '#78FCC5', color: '#1F322A', fontWeight: 500, padding: '2px 5px', borderRadius: '10px', width: '100px' };
      case 'waiting':
        return { backgroundColor: '#D3D3D3', color: '#808080', fontWeight: 500, padding: '2px 5px', borderRadius: '10px', width: '100px' };
      default:
        return {};
    }
  };

  return (
    <div className={styles.doctorsSection}>
      {/* Doctors Section */}
      <div className={styles.doctorsHeader}>
        <div className={styles.doctorDetailsContainer}>
          {queueDetails !== null ? (
            <>
              <h2>Doctor: {queueDetails.doctorName}</h2>
              <div style={{ marginLeft: '15px' }}>
                <p>Specialty: {queueDetails.specialty}</p>
                <p>Date: {queueDetails.date}</p>
                <p>Time: {queueDetails.time}</p>
                <p>Status: {queueDetails.status}</p>
              </div>
            </>
          ) : (
            <>
            <h2>Doctor: No queue available</h2>
            <div style={{ marginLeft: '15px' }}>
              <p>Specialty: No queue available</p>
              <p>Date: No queue available</p>
              <p>Time: No queue available</p>
              <p>Status: No queue available</p>
            </div>
            </>
          )}
        </div>
        {/* New Container for Current Queue Number with Status 'In' */}
        <div className={styles.currentQueueContainer}>
          {currentQueueNumber !== null ? (
            <div className={styles.queueInfo}>
              <p className={styles.queueLabel}>Current Queue Number:</p>
              <span className={styles.queueNumber}>{currentQueueNumber}</span>
            </div>
          ) : (
            <p className={styles.noQueueMessage}>No current queue</p>
          )}
        </div>

        {/* QR Code Reader Modal */}
        {isQRCodeModalOpen && (
          <div className={styles.modalOverlay} style={{zIndex:'10'}}>
            <div className={styles.modalContainer}>
              <QRCodeReader onScanComplete={handleScanComplete} />
              <button className={styles.closeModalButton} onClick={closeQRCodeModal}>&times;</button>
            </div>
          </div>
        )}

        <div style={{ float: 'right',display:'inline-grid', gap: '30%', marginTop:'-5%'}}>
      {/* Button to open QRCodeReader modal */}
          <button className={styles.addDoctorBtn} style={{backgroundColor: '#3788d8'}}onClick={openQRCodeModal}>
          <QrCodeScanner style={{ fontSize: '30px'}} />
            QR Scanner
          </button>
          <button className={styles.addDoctorBtn} onClick={handleOpenModal}>
            <Add style={{ fontSize: '30px'}} /> Walk-ins
          </button>
        </div>
    </div>

    <div className={styles.searchAppointment}>
        <div style={{display: 'flex'}}>
           <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* DataGrid */}
    {loadingQueue ? (
      <p>Loading...</p>
    ) : queueError ? (
      <p>{queueError}</p>
    ) : (
      /* DataGrid */
      <div style={{ height: 600, width: '100%', marginTop: '-1%' }}>
        <DataGrid sx={{ height: 600, width: '100%', cursor:'pointer' }}
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          getRowClassName={(params) =>
            params.index % 2 === 0 ? styles.evenRow : styles.oddRow
          }
          onRowClick={(params) => handleRowClick(params.row)}
          className={styles.table}
        />
      </div>
     )}
     </div>

      {/* Modal to display queue details */}
      <Modal
        open={openPatientModal}
        onClose={handleDetailsCloseModal}
        aria-labelledby="queue-details-modal"
        aria-describedby="modal-to-show-queue-details"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: '10px',
          }}
        >
          {selectedQueue && (
            <>
              <h2>Queue # {selectedQueue.queueNumber}</h2>
              <span onClick={handleDetailsCloseModal} style={{ fontSize: '45px', fontWeight: 600, cursor: 'pointer', marginTop: '-20%', float: 'right' }}>&times;</span>
              <hr />
              <h3 style={{ marginLeft: '-5px' }}>Patient Details</h3>
              <p><strong>Patient Name:</strong> {selectedQueue.patientName}</p>
              <p><strong>Age:</strong> {selectedQueue.age}</p>
              <p><strong>Contact No.:</strong> {selectedQueue.contactNumber}</p>
              <p><strong>Address:</strong> {selectedQueue.address}</p>
              <p><strong>Type:</strong> {selectedQueue.type}</p>
              <hr />
              <h3 style={{ marginLeft: '-5px' }}>Appointment Details</h3>
              <p><strong>Doctor:</strong> {queueDetails.doctorName}</p>
              <p><strong>Specialty:</strong> {queueDetails.specialty}</p>
              <p><strong>Date:</strong> {queueDetails.date}</p>
              <p><strong>Time:</strong> {queueDetails.time}</p>
            </>
          )}
        </Box>
      </Modal>

      {/* Modal for Join Queue */}
      <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="join-queue-modal"
      aria-describedby="modal-to-join-queue"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '60%',
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          borderRadius: '10px',
          boxShadow: 24,
          overflowY:'scroll',
          p: 4,
        }}
      >
        <button  style={{ top: '1%', right: '2%'}} className={styles.closeModalButton} onClick={handleCloseModal}>&times;</button>
        <h3 id="join-queue-modal-title">Walk-in patient form:</h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
            flex: '2',
            marginRight: '20px',
            height: '120px'
          }}>
            <div style={{ marginRight: '10px' }}>
              <img src={doctorImage} alt="Doctor" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            </div>
            <div>
              <h4>{`Doctor: ${queueDetails.doctorName} - ${queueDetails.specialty}`}</h4>
            </div>
          </div>
        </div>

        <h5>Select Patient Type:</h5>
        <FormControl component="fieldset">
          <RadioGroup
            row
            value={patientType}
            onChange={handlePatientTypeChange}
          >
            <FormControlLabel value="new" control={<Radio />} label="New Patient" />
            <FormControlLabel value="existing" control={<Radio />} label="Existing Patient" />
          </RadioGroup>
        </FormControl>

        {patientType === 'existing' && (

          //dropdown
          // <>
          //   <h5>Select Existing Patient:</h5>
          //   <FormControl fullWidth margin="normal">
          //     <InputLabel>Search Patient</InputLabel>
          //     <Select
          //       value={selectedPatient ? selectedPatient.id : ''}
          //       onChange={(e) => handleSelectPatient(patients.find(p => p.id === e.target.value))}
          //       displayEmpty
          //     >
          //       <MenuItem value="" disabled></MenuItem>
          //       {patients.map((patient) => (
          //         <MenuItem key={patient.id} value={patient.id}>
          //           {`${patient.FIRST_NAME} ${patient.LAST_NAME}`}
          //         </MenuItem>
          //       ))}
          //     </Select>
          //   </FormControl>
          // </>

          //searchable
          <>
            <h5>Select Existing Patient:</h5>
            <Autocomplete
              fullWidth
              margin="normal"
              options={patients}
              getOptionLabel={(option) => `${option.FIRST_NAME} ${option.LAST_NAME}`}
              value={selectedPatient || null}
              onChange={(e, newValue) => handleSelectPatient(newValue)}
              renderInput={(params) => <TextField {...params} label="Search Patient" />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </>
        )}

        <h5>Patient Information:</h5>
        <form>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              margin="normal"
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '250px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Suffix"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              margin="normal"
              style={{ width: '145px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
              required
              style={{ width: '100px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <div style={{ display: 'block', marginTop: '-0.7%' }}>
              <label htmlFor="gender">Gender:</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
                disabled={patientType === 'existing'} // Disable if it's an existing patient
              >
                <option value="" disabled>Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              fullWidth
              style={{ width: '340px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              margin="normal"
              fullWidth
              style={{ width: '300px' }}
              disabled={patientType === 'existing'} // Disable if it's an existing patient
            />
          </div>

          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={2}
            style={{ marginBottom: '20px' }}
            disabled={patientType === 'existing'} // Disable if it's an existing patient
          />

          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '5px', marginBottom: '20px' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              style={{
                backgroundColor: '#13C82E',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 20px',
                width: '30%',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              Confirm
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
            {errorModalOpen && (
                <ErrorModal
                  message={errorModalMessage}
                  onClose={() => setErrorModalOpen(false)}
                />
                
              )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />
            )}
    </div>
  );
};

export default Queuelist;
