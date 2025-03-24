import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import countries from "world-countries";
import "./EditJobPage.css";

function EditJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    in_person_mode: "",
    compensation: "",
    location: "",
    job_posted: "",
    job_expiration: "",
  });

  const [jobRole, setJobRole] = useState("");
  const [whatYouDo, setWhatYouDo] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [plusPoints, setPlusPoints] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/jobs/${jobId}`)
      .then((response) => response.json())
      .then((data) => {
        setJobData({
          title: data.title || "",
          description: data.description || "",
          in_person_mode: data.in_person_mode || "",
          compensation: data.compensation || "",
          location: data.location || "",
          job_posted: data.job_posted || "",
          job_expiration: data.job_expiration || "",
        });

        // Attempt to extract original fields from existing detailed_description
        const desc = data.detailed_description || "";
        setJobRole(desc.match(/### Job Role\n([\s\S]*?)\n###/i)?.[1]?.trim() || "");
        setWhatYouDo(desc.match(/### What You’ll Do\n([\s\S]*?)\n###/i)?.[1]?.trim() || "");
        setQualifications(desc.match(/### Qualifications\n([\s\S]*?)\n###/i)?.[1]?.trim() || "");
        setPlusPoints(desc.match(/### A Plus if You Have\n([\s\S]*?)\n###/i)?.[1]?.trim() || "");
      })
      .catch((error) => console.error("Error fetching job data:", error));
  }, [jobId]);

  const buildDetailedDescription = () => {
    return `## About QBA

QBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions in the software industry. We specialize in building products that empower businesses to innovate, optimize processes, and stay ahead of market demands. By leveraging advanced technologies and data-driven strategies, we help our clients achieve their goals with efficiency and precision.

As a fast-growing tech company, QBA combines the agility of a startup with the stability of an established player in the industry. Our commitment to fostering a culture of innovation, collaboration, and excellence makes us a great place for passionate engineers to thrive and grow. QBA values its employees and invests in creating a work environment where creativity, teamwork, and development opportunities flourish.

---

### Job Role
${jobRole}

---

### What You’ll Do
${whatYouDo}

---

### Qualifications
${qualifications}

${
  plusPoints
    ? `---

### A Plus if You Have
${plusPoints}`
    : ""
}

---

**Accommodations**

QBA is an equal opportunity employer that values diversity and inclusion. We are committed to providing an environment that fosters creativity and innovation, where every team member is empowered to grow and succeed. All applicants will be considered for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, veteran or disability status, or other legally protected characteristics.

For accommodations during the application process, please contact us at [accommodations@qba.com](mailto:accommodations@qba.com).

Learn more about how QBA processes your personal information by reading our Privacy Notice.
`;
  };

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...jobData,
      detailed_description: buildDetailedDescription(),
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update job");

      const updatedJob = await response.json();
      console.log("Job updated:", updatedJob);
      navigate("/jobs");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Failed to update job. Please try again.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete job");

      alert("Job deleted successfully");
      navigate("/jobs");
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Could not delete job. Please try again.");
    }
  };

  return (
    <div className="container edit-job-page">
      <button
        className="delete-button"
        onClick={handleDelete}
        style={{ backgroundColor: "#dc3545", marginTop: "1rem" }}
      >
        Delete This Job
      </button>

      <h1>Edit Job</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Job Name:</label>
          <input type="text" name="title" value={jobData.title} onChange={handleChange} required />
        </div>

        <div>
          <label>Work Mode:</label>
          <select name="in_person_mode" value={jobData.in_person_mode} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="In-Person">In-Person</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label>Short Job Description:</label>
          <textarea name="description" value={jobData.description} onChange={handleChange} required />
        </div>

        <div>
          <label>Job Role:</label>
          <textarea value={jobRole} onChange={(e) => setJobRole(e.target.value)} required />
        </div>

        <div>
          <label>What You’ll Do:</label>
          <textarea value={whatYouDo} onChange={(e) => setWhatYouDo(e.target.value)} required />
        </div>

        <div>
          <label>Qualifications:</label>
          <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} required />
        </div>

        <div>
          <label>A Plus if You Have (optional):</label>
          <textarea value={plusPoints} onChange={(e) => setPlusPoints(e.target.value)} />
        </div>

        <div>
          <label>Compensation (USD/hour):</label>
          <input
            type="number"
            name="compensation"
            min="0"
            value={jobData.compensation}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Location:</label>
          <input
            type="text"
            name="location"
            list="location-options"
            value={jobData.location}
            onChange={handleChange}
            required
          />
          <datalist id="location-options">
            {countries
              .map((c) => c.name.common)
              .sort()
              .map((country) => (
                <option key={country} value={country} />
              ))}
          </datalist>
        </div>

        <div>
          <label>Job Posted Date:</label>
          <input type="date" name="job_posted" value={jobData.job_posted} onChange={handleChange} />
        </div>

        <div>
          <label>Application Deadline:</label>
          <input type="date" name="job_expiration" value={jobData.job_expiration} onChange={handleChange} />
        </div>

        <button type="submit">Update Job</button>
      </form>
    </div>
  );
}

export default EditJobPage;
