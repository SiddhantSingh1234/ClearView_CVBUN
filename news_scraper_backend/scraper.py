# from pymongo import MongoClient
# import requests
# from bs4 import BeautifulSoup
# import datetime

# # MongoDB Connection
# MONGO_URI = "mongodb+srv://siddhantsingh:5RhPCpEZG0uOEW2A@clearview.watxj.mongodb.net/?retryWrites=true&w=majority&appName=ClearView"
# client = MongoClient(MONGO_URI)
# db = client["news_db"]
# collection = db["articles"]

# def scrape_articles():
#     headers = {"User-Agent": "Mozilla/5.0"}
#     url = "https://www.bbc.com/news"  # Replace with your target website
#     response = requests.get(url, headers=headers)
#     if response.status_code != 200:
#         return None
#     soup = BeautifulSoup(response.text, "html.parser")

#     articles = []
#     items = soup.select("a h2")  # Select all <h2> inside <a>

#     for item in items:
#         title = item.text.strip()
#         article_url = item.find_parent("a")["href"]
#         full_url = f"https://www.bbc.com{article_url}"  # Ensure full URL

#         # Check if article already exists in the database
#         if collection.find_one({"url": full_url}):
#             continue  # Skip duplicate articles

#         articles.append({
#             "title": title,
#             "url": full_url,
#             "publishedAt": datetime.datetime.utcnow(),
#         })

#     if articles:
#         collection.insert_many(articles, ordered=False)
#         print(f"✅ {len(articles)} New Articles Stored in MongoDB")
#     else:
#         print("⚠️ No new articles found.")

# if __name__ == "__main__":
#     scrape_articles()

from pymongo import MongoClient
import requests
from bs4 import BeautifulSoup
import datetime
import uuid

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["news_db"]
collection = db["articles"]

def get_article_details(article_url):
    """Fetch additional details from the article page."""
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(article_url, headers=headers)
    if response.status_code != 200:
        return {}
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    description = soup.find("meta", attrs={"name": "description"})
    description = description["content"] if description else "No description available."
    
    content = " ".join([p.text.strip() for p in soup.select("article p")])
    
    author_tag = soup.select_one(".ssrcss-68pt20-Contributor")
    author = author_tag.text.strip() if author_tag else "BBC News"
    
    image_tag = soup.select_one("meta[property='og:image']")
    image_url = image_tag["content"] if image_tag else ""
    
    category_tag = soup.select_one(".ssrcss-1sbyv9-SectionLink")
    category = category_tag.text.strip() if category_tag else "General"
    
    topics = [tag.text.strip() for tag in soup.select(".ssrcss-1ynkz29-TagList a")] or [category]
    
    return {
        "description": description,
        "content": content,
        "author": author,
        "imageUrl": image_url,
        "category": category,
        "topics": topics
    }

def scrape_articles():
    """Scrape BBC News articles and store them in MongoDB."""
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://www.bbc.com/news"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("⚠️ Failed to fetch BBC News homepage.")
        return
    
    soup = BeautifulSoup(response.text, "html.parser")
    articles = []
    items = soup.select("a h2")
    
    for item in items:
        title = item.text.strip()
        article_url = item.find_parent("a")["href"]
        if ("bbc.com" in article_url):
            full_url = article_url
        else:
            full_url = f"https://www.bbc.com{article_url}"
        print(full_url)
        
        # Check if article already exists in the database
        if collection.find_one({"url": full_url}):
            continue
        
        try:
            details = get_article_details(full_url)
        except:
            if articles:
                collection.insert_many(articles, ordered=False)
                print(f"✅ {len(articles)} New Articles Stored in MongoDB")
            else:
                print("⚠️ No new articles found.")
            return
        
        article = {
            "_id": str(uuid.uuid4()),
            "id": str(uuid.uuid4()),
            "title": title,
            "description": details.get("description", "No description available"),
            "content": details.get("content", "No content available"),
            "author": details.get("author", "BBC News"),
            "source": "BBC News",
            "url": full_url,
            "imageUrl": details.get("imageUrl", ""),
            "publishedAt": datetime.datetime.utcnow(),
            "category": details.get("category", "General"),
            "topics": details.get("topics", []),
            "likes": 0,
            "comments": []
        }
        
        articles.append(article)
    
    if articles:
        collection.insert_many(articles, ordered=False)
        print(f"✅ {len(articles)} New Articles Stored in MongoDB")
    else:
        print("⚠️ No new articles found.")

if __name__ == "__main__":
    scrape_articles()