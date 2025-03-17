import React from 'react';

function JobTable({ jobs }) {
  return (
    <table className="job-table">
      <thead>
        <tr>
          <th>Job Name</th>
          <th>Job ID</th>
          <th>In Person/Hybrid</th>
          <th>Compensation</th>
          <th>Job Description</th>
        </tr>
      </thead>
      <tbody>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.id}</td>
              <td>{job.inPersonOrHybrid || "N/A"}</td>
              <td>{job.compensation || "N/A"}</td>
              <td>{job.description}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5">No jobs available.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default JobTable;
