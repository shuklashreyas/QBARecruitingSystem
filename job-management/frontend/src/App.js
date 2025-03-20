import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import JobListingsPage from './pages/JobListingsPage';
import JobDetailPage from './pages/JobDetailPage';
import CreateJobPage from './pages/CreateJobPage';

function App() {
  const currentUser = { role: "recruiter" };
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/jobs" element={<JobListingsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} /> 
        <Route
          path="/jobs/create"
          element={currentUser && currentUser.role === "recruiter" ? <CreateJobPage /> : <Navigate to="/jobs" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
