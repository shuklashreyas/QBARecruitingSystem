import React, { useContext, useEffect } from "react";
import { GlobalContext } from "../context/GlobalState";
import api from "../apiService";
import { Link } from "react-router-dom";

const JobListings = () => {
  const { jobs, updateJobs } = useContext(GlobalContext);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs?limit=5&offset=0");
      if (Array.isArray(response.data)) {
        updateJobs(response.data);
      } else {
        console.error("Expected an array, got:", response.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      <h1>Job Listings</h1>
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.id}>
            <h2>
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </h2>
            <p>{job.description}</p>
            <p>
              <strong>Company:</strong> {job.company}
            </p>
          </div>
        ))
      ) : (
        <p>No jobs available.</p>
      )}
    </div>
  );
};

export default JobListings;
