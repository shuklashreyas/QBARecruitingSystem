import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict, Optional
import fitz  # PyMuPDF
import re

router = APIRouter()


# ============================
# 📄 RESUME PARSER
# ============================


@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)) -> Dict:
    content = await file.read()
    text = extract_text_from_pdf_bytes(content)
    return parse_resume_text(text)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    with fitz.open("pdf", pdf_bytes) as doc:
        text = "\n".join(page.get_text("text") or "" for page in doc)
    return sanitize_text(text)


def extract_name(text: str) -> str:
    lines = text.strip().splitlines()
    for line in lines[:5]:  # Check only top few lines
        if line.isupper() and len(line.split()) in [2, 3]:
            return line.title()
    return "N/A"


def estimate_experience(text: str) -> str:
    date_matches = re.findall(
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}", text
    )
    years = len(set(date_matches)) // 2
    return str(years) if years else "N/A"


def extract_skills(text: str) -> list:
    skill_keywords = [
        "python",
        "java",
        "c++",
        "sql",
        "javascript",
        "html",
        "css",
        "r",
        "kotlin",
        "typescript",
        "react",
        "node.js",
        "flask",
        "fastapi",
        "tensorflow",
        "docker",
        "git",
        "mongodb",
        "sqlite",
    ]
    found = [skill for skill in skill_keywords if skill in text.lower()]
    return list(set(found))


def parse_resume_text(text: str) -> Dict:
    email_match = re.search(r"[\w\.-]+@[\w\.-]+", text)
    phone_match = re.search(r"(\+?\d[\d\-\(\) ]{7,}\d)", text)
    education_match = re.search(
        r"(Bachelor|Master|PhD)[^\.]{0,100}", text, re.I)

    return {
        "name": extract_name(text),
        "email": email_match.group(0) if email_match else "N/A",
        "phone": phone_match.group(0) if phone_match else "N/A",
        "education": education_match.group(0).strip() if education_match else "N/A",
        "experience": estimate_experience(text),
        "skills": extract_skills(text),
    }


# ============================
# 📄 JOB DESCRIPTION PARSER
# ============================


@router.post("/parse-job-pdf")
async def parse_job_pdf(file: UploadFile = File(...)) -> Dict:
    """Parse a job description PDF and extract relevant fields"""
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        text = extract_text_from_pdf_bytes(content)
        job_data = extract_job_fields(text)

        # Set default dates if missing
        today = datetime.datetime.now()
        if not job_data.get("job_posted"):
            job_data["job_posted"] = today.strftime("%Y-%m-%d")
        if not job_data.get("job_expiration"):
            # Default 30 days from now
            expiration = today + datetime.timedelta(days=30)
            job_data["job_expiration"] = expiration.strftime("%Y-%m-%d")

        return job_data
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to parse PDF: {str(e)}")


