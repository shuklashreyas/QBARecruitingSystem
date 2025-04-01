// src/components/JobTable.js
import React from "react";
import { Link } from "react-router-dom";
import "./JobTable.css";

function JobTable({ jobs, currentUser }) {
  const isRecruiter = currentUser && currentUser.role === "recruiter";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  

  return (
    <table className="job-table">
      <thead>
        <tr>
          <th>Job Name</th>
          <th>Job ID</th>
          <th>In Person/Hybrid</th>
          <th>Compensation / hr</th>
          <th>Job Description</th>
          <th>Location</th>
          <th>Posted</th>         {/* ✅ New column */}
          <th>Last Date</th>      {/* ✅ New column */}
          {isRecruiter && <th className="edit-col">Edit</th>}
        </tr>
      </thead>
      <tbody>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <Link to={currentUser?.role === 'recruiter' ? `/recruiter/jobs/${job.id}` : `/jobs/${job.id}`}>
  {job.title}
</Link>
              </td>
              <td>{job.id}</td>
              <td>{job.in_person_mode || "N/A"}</td>
              <td>{job.compensation || "N/A"}</td>
              <td>{job.description}</td>
              <td>{job.location || "N/A"}</td>
              <td>{formatDate(job.job_posted) || "N/A"}</td>        {/* ✅ Display posted date */}
              <td>{formatDate(job.job_expiration) || "N/A"}</td>    {/* ✅ Display expiration date */}
              {isRecruiter && (
                <td className="edit-col">
                  <Link to={`/jobs/edit/${job.id}`}>
                    <button className="edit-button">Edit</button>
                  </Link>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={isRecruiter ? 9 : 8} style={{ textAlign: "center" }}>
              No jobs available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default JobTable;
