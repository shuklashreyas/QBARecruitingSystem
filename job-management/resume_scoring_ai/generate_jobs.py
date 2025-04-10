import json
import random

# Define diverse job categories and sample roles
job_templates = {
    "Software Engineering": [
        "Frontend Developer",
        "Backend Engineer",
        "DevOps Engineer",
        "Machine Learning Engineer"
    ],
    "Marketing": [
        "Digital Marketing Specialist", "SEO Analyst", "Brand Manager",
        "Content Strategist"
    ],
    "Human Resources": [
        "HR Generalist", "Talent Acquisition Specialist", "HR Business Partner"
    ],
    "Finance": [
        "Financial Analyst",
        "Accountant",
        "Investment Associate",
        "Risk Manager"
    ],
    "Design": [
        "UX Designer",
        "Graphic Designer",
        "Product Designer",
        "Visual Designer"
    ],
    "Business & Operations": [
        "Business Analyst", "Operations Manager", "Strategy Consultant",
        "Supply Chain Coordinator"
    ]
}

qualifications = [
    "Bachelor's degree in relevant field",
    "Strong communication and collaboration skills",
    "Experience with cross-functional teams",
    "Ability to manage multiple priorities",
    "Analytical thinking and problem-solving skills"
]

what_youll_do = [
    "Collaborate with teams across departments",
    "Design and implement new systems and workflows",
    "Analyze trends to improve performance",
    "Maintain documentation and reports",
    "Ensure alignment with organizational goals"
]

about_qba = (
    "QBA is a forward-thinking company delivering innovative solutions across "
    "various industries. We foster a collaborative, growth-oriented "
    "environment "
    "where talent is nurtured and ideas are valued."
)

accommodations = (
    (
        "QBA is committed to diversity and equal opportunity. For any "
        "accommodations, contact us at accommodations@qba.com."
    )
)


def generate_job(category, role):
    return {
        "title": role,
        "category": category,
        "description": (
            f"{about_qba}\n\nJob Role:\n{role}\n\nWhat You’ll Do:\n" +
            "\n".join(random.sample(what_youll_do, 3)) +
            "\n\nQualifications:\n" +
            "\n".join(random.sample(qualifications, 3)) +
            f"\n\nAccommodations:\n{accommodations}"
        )
    }


def generate_jobs(n=100):
    jobs = []
    all_roles = [
        (cat, role) for cat, roles in job_templates.items() for role in roles
    ]
    for _ in range(n):
        cat, role = random.choice(all_roles)
        job = generate_job(cat, role)
        jobs.append(job)
    return jobs


if __name__ == "__main__":
    print("🛠️ Generating synthetic job data...")
    jobs = generate_jobs(100)
    with open("data/jobs.json", "w") as f:
        json.dump(jobs, f, indent=2)
    print("✅ Saved 100 jobs to data/jobs.json")
