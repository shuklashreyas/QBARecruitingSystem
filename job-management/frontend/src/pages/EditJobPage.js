// src/pages/EditJobPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditJobPage.css"; // Create and style this CSS file

function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    detailed_description: "",
    in_person_mode: "",
    company: "",
    compensation: "",
    location: "",
  });

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/jobs/${jobId}`)
      .then((response) => response.json())
      .then((data) => setJobData(data))
      .catch((error) => console.error("Error fetching job data:", error));
  }, [jobId]);

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        throw new Error("Failed to update job");
      }
      const updatedJob = await response.json();
      console.log("Job updated:", updatedJob);
      navigate("/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  return (
    <div className="container edit-job-page">
      <h1>Edit Job</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Name:</label>
          <input type="text" name="title" value={jobData.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Job Description:</label>
          <textarea name="description" value={jobData.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Detailed Job Description:</label>
          <textarea name="detailed_description" value={jobData.detailed_description} onChange={handleChange} />
        </div>
        <div>
          <label>In Person/Hybrid:</label>
          <input type="text" name="in_person_mode" value={jobData.in_person_mode} onChange={handleChange} />
        </div>
        <div>
          <label>Company Name:</label>
          <input type="text" name="company" value={jobData.company} onChange={handleChange} required />
        </div>
        <div>
          <label>Compensation:</label>
          <input type="text" name="compensation" value={jobData.compensation} onChange={handleChange} />
        </div>
        <div>
          <label>Location:</label>
          <input type="text" name="location" value={jobData.location} onChange={handleChange} />
        </div>
        <button type="submit">Update Job</button>
      </form>
    </div>
  );
}

export default EditJobPage;
