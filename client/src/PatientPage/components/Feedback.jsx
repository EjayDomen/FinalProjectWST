import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Box, Typography, Button, Rating, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import SuccessModal from '../../SecretaryPage/components/successModal';

const FeedbackModal = ({ open, handleClose }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComment] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleRatingChange = (event, newValue) => {
    setRating(newValue);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/patient/submitfeedback/`, {
        rating,
        comments,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

        setIsSuccessModalOpen(true);
        setRating(0);
        setComment('');
        handleClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback');
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="feedback-modal-title"
        aria-describedby="feedback-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%', // Adjust for smaller screens
            maxWidth: 500, // Set a max width for larger screens
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
          className="container"
        >
          <div className="row">
            <div className="col-12">
              <Typography id="feedback-modal-title" variant="h5" component="h2" className="d-flex justify-content-between align-items-center" gutterBottom>
                <b>Feedback Form</b>
                <span style={{ cursor: 'pointer' }} onClick={handleClose}><Close /></span>
              </Typography>
              <Typography id="feedback-modal-description" variant="body2" gutterBottom>
                Please take a few moments to rate and fill up the form.
              </Typography>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Typography variant="subtitle1" style={{ fontWeight: '600' }} gutterBottom>
                Overall Satisfaction
              </Typography>
              <Rating
                name="overall-satisfaction"
                value={rating}
                onChange={handleRatingChange}
                size="large"
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-12">
              <Typography variant="subtitle1" style={{ fontWeight: '600' }} sx={{ mt: 2 }}>
                Comments: (Optional)
              </Typography>
              <TextField
                multiline
                fullWidth
                rows={4}
                variant="outlined"
                placeholder="Type here..."
                value={comments}
                onChange={handleCommentChange}
                sx={{ mt: 1, mb: 2 }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12 text-end">
              <Button
                variant="contained"
                onClick={handleSubmitFeedback}
                style={{ backgroundColor: '#28a745', width: '40%' }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      {isSuccessModalOpen && (
        <SuccessModal
          message="Feedback submitted successfully!"
          onClose={closeSuccessModal}
        />
      )}
    </>
  );
};

export default FeedbackModal;
