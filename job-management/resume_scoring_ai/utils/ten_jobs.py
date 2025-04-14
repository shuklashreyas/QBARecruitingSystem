import json
import os

# Define the first 10 categories
categories = [
    "Accountant", "Advocate", "Agriculture", "Apparel", "Architecture",
    "Arts", "Automobile", "Aviation", "BPO", "Banking"
]

# Job descriptions dictionary
job_descriptions = {
    "Accountant": {
        "Job Role": "As an Accountant at QBA, you’ll oversee financial records, prepare reports, and ensure regulatory compliance while optimizing accounting operations.",
        "What You’ll Do": [
            "Prepare and analyze financial statements, reports, and records.",
            "Manage accounts payable and receivable, and reconcile bank statements.",
            "Ensure compliance with tax regulations and internal controls.",
            "Collaborate with auditors and assist in audits.",
            "Streamline accounting operations using ERP tools like SAP or QuickBooks."
        ],
        "Qualifications": [
            "Bachelor’s degree in Accounting, Finance, or related field.",
            "2+ years of accounting or financial experience.",
            "Strong knowledge of GAAP and tax laws.",
            "Proficiency with Excel and accounting software (QuickBooks, SAP).",
            "Excellent attention to detail and organizational skills."
        ],
        "A Plus if You Have": [
            "CPA or CMA certification.",
            "Experience with international financial reporting.",
            "Familiarity with automation tools and macros."
        ]
    },
    "Advocate": {
        "Job Role": "As an Advocate at QBA, you’ll represent clients in legal proceedings and provide sound legal advice for civil, criminal, or corporate matters.",
        "What You’ll Do": [
            "Represent clients in court hearings and legal negotiations.",
            "Draft and review contracts, legal documents, and policies.",
            "Advise clients on legal rights and obligations.",
            "Conduct legal research and present findings.",
            "Liaise with internal and external stakeholders for legal matters."
        ],
        "Qualifications": [
            "LLB or equivalent law degree.",
            "Licensed to practice law in applicable jurisdiction.",
            "Strong verbal and written communication skills.",
            "Experience in litigation or corporate law.",
            "Analytical mindset and negotiation skills."
        ],
        "A Plus if You Have": [
            "Experience in intellectual property law or data privacy.",
            "Fluency in multiple languages."
        ]
    },
    "Agriculture": {
        "Job Role": "As an Agricultural Specialist at QBA, you'll improve agricultural practices and sustainability through research, planning, and innovation.",
        "What You’ll Do": [
            "Develop and implement sustainable farming strategies.",
            "Conduct soil and crop health assessments.",
            "Use agri-tech tools to monitor yields and optimize outputs.",
            "Educate farmers on best practices and new technology.",
            "Analyze data to increase crop profitability and reduce waste."
        ],
        "Qualifications": [
            "Bachelor’s in Agriculture, Agronomy, or related field.",
            "Hands-on farming or research experience.",
            "Knowledge of agricultural technologies and GIS tools.",
            "Strong analytical and communication skills."
        ],
        "A Plus if You Have": [
            "Master’s in Agricultural Science.",
            "Experience with smart irrigation or climate-resilient practices."
        ]
    },
    "Apparel": {
        "Job Role": "As an Apparel Designer at QBA, you’ll create fashion-forward designs, manage seasonal collections, and collaborate with production and marketing.",
        "What You’ll Do": [
            "Create designs and sketches for seasonal collections.",
            "Source and select appropriate fabrics and trims.",
            "Oversee sample creation and fittings.",
            "Stay updated on market trends and consumer preferences.",
            "Coordinate with production and sales teams."
        ],
        "Qualifications": [
            "Degree in Fashion Design or related field.",
            "Strong sketching and Adobe Illustrator/Photoshop skills.",
            "Understanding of garment construction and materials.",
            "Excellent sense of style and color coordination."
        ],
        "A Plus if You Have": [
            "Experience with PLM systems.",
            "Portfolio with original designs."
        ]
    },
    "Architecture": {
        "Job Role": "As an Architect at QBA, you will design buildings and infrastructure that are both functional and aesthetically pleasing, while ensuring safety and sustainability.",
        "What You’ll Do": [
            "Develop building designs and detailed drawings.",
            "Coordinate with engineers, contractors, and clients.",
            "Ensure compliance with zoning laws and safety regulations.",
            "Use CAD software like AutoCAD, Revit, or Rhino.",
            "Present design proposals and adjust based on feedback."
        ],
        "Qualifications": [
            "Bachelor’s or Master’s in Architecture.",
            "Licensed architect or working toward licensure.",
            "Strong CAD and visualization skills.",
            "Knowledge of construction techniques and materials."
        ],
        "A Plus if You Have": [
            "LEED certification.",
            "Experience in sustainable/green architecture."
        ]
    },
    "Arts": {
        "Job Role": "As a Visual Artist at QBA, you’ll conceptualize and create compelling visuals for digital and physical media, supporting branding and storytelling efforts.",
        "What You’ll Do": [
            "Create original illustrations, graphics, and mixed media.",
            "Collaborate with creative and marketing teams.",
            "Develop concept art and storyboards for campaigns.",
            "Maintain and evolve brand aesthetics.",
            "Present and revise work based on feedback."
        ],
        "Qualifications": [
            "Degree in Fine Arts, Design, or equivalent experience.",
            "Proficiency with Adobe Creative Suite.",
            "Strong creative portfolio.",
            "Excellent conceptual and executional skills."
        ],
        "A Plus if You Have": [
            "Experience in animation or 3D modeling.",
            "Gallery shows or exhibitions of your work."
        ]
    },
    "Automobile": {
        "Job Role": "As an Automotive Engineer at QBA, you’ll design and improve vehicles, focusing on performance, safety, and sustainability.",
        "What You’ll Do": [
            "Design vehicle components and systems.",
            "Conduct simulations and tests for safety and performance.",
            "Collaborate with manufacturing teams on prototyping.",
            "Optimize fuel efficiency and reduce emissions.",
            "Troubleshoot engineering problems with cross-functional teams."
        ],
        "Qualifications": [
            "Bachelor’s in Mechanical/Automotive Engineering.",
            "Knowledge of CAD and simulation tools (CATIA, SolidWorks).",
            "Experience with vehicle testing and diagnostics.",
            "Strong understanding of automotive systems."
        ],
        "A Plus if You Have": [
            "Experience with EVs or hybrid technologies.",
            "Certifications in ISO/TS standards."
        ]
    },
    "Aviation": {
        "Job Role": "As an Aviation Operations Specialist at QBA, you will oversee flight operations, maintenance, and compliance with aviation standards.",
        "What You’ll Do": [
            "Manage flight schedules and aircrew coordination.",
            "Ensure compliance with FAA and international regulations.",
            "Monitor aircraft maintenance and safety procedures.",
            "Use aviation software for operations tracking.",
            "Collaborate with pilots, engineers, and ground crew."
        ],
        "Qualifications": [
            "Degree in Aviation Management or related field.",
            "Experience in flight operations or airport services.",
            "Familiarity with aviation safety protocols.",
            "Excellent organizational and communication skills."
        ],
        "A Plus if You Have": [
            "Pilot license or ATC certification.",
            "Experience with flight planning systems (Jeppesen, Sabre)."
        ]
    },
    "BPO": {
        "Job Role": "As a BPO Customer Support Agent at QBA, you’ll handle customer interactions across channels to deliver high-quality support and satisfaction.",
        "What You’ll Do": [
            "Respond to customer queries via phone, email, or chat.",
            "Resolve technical or billing issues efficiently.",
            "Document customer interactions and feedback.",
            "Collaborate with internal teams to improve service.",
            "Meet performance KPIs like CSAT and response time."
        ],
        "Qualifications": [
            "High school diploma or equivalent; bachelor's preferred.",
            "Strong verbal and written communication skills.",
            "Basic computer literacy and CRM experience.",
            "Customer-focused and empathetic approach."
        ],
        "A Plus if You Have": [
            "Experience in international voice process.",
            "Multilingual abilities."
        ]
    },
    "Banking": {
        "Job Role": "As a Banking Associate at QBA, you’ll manage client accounts, advise on financial products, and ensure regulatory compliance.",
        "What You’ll Do": [
            "Assist customers with account management and inquiries.",
            "Promote bank products like loans, credit, and savings plans.",
            "Ensure compliance with KYC and anti-money laundering rules.",
            "Prepare reports and manage financial records.",
            "Handle transactions securely and accurately."
        ],
        "Qualifications": [
            "Bachelor’s in Finance, Business, or related field.",
            "Experience in retail or commercial banking.",
            "Strong numeracy and communication skills.",
            "Knowledge of banking software and regulations."
        ],
        "A Plus if You Have": [
            "Certifications like CFA, FRM, or CPA.",
            "Experience with fintech or digital banking systems."
        ]
    }
}

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

# Write to file
output_path = "data/job_descriptions.json"
with open(output_path, "w") as f:
    json.dump(job_descriptions, f, indent=2)

output_path
