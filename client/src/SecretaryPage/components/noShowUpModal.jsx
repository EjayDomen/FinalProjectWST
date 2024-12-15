import React from 'react';
import { Check, Close } from '@mui/icons-material';

const ReminderModal = ({ message, onRequestClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                maxWidth: '500px',
                maxHeight:'100%',
                width: '100%'
            }}>
                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '15px',
                    color: '#4BB543',
                    textAlign: 'left'
                    }}>
                        No show up
                </h2>
                <p style={{
                fontSize: '16px',
                color: '#666',
                textAlign: 'left',
                margin: '0 0 20px',
                }}> 
                    {message || 'Patient did not show up for the appointment.'}
                </p>
                <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
                marginTop: '20px'
                }}>
                <button
                    style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={onRequestClose}
                >
                    <Close style={{ marginRight: '8px', fontSize: '20px' }} /> No
                </button>
          
                <button
                    style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#ff4d4d',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={onConfirm}
                >
                    <Check style={{ marginRight: '8px', fontSize: '20px' }} /> Yes
                </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;