def sanitize_text(text: str) -> str:
    """Clean up text by replacing special characters"""
    replacements = {
        "â€¢": "•",
        "â€™": "'",
        "â€“": "–",
        "â€œ": '"',
        "â€": '"',
        "â€˜": "'",
        "â€\u0099": "'",
        "\ufffd": "",
        "\xa0": " ",  # Non-breaking space
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    # Normalize bullet points
    text = re.sub(r"[•*-]\s*", "• ", text)

    return text


def extract_section(
    text: str, section_patterns: list, end_patterns: Optional[list] = None
) -> str:
    """
    Extract a section from text based on patterns.

    Args:
        text: The full text to search in
        section_patterns: List of patterns that might mark the beginning of the section
        end_patterns: Optional list of patterns that might mark the end of the section

    Returns:
        The extracted section text or empty string if not found
    """
    for pattern in section_patterns:
        # Find the starting point of the section
        start_match = re.search(pattern, text, re.I)
        if not start_match:
            continue

        start_pos = start_match.end()

        # If no end patterns provided, capture until the next section heading
        if not end_patterns:
            # Look for the next section heading (capital letters followed by colon)
            end_match = re.search(r"\n[A-Z][A-Z\s]+:", text[start_pos:])
            if end_match:
                end_pos = start_pos + end_match.start()
                return text[start_pos:end_pos].strip()
            else:
                # If no next section, take all remaining text
                return text[start_pos:].strip()

        # Find the earliest end pattern match
        end_pos = len(text)
        for end_pattern in end_patterns:
            end_match = re.search(end_pattern, text[start_pos:], re.I)
            if end_match and (start_pos + end_match.start() < end_pos):
                end_pos = start_pos + end_match.start()

        return text[start_pos:end_pos].strip()

    return ""


def extract_job_fields(text: str) -> Dict:
    """
    Extract job details from the text content of a PDF.

    Args:
        text: The text content of the PDF

    Returns:
        Dictionary containing extracted job fields
    """
    # Common section headings and their possible variations
    sections = {
        "job_name": [
            r"(?:job|position)(?:\s+title)?[:\-]?\s*",
            r"^.*?(?=\n)",  # Fallback: first line might be the job title
        ],
        "job_role": [
            r"(?:role|job role|about the role|position overview)[:\-]?\s*",
            r"(?:about this position)[:\-]?\s*",
        ],
        "what_youll_do": [
            r"(?:responsibilities|what you(?:'ll)? do|key duties|job duties)[:\-]?\s*",
            r"(?:what you(?:'ll)? be doing)[:\-]?\s*",
            r"(?:day to day responsibilities)[:\-]?\s*",
        ],
        "qualifications": [
            r"(?:qualifications|requirements|required skills|you should have)[:\-]?\s*",
            r"(?:who you are|what you bring)[:\-]?\s*",
        ],
        "a_plus_if_you_have": [
            r"(?:a plus if you have|preferred|nice to have|bonus points)[:\-]?\s*",
            r"(?:preferred qualifications|desired skills)[:\-]?\s*",
        ],
        "compensation": [
            r"(?:compensation|salary|pay|remuneration)[:\-]?\s*",
            r"(?:we offer|benefits|what we offer)[:\-]?\s*",
        ],
        "location": [
            r"(?:location|place|work location|job location)[:\-]?\s*",
            r"(?:where you(?:'ll)? work)[:\-]?\s*",
            r"(?:remote|on-site|hybrid)[:\-]?\s*",
        ],
    }

    # End patterns - sections that might follow each section
    end_patterns = {
        "job_name": [
            r"(?:role|job role|about the role|position overview)[:\-]?\s*",
            r"(?:what you(?:'ll)? do|responsibilities|key duties)[:\-]?\s*",
        ],
        "job_role": [
            r"(?:responsibilities|what you(?:'ll)? do|key duties)[:\-]?\s*",
            r"(?:qualifications|requirements|required skills)[:\-]?\s*",
        ],
        "what_youll_do": [
            r"(?:qualifications|requirements|required skills|you should have)[:\-]?\s*",
            r"(?:who you are|what you bring)[:\-]?\s*",
        ],
        "qualifications": [
            r"(?:a plus if you have|preferred|nice to have|bonus points)[:\-]?\s*",
            r"(?:compensation|salary|pay|benefits|we offer)[:\-]?\s*",
        ],
        "a_plus_if_you_have": [
            r"(?:compensation|salary|pay|benefits|we offer)[:\-]?\s*",
            r"(?:location|place|work location)[:\-]?\s*",
        ],
        "compensation": [
            r"(?:location|place|work location)[:\-]?\s*",
            r"(?:about us|company|who we are)[:\-]?\s*",
        ],
    }

    # Extract sections
    result = {}
    for field, patterns in sections.items():
        ends = end_patterns.get(field, None)
        content = extract_section(text, patterns, ends)

        # Format the content based on field type
        if field in ["what_youll_do", "qualifications", "a_plus_if_you_have"]:
            # Convert to bullet points if not already
            if not content.strip().startswith("•"):
                content = format_as_bullets(content)

        result[field] = content

    # Try to extract salary/compensation data using regex patterns
    if not result["compensation"] or len(result["compensation"]) < 3:
        salary_match = re.search(
            r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:-|to)\s*\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)",
            text,
        )
        if salary_match:
            result["compensation"] = f"{salary_match.group(1)}-{salary_match.group(2)}"
        else:
            hourly_match = re.search(
                r"\$(\d{1,3}(?:\.\d+)?)\s*(?:-|to)?\s*\$?(\d{1,3}(?:\.\d+)?)/(?:hr|hour)",
                text,
            )
            if hourly_match:
                result["compensation"] = f"{hourly_match.group(1)}"

    # Process the job title - clean it up if possible
    if result.get("job_name"):
        # Remove company name if it appears in the job title
        job_title = result["job_name"]
        # Limit to first line and remove extra spaces
        job_title = job_title.split("\n")[0].strip()
        # Remove "Job Title:" prefix if present
        job_title = re.sub(
            r"^(?:job|position)(?:\s+title)?[:\-]?\s*", "", job_title, flags=re.I
        )
        result["job_name"] = job_title

    return result


def format_as_bullets(text: str) -> str:
    """Format text as bullet points if it's not already"""
    if not text:
        return ""

    # If already has bullet points, return as is
    if "•" in text:
        return text

    # Split by new lines and convert to bullet points
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    # For very long paragraphs, try to split by sentences
    if len(lines) == 1 and len(lines[0]) > 100:
        sentences = re.split(r"(?<=[.!?])\s+", lines[0])
        lines = [s.strip() for s in sentences if s.strip()]

    return "\n".join(f"• {line}" for line in lines if line)
