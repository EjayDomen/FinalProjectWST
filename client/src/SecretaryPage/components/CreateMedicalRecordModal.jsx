import { Notes } from '@mui/icons-material';
import React, { useState } from 'react';
import Modal from 'react-modal';

const CreateMedicalRecordModal = ({ isOpen, onClose, patientId }) => {
  const [formData, setFormData] = useState({
    date: '',
    timetreatment: '',
    medicineused: '',
    bpbefore: '',
    bpafter: '',
    weightbefore: '',
    weightafter: '',
    temperature: '',
    pulsebefore: '',
    pulseafter: '',
    generalremarks: '',
    attendingStaff: '',
    notes:'',
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
          zIndex: 1000
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
          Time Treatment:
          <input
            type="text"
            name="timetreatment"
            value={formData.timetreatment}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Medicine given during treatment(seperated by comma):
          <input
            type="text"
            name="medicineused"
            value={formData.medicineused}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>


        <label style={{ display: 'flex', flexDirection: 'column' }}>
          bp before:
          <input
            type="text"
            name="bpbefore"
            value={formData.bpbefore}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          bp after:
          <input
            type="text"
            name="bpafter"
            value={formData.bpafter}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Weight Before:
          <input
            type="text"
            name="weightbefore"
            value={formData.weightbefore}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Weight After:
          <input
            type="text"
            name="weightafter"
            value={formData.weightafter}
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
          Pulse Before:
          <input
            type="text"
            name="pulsebefore"
            value={formData.pulsebefore}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Pulse After:
          <input
            type="text"
            name="pulseafter"
            value={formData.pulseafter}
            onChange={handleInputChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          General Remarks:
          <textarea
            name="generalRemarks"
            value={formData.generalRemarks}
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
              backgroundColor: 'rgb(25, 135, 84)',
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
