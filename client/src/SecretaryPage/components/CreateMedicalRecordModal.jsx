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
      onClose();
    } else {
      const errorData = await response.json();
      console.error('Failed to create medical record:', errorData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          width: '600px',
          height: '80%',
          margin: 'auto',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          overflow: 'auto',
        },
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontWeight:'bold' }}>Create Medical Record</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Transaction Type:
          <input
            type="text"
            name="transactionType"
            value={formData.transactionType}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Transaction Details:
          <input
            type="text"
            name="transactionDetails"
            value={formData.transactionDetails}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Height:
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Weight:
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Age:
          <input
            type="text"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Heart Rate (HR):
          <input
            type="text"
            name="hr"
            value={formData.hr}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Respiratory Rate (RR):
          <input
            type="text"
            name="rr"
            value={formData.rr}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Temperature:
          <input
            type="text"
            name="temperature"
            value={formData.temperature}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Blood Pressure:
          <input
            type="text"
            name="bloodPressure"
            value={formData.bloodPressure}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Pain Scale:
          <input
            type="text"
            name="painScale"
            value={formData.painScale}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Other Symptoms:
          <textarea
            name="otherSymptoms"
            value={formData.otherSymptoms}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          ></textarea>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Initial Diagnosis:
          <textarea
            name="initialDiagnosis"
            value={formData.initialDiagnosis}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          ></textarea>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          ></textarea>
        </label>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#007BFF',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              color: '#000',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateMedicalRecordModal;
