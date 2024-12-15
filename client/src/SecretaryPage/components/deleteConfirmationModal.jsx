import React from 'react';
import Modal from 'react-modal';
import { Delete, Close, ErrorOutline } from '@mui/icons-material';

const DeleteConfirmationModal = ({ isOpen, onRequestClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        content: {
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          textAlign: 'center',
          maxHeight: 'fit-content',
          maxWidth: '500px',
          margin: 'auto',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}
      ariaHideApp={false} // Set Modal.setAppElement('#root') in the main App for accessibility
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <span style={{
          color: '#ff4d4d',
          marginBottom: '15px',
        }}>
          <ErrorOutline style={{ fontSize: '48px' }} /> {/* Enlarged icon */}
        </span>
        
        <h2 style={{
          fontWeight: 'bold',
          fontSize: '21px',
          marginBottom: '10px',
          color: '#333'
        }}>
          You are about to delete this doctor's profile
        </h2>
        
        <p style={{
          fontSize: '12px',
          color: '#666',
          margin: '0 0 20px',
        }}>
          Are you sure you want to delete this? This action cannot be undone.
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
            <Close style={{ marginRight: '8px', fontSize: '20px' }} /> Cancel
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
            <Delete style={{ marginRight: '8px', fontSize: '20px' }} /> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
