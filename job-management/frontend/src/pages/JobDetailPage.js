import React, { useEffect, useState } from "react";
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
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        setJob(data);

        const currentUser = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null;

        if (currentUser?.role === "recruiter") {
          const grouped = {
            accepted: [],
            rejected: [],
            not_reviewed: [],
          };
          const appGroups = data.applications || {};

          Object.entries(appGroups).forEach(([status, apps]) => {
            grouped[status] = apps;
          });
          setApplications(grouped);
        }

        if (currentUser?.role === "applicant") {
          setHasApplied(data.has_applied);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("job_id", jobId);

    const responses = {
      name: e.target.name.value,
      age: e.target.age.value,
      address: e.target.address.value,
    };
    formData.append("responses", JSON.stringify(responses));

    const resumeFile = e.target.resume.files[0];
    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.detail || "Error submitting application.");
        return;
      }

      alert("Application submitted successfully");
      window.location.reload();
    } catch (err) {
      console.error("Error submitting application:", err);
    }
  };

  if (!job) return <div>Loading...</div>;

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  return (
    <div className="job-detail-page">
      <h1>
        {job.title} {hasApplied && <span style={{ color: "green" }}>- Applied</span>}
      </h1>
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
                <div className="application-list">
                  {applications[status]?.length ? (
                    applications[status].map((app) => (
                      <div
                        key={app.id}
                        className="application-card"
                        onClick={() => (window.location.href = `/applications/${app.id}`)}
                      >
                        <p>
                          <strong>{app.user_name}</strong>
                        </p>
                      </div>
                    ))
                  ) : (
                    <p>No applications</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !hasApplied && (
            <div className="job-application-form">
              <h2>Apply for this job</h2>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <fieldset>
                  <legend>Personal Details</legend>
                  <label>Name: <input type="text" name="name" required /></label>
                  <label>Age: <input type="number" name="age" required /></label>
                  <label>Current Address: <input type="text" name="address" required /></label>
                  <label>Upload Resume: <input type="file" name="resume" accept=".pdf,.doc,.docx" required /></label>
                </fieldset>
                <button type="submit">Submit Application</button>
              </form>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default JobDetailPage;
