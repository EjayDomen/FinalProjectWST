import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FilterAlt, Search } from '@mui/icons-material';
import styles from '../styles/queuesSecre.module.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Queue = () => {
  const [queueManagements, setQueueManagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null); // State to track open dropdown
  const navigate = useNavigate();

  const fetchQueueManagements = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/queues`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setQueueManagements(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queue management details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueManagements();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }


  const handleEventClick = ({ queue }) => {
    console.log(queue.qid);
    console.log(queue.doctor_id);
    console.log(queue.schedule_id);

    navigate(`/secretary/queueList/${queue.qid}`, {
      state: {
        doctorId: queue.doctor_id,
        scheduleId: queue.schedule_id,
        doctorName: queue.doctorName, // Optional: add any other details if needed
        doctorSpecialty: queue.specialty
      }
    });
  };


  const toggleDropdown = (qid, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === qid ? null : qid); // Toggle dropdown
  };

  const handleDropdownAction = (action, queueId) => {
    if (action === 'cancel') {
      alert(`Cancel queue with ID: ${queueId}`);
    } else if (action === 'reschedule') {
      alert(`Reschedule queue with ID: ${queueId}`);
    }
    setDropdownOpen(null); // Close dropdown after action
  };
  // Function to manually trigger createQueuesForToday
  const createQueuesForToday = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/secretary/queues/createQueuesForToday`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      alert(response.data.message); // Show success message
      fetchQueueManagements(); // Refresh the queue list
    } catch (error) {
      console.error('Error creating queues for today:', error);
      alert('Failed to create queues for today.');
    }
  };

  return (
    <div className={styles.doctorsSection}>
      {/* Header */}
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{fontSize:'35px'}}>Queue List</h2>
          <p style={{marginLeft: '10px', marginTop: '7px'}}>This is the list of doctors and their status. Check now!</p>
        </div>
        {/* Button to manually trigger createQueuesForToday */}
        <button className={styles.createQueueButton} onClick={createQueuesForToday}>
          Create Queues for Today
        </button>
      </div>

      {/* Search, Filter, and Create Queue Section */}
      <div className={styles.searchAppointment}>
        <input type="text" placeholder="Search Appointment" />
        <button className={styles.filterBtn}><Search /></button>
        <button className={styles.filterBtn}><FilterAlt /></button>
      

        {/* Table Headers */}
        <div className={styles.tableHeader}>
          <span>No</span>
          <span>QID</span>
          <span>Doctor's Name</span>
          <span>Specialty</span>
          <span>Time</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* Table Body */}
        <div className={styles.tableBody}>
          {queueManagements.map((queue, index) => (
            <div className={styles.tableRow} key={queue.qid}
              onClick={() => handleEventClick({queue})}
              style={{ cursor: 'pointer'}}>
              <span>{queue.no}</span>
              <span>{queue.qid}</span>
              <span>{queue.doctorName}</span>
              <span>{queue.specialty}</span>
              <span>{queue.time}</span>
              <span>{queue.status}</span>
              <span>
                <div className={styles.dropdownWrapper}>
                  <button
                    className={styles.dropdownToggle}
                    onClick={(event) => toggleDropdown(queue.qid, event)}
                  >
                    &#9662;
                  </button>
                  {dropdownOpen === queue.qid && (
                    <div className={styles.dropdown}>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleDropdownAction('cancel', queue.qid)}
                      >
                        Cancel
                      </div>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleDropdownAction('reschedule', queue.qid)}
                      >
                        Reschedule
                      </div>
                    </div>
                  )}
                </div>
              </span>
            </div>
          ))}
        </div>
        </div>
    </div>
  );
};

export default Queue;
