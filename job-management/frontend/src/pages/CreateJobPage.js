import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./CreateJobPage.css";
import countries from "world-countries";

function CreateJobPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
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
  const [uploadError, setUploadError] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);


  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    // Default expiration date is 30 days from today
    const expirationDate = new Date();
    expirationDate.setDate(today.getDate() + 30);
    const formattedExpiration = expirationDate.toISOString().split('T')[0];
    
    setJobPosted(formattedToday);
    setJobExpiration(formattedExpiration);
  }, []);

  const handleOtherMaterialChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setOtherMaterials(selected);
  };

  const deduplicateText = (textA, textB) => {
    const sentencesA = textA
      .split(/[\n.•-]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  
    const sentencesB = textB
      .split(/[\n.•-]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  
    const seen = new Set(sentencesA);
    const uniqueB = sentencesB.filter(
      (s) => !seen.has(s.toLowerCase())
    );
  
    return {
      combined: textA.trim(),
      uniqueB: uniqueB.join("\n"),
    };
  };
  
  
  const handleLinkedInPaste = (rawText) => {
    const clean = rawText.replace(/\r\n|\r/g, "\n").trim();
    const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
    const full = lines.join("\n");
  
    // ========== Title
    const title = lines.find(
      (line) =>
        line.length > 5 &&
        !/qba/i.test(line) &&
        !/logo|save|apply|share|options/i.test(line)
    );
    if (title) setTitle(title);
  
    // ========== Location
    const locationMatch = full.match(/\b[A-Z][a-z]+,\s?[A-Z]{2}\b/);
    if (locationMatch) setLocation(locationMatch[0]);
  
    // ========== Work Mode
    if (/remote/i.test(full)) setInPersonMode("Remote");
    else if (/hybrid/i.test(full)) setInPersonMode("Hybrid");
    else if (/on[-\s]?site/i.test(full)) setInPersonMode("In-Person");
  
    // ========== Section Extractor
    const extractSection = (labelVariants, fallback = "") => {
      for (const label of labelVariants) {
        const pattern = new RegExp(
          `${label}[:\\n\\s]*([\\s\\S]*?)(?=\\n[A-Z][a-z]+:|\\n{2,}|\\n\\s*\\n|$)`,
          "i"
        );
        const match = full.match(pattern);
        if (match) return match[1].trim();
      }
      return fallback;
    };
    
  
    // ========== Section Assignment
    let jobRole = extractSection("Position Description");
    let qualifications =
      extractSection("Minimum Qualifications") || extractSection("Requirements");
    let plus = extractSection("Preferred Experience") || extractSection("Preferred");
    let duties = extractSection("Responsibilities") || extractSection("What You'll Do");
  
    // ========== De-duplication
    if (duties && qualifications) {
      const { combined, uniqueB } = deduplicateText(duties, qualifications);
      duties = combined;
      qualifications = uniqueB;
    }
  
    if (qualifications && plus) {
      const { combined, uniqueB } = deduplicateText(qualifications, plus);
      qualifications = combined;
      plus = uniqueB;
    }
  
    // ========== Apply to Form
    if (jobRole) setJobRole(jobRole);
    if (duties) setWhatYouDo(duties);
    if (qualifications) setQualifications(qualifications);
    if (plus) setPlusIfYouHave(plus);
  };
  

  


  const determineWorkMode = (text) => {
    if (!text) return "";
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("remote only") || 
        lowerText.includes("fully remote") || 
        lowerText.includes("100% remote")) {
      return "Remote";
    } else if (lowerText.includes("hybrid") || 
               lowerText.includes("flexible")) {
      return "Hybrid";
    } else if (lowerText.includes("in office") || 
               lowerText.includes("on-site") || 
               lowerText.includes("in-person")) {
      return "In-Person";
    }
    
    // Default mode based on location text
    if (lowerText.includes("remote")) {
      return "Remote";
    }
    
    return "";
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/resume-parser/parse-job-pdf", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to parse PDF");
      }
      
      const data = await res.json();
      console.log("Parsed PDF data:", data);

      // Set form fields with parsed data
      setTitle(data.job_name || "");
      
      // Add a short description based on job name and role
      if (data.job_name && data.job_role) {
        const shortDesc = `${data.job_name} position focusing on ${data.job_role.split('\n')[0]}`;
        setDescription(shortDesc);
      }
      
      setJobRole(data.job_role || "");
      setWhatYouDo(data.what_youll_do || "");
      setQualifications(data.qualifications || "");
      setPlusIfYouHave(data.a_plus_if_you_have || "");
      
      if (data.compensation) {
        // Try to extract just the number
        const numericValue = data.compensation.replace(/[^0-9]/g, '');
        if (numericValue) {
          setCompensation(numericValue);
        } else {
          setCompensation("");
        }
      }
      
      setLocation(data.location || "");
      
      // Try to determine work mode from location or job text
      const workMode = determineWorkMode(data.location || data.job_role || "");
      if (workMode) {
        setInPersonMode(workMode);
      }
      
      // Set dates if provided
      if (data.job_posted) {
        setJobPosted(data.job_posted);
      }
      
      if (data.job_expiration) {
        setJobExpiration(data.job_expiration);
      }
      
    } catch (err) {
      console.error("Error parsing PDF:", err);
      setUploadError(`Failed to parse job PDF: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const aboutQBA = `## About QBA\nQBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions in the software industry. We specialize in building products that empower businesses to innovate, optimize processes, and stay ahead of market demands. By leveraging advanced technologies and data-driven strategies, we help our clients achieve their goals with efficiency and precision.

As a fast-growing tech company, QBA combines the agility of a startup with the stability of an established player in the industry. Our commitment to fostering a culture of innovation, collaboration, and excellence makes us a great place for passionate engineers to thrive and grow. QBA values its employees and invests in creating a work environment where creativity, teamwork, and development opportunities flourish.`;
    const accommodations = `**Accommodations**\nQBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions in the software industry. We specialize in building products that empower businesses to innovate, optimize processes, and stay ahead of market demands. By leveraging advanced technologies and data-driven strategies, we help our clients achieve their goals with efficiency and precision.

As a fast-growing tech company, QBA combines the agility of a startup with the stability of an established player in the industry. Our commitment to fostering a culture of innovation, collaboration, and excellence makes us a great place for passionate engineers to thrive and grow. QBA values its employees and invests in creating a work environment where creativity, teamwork, and development opportunities flourish.`;

    const formatAsBullets = (text) => {
      if (!text) return "";
      
      // If text already contains bullet points, return as is
      if (text.includes("•")) return text;
      
      return text
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => `- ${line.trim()}`)
        .join("\n");
    };

    const detailedDescription = `\n${aboutQBA}\n---\n\n### Job Role\n${formatAsBullets(jobRole)}\n---\n\n### What You'll Do\n${formatAsBullets(whatYouDo)}\n---\n\n### Qualifications\n${formatAsBullets(qualifications)}\n${plusIfYouHave ? `\n---\n### A Plus if You Have\n${formatAsBullets(plusIfYouHave)}` : ""}\n---\n${accommodations}`;

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create job");
      }
      
      alert("Job created successfully!");
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      alert(`Error creating job: ${error.message}`);
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
          backgroundColor: isUploading ? "#888888" : "#d63384",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: isUploading ? "not-allowed" : "pointer",
          zIndex: 10,
        }}
        onClick={() => !isUploading && fileInputRef.current.click()}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "📄 Upload Job - PDF"}
      </button>
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handlePDFUpload}
        style={{ display: "none" }}
      />

      <div className="container create-job-page">
      {/* 📋 Copy from LinkedIn Feature */}
<div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <button
      className="qba-button-secondary"
      type="button"
      onClick={() => setShowPasteArea(!showPasteArea)}
      style={{ marginLeft: "auto" }}
    >
      {showPasteArea ? "Hide" : "Paste From LinkedIn"}
    </button>
  </div>

  {showPasteArea && (
    <textarea
      rows={8}
      placeholder="Paste full job description from LinkedIn here..."
      onChange={(e) => handleLinkedInPaste(e.target.value)}
      style={{
        width: "100%",
        marginTop: "0.75rem",
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontFamily: "inherit",
        fontSize: "1rem",
      }}
    />
  )}
</div>

        <h1>Create New Job</h1>
        
        {uploadError && (
          <div className="error-message" style={{ 
            color: "white", 
            backgroundColor: "#d63384", 
            padding: "10px", 
            borderRadius: "5px",
            marginBottom: "20px" 
          }}>
            {uploadError}
          </div>
        )}
        
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