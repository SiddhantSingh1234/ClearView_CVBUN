import requests
import datetime
import uuid
from pymongo import MongoClient

# 🔹 MongoDB Connection
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["news_db"]
collection = db["articles"]

# 🔹 NewsAPI Setup
API_KEY = "74060afc388e4b7fbf5e0f99f1ab03c9"  # Replace with your actual API key
BASE_URL = "https://newsapi.org/v2/top-headlines"

def fetch_news():
    """Fetch news articles from NewsAPI."""
    params = {
        "apiKey": API_KEY,
        "language": "en",
        "country": "us",
        "pageSize": 16  # Adjust the number of articles
    }

    response = requests.get(BASE_URL, params=params)
    if response.status_code != 200:
        print("⚠️ Failed to fetch news:", response.json().get("message", "Unknown error"))
        return []

    data = response.json()
    return data.get("articles", [])

def save_articles(articles):
    """Save new articles to MongoDB, avoiding duplicates."""
    new_articles = []
    
    for article in articles:
        url = article["url"]
        
        # 🔹 Skip if the article already exists
        if collection.find_one({"url": url}):
            continue

        new_article = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            "title": article["title"],
            "description": article.get("description", ""),
            "content": article.get("content", ""),
            "author": article.get("author", "Unknown"),
            "source": article.get("source", {}).get("name", "Unknown"),
            "url": url,
            "imageUrl": article.get("urlToImage", ""),
            "publishedAt": datetime.datetime.strptime(article["publishedAt"], "%Y-%m-%dT%H:%M:%SZ"),
            "category": "General",  # NewsAPI doesn't provide categories in free tier
            "topics": [],  # No topic data available
            "likes": 0,
            "comments": []
        }

        new_articles.append(new_article)

    if new_articles:
        collection.insert_many(new_articles, ordered=False)
        print(f"✅ {len(new_articles)} New Articles Stored in MongoDB")
    else:
        print("⚠️ No new articles found.")

if __name__ == "__main__":
    articles = fetch_news()
    save_articles(articles)
