import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import ErrorModal from './errorModal.jsx';
import SuccessModal from './successModal.jsx';

const QRCodeReader = () => {
    const [scanResult, setScanResult] = useState(null);
    const [hint, setHint] = useState('');
    const [manualInput, setManualInput] = useState(''); // State for manual input
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const html5QrcodeScanner = new Html5QrcodeScanner(
            'reader', {
            qrbox: { width: 300, height: 300 },
            fps: 5,
        }
        );

        const onScanSuccess = async (qrCodeMessage) => {
            setScanResult(qrCodeMessage);
            await updateQueueStatus(qrCodeMessage);
        };

        const onScanError = (errorMessage) => {
            console.error(`Scan Error: ${errorMessage}`);
        };

        html5QrcodeScanner.render(onScanSuccess, onScanError);
    }, []);

    const updateQueueStatus = async (appointmentId) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/secretary/scan/update-queue-status`, {
                appointmentId,
            });
            setHint(response.data.message);
            setSuccessModalOpen(true);
            setSuccessMessage('Queue Updated Successfully!')
        } catch (error) {
            console.error('Error updating queue status:', error);
            setHint(error.response?.data?.message || 'Error updating status.');
            setErrorModalMessage(error.response?.data?.message || 'Error updating status.');
        }
    };

    const handleCloseSuccessModal = () => {
        setSuccessModalOpen(false); // Close success modal
        setSuccessMessage('');
      };

    const handleManualSubmit = async () => {
        if (manualInput.trim() === '') {
            setHint('Please enter a valid appointment ID.');
            return;
        }
        setScanResult(manualInput); // Update scanResult with manual input
        await updateQueueStatus(manualInput); // Update queue status with manual input
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            // alignItems: 'center',
            height: '40vh',
            fontFamily: 'Arial, sans-serif',
            color: '#333',

        },
        reader: {
            width: '40%',
            height: '30%',
            border: '2px solid #dcdcdc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            marginRight: '100px',
        },
        resultContainer: {
            width: '30%',
            padding: '30px',
            // textAlign: 'center',
            border: '2px solid #dcdcdc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            // alignSelf: 'flex-start',
            // marginTop: '300px',
        },
        header: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2c3e50',
            marginBottom: '10px',
        },
        input: {
            border: '1px solid #dcdcdc',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.05)',
            fontSize: '14px',
            color: '#2c3e50',
            width: '100%',
            marginTop: '10px',
        },
        hintText: {
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#27ae60',
        },
        manualInputContainer: {
            marginTop: '20px',
        },
        submitButton: {
            padding: '10px 20px',
            backgroundColor: '#2c3e50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px',
        },
    };

    return (
        <div style={styles.container}>
            <div id="reader" style={styles.reader}></div>
            <div style={styles.resultContainer}>
                <h4 style={styles.header}>SCAN RESULT</h4>
                <div>Appointment Data</div>
                <form>
                    <input
                        type="text"
                        name="scanResult"
                        className="input"
                        value={scanResult || ''}
                        placeholder="Result here"
                        readOnly
                        style={styles.input}
                    />
                </form>
                <p>Status: <span id="txtHint" style={styles.hintText}>{hint}</span></p>

                <div style={styles.manualInputContainer}>
                    <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="Enter Appointment ID"
                        style={styles.input}
                    />
                    <button
                        type="button"
                        onClick={handleManualSubmit}
                        style={styles.submitButton}
                    >
                        Submit Manually
                    </button>
                </div>
            </div>
            {errorModalOpen && (
                <ErrorModal
                  message={errorModalMessage}
                  onClose={() => setErrorModalOpen(false)}
                />
                
              )}

            {/* Success Modal */}
            {isSuccessModalOpen && (
                <SuccessModal message={successMessage} onClose={handleCloseSuccessModal} />
            )}
        </div>
    );
};

export default QRCodeReader;