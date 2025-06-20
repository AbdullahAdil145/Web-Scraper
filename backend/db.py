from pymongo import MongoClient, errors

client = MongoClient("mongodb://localhost:27017")
db = client["scraper"]
collection = db["scraper"]

def save_job_to_db(job):
    try:
        collection.insert_one(job)
    except errors.DuplicateKeyError:
        pass

def get_jobs_from_db(filters=None):
    print("Fetching jobs from DB...")

    query = {}
    if filters:
        if "title" in filters:
            query["title"] = {"$regex": filters["title"], "$options": "i"}
        if "location" in filters:
            query["location"] = {"$regex": filters["location"], "$options": "i"}
    
    jobs = list(collection.find(query, {"_id": 0}))
    return jobs
