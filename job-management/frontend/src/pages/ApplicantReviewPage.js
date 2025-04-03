import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ApplicantReviewPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/applications/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setApplication(data);
    };
    fetchApplication();
  }, [applicationId]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
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
      if (!res.ok) throw new Error("Status update failed");
      alert("Application status updated");
      navigate(-1);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating application status");
    }
  };

  if (!application) return <div>Loading...</div>;

  const resumeUrl = application.responses.resume;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left: Resume (65%) */}
      <div style={{ flex: 0.65, overflow: "auto", borderRight: "1px solid #ccc" }}>
        <h2 style={{ padding: "10px" }}>Resume</h2>
        {resumeUrl ? (
          <iframe
            src={`http://localhost:8000/${resumeUrl}`}
            width="100%"
            height="100%"
            style={{ height: "calc(100% - 40px)", border: "none" }}
            title="Resume Viewer"
          />
        ) : (
          <p style={{ padding: "10px" }}>No resume uploaded.</p>
        )}
      </div>

      {/* Right: Responses (35%) */}
      <div style={{ flex: 0.35, padding: "30px", overflowY: "auto" }}>
        <h2>Responses</h2>
        {Object.entries(application.responses).map(([key, value]) => {
          if (key === "resume") return null;
          return (
            <div key={key} style={{ marginBottom: "20px" }}>
              <strong style={{ display: "block", fontSize: "1rem", color: "#444" }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
              </strong>
              <span style={{ fontSize: "1.1rem", color: "#222" }}>{value}</span>
            </div>
          );
        })}

        <div style={{ marginTop: "30px" }}>
          <button
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => handleStatusChange("accepted")}
          >
            Accept
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={() => handleStatusChange("rejected")}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicantReviewPage;
