// src/pages/JobListingsPage.js
import React, { useState, useEffect } from "react";
import "./../App.css";
import JobTable from "../components/JobTable";

function JobListingsPage() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [limit] = useState(5);
  const [offset, setOffset] = useState(0);

  const fetchJobs = async () => {
    try {
      const url = `http://127.0.0.1:8000/jobs?limit=${limit}&offset=${offset}&title=${titleFilter}&company=${companyFilter}`;
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
  }, [titleFilter, companyFilter, offset]);

  return (
    <div className="container">
      <h1>Job Listings</h1>
      {/* Filtering inputs */}
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
        <input
          type="text"
          placeholder="Filter by company"
          value={companyFilter}
          onChange={(e) => {
            setOffset(0);
            setCompanyFilter(e.target.value);
          }}
        />
        <button onClick={() => setOffset(0)}>Search</button>
      </div>
      
      {/* Job table */}
      <JobTable jobs={jobs} />

      {/* Pagination controls */}
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
