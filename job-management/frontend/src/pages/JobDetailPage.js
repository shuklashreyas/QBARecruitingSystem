// src/pages/JobDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./JobDetailPage.css"; // Make sure you have some basic styling here

function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    // Fetch the job details by jobId from your backend
    fetch(`http://127.0.0.1:8000/jobs/${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched job data:", data); // Debug: log the job data
        setJob(data);
      })
      .catch((error) => console.error("Error fetching job details:", error));
  }, [jobId]);

  if (!job) return <div>Loading...</div>;

  return (
    <div className="job-detail-page">
      <h1>{job.title}</h1>
      <div className="job-detail-container">
        <div className="job-description">
          <h2>Job Description</h2>
          {job.detailed_description ? (
            // Renders HTML from 'detailed_description'
            <div
              dangerouslySetInnerHTML={{ __html: job.detailed_description }}
            />
          ) : (
            // Fallback if there's no 'detailed_description'
            <p>{job.description}</p>
          )}
        </div>

        <div className="job-application-form">
          <h2>Apply for this job</h2>
          <form>
            <fieldset>
              <legend>Personal Information</legend>
              <label>
                Name:
                <input type="text" name="name" required />
              </label>
              <label>
                Date of Birth:
                <input type="date" name="dob" required />
              </label>
              <label>
                Passport Number:
                <input type="text" name="passport" required />
              </label>
              <label>
                Country:
                <input type="text" name="country" required />
              </label>
              <label>
                Current Residence:
                <input type="text" name="residence" required />
              </label>
              <label>
                Phone Number:
                <input type="tel" name="phone" required />
              </label>
            </fieldset>

            <fieldset>
              <legend>Resume</legend>
              <label>
                Upload CV/Resume:
                <input type="file" name="resume" required />
              </label>
            </fieldset>

            <fieldset>
              <legend>Job-Related Questions</legend>
              <label>
                Are you proficient in C++?
                <select name="cpp" required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
              <label>
                Ethnicity:
                <input type="text" name="ethnicity" />
              </label>
              <label>
                Visa Status:
                <input type="text" name="visa" />
              </label>
            </fieldset>

            <button type="submit">Submit Application</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default JobDetailPage;
