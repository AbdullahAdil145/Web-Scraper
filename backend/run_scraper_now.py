from scraper import run_scraper
import json

if __name__ == "__main__":
    print("Running scraper...")
    jobs = run_scraper()
    print(json.dumps(jobs, indent=2))
    print(f"Scraped {len(jobs)} jobs.")
