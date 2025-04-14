import sys
import json
import re
from PyPDF2 import PdfReader


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    all_text = ""
    for page in reader.pages:
        all_text += page.extract_text() or ""
    return clean_text(all_text)


def save_as_json(text, output_path):
    data = [{"text": text}]
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python convert_pdf_to_json.py input.pdf output.json")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = sys.argv[2]

    print("📄 Reading and cleaning PDF...")
    text = extract_text_from_pdf(pdf_path)
    save_as_json(text, output_path)
    print(f"✅ Saved JSON to {output_path}")
