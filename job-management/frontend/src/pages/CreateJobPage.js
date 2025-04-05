import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJobPage.css";
import countries from "world-countries";

function CreateJobPage() {
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobMaterials = otherMaterials;

    const aboutQBA = `## About QBA

QBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions in the software industry. We specialize in building products that empower businesses to innovate, optimize processes, and stay ahead of market demands. By leveraging advanced technologies and data-driven strategies, we help our clients achieve their goals with efficiency and precision.

As a fast-growing tech company, QBA combines the agility of a startup with the stability of an established player in the industry. Our commitment to fostering a culture of innovation, collaboration, and excellence makes us a great place for passionate engineers to thrive and grow. QBA values its employees and invests in creating a work environment where creativity, teamwork, and development opportunities flourish.`;

    const accommodations = `**Accommodations**

QBA is an equal opportunity employer that values diversity and inclusion. We are committed to providing an environment that fosters creativity and innovation, where every team member is empowered to grow and succeed. All applicants will be considered for employment without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, veteran or disability status, or other legally protected characteristics.

For accommodations during the application process, please contact us at [accommodations@qba.com](mailto:accommodations@qba.com).

Learn more about how QBA processes your personal information by reading our Privacy Notice.`;

    const detailedDescription = `
${aboutQBA}

---

### Job Role
${jobRole}

---

### What You’ll Do
${whatYouDo}

---

### Qualifications
${qualifications}

${plusIfYouHave ? `\n---\n### A Plus if You Have\n${plusIfYouHave}\n` : ""}

---

${accommodations}`;

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
      job_questions: jobMaterials.includes("job_question") ? [jobQuestion] : [],
      url_descriptions: jobMaterials.includes("url") ? [urlLabel] : []
    };

    try {
      const token = localStorage.getItem("token");
      console.log("Submitting jobData:", JSON.stringify(jobData, null, 2));

      const response = await fetch("http://127.0.0.1:8000/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) throw new Error("Failed to create job");

      const data = await response.json();
      console.log("Job created:", data);
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
  );
}

export default CreateJobPage;
