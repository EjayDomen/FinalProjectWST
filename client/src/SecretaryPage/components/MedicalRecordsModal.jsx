import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios'; // Import axios
import styles from '../styles/patientsSecre.module.css';

const MedicalRecordsModal = ({ isOpen, onClose, patientId, patientName }) => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && patientId) {
      // Fetch the medical records when the modal is opened
      setLoading(true);
      setError(null);

      axios.get(`${process.env.REACT_APP_API_URL}/api/admin/medical-records/${patientId}/`) // Use axios for the API call
        .then((response) => {
          if (response.data.medical_records) {
            setMedicalRecords(response.data.medical_records);
          } else {
            setError('No medical records found.');
          }
        })
        .catch((err) => {
          setError('Failed to fetch medical records.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, patientId]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.modalOverlay}
      contentLabel="Medical Records"
    >
      <div>
        <h2>Medical Records for {patientName}</h2>
        <hr />
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : medicalRecords && medicalRecords.length > 0 ? (
          medicalRecords.map((record, index) => (
            <div key={index} className={styles.recordCard}>
              <h3>Record {index + 1}</h3>
              <p><strong>Transaction Type:</strong> {record.transactiontype}</p>
              <p><strong>Date:</strong> {record.date}</p>
              <p><strong>Transaction Details:</strong> {record.transactiondetails}</p>
              <p><strong>Height:</strong> {record.height}</p>
              <p><strong>Weight:</strong> {record.weight}</p>
              <p><strong>Age:</strong> {record.age}</p>
              <p><strong>Heart Rate:</strong> {record.heart_rate}</p>
              <p><strong>Respiratory Rate:</strong> {record.respiratory_rate}</p>
              <p><strong>Temperature:</strong> {record.temperature}</p>
              <p><strong>Blood Pressure:</strong> {record.bloodpressure}</p>
              <p><strong>Pain Scale:</strong> {record.painscale}</p>
              <p><strong>Other Symptoms:</strong> {record.othersymptoms}</p>
              <p><strong>Initial Diagnosis:</strong> {record.initialdiagnosis}</p>
              <p><strong>Notes:</strong> {record.notes}</p>
              <p><strong>Attending Staff:</strong> {record.attendingstaff}</p>
            </div>
          ))
        ) : (
          <p>No medical records available for this patient.</p>
        )}
        <button onClick={onClose} className={styles.backButton}>Close</button>
      </div>
    </Modal>
  );
};

export default MedicalRecordsModal;
