import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FilterAlt, Search, Add } from '@mui/icons-material';
import { Button} from '@mui/material';
import styles from '../styles/queuesSecre.module.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



const Queue = () => {
  const [queueManagements, setQueueManagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null); // State to track open dropdown
  const navigate = useNavigate();

  const fetchQueueManagements = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/viewallqm`, {
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


    navigate(`/secretary/queueList/${queue.id}`, {
      state: {
        purpose: queue.transaction_type,
        date: queue.date,
        status: queue.status, // Optional: add any other details if needed
      }
    });
  };


  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id); // Toggle dropdown
  };

  const handleDropdownAction = async (action, queueId) => { // Mark function as async
    if (action === 'completed') {
      try {
        const payload = { status: "completed" };
        console.log("Sending payload:", payload); // Debugging line
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/admin/update-queue-status/${queueId}/`,
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          }
        );
  
        if (response.ok) {
          const data = await response.json();
          alert(data.message); // Show success message
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`); // Show error message
        }
      } catch (error) {
        alert(`Failed to update status: ${error.message}`); // Handle network errors
      }
    }
    setDropdownOpen(null); // Close dropdown after action
  };
  
  // Function to manually trigger createQueuesForToda

  return (
    <div className={styles.doctorsSection}>
      {/* Header */}
      <div className={styles.doctorsHeader}>
        <div>
          <h2 style={{fontSize:'35px'}}>Queue List</h2>
          <p style={{marginLeft: '10px', marginTop: '7px'}}>This is the list of doctors and their status. Check now!</p>
        </div>
                <div style={{gap:'10px', display:'flex'}}>
                  <div>
                    <button className={styles.addDoctorBtn} >
                        <Add style={{ fontSize: '16px'}} /> Walk-ins
                    </button>
                  </div>
                  <div>
                    <button  className={styles.addDoctorBtn2} onClick={() => navigate('../viewQueue')}>
                      View Queue
                    </button>
                  </div>
                </div>
      </div>

      {/* Search, Filter, and Create Queue Section */}
      <div className={styles.searchAppointment}>
        <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', /* Center the content horizontally */
                margin: 0, /* Remove default margin */
                gap: '12px',
                width: '90%'
              }}>
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{
                    position: 'absolute',
                    left: '22px',
                    color: '#aaa'
                  }} />
        <input type="text" placeholder="Search Appointment" style={{
          paddingLeft: '50px'
        }}/>
        <button className={styles.filterBtn}><Search /></button>
        <button className={styles.filterBtn}><FilterAlt /></button>

        </div>

        {/* Table Headers */}
        <div className={styles.tableHeader}>
          <span>No.</span>
          <span>QID</span>
          <span>Purpose</span>
          <span>Date</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {/* Table Body */}
        <div className={styles.tableBody}>
          {queueManagements.map((queue, index) => (
            <div className={styles.tableRow} key={queue.id}
              onClick={() => handleEventClick({queue})}
              style={{ cursor: 'pointer'}}>
              <span>{index + 1}</span>
              <span>{queue.id}</span>
              <span>{queue.transaction_type}</span>
              <span>{queue.date}</span>
              <span>{queue.status}</span>
              <span>
                <div className={styles.dropdownWrapper}>
                  <button
                    className={styles.dropdownToggle}
                    onClick={(event) => toggleDropdown(queue.id, event)}
                  >
                    &#9662;
                  </button>
                  {dropdownOpen === queue.id && (
                    <div className={styles.dropdown}>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleDropdownAction('cancel', queue.id)}
                      >
                        Cancel
                      </div>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleDropdownAction('reschedule', queue.id)}
                      >
                        Reschedule
                      </div>
                      <div
                        className={styles.dropdownItem}
                        onClick={() => handleDropdownAction('completed', queue.id)}
                      >
                        Completed
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
