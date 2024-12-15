import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import styles from '../styles/servicesSecre.module.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

const Services = () => {
    // State for the first SMS service
    const [textMessage, setTextMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isActive, setIsActive] = useState(null);

    // State for the second SMS service
    const [textMessage2, setTextMessage2] = useState('');
    const [isSaved2, setIsSaved2] = useState(false);
    const [isActive2, setIsActive2] = useState(null);

    // Fetch existing text message and active status for first service
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/patient/sms/getTextMessage`)
            .then(response => {
                if (response.data) {
                    setTextMessage(response.data.message || '');
                    setIsActive(response.data.is_active ?? false);
                }
            })
            .catch(error => {
                console.error('Error fetching first service message:', error);
            });

        // Fetch existing text message and active status for second service
        axios.get(`${process.env.REACT_APP_API_URL}/patient/sms/getTextMessage2`)
            .then(response => {
                if (response.data) {
                    setTextMessage2(response.data.message || '');
                    setIsActive2(response.data.is_active ?? false);
                }
            })
            .catch(error => {
                console.error('Error fetching second service message:', error);
            });
    }, []);

    // Handler to save the input for the first service
    const handleSave = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/patient/sms/saveTextMessage`, { message: textMessage })
            .then(response => {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
            })
            .catch(error => {
                console.error('Error saving first service message:', error);
            });
    };

    // Handler to save the input for the second service
    const handleSave2 = () => {
        axios.post(`${process.env.REACT_APP_API_URL}/patient/sms/saveTextMessage2`, { message: textMessage2 })
            .then(response => {
                setIsSaved2(true);
                setTimeout(() => setIsSaved2(false), 3000);
            })
            .catch(error => {
                console.error('Error saving second service message:', error);
            });
    };

    // Toggle isActive state and update on server for the first service
    const handleToggle = () => {
        const newStatus = !isActive;
        axios.post(`${process.env.REACT_APP_API_URL}/patient/sms/toggleSmsService`, { is_active: newStatus })
            .then(response => {
                setIsActive(newStatus);
            })
            .catch(error => {
                console.error('Error updating first service status:', error);
            });
    };

    // Toggle isActive state and update on server for the second service
    const handleToggle2 = () => {
        const newStatus = !isActive2;
        axios.post(`${process.env.REACT_APP_API_URL}/patient/sms/toggleSmsService2`, { is_active: newStatus })
            .then(response => {
                setIsActive2(newStatus);
            })
            .catch(error => {
                console.error('Error updating second service status:', error);
            });
    };

    return (
        <div className={styles.doctorsSection}>
            <div className={styles.doctorsHeader}>
                <h2 style={{ fontSize: '35px' }}>Services</h2>
                <p style={{ marginLeft: '10px', marginTop: '7px' }}>Manage SMS Reminder Services</p>
            </div>

            {/* First SMS Service */}
            <div className={styles.container}>
                <div className={styles.containerContent}>
                    <button
                        onClick={handleToggle}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isActive ? 'red' : 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            float: 'right'
                        }}
                    >
                        {isActive ? 'Turn Off Service 1' : 'Turn On Service 1'}
                    </button>
                    <h2><strong>SMS Service</strong> - Appointment Reminder</h2>
                    <h4>Guides for Messages</h4>
                    <div style={{ marginLeft: '1%' }}>
                        <p><strong>{'PATIENT'}</strong>: Patient's full name</p>
                        <p><strong>{'DOCTOR'}</strong>: Doctor's full name</p>
                        <p><strong>{'APPOINTMENTTIME'}</strong>: Appointment time</p>
                    </div>
                    <textarea
                        value={textMessage}
                        onChange={(e) => setTextMessage(e.target.value)}
                        placeholder="Enter your reminder text here for Service 1"
                        rows="4"
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                    <button onClick={handleSave} className={styles.actionBtn}>Save Message</button>
                    {isSaved && <p style={{ color: 'green' }}>Message saved successfully!</p>}

                </div>
            </div>

            {/* Second SMS Service */}
            <div className={styles.container}>
                <div className={styles.containerContent}>
                    <button
                        onClick={handleToggle2}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isActive2 ? 'red' : 'green',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            float: 'right'
                        }}
                    >
                        {isActive2 ? 'Turn Off Service 2' : 'Turn On Service 2'}
                    </button>
                    <h2><strong>SMS Service</strong> - Reschedule Notification</h2>
                    <h4>Guides for Messages</h4>
                    <div style={{ marginLeft: '1%' }}>
                        <p><strong>{'DOCTOR'}</strong>: Doctor's full name</p>
                        <p><strong>{'APPOINTMENTDATE'}</strong>: Appointment new date </p>
                        <p><strong>{'APPOINTMENTTIME'}</strong>: Appointment time</p>
                    </div>
                    <textarea
                        value={textMessage2}
                        onChange={(e) => setTextMessage2(e.target.value)}
                        placeholder="Enter your reminder text here for Service 2"
                        rows="4"
                        style={{ width: '100%', marginBottom: '10px' }}
                    />
                    <button onClick={handleSave2} className={styles.actionBtn}>Save Message</button>
                    {isSaved2 && <p style={{ color: 'green' }}>Message saved successfully!</p>}
                </div>
            </div>
        </div>
    );
};

export default Services;
