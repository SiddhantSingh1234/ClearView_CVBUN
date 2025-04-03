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
    """Fetch additional details from a Fox News article page."""
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(article_url, headers=headers)
    if response.status_code != 200:
        return {}

    soup = BeautifulSoup(response.text, "html.parser")

    description = soup.find("meta", attrs={"name": "description"})
    description = description["content"] if description else "No description available."

    content = " ".join([p.text.strip() for p in soup.select("article p")])

    author_tag = soup.select_one(".author-byline")
    author = author_tag.text.strip() if author_tag else "Fox News"

    image_tag = soup.select_one("meta[property='og:image']")
    image_url = image_tag["content"] if image_tag else ""

    category_tag = soup.select_one(".eyebrow")
    category = category_tag.text.strip() if category_tag else "General"

    topics = [tag.text.strip() for tag in soup.select(".tag")] or [category]

    return {
        "description": description,
        "content": content,
        "author": author,
        "imageUrl": image_url,
        "category": category,
        "topics": topics
    }

def scrape_articles():
    """Scrape Fox News articles and store them in MongoDB."""
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://www.foxnews.com/"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print("⚠️ Failed to fetch Fox News homepage.")
        return

    soup = BeautifulSoup(response.text, "html.parser")
    articles = []
    items = soup.select("h2.title a")

    for item in items:
        title = item.text.strip()
        article_url = item["href"]

        if not article_url.startswith("http"):
            full_url = f"https://www.foxnews.com{article_url}"
        else:
            full_url = article_url

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
            "author": details.get("author", "Fox News"),
            "source": "Fox News",
            "url": full_url,
            "imageUrl": details.get("imageUrl", "No image"),
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