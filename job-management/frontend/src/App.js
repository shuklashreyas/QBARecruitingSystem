import React, { useEffect, useState } from "react";

function App() {
  const [jobs, setJobs] = useState([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const fetchJobs = () => {
    const url = `http://127.0.0.1:8000/jobs?limit=${limit}&offset=${offset}&title=${titleFilter}&company=${companyFilter}`;
    const token = localStorage.getItem("access_token"); // or however you store your token
  
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          console.error("Expected an array but got:", data);
          setJobs([]);
        }
      })
      .catch((error) => console.error("Error fetching jobs:", error));
  };
  

  useEffect(() => {
    fetchJobs();
  }, [titleFilter, companyFilter, limit, offset]);

  return (
    <div>
      <h1>Job Listings</h1>
      <div>
        <input
          type="text"
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by company"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        />
        <button onClick={() => setOffset(0)}>Search</button>
      </div>
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
      <div>
        <button onClick={() => setOffset(offset - limit)} disabled={offset === 0}>Previous</button>
        <button onClick={() => setOffset(offset + limit)}>Next</button>
      </div>
    </div>
  );
}

export default App;
