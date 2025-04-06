// src/pages/JobDetailPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "github-markdown-css";
import "./JobDetailPage.css";
import { Link } from "react-router-dom";

function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applications, setApplications] = useState({
    accepted: [],
    rejected: [],
    not_reviewed: [],
  });

  const [urlInputs, setUrlInputs] = useState({});
  const [jobQuestionResponses, setJobQuestionResponses] = useState({});

  const isJobExpired = (expirationDate) => {
    const today = new Date().toISOString().split("T")[0];
    return expirationDate && expirationDate < today;
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const data = await response.json();
        console.log("Fetched job data:", data);
        console.log("other_materials:", data.other_materials);
        console.log("url_descriptions:", data.url_descriptions);

        setJob(data);
        console.log("Job data loaded:", data);
        console.log("other_materials:", data.other_materials);
        console.log("url_descriptions:", data.url_descriptions);

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
      ...jobQuestionResponses,
      urls: urlInputs,
    };

    formData.append("responses", JSON.stringify(responses));
    formData.append("resume", e.target.resume.files[0]);

    if (e.target.cv?.files[0]) formData.append("cv", e.target.cv.files[0]);
    if (e.target.transcript?.files[0]) formData.append("transcript", e.target.transcript.files[0]);
    if (e.target.cover_letter?.files[0]) formData.append("cover_letter", e.target.cover_letter.files[0]);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/applications", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  const currentUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  if (!job) return <div>Loading...</div>;

  return (
    <div className="job-detail-page">
      <Link to="/jobs" style={{ position: "absolute", top: "20px", left: "20px" }}>
        <img
          src="/QBA.png"
          alt="QBA Logo"
          style={{ height: "60px", cursor: "pointer" }}
        />
      </Link>
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
                        <p><strong>{app.user_name}</strong></p>
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
          <>
            {!hasApplied && !isJobExpired(job.job_expiration) ? (
              <div className="job-application-form">
                <h2>Apply for this job</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <fieldset>
                    <legend>Personal Details</legend>
                    <label>Name: <input type="text" name="name" required /></label>
                    <label>Age: <input type="number" name="age" required /></label>
                    <label>Current Address: <input type="text" name="address" required /></label>
                  </fieldset>

                  <fieldset>
                    <legend>Documents</legend>
                    <label>Resume: <input type="file" name="resume" accept=".pdf,.doc,.docx" required /></label>
                    <label>CV: <input type="file" name="cv" accept=".pdf,.doc,.docx" /></label>
                    {job.other_materials?.includes("transcript") && (
                      <label>Transcript: <input type="file" name="transcript" accept=".pdf" /></label>
                    )}
                    {job.other_materials?.includes("cover_letter") && (
                      <label>Cover Letter: <input type="file" name="cover_letter" accept=".pdf,.doc,.docx" /></label>
                    )}
                  </fieldset>

                  {job.job_questions?.length > 0 && (
                    <fieldset>
                      <legend>Job Questions</legend>
                      {job.job_questions.map((q, index) => (
                        <label key={index}>
                          {q}
                          <input
                            type="text"
                            onChange={(e) =>
                              setJobQuestionResponses({
                                ...jobQuestionResponses,
                                [q]: e.target.value,
                              })
                            }
                          />
                        </label>
                      ))}
                    </fieldset>
                  )}

                  {job.other_materials?.includes("url") && (
                    <fieldset>
                      <legend>Relevant URLs</legend>
                      {job.url_descriptions?.map((desc, index) => (
                        <label key={index}>
                          {desc}
                          <input
                            type="url"
                            onChange={(e) =>
                              setUrlInputs({
                                ...urlInputs,
                                [desc]: e.target.value,
                              })
                            }
                          />
                        </label>
                      ))}
                    </fieldset>
                  )}

                  <button type="submit">Submit Application</button>
                </form>
              </div>
            ) : isJobExpired(job.job_expiration) ? (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Applications are closed — this job has expired.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default JobDetailPage;
