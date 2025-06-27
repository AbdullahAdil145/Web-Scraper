from playwright.async_api import async_playwright
from db import save_job_to_db
from hashlib import sha256

async def async_run_scraper():
    jobs = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)  # Set to True for production
        page = await browser.new_page()
        await page.goto("https://www.rippling.com/en-CA/careers/open-roles", timeout=60000)
        await page.wait_for_timeout(3000)

        # Select "Engineering" from department dropdown
        await page.select_option('select', label='Engineering')
        await page.wait_for_timeout(3000)

        # Wait for job cards to load
        await page.wait_for_selector('a.flex.flex-col', timeout=15000)
        cards = page.locator('a.flex.flex-col')
        count = await cards.count()
        print(f"Found {count} engineering job cards")

        for i in range(count):
            try:
                card = cards.nth(i)
                paragraphs = card.locator("p")

                title = await paragraphs.nth(0).inner_text()
                department = await paragraphs.nth(1).inner_text()
                location = await paragraphs.nth(2).inner_text()
                url = await card.get_attribute("href")
                if not url.startswith("http"):
                    url = "https://www.rippling.com" + url

                if department.strip().lower() != "engineering":
                    continue

                job = {
                    "title": title.strip(),
                    "department": department.strip(),
                    "location": location.strip(),
                    "url": url,
                    "_id": sha256((title + department + location + url).encode()).hexdigest()
                }

                save_job_to_db(job)
                jobs.append(job)

            except Exception as e:
                print(f"Skipping job {i}: {e}")

        await browser.close()
    return jobs

def run_scraper():
    import asyncio
    return asyncio.run(async_run_scraper())
