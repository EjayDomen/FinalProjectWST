import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import logoImage from './images/logo.png'; // Replace with the correct path to your logo image

const SuccessMessage = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '110vh',
    background: `url(${require('./images/AceBldg.png')}) no-repeat center center fixed`,
    backgroundSize: 'cover',
    padding: '20px',
    boxSizing: 'border-box',
  };

  const cardStyle = {
    marginTop:'-100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    width: '100%',
    padding: '70px 30px',
    textAlign: 'center'
  };

  const logoStyle = {
    width: '150px',
    marginBottom: '20px',
  };

  const titleStyle = {
    fontSize: '30px',
    color: '#28561f',
    fontWeight: 'bold',
    marginTop: '0',
  };

  const highlightStyle = {
    marginTop: '-30px',
    background: 'linear-gradient(to right, #f70301, #8b2f11, #28561f)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  };

  const messageStyle = {
    fontSize: '20px',
    fontWeight: '600',
    margin: '20px 0',
  };

  const buttonStyle = {
    marginTop: '20px',
    fontSize: '16px',
    padding: '12px 20px',
    width: '100%',
    maxWidth: '450px',
    borderRadius: '5px',
    backgroundColor: '#3d9d3b',
    color: '#ffffff',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
  };

  const handleMouseEnter = (e) => {
    e.target.style.backgroundColor = '#1b5e20'; // Darker green on hover
  };

  const handleMouseLeave = (e) => {
    e.target.style.backgroundColor = '#3d9d3b'; // Original green
  };

  const handleConfirmClick = () => {
    navigate('/'); // Navigate to the index (root) or specify '/login' to go directly to LoginPage
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={logoImage} alt="ACE Queue Logo" style={logoStyle} />
        <h2 style={titleStyle}>
          GET STARTED WITH <span style={highlightStyle}>ACE QUEUE</span>
        </h2>
        <p style={messageStyle}>
          You've successfully created an account!
        </p>
        <Button
          variant="contained"
          fullWidth
          style={buttonStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleConfirmClick} // Add click handler
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default SuccessMessage;
