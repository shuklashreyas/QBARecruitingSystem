// src/components/JobTable.js
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
          <th>Location</th> {/* New column header */}
        </tr>
      </thead>
      <tbody>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.id}</td>
              <td>{job.in_person_mode || "N/A"}</td>
              <td>{job.compensation || "N/A"}</td>
              <td>{job.description}</td>
              <td>{job.location || "N/A"}</td> {/* New table cell for location */}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No jobs available.</td> {/* Update colSpan to 6 */}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default JobTable;
