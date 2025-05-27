import React, { useState, useRef, useEffect } from "react";
import {Link } from "react-router-dom";
import "./CreateJobPage.css"; // Make sure this CSS file exists or remove if not used
import countries from "world-countries";

function CreateJobPage() {
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
  const [uploadError, setUploadError] = useState(""); // For PDF upload specific errors
  const [showPasteArea, setShowPasteArea] = useState(false);

  // State for status messages (replaces alerts)
  const [statusMessage, setStatusMessage] = useState({ text: "", type: "" }); // type: "success", "error", or "info"


  const predictLabel = async (text) => {
  try {
    const res = await fetch("http://localhost:8000/predict-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    const label = data.label;
    const confidence = data.confidence;

    console.log(`Predicted label: ${label} (confidence: ${confidence.toFixed(2)})`);

    switch (label) {
      case "job_role":
        setJobRole(text);
        break;
      case "what_youll_do":
        setWhatYouDo(text);
        break;
      case "qualifications":
        setQualifications(text);
        break;
      case "a_plus_if_you_have":
        setPlusIfYouHave(text);
        break;
      case "description":
        setDescription(text);
        break;
      case "location":
        setLocation(text);
        break;
      default:
        console.warn("Unknown label:", label);
    }
  } catch (err) {
    console.error("AI prediction failed:", err);
  }
};


  // Set default dates when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

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

  // Helper to clear status message after a delay
  const clearStatusMessage = () => {
    setTimeout(() => {
      setStatusMessage({ text: "", type: "" });
    }, 5000); // Clear after 5 seconds
  };

  const deduplicateText = (textA, textB) => {
    if (!textA && !textB) return { combined: "", uniqueB: "" };
    if (!textB) return { combined: (textA || "").trim(), uniqueB: "" };
    if (!textA) return { combined: "", uniqueB: (textB || "").trim() };

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

  const cleanGenericLines = (text) => {
    if (!text) return "";
    return text
      .split("\n")
      .filter(line => {
        const trimmedLine = line.trim();
        return (
          !/^we('| a)?re hiring/i.test(trimmedLine) &&
          !/responsibilities include/i.test(trimmedLine) &&
          !/as part of/i.test(trimmedLine) &&
          !/^\s*[-•*]\s*$/i.test(trimmedLine) && // Filter empty bullet points
          trimmedLine.length > 5
        );
      })
      .join("\n");
  };

  const handleLinkedInPaste = (rawText) => {



    if (!rawText || rawText.trim() === "") {
        // Optionally clear fields if paste area is emptied by user
        // Example: setTitle(""); setLocation(""); setDescription(""); // etc.
        return;
    }
    const clean = rawText.replace(/\r\n|\r/g, "\n").trim();
    const lines = clean.split("\n").map((line) => line.trim()).filter(Boolean);
    const full = lines.join("\n");

    // === Title Extraction ===
    const titleKeywordsExclude = /logo|save|apply|share|options|people you can reach|your network|responses managed|fit|resume|position myself|show all|ago|week ago|weeks ago|day ago|days ago|posted|clicked apply|managed off linkedin|report this job|job details|salary|job type|shift and schedule|location|company/i;
    let extractedTitle = "";
    for (let i = 0; i < Math.min(lines.length, 7); i++) { // Check first few lines
        if (lines[i].length > 5 && lines[i].length < 120 && !titleKeywordsExclude.test(lines[i]) && !/^\d+/.test(lines[i]) && !lines[i].includes('·') && !lines[i].toLowerCase().includes(' at ') && lines[i].toLowerCase() !== 'new') {
            extractedTitle = lines[i];
            break;
        }
    }
    if (!extractedTitle && lines.length > 0) {
        extractedTitle = lines.find(line => line.length > 5 && line.length < 120 && !titleKeywordsExclude.test(line) && !/^\d+/.test(line) && !line.includes('·')  && !line.toLowerCase().includes(' at ') && line.toLowerCase() !== 'new') || "";
    }
    if (extractedTitle) setTitle(extractedTitle);


    // === Location Extraction ===
    const locationRegex = /^([A-Za-z\s.,'-]+?,\s*[A-Za-z\s.,'-]+?)(?:\s*[·•\n]|$)/m;
    let foundLocation = "";
    const locationMatchResult = full.match(locationRegex);

    if (locationMatchResult && locationMatchResult[1]) {
      const potentialLocation = locationMatchResult[1].trim();
      // Avoid matching long sentences as location
      if (potentialLocation.length < 60) {
        foundLocation = potentialLocation;
      }
    }
    
    if (!foundLocation) {
      const altLocationMatch = full.match(/\b(in|at)\s+([A-Za-z\s.,'-]+(?:,\s*[A-Za-z\s.,'-]+)?)/i);
      if (altLocationMatch && altLocationMatch[2]) {
        const potentialLocation = altLocationMatch[2].trim();
        if (potentialLocation.length < 60) {
          foundLocation = potentialLocation;
        }
      }
    }
    if (foundLocation) setLocation(foundLocation);


    // === Work Mode ===
    if (/\bremote\b/i.test(full)) setInPersonMode("Remote");
    else if (/\bhybrid\b/i.test(full)) setInPersonMode("Hybrid");
    else if (/\b(on[-\s]?site|in[-\s]?person|office-based)\b/i.test(full)) setInPersonMode("In-Person");


    // === Section Extractor ===
    const extractSection = (labelVariants, textToSearch = full) => {
      for (const label of labelVariants) {
        const pattern = new RegExp(
          `^${label}(?:\\s*[:-\u2013])?\\s*\\n?([\\s\\S]*?)(?=\\n(?:[A-Z][A-Za-z'’]+(?:\\s+[A-Z][A-Za-z'’]+){0,3}:|\\s*\\n)|$)`,
          "im"
        );
        const match = textToSearch.match(pattern);
        if (match && match[1] && match[1].trim()) return match[1].trim();
      }
      return "";
    };
    
    let jobRoleText = extractSection([
        "About the job", "The Role", "Position Description", "Job Overview", "Overview", "Role Summary", "Job Purpose"
    ]);
    let whatYouDoText = extractSection([
        "What You'll Do", "Responsibilities", "Key Responsibilities", "Duties", "Your Impact", "In this role, you will", "Day-to-day activities",
        "Below Are The Skills That We Need", "Primary Responsibilities", "Job Responsibilities", "Key Accountabilities", "Your Tasks"
    ]);
    let qualificationsText = extractSection([
        "Qualifications", "Requirements", "Minimum Qualifications", "Skills & Experience", "Who You Are", 
        "What You Bring", "Required Skills", "Basic Qualifications", "Ideal Candidate Profile", "Your Profile", "Essential Skills"
    ]);
    let plusText = extractSection([
        "Preferred Qualifications", "Nice to have", "Bonus Points", "A Plus if You Have", "Additional Skills", "Desired Skills", "Good to Have"
    ]);

    const blocks = [jobRoleText, whatYouDoText, qualificationsText, plusText];
    blocks.forEach(block => {
      if (block && block.length > 40) predictLabel(block);
    });

    jobRoleText = cleanGenericLines(jobRoleText);
    whatYouDoText = cleanGenericLines(whatYouDoText);
    qualificationsText = cleanGenericLines(qualificationsText);
    plusText = cleanGenericLines(plusText);
    
    if (jobRoleText && whatYouDoText) {
      const deduped = deduplicateText(jobRoleText, whatYouDoText);
      jobRoleText = deduped.combined;
      whatYouDoText = deduped.uniqueB;
    }
    if (whatYouDoText && qualificationsText) {
      const deduped = deduplicateText(whatYouDoText, qualificationsText);
      whatYouDoText = deduped.combined;
      qualificationsText = deduped.uniqueB;
    }
    if (jobRoleText && qualificationsText && !whatYouDoText) { // If whatYouDo is empty, try to deduplicate jobRole vs qualifications
        const deduped = deduplicateText(jobRoleText, qualificationsText);
        jobRoleText = deduped.combined;
        qualificationsText = deduped.uniqueB;
    }
    if (qualificationsText && plusText) {
      const deduped = deduplicateText(qualificationsText, plusText);
      qualificationsText = deduped.combined;
      plusText = deduped.uniqueB;
    }
    
    // === AI Enhancement Placeholder ===
    // TODO: AI Step:
    // 1. Send `full` text or extracted sections to an AI model.
    // 2. Ask the AI to refine sections, extract specific skills, experience years, etc.
    // 3. Update state with AI's response.

    if (jobRoleText) setJobRole(jobRoleText);
    if (whatYouDoText) setWhatYouDo(whatYouDoText);
    if (qualificationsText) setQualifications(qualificationsText);
    if (plusText) setPlusIfYouHave(plusText);

    const getFirstMeaningfulLine = (text) => {
        if (!text) return "";
        const textLines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 15); // Prefer slightly longer lines
        for (const line of textLines) {
            if (!/^(Responsibilities|What You'll Do|Duties|Tasks|Skills|About the job|Role|Overview|Position Description|Qualifications|Requirements|Key Responsibilities|Minimum Qualifications)/i.test(line)) {
                return line.replace(/^[-•*]\s*/, '').trim();
            }
        }
        // Fallback if all lines look like headers or are too short, take the first non-empty one if exists
        const firstLine = text.split('\n').map(l => l.trim()).filter(l => l)[0];
        return firstLine ? firstLine.replace(/^[-•*]\s*/, '').trim() : "";
    };

    if (extractedTitle) {
      let summaryBasis = getFirstMeaningfulLine(whatYouDoText) || getFirstMeaningfulLine(jobRoleText) || getFirstMeaningfulLine(qualificationsText);
      if (summaryBasis) {
        setDescription(`${extractedTitle} - ${summaryBasis.substring(0, 200)}...`);
      } else {
        setDescription(`${extractedTitle} - Review details in respective sections.`);
      }
    } else if (!description) { // Only if description is still empty
        let summaryBasis = getFirstMeaningfulLine(jobRoleText) || getFirstMeaningfulLine(whatYouDoText);
        if (summaryBasis) {
            setDescription(summaryBasis.substring(0,250) + "...");
        }
    }
    
    setStatusMessage({ text: "✅ Job details parsed. Review and complete the form.", type: "success" });
    clearStatusMessage();
  };
  
  const determineWorkMode = (text) => {
    if (!text) return "";
    const lowerText = text.toLowerCase();
    if (lowerText.includes("remote only") || lowerText.includes("fully remote") || lowerText.includes("100% remote")) return "Remote";
    if (lowerText.includes("hybrid") || lowerText.includes("flexible")) return "Hybrid";
    if (lowerText.includes("in office") || lowerText.includes("on-site") || lowerText.includes("in-person") || lowerText.includes("office-based")) return "In-Person";
    if (lowerText.includes("remote")) return "Remote";
    return "";
  };

  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setStatusMessage({ text: "", type: "" }); // Clear previous messages
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
        const errorData = await res.json().catch(() => ({ detail: "Unknown error reading PDF response" }));
        throw new Error(errorData.detail || "Failed to parse PDF");
      }
      
      const data = await res.json();
      // console.log("Parsed PDF data:", data); // For debugging

      setTitle(data.job_name || "");
      if (data.job_name && data.job_role) {
        setDescription(`${data.job_name} position focusing on ${data.job_role.split('\n')[0]}`);
      } else if (data.job_name) {
        setDescription(`${data.job_name} - see details below.`);
      }
      setJobRole(data.job_role || "");
      setWhatYouDo(data.what_youll_do || "");
      setQualifications(data.qualifications || "");
      setPlusIfYouHave(data.a_plus_if_you_have || "");
      if (data.compensation) {
        const numericValue = String(data.compensation).replace(/[^0-9.,$-]/g, '')
        setCompensation(numericValue || "");
      }
      setLocation(data.location || "");
      const workMode = determineWorkMode(data.location || data.job_role || data.what_youll_do || "");
      if (workMode) setInPersonMode(workMode);
      if (data.job_posted) setJobPosted(data.job_posted);
      if (data.job_expiration) setJobExpiration(data.job_expiration);

      setStatusMessage({ text: "📄 PDF parsed successfully!", type: "success" });
      
    } catch (err) {
      // console.error("Error parsing PDF:", err); // For debugging
      setUploadError(`Failed to parse job PDF: ${err.message}`);
      setStatusMessage({ text: `Error parsing PDF: ${err.message}`, type: "error" });
    } finally {
      setIsUploading(false);
      clearStatusMessage();
    }
  };

  const clearForm = () => {
    setTitle("");
    setInPersonMode("");
    setDescription("");
    setJobRole("");
    setWhatYouDo("");
    setQualifications("");
    setPlusIfYouHave("");
    setCompensation("");
    setLocation("");
  
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0];
    const expirationDate = new Date();
    expirationDate.setDate(today.getDate() + 30);
    const formattedExpiration = expirationDate.toISOString().split("T")[0];
  
    setJobPosted(formattedToday);
    setJobExpiration(formattedExpiration);
    setOtherMaterials([]);
    setJobQuestion("");
    setQuestionType("short_answer");
    setUrlLabel("");
    setUploadError("");
    setShowPasteArea(false); // Also hide paste area if it was open

    setStatusMessage({ text: "Form cleared.", type: "info" });
    clearStatusMessage();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ text: "", type: "" }); // Clear previous messages

    const aboutQBA = `## About QBA\nQBA is a forward-thinking technology company on a mission to deliver cutting-edge solutions in the software industry. We specialize in building products that empower businesses to innovate, optimize processes, and stay ahead of market demands. By leveraging advanced technologies and data-driven strategies, we help our clients achieve their goals with efficiency and precision.\n\nAs a fast-growing tech company, QBA combines the agility of a startup with the stability of an established player in the industry. Our commitment to fostering a culture of innovation, collaboration, and excellence makes us a great place for passionate engineers to thrive and grow. QBA values its employees and invests in creating a work environment where creativity, teamwork, and development opportunities flourish.`;
    const accommodations = `**Accommodations**\nQBA is committed to providing reasonable accommodations for qualified individuals with disabilities in our job application procedures. If you need assistance or an accommodation due to a disability, you may contact us at accommodations@qba.com or call us at [Phone Number].\n\nQBA is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees. All employment decisions are based on merit, qualifications, and business needs.`;

    const formatAsBullets = (text) => {
      if (!text) return "";
      // If text already contains common bullet points (•, -, *), return as is or with minor cleaning
      if (text.match(/^\s*[-•*]\s/m)) {
        return text.split("\n").map(line => line.trim()).filter(line => line).join("\n");
      }
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
      const token = localStorage.getItem("token"); // Make sure localStorage is accessible
      const response = await fetch("http://127.0.0.1:8000/jobs", { // Your actual API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: "Unknown error creating job"}));
        throw new Error(errorData.detail || "Failed to create job");
      }
      
      setStatusMessage({ text: "🎉 Job created successfully!", type: "success" });
      // navigate("/jobs"); // Uncomment if using react-router
      console.log("Job created, navigate to /jobs"); // For testing
      // clearForm(); // Optionally clear form after successful submission

    } catch (error) {
      // console.error("Error creating job:", error); // For debugging
      setStatusMessage({ text: `Error creating job: ${error.message}`, type: "error" });
    } finally {
        clearStatusMessage();
    }
  };

  return (
    <div style={{ position: "relative", padding: "20px", maxWidth: "900px", margin: "auto" }}>
      <Link to="/jobs" style={{ position: "absolute", top: "20px", left: "20px" }}>
        {/* It's better to import the image or use a path from the public folder */}
        <img src="/QBA.png" alt="QBA Logo" style={{ height: "60px", cursor: "pointer" }} 
             onError={(e) => { e.target.onerror = null; e.target.alt="QBA Logo"; e.target.src="https://via.placeholder.com/100x60.png?text=QBA"; }}/>
      </Link>

      <button
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: isUploading ? "#888888" : "#d63384", // Example color
          color: "white",
          padding: "10px 18px", // Slightly increased padding
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: isUploading ? "not-allowed" : "pointer",
          zIndex: 10,
          fontSize: "0.9rem"
        }}
        onClick={() => !isUploading && fileInputRef.current && fileInputRef.current.click()}
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

      {/* Added className from your original for main content area and some padding */}
      <div className="container create-job-page" style={{paddingTop: "80px"}}> 
      
        {/* Status Message Display */}
        {statusMessage.text && (
          <div
            style={{
              padding: "12px 15px",
              marginBlock: "20px",
              borderRadius: "6px",
              textAlign: "center",
              fontSize: "0.95rem",
              border: `1px solid ${statusMessage.type === "success" ? "#c3e6cb" : (statusMessage.type === "error" ? "#f5c6cb" : "#bee5eb")}`,
              backgroundColor: statusMessage.type === "success" ? "#d4edda" : (statusMessage.type === "error" ? "#f8d7da" : "#d1ecf1"),
              color: statusMessage.type === "success" ? "#155724" : (statusMessage.type === "error" ? "#721c24" : "#0c5460"),
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Copy from LinkedIn Feature */}
        <div style={{ marginBottom: "2rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              // className="qba-button-secondary" // Use inline styles or ensure this class is defined
              type="button"
              onClick={() => setShowPasteArea(!showPasteArea)}
              style={{ 
                marginLeft: "auto", 
                backgroundColor: "#007bff", // Example: Primary button color
                color: "white",
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem"
               }}
            >
              {showPasteArea ? "Hide Paste Area" : "📋 Paste from LinkedIn/Job Source"}
            </button>
          </div>

          {showPasteArea && (
            <textarea
              rows={12} // Increased rows
              placeholder="Paste full job description from LinkedIn or any other source here..."
              onChange={(e) => handleLinkedInPaste(e.target.value)}
              style={{
                width: "100%",
                marginTop: "1rem", // Increased margin
                padding: "10px",    // Increased padding
                border: "1px solid #ced4da", // Softer border color
                borderRadius: "6px",
                fontFamily: "inherit",
                fontSize: "1rem",
                boxSizing: "border-box", // Ensures padding doesn't add to width
                resize: "vertical"
              }}
            />
          )}
        </div>

        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem"}}>
            <h1>Create New Job</h1>
            <button
                type="button"
                onClick={clearForm}
                style={{
                backgroundColor: "#6c757d", // Secondary button color
                color: "white",
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem",
                height: "fit-content" // Ensure button aligns well if text wraps
                }}
            >
                🧹 Clear Form
            </button>
        </div>
        
        {uploadError && ( // Specific error display for PDF upload
          <div className="error-message" style={{ 
            color: "#721c24", 
            backgroundColor: "#f8d7da", 
            border: "1px solid #f5c6cb",
            padding: "12px 15px", 
            borderRadius: "6px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            {uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Using a more structured layout for form fields might be good, e.g., divs for each field group */}
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Job Name:</label>
            <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Work Mode:</label>
            <select style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} value={inPersonMode} onChange={(e) => setInPersonMode(e.target.value)} required>
              <option value="">Select Work Mode</option>
              <option value="In-Person">In-Person</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Short Job Description:</label>
            <textarea style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '80px'}} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Job Role / Overview:</label>
            <textarea style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '120px'}} value={jobRole} onChange={(e) => setJobRole(e.target.value)}  /> {/* Consider if this should be required */}
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>What You'll Do / Responsibilities:</label>
            <textarea style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '150px'}} value={whatYouDo} onChange={(e) => setWhatYouDo(e.target.value)}  /> {/* Consider if this should be required */}
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Qualifications / Requirements:</label>
            <textarea style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '150px'}} value={qualifications} onChange={(e) => setQualifications(e.target.value)}  /> {/* Consider if this should be required */}
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>A Plus if You Have (Optional):</label>
            <textarea style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '100px'}} value={plusIfYouHave} onChange={(e) => setPlusIfYouHave(e.target.value)} />
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Compensation (e.g., USD/hour, annual salary range):</label>
            <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} type="text" value={compensation} onChange={(e) => setCompensation(e.target.value)} placeholder="e.g., $50-60/hour or $100k-$120k/year" /> {/* Consider if this should be required */}
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Location:</label>
            <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} list="location-options" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., New York, NY or Remote" required />
            <datalist id="location-options">
              {countries.map((country) => country.name.common).sort().map((name) => (
                <option key={name} value={name} />
              ))}
              <option value="Remote" />
              <option value="Hybrid" /> 
              {/* Add more common city/state options or specific locations */}
            </datalist>
          </div>
          <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Job Posted Date:</label>
              <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} type="date" value={jobPosted} onChange={(e) => setJobPosted(e.target.value)} />
            </div>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Application Deadline:</label>
              <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} type="date" value={jobExpiration} onChange={(e) => setJobExpiration(e.target.value)} />
            </div>
          </div>
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Other Material to Request (Optional):</label>
            <select style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', minHeight: '80px'}} multiple value={otherMaterials} onChange={handleOtherMaterialChange}>
              <option value="job_question">Job Related Question</option>
              <option value="transcript">Latest School Transcript</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="url">URLs (e.g., Portfolio, GitHub)</option>
            </select>
          </div>
          {otherMaterials.includes("job_question") && (
            <div style={{marginBottom: '1rem', padding: '1rem', border: '1px solid #e9ecef', borderRadius: '6px', backgroundColor: '#f8f9fa'}}>
              <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>Custom Job Question:</label>
              <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da', marginBottom: '0.5rem'}} type="text" value={jobQuestion} onChange={(e) => setJobQuestion(e.target.value)} placeholder="Enter your custom question"/>
              <select style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option value="short_answer">Short Answer</option>
                <option value="yes_no">Yes / No / N/A</option>
              </select>
            </div>
          )}
          {otherMaterials.includes("url") && (
            <div style={{marginBottom: '1rem', padding: '1rem', border: '1px solid #e9ecef', borderRadius: '6px', backgroundColor: '#f8f9fa'}}>
              <label style={{display: 'block', marginBottom: '0.3rem', fontWeight: 'bold'}}>URL Field Label (e.g., Portfolio, GitHub):</label>
              <input style={{width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ced4da'}} type="text" value={urlLabel} onChange={(e) => setUrlLabel(e.target.value)} placeholder="e.g., GitHub Profile URL"/>
            </div>
          )}
          <button 
            type="submit" 
            style={{
                backgroundColor: "#28a745", // Success button color
                color: "white",
                padding: "12px 25px",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "1rem",
                display: 'block', // Make it block to center if needed or use margin auto
                margin: '20px auto 0 auto' // Center the button
            }}
           >Create Job</button>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;