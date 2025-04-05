import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./../App.css";

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/applications/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch applications");

        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) return <div>Loading applications...</div>;

  return (
    <div className="container">
      <h1>My Applications</h1>
      {applications.length === 0 ? (
        <p>You haven't applied to any jobs yet.</p>
      ) : (
        <table className="my-applications-table">
  <thead>
    <tr>
      <th>Job Title</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {applications.map((app) => (
      <tr key={app.id}>
        <td>
          <Link to={`/jobs/${app.job_id}`}>{app.job_title}</Link>
        </td>
        <td className={`status ${app.status.toLowerCase()}`}>
          {app.status.replace("_", " ")}
        </td>
      </tr>
    ))}
  </tbody>
</table>

      )}
    </div>
  );
}

export default MyApplicationsPage;
