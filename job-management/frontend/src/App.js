// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import JobListingsPage from './pages/JobListingsPage';
import JobDetailPage from './pages/JobDetailPage';
import CreateJobPage from './pages/CreateJobPage';
import EditJobPage from './pages/EditJobPage';
import ApplicantReviewPage from './pages/ApplicantReviewPage';


function App() {
  // Assume you have a way to get the current user's role, e.g., from localStorage
  const currentUserRole = JSON.parse(localStorage.getItem("user"))?.role || "applicant";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/jobs/create" element={ currentUserRole === "recruiter" ? <CreateJobPage /> : <Navigate to="/jobs" /> } />
        <Route path="/jobs/edit/:jobId" element={ currentUserRole === "recruiter" ? <EditJobPage /> : <Navigate to="/jobs" /> } />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/applications/:applicationId" element={<ApplicantReviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
