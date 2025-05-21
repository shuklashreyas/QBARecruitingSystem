from fastapi import APIRouter, UploadFile, File
from typing import Dict
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


def sanitize_text(text: str) -> str:
    return (
        text.replace("â€¢", "•")
            .replace("â€™", "’")
            .replace("â€“", "–")
            .replace("â€”", "—")
            .replace("â€œ", '"')
            .replace("â€", '"')
            .replace("â€˜", "'")
            .replace("â€\u0099", "'")
            .replace("\uFFFD", "")
    )


def extract_name(text: str) -> str:
    lines = text.strip().splitlines()
    for line in lines[:5]:  # Check only top few lines
        if line.isupper() and len(line.split()) in [2, 3]:
            return line.title()
    return "N/A"


def estimate_experience(text: str) -> str:
    date_matches = re.findall(
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}", text)
    years = len(set(date_matches)) // 2
    return str(years) if years else "N/A"


def extract_skills(text: str) -> list:
    skill_keywords = [
        "python", "java", "c++", "sql", "javascript", "html", "css", "r", "kotlin", "typescript",
        "react", "node.js", "flask", "fastapi", "tensorflow", "docker", "git", "mongodb", "sqlite"
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
    content = await file.read()
    text = extract_text_from_pdf_bytes(content)
    return extract_job_fields(text)


def extract_job_fields(text: str) -> Dict:
    def match(pattern, fallback=""):
        m = re.search(pattern, text, re.I | re.DOTALL)
        return m.group(1).strip() if m else fallback

    return {
        "job_name": match(r"(?:Job Title|Position)[:\-]?\s*(.*)"),
        "job_role": match(r"(?:Role|Job Role)[:\-]?\s*(.*)"),
        "what_youll_do": match(r"(?:Responsibilities|What You(?:'ll)? Do)[:\-]?\s*(.*?)(?:Qualifications|Skills|Requirements|$)"),
        "qualifications": match(r"(?:Qualifications|Requirements)[:\-]?\s*(.*?)(?:A Plus|Preferred|$)"),
        "a_plus_if_you_have": match(r"(?:A Plus if You Have|Preferred)[:\-]?\s*(.*)"),
        "compensation": match(r"(?:Compensation|Salary)[:\-]?\s*(.*)"),
        "location": match(r"(?:Location)[:\-]?\s*(.*)"),
    }
