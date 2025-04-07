import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./JobTable.css";

function JobTable({ jobs, currentUser }) {
  const isRecruiter = currentUser && currentUser.role === "recruiter";

  const [filters, setFilters] = useState({
    title: "",
    location: "",
    workMode: "",
    minComp: "",
    maxComp: "",
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    const aVal = key.includes("date") ? new Date(a[key]) : a[key];
    const bVal = key.includes("date") ? new Date(b[key]) : b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredJobs = sortedJobs.filter((job) => {
    const titleMatch = job.title.toLowerCase().includes(filters.title.toLowerCase());
    const locationMatch = filters.location ? job.location === filters.location : true;
    const workModeMatch = filters.workMode ? job.in_person_mode === filters.workMode : true;
    const compMatch =
      (!filters.minComp || Number(job.compensation) >= Number(filters.minComp)) &&
      (!filters.maxComp || Number(job.compensation) <= Number(filters.maxComp));

    return titleMatch && locationMatch && workModeMatch && compMatch;
  });

  const uniqueLocations = [...new Set(jobs.map((job) => job.location).filter(Boolean))];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSortClass = (key) => {
    if (sortConfig.key !== key) return "sortable";
    return `sortable sorted-${sortConfig.direction}`;
  };

  return (
    <>
      <div className="job-filters" style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <input type="text" name="title" placeholder="Filter by Job Title" value={filters.title} onChange={handleFilterChange} />
        <select name="location" value={filters.location} onChange={handleFilterChange}>
          <option value="">All Locations</option>
          {uniqueLocations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
        </select>
        <select name="workMode" value={filters.workMode} onChange={handleFilterChange}>
          <option value="">All Work Modes</option>
          <option value="In-Person">In-Person</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>
        <input type="number" name="minComp" placeholder="Min Compensation" value={filters.minComp} onChange={handleFilterChange} />
        <input type="number" name="maxComp" placeholder="Max Compensation" value={filters.maxComp} onChange={handleFilterChange} />
        <button onClick={() => setFilters({ title: "", location: "", workMode: "", minComp: "", maxComp: "" })}>
          Clear Filters
        </button>
      </div>

      <table className="job-table">
        <thead>
          <tr>
            <th className={getSortClass("title")} onClick={() => handleSort("title")}>Job Name</th>
            <th className={getSortClass("id")} onClick={() => handleSort("id")}>Job ID</th>
            <th className={getSortClass("in_person_mode")} onClick={() => handleSort("in_person_mode")}>In Person/Hybrid</th>
            <th className={getSortClass("compensation")} onClick={() => handleSort("compensation")}>Compensation / hr</th>
            <th>Job Description</th>
            <th className={getSortClass("location")} onClick={() => handleSort("location")}>Location</th>
            <th className={getSortClass("job_posted")} onClick={() => handleSort("job_posted")}>Posted</th>
            <th className={getSortClass("job_expiration")} onClick={() => handleSort("job_expiration")}>Last Date</th>
            {isRecruiter && <th className="edit-col">Edit</th>}
          </tr>
        </thead>
        <tbody>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const expirationDate = new Date(job.job_expiration);
              const daysLeft = Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24));
              const isClosingSoon = daysLeft <= 3 && daysLeft >= 0;

              return (
                <tr key={job.id} className={isClosingSoon ? "closing-soon" : ""}>
                  <td><Link to={`/jobs/${job.id}`}>{job.title}</Link></td>
                  <td>{job.id}</td>
                  <td>{job.in_person_mode || "N/A"}</td>
                  <td>{job.compensation || "N/A"}</td>
                  <td>{job.description}</td>
                  <td>{job.location || "N/A"}</td>
                  <td>{formatDate(job.job_posted)}</td>
                  <td>
                    {formatDate(job.job_expiration)}
                    {isClosingSoon && <span className="deadline-badge">Closing Soon</span>}
                  </td>
                  {isRecruiter && (
                    <td className="edit-col">
                      <Link to={`/jobs/edit/${job.id}`}>
                        <button className="edit-button">Edit</button>
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={isRecruiter ? 9 : 8} style={{ textAlign: "center" }}>
                No jobs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default JobTable;
