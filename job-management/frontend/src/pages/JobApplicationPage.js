import React from "react";
import { useParams } from "react-router-dom";

function JobApplicationPage({ currentUser }) {
  const { jobId } = useParams();

  // Assume currentUser is passed via props or global state.
  if (currentUser.role !== "applicant") {
    return <p>Only applicants can apply for jobs.</p>;
  }

  return (
    <div className="container">
      <h1>Apply for Job #{jobId}</h1>
      {/* Display job details here if available */}
      <form>
        <div>
          <label htmlFor="cv">Upload your CV:</label>
          <input type="file" id="cv" name="cv" />
        </div>
        <div>
          <label htmlFor="questions">Job Questions:</label>
          <textarea id="questions" name="questions" placeholder="Answer job-related questions..." />
        </div>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default JobApplicationPage;
