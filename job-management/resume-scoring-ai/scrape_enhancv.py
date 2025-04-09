from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://enhancv.com"
CATEGORY_URL = f"{BASE_URL}/resume-examples/category/software-engineering/"

options = Options()
options.add_argument("--headless")  # run in background
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")

driver = webdriver.Chrome(options=options)


def get_resume_links():
    driver.get(CATEGORY_URL)
    time.sleep(3)
    soup = BeautifulSoup(driver.page_source, "html.parser")

    links = []
    for card in soup.select("a[href*='/resume-examples/software-engineer']"):
        href = card.get("href")
        if href and href.startswith("/resume-examples/"):
            links.append(BASE_URL + href)
    return list(set(links))


def get_resume_content(url):
    driver.get(url)
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, "html.parser")
    sections = soup.select("section, p, h2")
    content = " ".join([el.get_text(strip=True) for el in sections])
    return content


def main():
    print("🔍 Gathering resume links...")
    links = get_resume_links()
    print(f"Found {len(links)} resumes!")

    resumes = []
    for i, link in enumerate(links):
        try:
            print(f"📝 Scraping {i+1}/{len(links)}: {link}")
            text = get_resume_content(link)
            resumes.append({"url": link, "text": text})
        except Exception as e:
            print(f"❌ Error scraping {link}: {e}")

    with open("resumes.json", "w") as f:
        json.dump(resumes, f, indent=2)

    driver.quit()
    print("✅ Done! Saved to resumes.json")


if __name__ == "__main__":
    main()
