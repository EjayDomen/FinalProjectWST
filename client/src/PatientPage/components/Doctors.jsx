import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Button, Container, Row, Col, Form, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import doc from "../images/doc.png";
import PatientChat from './PatientChat';
import SuccessModal from '../../SecretaryPage/components/successModal';
import ErrorModal from '../../SecretaryPage/components/errorModal.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/DoctorsPatient.css';

Modal.setAppElement('#root');

// Utility function to convert 24-hour time to 12-hour time
const convertToStandardTime = (time) => {
  const [hour, minute] = time.split(':');
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const standardHour = h % 12 || 12; // Converts '0' hour to '12'
  return `${standardHour}:${minute} ${suffix}`;
};

const DoctorList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    contactNumber: '',
    civilStatus: '',
    address: '',
    additionalNotes: '',
  });
  const [userId, setUserId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/signup/patient/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        const userData = response.data;
        setUserId(userData.userId || userData.id || null); // Set userId from API response
        setPatientInfo((prev) => ({
          ...prev,
          lastName: userData.LAST_NAME || '',
          firstName: userData.FIRST_NAME || '',
          middleName: userData.MIDDLE_NAME || '',
          suffix: userData.SUFFIX || '',
          dateOfBirth: userData.BIRTHDAY || '',
          age: calculateAge(userData.BIRTHDAY),
          gender: userData.SEX || '',
          contactNumber: userData.CONTACT_NUMBER || '',
          civilStatus: userData.CIVIL_STATUS || '',
          address: userData.ADDRESS || '',
          additionalNotes: '',
          // Vaccination details
          firstDoseBrand: userData.FIRST_DOSE_BRAND || '',
          firstDoseDate: userData.FIRST_DOSE_DATE || '',
          secondDoseBrand: userData.SECOND_DOSE_BRAND || '',
          secondDoseDate: userData.SECOND_DOSE_DATE || '',
          boosterBrand: userData.BOOSTER_BRAND || '',
          boosterDate: userData.BOOSTER_DATE || '',
        }));
      })
      .catch((error) => {
        console.error("Error fetching patient data:", error);
      });
  }, []);
  
  
  
  // Utility function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Handle changes to dateOfBirth and update age dynamically
  const handleDateOfBirthChange = (value) => {
    setPatientInfo((prev) => ({
      ...prev,
      dateOfBirth: value,
      age: calculateAge(value), // Update age automatically
    }));
  };
  

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/patient/doctors/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((response) => {
        setDoctors(response.data);
        setFilteredDoctors(response.data);
      })
      .catch((error) => console.error('Error fetching doctors:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
  
    const filtered = doctors.filter((doctor) => {
      // Check if doctor name or expertise matches the search query
      const matchesDoctorDetails =
        `${doctor.FIRST_NAME} ${doctor.LAST_NAME}`.toLowerCase().includes(query) ||
        doctor.EXPERTISE.toLowerCase().includes(query);
  
      // Check if any schedule matches the search query
      const matchesSchedule = doctor.schedules?.some((schedule) => {
        const dayMatch = schedule.DAY_OF_WEEK.toLowerCase().includes(query);
        const timeMatch =
          convertToStandardTime(schedule.START_TIME).toLowerCase().includes(query) ||
          convertToStandardTime(schedule.END_TIME).toLowerCase().includes(query);
        return dayMatch || timeMatch;
      });
  
      return matchesDoctorDetails || matchesSchedule;
    });
  
    setFilteredDoctors(filtered);
  };
  

  const handleCheckAvailability = (doctor) => {
    setSelectedDoctor(doctor);
    fetchDoctorSchedule(doctor.id);
    setIsScheduleModalOpen(true);
  };

  // Function to fetch doctor's schedule
  const fetchDoctorSchedule = async (doctorId) => {
    try {
      // Fetch the doctor's schedule data first
      const scheduleResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/patient/doctors/getDoctorSchedule/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // Map the schedule data and check availability of slots
      const eventData = await Promise.all(
        scheduleResponse.data.map(async (event) => {
          // Extract event details
          const { schedule_id, slot_count, day_of_week, start_time, end_time, Doctor } = event;
           // Calculate the next occurrence of the specific day_of_week
           const currentDate = new Date();

           // Convert the current date to Manila timezone
           const manilaDate = new Date(
             currentDate.toLocaleString("en-US", { timeZone: "Asia/Manila" })
           );
           
           const currentDay = manilaDate.getDay(); // Get the current day of the week (0-6)
           const targetDay = day_of_week; // Assuming `day_of_week` is in 0 (Sunday) to 6 (Saturday) format
           
           // Determine how many days to add to the current date
           const daysToAdd = (targetDay - currentDay + 7) % 7;
           
           const scheduleDate = new Date(manilaDate); // Clone the Manila date
           scheduleDate.setDate(manilaDate.getDate() + daysToAdd);
  
          // Fetch the count of appointments for the specific schedule and date
          const countResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/patient/doctors/appointments/count/${doctorId}/${schedule_id}/${scheduleDate.toISOString().split('T')[0]}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
  
          // Check if the available slots are full
          const isFull = countResponse.data.appointmentCount >= slot_count;
          const countSlot = slot_count - countResponse.data.appointmentCount;
  
          return {
            ...event,
            id: schedule_id,
            title: isFull ? `${event.title} - No available slots` : `${event.title}, ${event.HPA} Available slots: ${countSlot} `, // Add label if full
            backgroundColor: isFull ? 'rgba(255, 0, 0, 0.7)' : 'rgba(10, 193, 28, 0.5)', // Red for full, green otherwise
            extendedProps: {
              specialization: event.expertise,
              clickable: !isFull, // Add clickable property
              slots: countSlot,
            },
            daysOfWeek: [event.day_of_week],
            startTime: start_time, 
            endTime: end_time,
            startRecur: scheduleDate.toISOString().split('T')[0],
            endRecur: null,
          };
        })
      );
  
      // Set calendar events
      setCalendarEvents(eventData);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };
  

  const handleEventClick = (eventInfo) => {
    setSelectedEvent(eventInfo.event);
    const { startStr, extendedProps } = eventInfo.event;

    // Prevent interaction for schedules with no available slots
  if (extendedProps.clickable === false) {
    setErrorMessage('This schedule is fully booked and cannot be selected.');
    setShowErrorModal(true)
    return;
  }
  
    // Update selected date and time
    setSelectedDate(startStr.split('T')[0]);
    setSelectedTime(`${convertToStandardTime(extendedProps.start_time)} - ${convertToStandardTime(extendedProps.end_time)}`);
  
    // Pre-fill patientInfo with user's information and schedule details
    setPatientInfo((prev) => ({
      ...prev,
      scheduleId: eventInfo.event.id,
      appointmentDate: startStr.split('T')[0],
      appointmentTime: `${convertToStandardTime(extendedProps.start_time)} - ${convertToStandardTime(extendedProps.end_time)}`,
      doctorId: selectedDoctor.id, // Include the selected doctor's ID
      lastName: prev.lastName || '', // Pre-fill with fetched user data
      firstName: prev.firstName || '',
      middleName: prev.middleName || '',
      suffix: prev.suffix || '',
      dateOfBirth: prev.dateOfBirth || '',
      age: prev.age || '',
      gender: prev.gender || '',
      contactNumber: prev.contactNumber || '',
      civilStatus: prev.civilStatus || '',
      address: prev.address || '',
      additionalNotes: '', // Optional field
    }));
  
    setIsFormModalOpen(true);
    setIsScheduleModalOpen(false);
  };
  

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedDoctor(null);
    setCalendarEvents([]);
  };

 // Function to handle form submission
 const handleFormSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting patientInfo:', patientInfo); // Debug log
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/patient/appointment/createAppointment`, patientInfo, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      setShowSuccessModal(true);
      setIsFormModalOpen(false);
    } else {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorModal(true);
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    setErrorMessage(error.response?.data?.error || 'Failed to create appointment. Please check your details and try again.');
    setShowErrorModal(true);
  }
};

  return (
    
    <Container className='container'>
      <h1 className="mb-4 text-center">Doctors List</h1>
      {/* Search Bar */}
      <Form className="mb-4">
        <Row className="justify-content-center">
          <Col md={6} style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', /* Center the content horizontally */
            margin: 0 /* Remove default margin */
          }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{
            position: 'absolute',
            left: '22px',
            color: '#aaa'
          }} />
            <Form.Control
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              style={{
                paddingLeft: '30px', 
                width: '100%'
              }}  
            />
          </Col>
        </Row>
      </Form>

      {/* Doctor Cards */}
      <Row>
  {filteredDoctors.map((doctor) => (
    <Col md={6} lg={4} key={doctor.id} className="mb-4">
      <Card className="cont">
        <Card.Body className="card-body">
          <div className="text-center">
            <img
              src={doc}
              alt="Doctor"
              className="rounded-circle mb-3"
              style={{ width: '80px', height: '80px' }}
            />
            <Card.Title>{`${doctor.FIRST_NAME} ${doctor.LAST_NAME}`}</Card.Title>
            <Card.Subtitle className="text-muted">{doctor.EXPERTISE}</Card.Subtitle>
          </div>
          <hr />
          <div className="schedule">
            <h5>Weekly Schedule:</h5>
            {doctor.schedules && doctor.schedules.length > 0 ? (
              doctor.schedules.map((schedule, index) => (
                <div key={index}>
                  <strong>{schedule.DAY_OF_WEEK}</strong>: {convertToStandardTime(schedule.START_TIME)} -{' '}
                  {convertToStandardTime(schedule.END_TIME)}
                </div>
              ))
            ) : (
              <p>No schedule available</p>
            )}
          </div>
          <Button
            variant="success"
            className="mt-3"
            onClick={() => handleCheckAvailability(doctor)}
          >
            Check Availability
          </Button>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onRequestClose={() => setIsScheduleModalOpen(false)}
        style={{
          content: {
            border: 'none',
            borderRadius: '10px', // Optional for rounded corners
            overflow: 'scroll', // Ensures no scrollbars appear outside the modal
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Optional for subtle shadow
            
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dim the background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
        }}
      >
        <Button
          variant="danger"
          onClick={() => setIsScheduleModalOpen(false)}
          className="closebtn"
        >
          &times;
        </Button>
        <h3 className="topTitle">Doctor's Weekly Schedule</h3>
        <p style={{ color: '#333', fontSize: '15px', textAlign: 'center'}}>
              Appointment Scheduling 6 days prior
            </p>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={calendarEvents}
          headerToolbar={{
            center: 'title', // Only keep the title in the center
            left: 'prev,next',       // Remove left buttons
            right: 'today',      // Remove right buttons
          }}
          eventClick={handleEventClick}
          allDaySlot={false}
          slotMinTime="07:00:00" // Start time at 7:00 AM
          slotMaxTime="18:00:00" // End time at 6:00 PM
          validRange={{
            start: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString('en-CA', {
              timeZone: 'Asia/Manila', // Philippine time zone
            }), // Start from tomorrow in PHT
            end: new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('en-CA', {
              timeZone: 'Asia/Manila', // End 6 days from tomorrow in PHT
            }), // End at 6 days from tomorrow in PHT
          }}
          selectAllow={(selectInfo) => {
            const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
            return selectInfo.startStr > today; // Block today, only allow dates after today in PHT
          }}        
        />
      </Modal>

      <Modal
  isOpen={isFormModalOpen}
  onRequestClose={() => setIsFormModalOpen(false)}
  style={{
    content: {
      borderRadius: '10px',
      overflowY: 'auto',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }}
>
  {/* Close Button */}
  <button
    onClick={() => setIsFormModalOpen(false)}
    style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#333',
    }}
  >
    &times;
  </button>

  {/* Header Section */}
  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
    <img src={require("../images/logo.png")} alt="Logo" style={{ width: '120px', marginRight: '15px' }} />
    <h2 style={{ fontSize: '24px', fontWeight: '600' }}>ACE Malolos Hospital</h2>
    <p>AceQueue: Online Appointment Form</p>
  </div>

  <hr />

  {/* Appointment Details */}
  <div className="appDetails">
    <div style={{ flex: '1', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
      <h5>Sending an Appointment Request to:</h5>
      <div style={{display: 'flex', gap: '20px'}}>
          <img src={doc} alt="Doctor" style={{ width: '70px', height: '70px', borderRadius: '50%' }} />
        <div>
          <h4><strong>Dr. {selectedDoctor?.FIRST_NAME} {selectedDoctor?.LAST_NAME}</strong></h4>
          <p>{selectedDoctor?.HEALTH_PROFESSIONAL_ACRONYM}</p>
        </div>
      </div>
    </div>
    <div style={{ flex: '1', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
      <h5>Preferred date of the Patient:</h5>
      <div style={{display:'flex', gap: '20px'}}>
        <img 
          src={require("../images/sched.png")} // Make sure the path matches where you store the image
          alt="Calendar" style={{width: '55px', height: '65px'}}
        />
        <div>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {selectedTime}</p>
        </div>
      </div>
    </div>
  </div>

  {/* Patient Information Form */}
<Form onSubmit={handleFormSubmit}>
  <h4>Patient Information</h4>
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>Last Name</Form.Label>
      <Form.Control
        type="text"
        name="lastName"
        value={patientInfo.lastName}
        onChange={(e) => setPatientInfo({ ...patientInfo, lastName: e.target.value })}
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>First Name</Form.Label>
      <Form.Control
        type="text"
        name="firstName"
        value={patientInfo.firstName}
        onChange={(e) => setPatientInfo({ ...patientInfo, firstName: e.target.value })}
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '100px' }}>
      <Form.Label>Middle Name</Form.Label>
      <Form.Control
        type="text"
        name="middleName"
        value={patientInfo.middleName}
        onChange={(e) => setPatientInfo({ ...patientInfo, middleName: e.target.value })}
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '100px' }}>
      <Form.Label>Suffix</Form.Label>
      <Form.Control
        type="text"
        name="suffix"
        value={patientInfo.suffix}
        onChange={(e) => setPatientInfo({ ...patientInfo, suffix: e.target.value })}
      />
    </Form.Group>
  </div>

  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>Date of Birth</Form.Label>
      <Form.Control
        type="date"
        name="dateOfBirth"
        value={patientInfo.dateOfBirth}
        onChange={(e) => handleDateOfBirthChange(e.target.value)}
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '80px' }}>
      <Form.Label>Age</Form.Label>
      <Form.Control
        type="number"
        name="age"
        value={patientInfo.age}
        readOnly
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>Gender</Form.Label>
      <Form.Select
        name="gender"
        value={patientInfo.gender}
        onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </Form.Select>
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>Contact Number</Form.Label>
      <Form.Control
        type="text"
        name="contactNumber"
        value={patientInfo.contactNumber}
        onChange={(e) => setPatientInfo({ ...patientInfo, contactNumber: e.target.value })}
      />
    </Form.Group>
    <Form.Group style={{ flex: '1', minWidth: '150px' }}>
      <Form.Label>Civil Status</Form.Label>
      <Form.Select
        name="civilStatus"
        value={patientInfo.civilStatus}
        onChange={(e) => setPatientInfo({ ...patientInfo, civilStatus: e.target.value })}
      >
        <option value="">Select</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </Form.Select>
    </Form.Group>
  </div>

  {/* Address and Notes */}
  <div className="lowDetails">
    {/* Address and Additional Notes */}
    <div style={{ flex: '1' }}>
      <Form.Group style={{ marginBottom: '20px' }}>
        <Form.Label>Address</Form.Label>
        <Form.Control
          as="textarea"
          name="address"
          value={patientInfo.address}
          onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
          rows={2}
          placeholder="Enter your address"
        />
      </Form.Group>
  
    <Form.Group>
      <Form.Label>Additional Notes (Optional)</Form.Label>
      <Form.Control
        as="textarea"
        name="additionalNotes"
        value={patientInfo.additionalNotes}
        onChange={(e) => setPatientInfo({ ...patientInfo, additionalNotes: e.target.value })}
        rows={2}
        placeholder="Add any additional information"
      />
    </Form.Group>
  </div>

  {/* Covid-19 Vaccination Details */}
  <div style={{ flex: '1', marginTop: '10px' }}>
      <h4>Covid-19 Vaccination Details</h4>
      <Form.Group className="covidDetails">
        <Form.Check type="checkbox" label="1st Dose Brand" />
        <Form.Control
          type="text"
          name="firstDoseBrand"
          placeholder="Brand"
          value={patientInfo.firstDoseBrand}
          onChange={(e) => setPatientInfo({ ...patientInfo, firstDoseBrand: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
        <Form.Control
          type="date"
          name="firstDoseDate"
          value={patientInfo.firstDoseDate}
          onChange={(e) => setPatientInfo({ ...patientInfo, firstDoseDate: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
      </Form.Group>

      <Form.Group className="covidDetails">
        <Form.Check type="checkbox" label="2nd Dose Brand" />
        <Form.Control
          type="text"
          name="secondDoseBrand"
          placeholder="Brand"
          value={patientInfo.secondDoseBrand}
          onChange={(e) => setPatientInfo({ ...patientInfo, secondDoseBrand: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
        <Form.Control
          type="date"
          name="secondDoseDate"
          value={patientInfo.secondDoseDate}
          onChange={(e) => setPatientInfo({ ...patientInfo, secondDoseDate: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
      </Form.Group>

      <Form.Group className="covidDetails">
        <Form.Check type="checkbox" label="Booster Brand" />
        <Form.Control
          type="text"
          name="boosterBrand"
          placeholder="Brand"
          value={patientInfo.boosterBrand}
          onChange={(e) => setPatientInfo({ ...patientInfo, boosterBrand: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
        <Form.Control
          type="date"
          name="boosterDate"
          value={patientInfo.boosterDate}
          onChange={(e) => setPatientInfo({ ...patientInfo, boosterDate: e.target.value })}
          style={{ marginLeft: '10px', flex: '1' }}
        />
      </Form.Group>
    </div>
</div>


          {/* Confirm Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button type="submit" variant="success" style={{ padding: '10px 30px' }}>
              Confirm Appointment
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Success and Error Modals */}
      {showSuccessModal && (
        <SuccessModal
          message="Appointment created successfully!"
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {/* Chat Component */}
        {userId && <PatientChat userId={userId} />}
      
    </Container>
  );
};

export default DoctorList;
