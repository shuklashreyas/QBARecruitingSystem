import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CreateJobPage.css";
import countries from "world-countries";

function CreateJobPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [inPersonMode, setInPersonMode] = useState("");
  const [description, setDescription] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [whatYouDo, setWhatYouDo] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [plusIfYouHave, setPlusIfYouHave] = useState("");
  const [compensation, setCompensation] = useState("");
  const [location, setLocation] = useState("");
  const [jobPosted, setJobPosted] = useState("");
  const [jobExpiration, setJobExpiration] = useState("");
  const [otherMaterials, setOtherMaterials] = useState([]);
  const [jobQuestion, setJobQuestion] = useState("");
  const [questionType, setQuestionType] = useState("short_answer");
  const [urlLabel, setUrlLabel] = useState("");

  const handleOtherMaterialChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setOtherMaterials(selected);
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/resume-parser/parse-job-pdf", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setTitle(data.job_name || "");
      setJobRole(data.job_role || "");
      setWhatYouDo(data.what_youll_do || "");
      setQualifications(data.qualifications || "");
      setPlusIfYouHave(data.a_plus_if_you_have || "");
      setCompensation(data.compensation || "");
      setLocation(data.location || "");
    } catch (err) {
      alert("Failed to parse job PDF");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const aboutQBA = `## About QBA\nQBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions...`;
    const accommodations = `**Accommodations**\nQBA is an equal opportunity employer...`;

    const formatAsBullets = (text) => text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => `- ${line.trim()}`)
      .join("\n");

    const detailedDescription = `\n${aboutQBA}\n---\n\n### Job Role\n${formatAsBullets(jobRole)}\n---\n\n### What You’ll Do\n${formatAsBullets(whatYouDo)}\n---\n\n### Qualifications\n${formatAsBullets(qualifications)}\n${plusIfYouHave ? `\n---\n### A Plus if You Have\n${formatAsBullets(plusIfYouHave)}` : ""}\n---\n${accommodations}`;

    const jobData = {
      title,
      in_person_mode: inPersonMode,
      description,
      detailed_description: detailedDescription,
      compensation,
      location,
      job_posted: jobPosted,
      job_expiration: jobExpiration,
      other_materials: otherMaterials,
      job_questions: otherMaterials.includes("job_question") ? [jobQuestion] : [],
      url_descriptions: otherMaterials.includes("url") ? [urlLabel] : [],
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error("Failed to create job");
      navigate("/jobs");
    } catch (error) {
      alert("Error creating job. Please try again.");
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Link to="/jobs" style={{ position: "absolute", top: "20px", left: "20px" }}>
        <img src="/QBA.png" alt="QBA Logo" style={{ height: "60px", cursor: "pointer" }} />
      </Link>

      <button
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "#d63384",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 10,
        }}
        onClick={() => fileInputRef.current.click()}
      >
        📄 Upload Job - PDF
      </button>
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handlePDFUpload}
        style={{ display: "none" }}
      />

      <div className="container create-job-page">
        <h1>Create New Job</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Job Name:</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label>Work Mode:</label>
            <select value={inPersonMode} onChange={(e) => setInPersonMode(e.target.value)} required>
              <option value="">Select</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label>Short Job Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div>
            <label>Job Role:</label>
            <textarea value={jobRole} onChange={(e) => setJobRole(e.target.value)} required />
          </div>
          <div>
            <label>What You'll Do:</label>
            <textarea value={whatYouDo} onChange={(e) => setWhatYouDo(e.target.value)} required />
          </div>
          <div>
            <label>Qualifications:</label>
            <textarea value={qualifications} onChange={(e) => setQualifications(e.target.value)} required />
          </div>
          <div>
            <label>A Plus if You Have (Optional):</label>
            <textarea value={plusIfYouHave} onChange={(e) => setPlusIfYouHave(e.target.value)} />
          </div>
          <div>
            <label>Compensation (USD/hour):</label>
            <input type="number" min="0" value={compensation} onChange={(e) => setCompensation(e.target.value)} required />
          </div>
          <div>
            <label>Location:</label>
            <input list="location-options" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <datalist id="location-options">
              {countries.map((country) => country.name.common).sort().map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div>
            <label>Job Posted Date:</label>
            <input type="date" value={jobPosted} onChange={(e) => setJobPosted(e.target.value)} />
          </div>
          <div>
            <label>Application Deadline:</label>
            <input type="date" value={jobExpiration} onChange={(e) => setJobExpiration(e.target.value)} />
          </div>
          <div>
            <label>Other Material (Optional):</label>
            <select multiple value={otherMaterials} onChange={handleOtherMaterialChange}>
              <option value="job_question">Job Related Question</option>
              <option value="transcript">Latest School Transcript</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="url">URLs</option>
            </select>
          </div>
          {otherMaterials.includes("job_question") && (
            <div>
              <label>Custom Job Question:</label>
              <input type="text" value={jobQuestion} onChange={(e) => setJobQuestion(e.target.value)} />
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="short_answer">Short Answer</option>
                <option value="yes_no">Yes / No / N/A</option>
              </select>
            </div>
          )}
          {otherMaterials.includes("url") && (
            <div>
              <label>URL Field Label (e.g., Portfolio, GitHub):</label>
              <input type="text" value={urlLabel} onChange={(e) => setUrlLabel(e.target.value)} />
            </div>
          )}
          <button type="submit">Create Job</button>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;