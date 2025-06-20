from playwright.async_api import async_playwright
from db import save_job_to_db
from hashlib import sha256

async def async_run_scraper():
    jobs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://explore.jobs.netflix.net/careers", timeout=60000)
        await page.wait_for_timeout(5000)

        job_cards = page.locator('div[data-test-id^="position-card-"]')
        count = await job_cards.count()
        print(f"Found {count} job cards")

        for i in range(count):
            try:
                card = job_cards.nth(i)
                title = await card.get_attribute("aria-label") or "Unknown"
                location_elem = card.locator("p[id^='position-location']")
                location = await location_elem.inner_text()

                job = {
                    "title": title,
                    "location": location,
                    "_id": sha256((title + location).encode()).hexdigest()
                }

                save_job_to_db(job)
                jobs.append(job)
            except Exception as e:
                print(f"Skipping job {i}: {e}")

        await browser.close()
    return jobs