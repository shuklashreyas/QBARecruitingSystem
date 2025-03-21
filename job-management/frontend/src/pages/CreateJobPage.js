import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJobPage.css"; // Create and style this CSS file as needed

function CreateJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [inPersonMode, setInPersonMode] = useState("");
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [company, setCompany] = useState("");
  const [compensation, setCompensation] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobData = {
      title,
      in_person_mode: inPersonMode,
      description,
      detailed_description: detailedDescription,
      company,
      compensation,
      location,
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Token used for create job:", localStorage.getItem("token"));
      const response = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        throw new Error("Failed to create job");
      }
      const data = await response.json();
      console.log("Job created:", data);
      // Redirect to the job listings page after successful creation
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Error creating job. Please try again.");
    }
  };

  return (
    <div className="container create-job-page">
      <h1>Create New Job</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Name:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>In Person/Hybrid:</label>
          <input
            type="text"
            value={inPersonMode}
            onChange={(e) => setInPersonMode(e.target.value)}
          />
        </div>
        <div>
          <label>Job Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Detailed Job Description:</label>
          <textarea
            value={detailedDescription}
            onChange={(e) => setDetailedDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label>Company Name:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Compensation:</label>
          <input
            type="text"
            value={compensation}
            onChange={(e) => setCompensation(e.target.value)}
          />
        </div>
        <div>
          <label>Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit">Create Job</button>
      </form>
    </div>
  );
}

export default CreateJobPage;
