// src/components/JobTable.js
import React from 'react';
import { Link } from "react-router-dom";

function JobTable({ jobs, isRecruiter }) {
  return (
    <table className="job-table">
      <thead>
        <tr>
          <th>Job Name</th>
          <th>Job ID</th>
          <th>In Person/Hybrid</th>
          <th>Compensation</th>
          <th>Job Description</th>
          <th>Location</th>
          {isRecruiter && <th>Edit</th>}
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
              <td>{job.location || "N/A"}</td>
              {isRecruiter && (
                <td>
                  <Link to={`/jobs/edit/${job.id}`}>
                    <button>Edit</button>
                  </Link>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={isRecruiter ? 7 : 6}>No jobs available.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default JobTable;
