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
              <p><strong>Date:</strong> {record.date}</p>
              <p><strong>Time Treatment:</strong> {record.timetreatment}</p>
              <p><strong>Medicine given during Treatment:</strong> {record.medicineused}</p>
              <p><strong>Blood Pressure Before:</strong> {record.bpbefore}</p>
              <p><strong>Blood Pressure After:</strong> {record.bpafter}</p>
              <p><strong>Weight Before:</strong> {record.weightbefore}</p>
              <p><strong>Weight After:</strong> {record.weightafter}</p>
              <p><strong>Temperature:</strong> {record.temperature}</p>
              <p><strong>Pulse Before:</strong> {record.pulsebefore}</p>
              <p><strong>Pulse After:</strong> {record.pulseafter}</p>
              <p><strong>General Remarks:</strong> {record.generalremarks}</p>
              <p><strong>Doctor's Notes:</strong> {record.notes}</p>
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
