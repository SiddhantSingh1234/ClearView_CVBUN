from pymongo import MongoClient
import uuid
from datetime import datetime

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["news_db"]
video_collection = db["videos"]

def add_test_deepfake():
    # Example of a known deepfake video
    # This is a video from the DeepFake Detection Challenge dataset
    test_deepfake = {
        "_id": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "videoId": "dfdc_sample_1",
        "title": "Test Deepfake - AI Generated Speaker",
        "description": "This is a test deepfake video showing AI-generated content. This video is from an AI research project demonstrating deepfake technology.",
        "videoUrl": "https://www.youtube.com/embed/cQ54GDm1eL0",  # Known deepfake example
        "thumbnailUrl": "https://img.youtube.com/vi/cQ54GDm1eL0/hqdefault.jpg",
        "duration": "00:45",
        "source": "AI Research Center",
        "url": "https://www.youtube.com/watch?v=cQ54GDm1eL0",
        "publishedAt": datetime.now().isoformat(),
        "category": "Technology",
        "views": 15000,
        "likes": 320,
        "isDeepfake": None,  # We'll let the detector analyze this
        "deepfakeScore": None,
        "analyzed": False
    }
    
    # Add another example
    test_deepfake2 = {
        "_id": str(uuid.uuid4()),
        "id": str(uuid.uuid4()),
        "videoId": "dfdc_sample_2",
        "title": "AI-Generated Political Speech - Deepfake Demo",
        "description": "A demonstration of how AI can be used to generate realistic political speeches. This is a synthetic video created for research purposes.",
        "videoUrl": "https://www.youtube.com/embed/AmUC4m6w1wo",  # Another deepfake example
        "thumbnailUrl": "https://img.youtube.com/vi/AmUC4m6w1wo/hqdefault.jpg",
        "duration": "01:12",
        "source": "Deepfake Research",
        "url": "https://www.youtube.com/watch?v=AmUC4m6w1wo",
        "publishedAt": datetime.now().isoformat(),
        "category": "Politics",
        "views": 25000,
        "likes": 450,
        "isDeepfake": None,
        "deepfakeScore": None,
        "analyzed": False
    }
    
    # Check if videos already exist
    existing_video1 = video_collection.find_one({"videoId": "dfdc_sample_1"})
    existing_video2 = video_collection.find_one({"videoId": "dfdc_sample_2"})
    
    videos_to_insert = []
    if not existing_video1:
        videos_to_insert.append(test_deepfake)
    if not existing_video2:
        videos_to_insert.append(test_deepfake2)
    
    if videos_to_insert:
        video_collection.insert_many(videos_to_insert)
        print(f"✅ {len(videos_to_insert)} Test deepfake videos added to the database")
    else:
        print("⚠️ Test deepfake videos already exist in the database")

if __name__ == "__main__":
    add_test_deepfake()