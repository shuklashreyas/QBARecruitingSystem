// src/pages/JobListingsPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../App.css";
import JobTable from "../components/JobTable";

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [limit] = useState(10);
  const [offset, setOffset] = useState(0);

  // Example currentUser for demonstration; assume it's stored in localStorage after login
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

  console.log("User role on Jobs listing page is:", currentUser ? currentUser.role : "No user role found");
  
  return (
    <div className="job-listings-container">
      <h1 className="page-title">QBA Job Listings</h1>

      {currentUser && currentUser.role === "recruiter" && (
        <div className="create-job-button" style={{ marginBottom: "1.5rem", textAlign: "right" }}>
          <Link to="/jobs/create">
            <button>Create New Job</button>
          </Link>
        </div>
      )}

      <div className="filter-section" style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => {
            setOffset(0);
            setTitleFilter(e.target.value);
          }}
        />
        <button onClick={() => setOffset(0)}>Search</button>
      </div>

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
