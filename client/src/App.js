import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage/LoginPage'; // Adjust path if needed
import ResetPasswordPage from './LoginPage/ResetPassword';
import OTPVerification from './LoginPage/OTPVerification';
import ChangePassword from './LoginPage/changePassword';
import ResetSuccessPage from './LoginPage/ResetSuccess';
import SignupPage from './SignupPage/SignupPage'; // Adjust path if needed
import VerificationPage from './SignupPage/VerificationPage';
import AccountSuccessPage from './SignupPage/AccountSuccessPage';


// Patient components
import SidebarPatient from './PatientPage/components/Sidebar';
import HomePatient from './PatientPage/components/Home';
import DoctorsPatient from './PatientPage/components/Doctors';
import AppointmentPatient from './PatientPage/components/appointment';

import ProfilePatient from './PatientPage/components/Profile';

// Secretary components
import SidebarSecre from './SecretaryPage/components/sidebarSecre';
import DashboardSecre from './SecretaryPage/components/dashboard';
import DoctorSecre from './SecretaryPage/components/doctors';
import PatientSecre from './SecretaryPage/components/patient';
import PatientListSecre from './SecretaryPage/components/patientlist'
import AppointmentSecre from './SecretaryPage/components/appointments';
import QueueSecre from './SecretaryPage/components/queue';
import QueueListSecre from './SecretaryPage/components/queuelist.jsx';
import MessageSecre from './SecretaryPage/components/messages';
import ReportSecre from './SecretaryPage/components/report';
import ReportLogsSecre from './SecretaryPage/components/logs.jsx';
import ReportFeedbackSecre from './SecretaryPage/components/feedback.jsx';
import ServicesSecre from './SecretaryPage/components/services.jsx';
import QRReaderSecre from './SecretaryPage/components/QRCodeReader.jsx';
import PredefinedQuestion from './SecretaryPage/components/ManagePredefinedQuestions.jsx';

import ProfileSecre from './SecretaryPage/components/profile';

// Layout components for Patient and Secretary
function PatientLayout({ children }) {
  return (
    <div>
      <SidebarPatient />
      <div className="patient-content">
        {children}
      </div>
    </div>
  );
}

function SecretaryLayout({ children }) {
  return (
    <div>
      <SidebarSecre />
      <div className="secre-content">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route index element={<LoginPage />} />
        <Route path="/reset" element={<ResetPasswordPage />} />
        <Route path="/OTPVerification" element={<OTPVerification />} />
        <Route path="/changePassword" element={<ChangePassword />} />
        <Route path="/resetSuccess" element={<ResetSuccessPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verification" element={<VerificationPage />} />
        <Route path="/accountSuccess" element={<AccountSuccessPage />} />

        {/* Patient routes with SidebarPatient layout */}
        <Route
          path="/patient/*"
          element={
            <PatientLayout>
              <Routes>
                <Route path="home" element={<HomePatient />} />
                <Route path="doctors" element={<DoctorsPatient />} />
                <Route path="appointment" element={<AppointmentPatient />} />

                <Route path="profile" element={<ProfilePatient />} />
              </Routes>
            </PatientLayout>
          }
        />

        {/* Secretary routes with SidebarSecre layout */}
        <Route
          path="/secretary/*"
          element={
            <SecretaryLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardSecre />} />
                <Route path="doctors" element={<DoctorSecre />} />
                <Route path="patients" element={<PatientSecre />} />
                <Route path="appointments" element={<AppointmentSecre />} />
                <Route path="appointments/patientList/:scheduleId" element={<PatientListSecre />} />
                <Route path="queue" element={<QueueSecre />} />
                <Route path="queueList" element={<QueueListSecre />} />
                <Route path="messages" element={<MessageSecre />} />
                <Route path="qr-scanner" element={<QRReaderSecre />} />
                <Route path="report" element={<ReportSecre />} />
                <Route path="report/logs" element={<ReportLogsSecre />} />
                <Route path="report/feedback" element={<ReportFeedbackSecre />} />
                <Route path="services" element={<ServicesSecre />} />
                <Route path="profile" element={<ProfileSecre />} />
                <Route path="predefinedquestion" element={<PredefinedQuestion />} />
              </Routes>
            </SecretaryLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
