import asyncio
import sys
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from db import get_jobs_from_db
from scraper import async_run_scraper

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/scrape")
async def scrape():
    try:
        print("Running scraper...")
        await async_run_scraper()
        print("Scraper done.")
        return {"status": "success"}
    except Exception as e:
        print("Scraper error:", e)
        return {"status": "error", "detail": str(e)}

@app.get("/jobs")
def jobs(title: Optional[str] = Query(None), location: Optional[str] = Query(None)):
    print("Fetching jobs from DB...")
    filters = {}
    if title:
        filters["title"] = title
    if location:
        filters["location"] = location
    return get_jobs_from_db(filters)
