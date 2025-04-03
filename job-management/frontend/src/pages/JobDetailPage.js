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

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchJob = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job");
      }

      const data = await response.json();
      setJob(data);

      if (currentUser?.role === "recruiter") {
        setApplications(data.applications || {
          accepted: [],
          rejected: [],
          not_reviewed: [],
        });
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
    }
  }, [jobId]); // currentUser removed to avoid unnecessary rerenders

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `http://127.0.0.1:8000/recruiter/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      fetchJob();
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const responses = Object.fromEntries(formData.entries());

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: jobId, responses }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }

      await fetchJob();
      alert("Application submitted successfully");
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("Failed to submit application.");
    }
  };

  if (!job) return <div>Loading...</div>;

  return (
    <div className="job-detail-page">
      <h1>{job.title}</h1>
      <div className="job-detail-container">
        <div className="job-description">
          <h2>Job Description</h2>
          {job.detailed_description ? (
            <div className="markdown-body">
              <ReactMarkdown>{job.detailed_description}</ReactMarkdown>
            </div>
          ) : (
            <p>{job.description}</p>
          )}
        </div>

        {currentUser?.role === "recruiter" ? (
          <div className="recruiter-applications-panel">
            {["not_reviewed", "accepted", "rejected"].map((status) => (
              <div key={status} className="application-column">
                <h3>{status.replace("_", " ").toUpperCase()}</h3>
                {applications[status]?.length ? (
                  applications[status].map((app) => (
                    <div key={app.id} className="application-card">
                      <p>User ID: {app.user_id}</p>
                      {status === "not_reviewed" && (
                        <>
                          <button onClick={() => handleUpdateStatus(app.id, "accepted")}>Accept</button>
                          <button onClick={() => handleUpdateStatus(app.id, "rejected")}>Reject</button>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No applications</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="job-application-form">
            <h2>Apply for this job</h2>
            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend>Personal Details</legend>
                <label>Name: <input type="text" name="name" required /></label>
                <label>Age: <input type="number" name="age" required /></label>
                <label>Current Address: <input type="text" name="address" required /></label>
              </fieldset>
              <button type="submit">Submit Application</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetailPage;
