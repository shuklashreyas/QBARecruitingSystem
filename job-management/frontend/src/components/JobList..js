// frontend/src/components/JobList.js
import React, { useEffect, useState } from "react";
import { fetchJobs } from "../apiService";

function JobList() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    // On initial mount or whenever filters change
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await fetchJobs({
        title: titleFilter,
        company: companyFilter,
        limit: 5,
        offset: 0,
      });
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleSearch = () => {
    loadJobs();
  };

  return (
    <div>
      <h1>Job Listings</h1>
      <div>
        <input
          type="text"
          placeholder="Title filter"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company filter"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.id} style={{ border: "1px solid #ccc", margin: "10px" }}>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <strong>Company: {job.company}</strong>
          </div>
        ))
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
}

export default JobList;
