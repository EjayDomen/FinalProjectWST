// TermsModal.jsx
import React from 'react';
import styles from './SignupPage.module.css';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
        <h1>Terms of Service</h1>
        <div className={styles.termsContainer}>
          <strong>Terms and Conditions</strong><br />
          <p>1. Acceptance of Terms<br />By using AceQueue, you agree to these Terms and Conditions. If you do not agree, please refrain from using the platform.</p>
          <p>2. Purpose of AceQueue<br />AceQueue is designed to facilitate appointment scheduling and queue management at ACE Malolos Doctors' Clinic. It helps users reserve appointments, track queue status, and receive SMS notifications. Medical consultations and healthcare services are provided solely by licensed clinic professionals.</p>
          <p>3. Scope of Service<br />AceQueue operates within the clinic’s hours, Monday to Saturday. Emergency appointment requests or scheduling outside these hours are not supported.</p>
          <p>4. Account Registration<br />To use AceQueue, users must create an account and provide accurate information. Users are responsible for their login credentials and any activity on their account.</p>
          <p>5. Appointment Scheduling<br />Users can book, reschedule, or cancel appointments within designated slots. AceQueue provides real-time queue tracking to help users manage their wait time.</p>
          <p>6. SMS Notifications<br />Users consent to receive SMS notifications for appointment reminders and updates, designed to improve the clinic's operational efficiency.</p>
          <p>7. Limitations and Conduct<br />AceQueue is solely for managing appointments and queues. Misuse of the platform, including attempting to bypass scheduling protocols, may result in account suspension.</p>
          <p>8. Liability Limitations<br />AceQueue aims to provide reliable service but cannot guarantee uninterrupted access. It is not liable for damages caused by technical issues or missed appointments.</p>
          <p>9. Privacy Policy<br />AceQueue collects personal data to manage appointments and send notifications. Data will not be shared with third parties outside of authorized personnel, except as legally required.</p>
          <p>10. Security and Data Retention<br />Data security measures, including encryption, are in place. Personal data is retained only as necessary for operational purposes.</p>
          <p>11. Age Requirement<br />Users must be 18 years old or have parental consent to use AceQueue.</p>
          <p>12. Amendments<br />AceQueue may modify these terms as necessary. Continued use implies acceptance of changes.<br />For any questions, <b>contact:<span className={styles.emailLink}>acequeue0@gmail.com </span></b></p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
