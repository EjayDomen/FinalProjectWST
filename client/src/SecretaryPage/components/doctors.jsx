import React, { useState, useEffect } from 'react';
import { Search, FilterAlt, Add, Delete, Archive } from '@mui/icons-material';
import styles from '../styles/doctorsSecre.module.css';
import axios from 'axios';
import Modal from 'react-modal';
import DeleteConfirmationModal from '../components/deleteConfirmationModal.jsx';
import { DataGrid } from '@mui/x-data-grid';
import ErrorModal from './errorModal.jsx';
import SuccessModal from './successModal.jsx';
import { TextField } from '@mui/material';
import ArchivedDoctorsModal from './archivedDoctor.jsx';

const DoctorsSection = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Track edit mode
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [gender, setGender] = useState('');
  const [healthProfessionalAcronym, setHealthProfessionalAcronym] = useState('');
  const [department, setDepartment] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [expertise, setExpertise] = useState('');
  const [schedules, setSchedules] = useState([{ day: '', timeIn: '', timeOut: '', slots: '' }]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // Added search term state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [isArchiveModalOpen, setArchiveModalOpen] = useState(false);

  // Function to open the archive modal
  const handleOpenArchiveModal = () => {
    setArchiveModalOpen(true);
  };

  // Function to close the archive modal
  const handleCloseArchiveModal = () => {
    setArchiveModalOpen(false);
  };

  const specialtiesData = [
    'Allergy and Immunology',
    'Anesthesiology',
    'Cardiology',
    'Dermatology',
    'Emergency Medicine',
    'Endocrinology',
    'Family Medicine',
    'Gastroenterology',
    'General and Cancer Surgery',
    'Geriatrics',
    'Hematology',
    'Infectious Disease',
    'Internal Medicine',
    'Nephrology',
    'Neurology',
    'Obstetrics and Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Otolaryngology (ENT)',
    'Pediatrician',
    'Physical Medicine and Rehabilitation',
    'Plastic Surgery',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Rheumatology',
    'Urology',
    'Vascular Surgery',
    'Sports Medicine',
    'Pathology',
    'Thoracic Surgery',
    'Pain Management',
    'Occupational Medicine',
    'Medical Genetics',
    'Palliative Care',
    'Clinical Pharmacology',
    'Critical Care Medicine',
    'Nuclear Medicine'
  ];
  

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/doctors/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDoctors(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDoctorClick = async (doctorId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/doctors/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSelectedDoctor(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch doctor details:', err.message);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/secretary/doctors/deleteDoctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchDoctors();
      closeDeleteConfirmation();
    } catch (error) {
      console.error('Failed to delete doctor:', error);
      alert('Failed to delete doctor. Please try again later.');
    }
  };

  const openDeleteConfirmation = (doctorId) => {
    setDoctorToDelete(doctorId);
    setDeleteModalOpen(true);
  };
  
  const closeDeleteConfirmation = () => {
    setDeleteModalOpen(false);
    setDoctorToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setIsEditing(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 180 },
    { field: 'FIRST_NAME', headerName: 'First Name', width: 300 },
    { field: 'LAST_NAME', headerName: 'Last Name', width: 300 },
    { field: 'EXPERTISE', headerName: 'Specialization', width: 380 },
    {
      field: 'actions',
      headerName: 'Action',
      sortable: false,
      width: '100',
      renderCell: (params) => (
        <button
          className={styles.iconButton}
          onClick={(e) => {
            e.stopPropagation();
            openDeleteConfirmation(params.row.id);
          }}
        >
          <Delete />
        </button>
      ),
    },
  ];

  const closeAddDoctorModal = () => {
    setIsAddDoctorModalOpen(false);
    setSchedules([{ scheduleId: '',day: '', timeIn: '', timeOut: '', slots: '' }]);
  };
  const handleRemoveSchedule = () => {
    if (schedules.length > 1) {
      setSchedules(schedules.slice(0, -1)); // Remove the last schedule
    }};

    const handleAddDoctor = async () => {
      const schedulesToSend = schedules.map(schedule => ({
        day_of_week: schedule.day,
        start_time: schedule.timeIn,
        end_time: schedule.timeOut,
        slot_count: schedule.slots
      }));
  
      const doctorData = {
        FIRST_NAME: firstName,
        MIDDLE_NAME: middleName,
        LAST_NAME: lastName,
        SUFFIX: suffix,
        GENDER: gender,
        HEALTH_PROFESSIONAL_ACRONYM: healthProfessionalAcronym,
        DEPARTMENT: department,
        YEARS_OF_EXPERIENCE: yearsOfExperience,
        EXPERTISE: expertise,
        schedules: schedulesToSend,
      };
  
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/secretary/doctors/addDoctor`, doctorData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Doctor added:', response.data);
        setSuccessMessage('Doctor added successfully!'); // Set the success message
        setSuccessModalOpen(true); // Open the success modal
        closeAddDoctorModal();
        setFirstName('');
        setMiddleName('');
        setLastName('');
        setSuffix('');
        setHealthProfessionalAcronym('');
        setDepartment('');
        setYearsOfExperience('');
        setExpertise('');
        fetchDoctors();
      } catch (error) {
        console.error('Failed to add doctor:', error.message);
        setErrorModalMessage(error.response?.data?.error || 'Failed to add doctor. Please try again later.');
        setErrorModalOpen(true);
      }
    };

  const toggleEdit = () => {
    setIsEditing(!isEditing); // Toggle edit mode
  };
  // Function to close the success modal
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSuccessMessage(''); // Reset success message if needed
};


  const handleSaveDoctor = async () => {
    if (selectedDoctor) {
      const doctorData = {
        FIRST_NAME: selectedDoctor.doctor.FIRST_NAME,
        MIDDLE_NAME: selectedDoctor.doctor.MIDDLE_NAME,
        LAST_NAME: selectedDoctor.doctor.LAST_NAME,
        SUFFIX: selectedDoctor.doctor.SUFFIX,
        GENDER: selectedDoctor.doctor.GENDER,
        HEALTH_PROFESSIONAL_ACRONYM: selectedDoctor.doctor.HEALTH_PROFESSIONAL_ACRONYM,
        DEPARTMENT: selectedDoctor.doctor.DEPARTMENT,
        YEARS_OF_EXPERIENCE: selectedDoctor.doctor.YEARS_OF_EXPERIENCE,
        EXPERTISE: selectedDoctor.doctor.EXPERTISE,
        schedules: selectedDoctor.schedule.map(schedule => ({
          scheduleId: schedule.SCHEDULE_ID,
          day_of_week: schedule.DAY_OF_WEEK,
          start_time: schedule.START_TIME,
          end_time: schedule.END_TIME,
          slot_count: schedule.SLOT_COUNT
        })),
      };
  
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/secretary/doctors/updateDoctor/${selectedDoctor.doctor.id}`, doctorData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('Doctor updated:', response.data);
        setSuccessMessage('Doctor updated successfully!'); // Set the success message
        setSuccessModalOpen(true); // Open the success modal
        setIsEditing(false);
        closeModal();
        fetchDoctors();
      } catch (error) {
        console.error('Failed to save doctor:', error.message);
        setErrorModalMessage(error.response?.data?.error || 'Failed to add doctor. Please try again later.');
        setErrorModalOpen(true);
      }
    }
  };

  const handleAddSchedule = () => {
    // Adding a new schedule entry with default fields
    setSelectedDoctor((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        { SCHEDULE_ID: '', DAY_OF_WEEK: '', START_TIME: '', END_TIME: '', SLOT_COUNT: '' },
      ],
    }));
  };

  const handleSpecialtyChange = (value) => {
    if (expertise.includes(value)) {
      // Remove the specialty if it's already included
      const updatedExpertise = expertise
        .split(', ')
        .filter((specialty) => specialty !== value)
        .join(', ');
      setExpertise(updatedExpertise);
    } else {
      // Add the specialty if not already included
      setExpertise(expertise ? `${expertise}, ${value}` : value);
    }
  };
  
  const filteredDoctors = doctors.filter((doctor) =>
    Object.values(doctor).some((value) =>
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const handleRemoveExistingSchedule = (index) => {
    setSelectedDoctor((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.doctorsSection}>
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{fontSize:'35px'}}>Doctors</h2>
          <p style={{marginLeft: '10px', marginTop: '7px'}}>Manage doctor profiles</p>
        </div>
        <button
          className={styles.addDoctorBtn}
          onClick={() => setIsAddDoctorModalOpen(true)}
        >
          <Add style={{ fontSize: '30px', marginTop: '-5px' }} /> Add Doctor
        </button>
      </div>

      <div className={styles.searchAppointment}>
        <div className={styles.actionButtons}>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on input change
          />
          <button className={styles.iconButton}onClick={handleOpenArchiveModal}><Archive/> Archive</button>
        </div>
        {/* Archive Modal */}
      <ArchivedDoctorsModal isOpen={isArchiveModalOpen} onClose={handleCloseArchiveModal} />

        <div style={{ height: '100%', width: '100%', marginTop:'1%' }}>
          <DataGrid sx={{ height: 600, width: '100%', cursor:'pointer' }}
            rows={filteredDoctors} // Use filteredDoctors here instead of doctors
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            getRowId={(row) => row.id}
            onRowClick={(params) => {
              handleDoctorClick(params.row.id);
            }}
          />
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onRequestClose={closeDeleteConfirmation}
        onConfirm={() => handleDeleteDoctor(doctorToDelete)}
      />

        {/* Modal for Viewing Doctor Information */}
        <Modal
          isOpen={isModalOpen && selectedDoctor}
          onRequestClose={closeModal}
          className={styles.modal}
          overlayClassName={styles.modalOverlay}
        >
          {selectedDoctor && (
            <div>
              <h2><b>Doctor's Information</b></h2>
              <hr />
              <div>
                <h3>Personal Information</h3>

                <div className={styles.formGroup}>
                  <label><strong>Name:</strong></label>
                  <div style={{display: 'flex', gap:'20px', marginTop:'-3%'}}>
                    <input
                      type="text"
                      name="firstName"
                      value={selectedDoctor.doctor.FIRST_NAME}
                      onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, FIRST_NAME: e.target.value } })}
                      readOnly={!isEditing}
                      className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    />
                    <input
                      type="text"
                      name="middleName"
                      value={selectedDoctor.doctor.MIDDLE_NAME}
                      onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, MIDDLE_NAME: e.target.value } })}
                      readOnly={!isEditing}
                      className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={selectedDoctor.doctor.LAST_NAME}
                      onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, LAST_NAME: e.target.value } })}
                      readOnly={!isEditing}
                      className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    />
                    <input
                      type="text"
                      name="suffix"
                      value={selectedDoctor.doctor.SUFFIX}
                      onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, SUFFIX: e.target.value } })}
                      readOnly={!isEditing}
                      className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label><strong>Gender:</strong></label>
                  <input
                    type="text"
                    value={selectedDoctor.doctor.GENDER}
                    readOnly={!isEditing}
                    style={{marginTop:'-3%'}}
                    className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, GENDER: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><strong>Specialty:</strong></label>
                  <input
                    type="text"
                    value={selectedDoctor.doctor.EXPERTISE}
                    readOnly={!isEditing}
                    style={{marginTop:'-3%'}}
                    className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, EXPERTISE: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><strong>Health Professional Acronym:</strong></label>
                  <input
                    type="text"
                    value={selectedDoctor.doctor.HEALTH_PROFESSIONAL_ACRONYM}
                    readOnly={!isEditing}
                    style={{marginTop:'-3%'}}
                    className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, HEALTH_PROFESSIONAL_ACRONYM: e.target.value } })}
                  />
                </div>
              </div>
              <hr style={{margin: '25px 0'}}/>
              <div>
                <h3>Clinic Information</h3>

                <div className={styles.formGroup}>
                  <label><strong>Department:</strong></label>
                  <input
                    type="text"
                    value={selectedDoctor.doctor.DEPARTMENT}
                    readOnly={!isEditing}
                    style={{marginTop:'-3%'}}
                    className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, DEPARTMENT: e.target.value } })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label><strong>Years of Expertise:</strong></label>
                  <input
                    type="text"
                    value={selectedDoctor.doctor.YEARS_OF_EXPERIENCE}
                    readOnly={!isEditing}
                    style={{marginTop:'-3%'}}
                    className={isEditing ? styles.editableInput : styles.readOnlyInput}
                    onChange={(e) => setSelectedDoctor({ ...selectedDoctor, doctor: { ...selectedDoctor.doctor, YEARS_OF_EXPERIENCE: e.target.value } })}
                  />
                </div>
              </div>
              <hr style={{margin: '25px 0'}}/>

              <h3>Doctor's Schedule</h3>
              <div>
                {selectedDoctor.schedule.length > 0 ? (
                  selectedDoctor.schedule.map((schedule, index) => (
                    <div key={index} className={styles.scheduleGroup} style={{marginBottom:'40px'}}>
                      <div className={styles.formGroup} >
                      <div style={{ display: 'none' }}>
                          <label><strong>Schedule ID:</strong></label>
                          <input
                            type="text"
                            value={schedule.SCHEDULE_ID}
                            readOnly={!isEditing}
                            className={isEditing ? styles.editableInput : styles.readOnlyInput}
                            onChange={(e) => {
                              const newSchedule = [...selectedDoctor.scheduleId];
                              newSchedule[index].SCHEDULE_ID = e.target.value;
                              setSelectedDoctor({ ...selectedDoctor, schedule: newSchedule });
                            }}
                          />
                        </div>
                        <label><strong>Day:</strong></label>
                        <select
                          value={schedule.DAY_OF_WEEK}
                          disabled={!isEditing}
                          style={{marginTop:'-3%'}}
                          className={isEditing ? styles.editableInput : styles.readOnlyInput}
                          onChange={(e) => {
                            const newSchedule = [...selectedDoctor.schedule];
                            newSchedule[index].DAY_OF_WEEK = e.target.value;
                            setSelectedDoctor({ ...selectedDoctor, schedule: newSchedule });
                          }}
                        >
                        <option value="">Select Day</option>
                        <option value="Monday">Mondays</option>
                        <option value="Tuesday">Tuesdays</option>
                        <option value="Wednesday">Wednesdays</option>
                        <option value="Thursday">Thursdays</option>
                        <option value="Friday">Fridays</option>
                        <option value="Saturday">Saturdays</option>
                        <option value="Sunday">Sundays</option>
                      </select>
                      </div>
                      
                      <div style={{display: 'flex', gap: '20px'}}>
                        <div className={styles.formGroup}>
                          <label><strong>Start Time:</strong></label>
                          <input
                            type="time"
                            value={schedule.START_TIME}
                            readOnly={!isEditing}
                            className={isEditing ? styles.editableInput : styles.readOnlyInput}
                            onChange={(e) => {
                              const newSchedule = [...selectedDoctor.schedule];
                              newSchedule[index].START_TIME = e.target.value;
                              setSelectedDoctor({ ...selectedDoctor, schedule: newSchedule });
                            }}style={{width:'262px', marginTop:'-3%'}}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label><strong>End Time:</strong></label>
                          <input
                            type="time"
                            value={schedule.END_TIME}
                            readOnly={!isEditing}
                            className={isEditing ? styles.editableInput : styles.readOnlyInput}
                            onChange={(e) => {
                              const newSchedule = [...selectedDoctor.schedule];
                              newSchedule[index].END_TIME = e.target.value;
                              setSelectedDoctor({ ...selectedDoctor, schedule: newSchedule });
                            }}style={{width:'262px', marginTop:'-3%'}}
                          />
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label><strong>Slots Available:</strong></label>
                        <input
                          type="number"
                          value={schedule.SLOT_COUNT}
                          readOnly={!isEditing}
                          style={{marginTop:'-3%'}}
                          className={isEditing ? styles.editableInput : styles.readOnlyInput}
                          onChange={(e) => {
                            const newSchedule = [...selectedDoctor.schedule];
                            newSchedule[index].SLOT_COUNT = e.target.value;
                            setSelectedDoctor({ ...selectedDoctor, schedule: newSchedule });
                          }}
                        />
                      </div>
                      <button onClick={() => handleRemoveExistingSchedule(index)} className={styles.removeScheduleBtn} >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No schedules available for this doctor.</p>
                )}
              </div>
              <button onClick={handleAddSchedule} className={styles.addScheduleBtn}  disabled={!isEditing}>Add Schedule</button>
              <div className={styles.modalActions}>
                <button onClick={closeModal} className={styles.backButton}>Back</button>
                <button onClick={isEditing ? handleSaveDoctor : toggleEdit} className={styles.editButton}>
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isAddDoctorModalOpen}
          onRequestClose={closeAddDoctorModal}
          className={styles.addDoctorModal}
          overlayClassName={styles.modalOverlay}
        >
          <div className={styles.modalContent}>
            <h2><b>Add Doctor</b></h2>
            <hr style={{margin: '10px 0'}}/>

            <div className={styles.formSection}>
              <h3>Personal Information</h3>
              <TextField
                type="text"
                label="First Name"
                className={styles.inputField}
                style={{marginBottom:'2%'}}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                type="text"
                label="Middle Name"
                className={styles.inputField}
                style={{marginBottom:'2%'}}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <TextField
                type="text"
                label="Last Name"
                className={styles.inputField}
                style={{marginBottom:'2%'}}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                type="text"
                label="Suffix"
                className={styles.inputField}
                style={{marginBottom:'2%'}}
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
              />
              <div className={styles.inlineFields}>
                <select
                  className={styles.selectField}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled select>
                    Select
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
                {/* <div className={styles.selectField}> */}
                <button style={{ width: '50%', borderRadius: '4px', marginTop:'2%',marginBottom:'2%' }} type="button" onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}>
                  {expertise ? expertise : 'Select Specialty'}
                </button>
                  {showSpecialtyDropdown && (
                    <div className={styles.dropdownContent}>
                      {specialtiesData.map((specialty) => (
                        <label key={specialty} className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            value={specialty}
                            checked={expertise.includes(specialty)}
                            onChange={(e) => handleSpecialtyChange(e.target.value)}
                          />
                          {specialty}
                        </label>
                      ))}
                    </div>
                  )}
                {/* </div> */}
              </div>
              <TextField
                type="text"
                label="Health Professional Acronym"
                className={styles.inputField}
                style={{marginBottom:'2%'}}
                value={healthProfessionalAcronym}
                onChange={(e) => setHealthProfessionalAcronym(e.target.value)}
              />
            </div>
              <hr />
            <div className={styles.formSection}>
            <h3>Clinic Information</h3>  
              <TextField
                type="text"
                label="Department"
                style={{marginBottom:'2%'}}
                className={styles.inputField}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              <TextField
                type="number"
                label="Years of Experience"
                className={styles.inputField}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
              />
            </div>
              <hr />
            <h3>Schedules</h3>
            <div>
              {schedules.map((schedule, index) => (
                <div key={index} className={styles.scheduleRow}>
                  
                  <select
                    value={schedule.day}
                    onChange={(e) => {
                      const newSchedules = [...schedules];
                      newSchedules[index].day = e.target.value;
                      setSchedules(newSchedules);
                    }}
                    className={styles.selectField}
                  >
                    <option value="">Select Day</option>
                    <option value="Monday">Mondays</option>
                    <option value="Tuesday">Tuesdays</option>
                    <option value="Wednesday">Wednesdays</option>
                    <option value="Thursday">Thursdays</option>
                    <option value="Friday">Fridays</option>
                    <option value="Saturday">Saturdays</option>
                    <option value="Sunday">Sundays</option>
                  </select>
                  <div className={styles.inlineFields}>
                    <input
                      type="time"
                      placeholder="Time In"
                      className={styles.inputField}
                      value={schedule.timeIn}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].timeIn = e.target.value;
                        setSchedules(newSchedules);
                      }}style={{maxWidth: '165px'}}
                    />
                    <input
                      type="time"
                      placeholder="Time Out"
                      className={styles.inputField}
                      value={schedule.timeOut}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].timeOut = e.target.value;
                        setSchedules(newSchedules);
                      }}style={{maxWidth: '165px'}}
                    />
                    <input
                      type="number"
                      placeholder="Slots Available"
                      className={styles.inputField}
                      value={schedule.slots}
                      onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].slots = e.target.value;
                        setSchedules(newSchedules);
                      }}style={{maxWidth: '160px'}}
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => setSchedules([...schedules, { day: '', timeIn: '', timeOut: '', slots: '' }])} className={styles.addScheduleBtn}>Add Schedule</button>
              <button onClick={handleRemoveSchedule} className={styles.removeScheduleBtn} disabled={schedules.length <= 1}>Remove</button>
            </div>
            <div className={styles.actBtn}>
              <button onClick={closeAddDoctorModal} className={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAddDoctor} className={styles.submitBtn}>Submit</button>
            </div>
          </div>
        </Modal>
      
        {errorModalOpen && (
        <ErrorModal
          message={errorModalMessage}
          onClose={() => setErrorModalOpen(false)}
        />
        
      )}

            {isSuccessModalOpen && (
                <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />
            )}
    </div>
  );
};

export default DoctorsSection;
