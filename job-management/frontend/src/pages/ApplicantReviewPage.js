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
      {/* Left Panel: Resume */}
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

      {/* Right Panel: Responses */}
      <div style={{ flex: 0.35, padding: "30px", overflowY: "auto", backgroundColor: "#fafafa" }}>
        <h2 style={{ marginBottom: "20px", borderBottom: "2px solid #ddd", paddingBottom: "10px" }}>
          Applicant Details
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {Object.entries(application.responses).map(([key, value]) => {
            if (key === "resume") return null;

            return (
              <div
                key={key}
                style={{
                  background: "#fff",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <strong
                  style={{
                    color: "#555",
                    fontSize: "0.95rem",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}:
                </strong>
                {typeof value === "object" && value !== null ? (
                  Object.entries(value).map(([label, url]) => (
                    <div key={label}>
                      <strong>{label}:</strong>{" "}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff" }}
                      >
                        {url}
                      </a>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: "1.05rem", color: "#333" }}>{value}</span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
          <button
            style={{
              flex: 1,
              marginRight: "10px",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => handleStatusChange("accepted")}
          >
            ✅ Accept
          </button>
          <button
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => handleStatusChange("rejected")}
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicantReviewPage;
