import React from 'react';
import { CheckCircleOutline } from '@mui/icons-material';

const SuccessModal = ({ message, onClose }) => {
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
                {/* <span style={{
                    color: '#4BB543',
                    marginBottom: '15px',
                    float: 'left'
                    }}>
                    <CheckCircleOutline style={{ fontSize: '25px' }} /> 
                </span> */}
                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '15px',
                    color: '#4BB543',
                    textAlign: 'left'
                    }}>Successful
                </h2>
                <p style={{
                fontSize: '16px',
                color: '#666',
                textAlign: 'left',
                margin: '0 0 20px',
                }}> 
                    {message || 'Your data has been loaded successfully.'}
                </p>
                <button 
                    onClick={onClose} 
                    style={{
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '20%',
                        marginTop:'3%',
                        backgroundColor: '#4BB543',
                        color: 'white',
                        alignItems: 'center',
                        float: 'right',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                    Done
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;