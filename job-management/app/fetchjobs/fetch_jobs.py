import requests

# TEMP: replace with your real API key or set it via env variable
SERP_APIKEY = "6af570eadc7ffde2c0150040f1b2a41c856b8fe68eeb2ae702b0276805e74663"

params = {
    "engine": "google_jobs",
    "q": "site:linkedin.com/jobs company QBA",
    "location": "United States",
    "api_key": SERP_APIKEY
}

response = requests.get("https://serpapi.com/search", params=params)
data = response.json()

if "jobs_results" in data:
    for job in data["jobs_results"]:
        print({
            "title": job.get("title"),
            "company": job.get("company_name"),
            "location": job.get("location"),
            "description": job.get("description"),
            # or use 'extensions' / 'detected_extensions'
            "link": job.get("via")
        })
else:
    print("❌ No job results found or API key issue")
    print(data)
