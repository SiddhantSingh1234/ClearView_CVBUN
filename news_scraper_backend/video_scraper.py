from pymongo import MongoClient
import requests
from bs4 import BeautifulSoup
import datetime
import uuid
import xml.etree.ElementTree as ET

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["news_db"]
video_collection = db["videos"]

def parse_duration(duration_str):
    """Convert ISO 8601 duration to readable format."""
    try:
        minutes = 0
        seconds = 0
        if 'M' in duration_str:
            minutes = int(duration_str.split('M')[0].split('T')[-1])
        if 'S' in duration_str:
            seconds = int(duration_str.split('M')[-1].split('S')[0])
        return f"{minutes:02d}:{seconds:02d}"
    except:
        return "00:00"

def get_channel_videos(channel_id):
    """Fetch videos from a YouTube channel's RSS feed."""
    feed_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
    
    try:
        response = requests.get(feed_url)
        response.raise_for_status()
        
        # Parse XML feed
        root = ET.fromstring(response.content)
        
        # Define namespace
        ns = {'yt': 'http://www.youtube.com/xml/schemas/2015',
              'media': 'http://search.yahoo.com/mrss/',
              'atom': 'http://www.w3.org/2005/Atom'}
        
        videos = []
        
        for entry in root.findall('atom:entry', ns):
            video_id = entry.find('yt:videoId', ns).text
            title = entry.find('atom:title', ns).text
            description = entry.find('media:group/media:description', ns).text
            published = entry.find('atom:published', ns).text
            thumbnail = entry.find('media:group/media:thumbnail', ns).get('url')
            
            video = {
                "_id": str(uuid.uuid4()),
                "id": str(uuid.uuid4()),
                "videoId": video_id,
                "title": title,
                "description": description if description else "No description available",
                "videoUrl": f"https://www.youtube.com/embed/{video_id}",
                "thumbnailUrl": thumbnail,
                "duration": "00:00",  # Duration not available in RSS feed
                "source": "BBC News",
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "publishedAt": published,
                "category": "News",
                "views": 0,
                "likes": 0,
                "isDeepfake": None,
                "deepfakeScore": None,
                "analyzed": False
            }
            
            videos.append(video)
        
        return videos
    
    except Exception as e:
        print(f"Error fetching channel videos: {e}")
        return []

def scrape_videos():
    """Fetch and store news videos."""
    # List of news channel IDs
    news_channels = {
        "UCXIJgqnII2ZOINSWNOGFThA": "BBC News",  # BBC News
        "UCBi2mrWuNuyYy4gbM6fU18Q": "ABC News",  # ABC News
        "UCeY0bbntWzzVIaj2z3QigXg": "NBC News",  # NBC News
        "UCupvZG-5ko_eiXAupbDfxWw": "CNN",       # CNN
    }
    
    all_videos = []
    
    for channel_id, source in news_channels.items():
        print(f"Fetching videos from {source}...")
        videos = get_channel_videos(channel_id)
        
        for video in videos:
            # Check if video already exists
            if not video_collection.find_one({"videoId": video["videoId"]}):
                video["source"] = source
                all_videos.append(video)
    
    if all_videos:
        try:
            video_collection.insert_many(all_videos, ordered=False)
            print(f"✅ {len(all_videos)} New Videos Stored in MongoDB")
        except Exception as e:
            print(f"Error storing videos in MongoDB: {e}")
    else:
        print("⚠️ No new videos found.")

if __name__ == "__main__":
    scrape_videos()