import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./../App.css";
import JobTable from "../components/JobTable";

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [limit] = useState(5);
  const [offset, setOffset] = useState(0);
  

  // Dummy currentUser object for demonstration; replace with your context hook
  const currentUser = { role: "recruiter" };

  const fetchJobs = async () => {
    try {
      const url = `http://127.0.0.1:8000/jobs?limit=${limit}&offset=${offset}&title=${titleFilter}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        console.error("Expected an array but got:", data);
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleFilter, offset]);

  return (
    <div className="container">
      <h1>Job Listings</h1>

      {/* If user is a recruiter, show the create button */}
      {currentUser && currentUser.role === "recruiter" && (
        <div className="create-job-button" style={{ textAlign: "right", marginBottom: "1rem" }}>
          <Link to="/jobs/create">
            <button>Create New Job</button>
          </Link>
        </div>
      )}

      {/* Filtering Inputs */}
      <div style={{ marginBottom: "1rem" }}>
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

      {/* Table of Jobs */}
      <JobTable jobs={jobs} />

      {/* Pagination Controls */}
      <div style={{ marginTop: "1rem" }}>
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
