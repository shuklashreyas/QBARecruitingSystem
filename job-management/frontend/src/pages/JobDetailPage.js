// src/pages/JobDetailPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "github-markdown-css";
import "./JobDetailPage.css";

function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState({
    accepted: [],
    rejected: [],
    not_reviewed: [],
  });

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const isRecruiter = currentUser?.role === "recruiter";

  const fetchJob = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isRecruiter
        ? `http://localhost:8000/recruiter/jobs/${jobId}`
        : `http://localhost:8000/jobs/${jobId}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch job");
      const data = await response.json();

      if (isRecruiter) {
        setJob(data.job);
        setApplications({
          accepted: data.accepted,
          rejected: data.rejected,
          not_reviewed: data.not_reviewed,
        });
      } else {
        setJob(data);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    }
  }, [jobId, isRecruiter]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update status");
      fetchJob();
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="job-detail-page" style={{ display: "flex" }}>
      {/* LEFT: Job Details */}
      <div style={{ flex: 1, padding: "1rem" }}>
        <h1>{job.title}</h1>
        <div className="job-description">
          {job.detailed_description ? (
            <div className="markdown-body">
              <ReactMarkdown>{job.detailed_description}</ReactMarkdown>
            </div>
          ) : (
            <p>{job.description}</p>
          )}
        </div>
      </div>

      {/* RIGHT: Recruiter-only Application View */}
      {isRecruiter && (
        <div style={{ flex: 2, display: "flex", gap: "1rem", padding: "1rem" }}>
          {["not_reviewed", "accepted", "rejected"].map((status) => (
            <div
              key={status}
              style={{ flex: 1, border: "1px solid #ccc", padding: "0.5rem" }}
            >
              <h3>{status.replace("_", " ").toUpperCase()}</h3>
              {applications[status]?.map((app) => (
                <div key={app.id} style={{ marginBottom: "0.5rem" }}>
                  <p>User ID: {app.user_id}</p>
                  <button onClick={() => handleUpdateStatus(app.id, "accepted")}>
                    Accept
                  </button>
                  <button onClick={() => handleUpdateStatus(app.id, "rejected")}>
                    Reject
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Applicant-only form */}
      {!isRecruiter && (
        <div className="job-application-form" style={{ flex: 1, padding: "1rem" }}>
          <h2>Apply for this job</h2>
          {/* Your application form goes here */}
          <form>
            <fieldset>
              <legend>Personal Info</legend>
              <label>Name: <input type="text" required /></label>
              <label>DOB: <input type="date" required /></label>
              <label>Passport: <input type="text" required /></label>
              <label>Country: <input type="text" required /></label>
              <label>Residence: <input type="text" required /></label>
              <label>Phone: <input type="tel" required /></label>
            </fieldset>
            <fieldset>
              <legend>Upload</legend>
              <label>CV/Resume: <input type="file" required /></label>
            </fieldset>
            <fieldset>
              <legend>Questions</legend>
              <label>C++? <select><option value="yes">Yes</option><option value="no">No</option></select></label>
              <label>Ethnicity: <input type="text" /></label>
              <label>Visa: <input type="text" /></label>
            </fieldset>
            <button type="submit">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;
