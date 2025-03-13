import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobListings from "./components/JobListings";
import JobDetails from "./components/JobDetails";
import NewJobForm from "./components/NewJobForm";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/new-job" element={<NewJobForm />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
