import React, { useState } from 'react';
import Modal from 'react-modal';

const CreateMedicalRecordModal = ({ isOpen, onClose, onSubmit, patientId }) => {
  const [formData, setFormData] = useState({
    transactionType: '',
    date: '',
    transactionDetails: '',
    height: '',
    weight: '',
    age: '',
    hr: '',
    rr: '',
    temperature: '',
    bloodPressure: '',
    painScale: '',
    otherSymptoms: '',
    initialDiagnosis: '',
    notes: '',
    attendingStaff: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/patients/${patientId}/medical-records/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(formData),
    });
  
    if (response.ok) {
      onSubmit(patientId, formData);
      onClose(); // Close the modal after submission
    } else {
      const errorData = await response.json();
      console.error('Failed to create medical record:', errorData);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <h2>Create Medical Record</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Transaction Type:
          <input
            type="text"
            name="transactionType"
            value={formData.transactionType}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Transaction Details:
          <input
            type="text"
            name="transactionDetails"
            value={formData.transactionDetails}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Height:
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Weight:
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Age:
          <input
            type="text"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Heart Rate (HR):
          <input
            type="text"
            name="hr"
            value={formData.hr}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Respiratory Rate (RR):
          <input
            type="text"
            name="rr"
            value={formData.rr}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Temperature:
          <input
            type="text"
            name="temperature"
            value={formData.temperature}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Blood Pressure:
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Pain Scale:
          <input
            type="text"
            name="painScale"
            value={formData.painScale}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Other Symptoms:
          <textarea
            name="otherSymptoms"
            value={formData.otherSymptoms}
            onChange={handleInputChange}
          ></textarea>
        </label>
        <label>
          Initial Diagnosis:
          <textarea
            name="initialDiagnosis"
            value={formData.initialDiagnosis}
            onChange={handleInputChange}
          ></textarea>
        </label>
        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          ></textarea>
        </label>
        <label>
          Attending Staff:
          <input
            type="text"
            name="attendingStaff"
            value={formData.attendingStaff}
            onChange={handleInputChange}
          />
        </label>
        <div style={{ marginTop: '20px' }}>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose} style={{ marginLeft: '10px' }}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMedicalRecordModal;
