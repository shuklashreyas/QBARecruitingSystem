import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import countries from "world-countries";
import "./EditJobPage.css";
import { Link } from "react-router-dom";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

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
  const [usState, setUsState] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/jobs/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched job data:", data);

        if (data.detail === "Not authenticated") {
          alert("You're not logged in. Please sign in again.");
          return;
        }

        setJobData({
          title: data.title || "",
          description: data.description || "",
          in_person_mode: data.in_person_mode || "",
          compensation: data.compensation || "",
          location: data.location || "",
          job_posted: data.job_posted || "",
          job_expiration: data.job_expiration || "",
        });

        const desc = data.detailed_description || "";
        const extractSection = (label) => {
          const pattern = new RegExp(`### ${label}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`, "i");
          const match = desc.match(pattern);
          return match ? match[1].trim() : "";
        };

        setJobRole(extractSection("Job Role"));
        setWhatYouDo(extractSection("What You’ll Do"));
        setQualifications(extractSection("Qualifications"));
        setPlusPoints(extractSection("A Plus if You Have"));
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
    const { name, value } = e.target;
    if (name === "usState") {
      setUsState(value);
    } else {
      setJobData({ ...jobData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      ...jobData,
      location:
        jobData.location === "United States" && usState
          ? `United States, ${usState}`
          : jobData.location,
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
      <Link to="/jobs" style={{ position: "absolute", top: "20px", left: "20px" }}>
  <img
    src="\QBA.png"
    alt="QBA Logo"
    style={{ height: "60px", cursor: "pointer" }}
  />
</Link>
      <button className="delete-button" onClick={handleDelete} style={{ backgroundColor: "#dc3545", marginTop: "1rem" }}>
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
          <textarea name="description" value={jobData.description} onChange={handleChange} required rows={3} />
        </div>

        <div>
          <label>Job Role:</label>
          <textarea value={jobRole} onChange={(e) => setJobRole(e.target.value)} required rows={3} />
        </div>

        <div>
          <label>What You’ll Do:</label>
          <textarea value={whatYouDo} onChange={(e) => setWhatYouDo(e.target.value)} required rows={3} />
        </div>

        <div>
          <label>Qualifications:</label>
          <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} required rows={3} />
        </div>

        <div>
          <label>A Plus if You Have (optional):</label>
          <textarea value={plusPoints} onChange={(e) => setPlusPoints(e.target.value)} rows={2} />
        </div>

        <div>
          <label>Compensation (USD/hour):</label>
          <input type="number" name="compensation" min="0" value={jobData.compensation} onChange={handleChange} required />
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

        {jobData.location === "United States" && (
          <div>
            <label>State (US only):</label>
            <select name="usState" value={usState} onChange={handleChange} required>
              <option value="">Select a state</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        )}

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
