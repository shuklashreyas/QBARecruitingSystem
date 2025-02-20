import React, { useEffect, useState } from "react";

function App() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/jobs?limit=5&offset=0")
      .then((response) => response.json())
      .then((data) => {
        // Check if the data is an array
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          console.error("Expected an array but got:", data);
          setJobs([]); // fallback to empty array
        }
      })
      .catch((error) => console.error("Error fetching jobs:", error));
  }, []);

  return (
    <div>
      <h1>Job Listings</h1>
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div key={job.id}>
            <h2>{job.title}</h2>
            <p>{job.description}</p>
            <p><strong>Company:</strong> {job.company}</p>
          </div>
        ))
      ) : (
        <p>No jobs available.</p>
      )}
    </div>
  );
}

export default App;
