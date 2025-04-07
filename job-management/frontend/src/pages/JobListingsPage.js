// src/pages/JobListingsPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../App.css";
import JobTable from "../components/JobTable";

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [limit] = useState(14);
  const [offset, setOffset] = useState(0);

  const currentUser = localStorage.getItem("user") 
    ? JSON.parse(localStorage.getItem("user")) 
    : null;

  const fetchJobs = async () => {
    try {
      const url = `http://127.0.0.1:8000/jobs?limit=${limit}&offset=${offset}&title=${titleFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFilter, offset]);

  return (
    <div className="job-listings-container">
      <h1 className="page-title">QBA Job Listings</h1>

      {currentUser?.role === "recruiter" && (
        <div className="create-job-button" style={{ marginBottom: "1.5rem", textAlign: "right" }}>
          <Link to="/jobs/create">
          <button className="pink-buttonnowidth">Create New Job</button>
          </Link>
        </div>
      )}
      <Link to="/login" style={{ position: "absolute", top: "20px", left: "20px" }}>
  <img
    src="QBA.png"
    alt="QBA Logo"
    style={{ height: "60px", cursor: "pointer" }}
  />
</Link>

      {currentUser?.role === "applicant" && (
        <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
          <Link to="/my-applications">
          <button className="pink-button">View My Applications</button>
          </Link>
        </div>
      )}

      

      <JobTable jobs={jobs} currentUser={currentUser} />

      <div className="pagination-controls" style={{ marginTop: "1.5rem" }}>
        <button
          onClick={() => setOffset(Math.max(offset - limit, 0))}
          disabled={offset === 0}
          style={{ marginRight: "1rem" }}
        >
          Previous
        </button>
        <button onClick={() => setOffset(offset + limit)}>Next</button>
      </div>
    </div>
  );
}

export default JobListingsPage;
