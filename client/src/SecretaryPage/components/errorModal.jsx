import React from 'react';
import { ErrorOutline } from '@mui/icons-material';

const ErrorModal = ({ message, onClose }) => {
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
                maxheight:'100%',
                width: '100%'
            }}>
                {/* <span style={{
                    color: '#ff4d4d',
                    marginBottom: '15px',
                    float: 'left'
                    }}>
                    <ErrorOutline style={{ fontSize: '25px' }} /> 
                </span> */}
                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                    color: '#ff4d4d',
                    textAlign: 'left'
                    }}>Error
                </h2>
                <p style={{
                fontSize: '16px',
                color: '#666',
                textAlign: 'left',
                padding: '0 2px'
                }}> 
                    {message || 'There was an error processing your request.'}
                </p>
                <button 
                    onClick={onClose} 
                    style={{
                        padding: '12px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '15%',
                        marginTop:'4%',
                        backgroundColor: '#ff4d4d',
                        color: 'white',
                        float: 'right',
                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    }}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default ErrorModal;