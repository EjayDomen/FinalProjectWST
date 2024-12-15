// PrivacyPolicyModal.jsx
import React from 'react';
import styles from './SignupPage.module.css';
import { Close } from '@mui/icons-material';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          <Close fontSize="small" />
        </button>
        <h1>Privacy Policy</h1>
        <div className={styles.termsContainer}>
          <p>We are dedicated to protecting your privacy. Learn more about how AceQueue collects and uses data and your rights as a user.</p>
          <p><strong>AceQueue Privacy Policy</strong></p>
          <p><strong>Introduction</strong>This Privacy Policy complies with the Data Privacy Act of 2012. AceQueue respects your data privacy and processes data transparently and responsibly.</p>
          <p><strong>Scope</strong>This Privacy Policy applies to all data processing activities by AceQueue.</p>
          <p><strong>Data Collection and Use</strong>AceQueue collects personal information to facilitate appointments, queue management, and notifications. This includes contact details and appointment history. Anonymized data may be used for analysis to improve service.</p>
          <p><strong>Data Disclosure</strong>AceQueue does not sell or disclose personal data to third parties without consent, except as legally required or necessary for platform functionality.</p>
          <p><strong>User Rights:</strong><br />
            <b>Right to be Informed:</b> Users will be notified about data processing.<br />
            <b>Right to Access:</b> Users may access their data upon request.<br />
            <b>Right to Object:</b> Users can object to certain processing activities.<br />
            <b>Right to Correct and Erase:</b> Users can request data corrections or deletions under specific conditions.<br />
            <b>Right to Data Portability:</b> Users may request an electronic copy of their data.
          </p>
          <p><strong>Security and Retention</strong>AceQueue employs security measures, including encryption and access controls, to protect user data. Data is retained only as long as necessary.</p>
          <p><strong>Changes and Updates</strong>This Privacy Policy may be updated periodically to comply with laws or reflect changes in AceQueue’s practices. Users will be notified of significant updates.</p>
          <p>For privacy-related questions, <b>contact:<span className={styles.emailLink}>acequeue0@gmail.com </span></b></p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
